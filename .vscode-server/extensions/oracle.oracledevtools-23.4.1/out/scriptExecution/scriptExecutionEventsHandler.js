"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginScriptExecutionInfo = exports.loginScriptExecutionMessage = exports.loginScriptExecutionMessages = exports.currentScriptExecutionMessage = exports.ScriptExecutionEventsHandler = void 0;
const vscode = require("vscode");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const scriptExecutionRequests_1 = require("../models/scriptExecutionRequests");
const logger_1 = require("./../infrastructure/logger");
const oracleLanguageServerClient_1 = require("./../infrastructure/oracleLanguageServerClient");
const resultsDataServer_1 = require("./../scriptExecution/resultsDataServer");
const localizedConstants_1 = require("./../constants/localizedConstants");
const scriptExecutionManager_1 = require("./scriptExecutionManager");
const saveQueryResultRequest_1 = require("./saveQueryResultRequest");
const helper_1 = require("../utilities/helper");
const queryHistoryManager_1 = require("../explorer/queryHistoryManager");
const constants_1 = require("../constants/constants");
const setup_1 = require("../utilities/setup");
const userPreferenceManager_1 = require("../infrastructure/userPreferenceManager");
const debugManager_1 = require("../debugger/debugManager");
const fileLogger = logger_1.FileStreamLogger.Instance;
const helper = require("../utilities/helper");
const settings_1 = require("../utilities/settings");
const oracleInlineCompletionItemProvider_1 = require("../infrastructure/oracleInlineCompletionItemProvider");
class ScriptExecutionEventsHandler {
    constructor() {
        this.currentMessageList = new Map();
        this.loginScriptMessageList = new Map();
        this.loginScriptExecutionDetails = new Map();
        this.acknowledgeMesasge = (args) => {
            return this.languageClient.sendRequest(scriptExecutionRequests_1.OracleRequestTypes.messageAcknowledgementRequest, args);
        };
        this.runningScripts = new Map();
        this.onMessageReceived = async (event_obj) => {
            let event = new scriptExecutionModels_1.ScriptExecutionMessageEvent();
            Object.assign(event, event_obj);
            fileLogger.info("Script Execution message received from Server for " +
                event.displayString());
            let uri = event.windowUri ? event.windowUri : event.ownerUri;
            if (event.messageType == scriptExecutionModels_1.ScriptExecutionMessageType.Cancel) {
                this.resultDataServer.postToClients(uri, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage, event);
                this.clearCurrentMessageList(uri, event.executionId);
            }
            else if (event.queryType === scriptExecutionModels_1.QueryType.ShowData || event.queryType === scriptExecutionModels_1.QueryType.RunCodeObject) {
                this.resultDataServer.postToClients(uri, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage, event);
            }
            else {
                if (event.outputTarget === scriptExecutionModels_1.OutputTarget.OutputPane && event.ownerUri !== constants_1.Constants.loginScriptResultsWindowUri) {
                    this.acknowledgeMesasgeForOutputPane(event);
                    logger_1.ChannelLogger.Instance.info(event.message);
                    logger_1.ChannelLogger.Instance.show();
                }
                else {
                    await this.acknowledgeAndPostToClients(event, scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage, uri);
                }
            }
        };
        this.acknowledgeMesasgeForOutputPane = (event) => {
            let request = new scriptExecutionModels_1.ScriptExecutionAcknowledgeMessageRequestParams();
            request.executionId = event.executionId;
            request.ownerUri = event.ownerUri;
            request.queryId = event.queryId;
            request.messageId = event.messageId;
            this.acknowledgeMesasge(request);
        };
        this.acknowledgeBatchMesasgeForOutputPane = (event) => {
            let request = new scriptExecutionModels_1.ScriptExecutionAcknowledgeMessageRequestParams();
            request.executionId = event.executionId;
            request.ownerUri = event.ownerUri;
            request.messageId = event.messageId;
            this.acknowledgeMesasge(request);
        };
        this.onBatchMessageReceived = async (event_obj) => {
            let batchEvent = new scriptExecutionModels_1.ScriptExecutionBatchedMessageEventParams();
            Object.assign(batchEvent, event_obj);
            fileLogger.info("Script Execution message received from Server for " +
                batchEvent.displayString());
            let uri = batchEvent.windowUri ? batchEvent.windowUri : batchEvent.ownerUri;
            await this.acknowledgeAndPostToClients(batchEvent, scriptExecutionModels_1.OracleEventNames.scriptExecutionBatchedMessage, uri);
            let acknowledged = false;
            let explainMode = scriptExecutionModels_1.ExplainPlanMode.None;
            for (let index = 0; index < batchEvent.messageList.length; index++) {
                const current = batchEvent.messageList[index];
                if (current.requestMessageType == scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage) {
                    let event = current;
                    explainMode = event.explainMode;
                    if (event.logInHistory) {
                        var sqlQuery = event.sqlQuery.trim();
                        queryHistoryManager_1.QueryHistoryManager.Instance().updateModel(sqlQuery, event.ownerUri, event.queryId);
                        if (event.outputTarget === scriptExecutionModels_1.OutputTarget.OutputPane) {
                            if (!acknowledged) {
                                this.acknowledgeBatchMesasgeForOutputPane(batchEvent);
                                acknowledged = true;
                            }
                            logger_1.ChannelLogger.Instance.info(event.message);
                            logger_1.ChannelLogger.Instance.show();
                        }
                    }
                }
            }
        };
        this.onLoginScriptExecutionStarted = async (event_obj) => {
            let event = new scriptExecutionModels_1.LoginScriptExecutionStartedEventParams();
            Object.assign(event, event_obj);
            fileLogger.info("LoginScriptExecutionStartedEvent received " + event.displayString());
            const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
            manager.loginScriptExecutionStarted(event);
        };
        this.onLoginScriptExecutionFinished = async (event_obj) => {
            let event = new scriptExecutionModels_1.LoginScriptExecutionFinishedEventParams();
            Object.assign(event, event_obj);
            fileLogger.info("LoginScriptExecutionFinishedEvent received " + event.displayString());
            const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
            manager.loginScriptExecutionFinished(event);
        };
        this.onNestedScriptExecutionStarted = async (event_obj) => {
            let event = new scriptExecutionModels_1.NestedScriptExecutionStartedEventParams();
            Object.assign(event, event_obj);
            fileLogger.info("NestedScriptExecutionStartedEvent received " + event.displayString());
            const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
            manager.nestedScriptExecutionStarted(event);
        };
        this.onNestedScriptExecutionFinished = async (event_obj) => {
            let event = new scriptExecutionModels_1.NestedScriptExecutionFinishedEventParams();
            Object.assign(event, event_obj);
            fileLogger.info("NestedScriptExecutionFinishedEvent received " + event.displayString());
            const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
            manager.nestedScriptExecutionFinished(event);
        };
        this.onGenerateNLtoSQLErrorEvent = async (event) => {
            vscode.window.showErrorMessage(event.message);
        };
        this.onGenerateNLtoSQLExecutionResult = async (event) => {
            let uri = this.vscodeConnector.activeTextEditorUri;
            if (uri && uri === event.ownerUri) {
                oracleInlineCompletionItemProvider_1.oracleInlineCompletionitemProvider.hint = event.transaltedSQL;
                oracleInlineCompletionItemProvider_1.oracleInlineCompletionitemProvider.startPosition = this.vscodeConnector.activeTextEditor.selection.active;
                await vscode.commands.executeCommand('editor.action.inlineSuggest.trigger');
            }
        };
    }
    showObjectData(showData, args) {
        this.attachShowDataEventHandlers(args);
        return this.languageClient.sendRequest(showData, args);
    }
    runHistObject(runHistObject, args) {
        this.attachEventHandlers(args);
        return this.languageClient.sendRequest(runHistObject, args);
    }
    runBookmarkObject(runBookmarkObject, args) {
        this.attachEventHandlers(args);
        return this.languageClient.sendRequest(runBookmarkObject, args);
    }
    runCodeObject(runCodeObect, args) {
        this.attachEventHandlers(args);
        return this.languageClient.sendRequest(runCodeObect, args);
    }
    static get instance() {
        if (ScriptExecutionEventsHandler.varInstance) {
            return this.varInstance;
        }
    }
    static init(varStatusManager, vscodeConnector, resultDataServer) {
        fileLogger.info("Initializing Script Event Manager");
        ScriptExecutionEventsHandler.varInstance = new ScriptExecutionEventsHandler();
        ScriptExecutionEventsHandler.varInstance.initializer(varStatusManager, vscodeConnector, resultDataServer);
        fileLogger.info("Script Event Manager initialized");
    }
    executeScript(queryExecute, args) {
        const executor = this.attachEventHandlers(args);
        return executor.executeScript(queryExecute, args);
    }
    attachShowDataEventHandlers(args) {
        fileLogger.info(`Preparing for ShowData execution  ${args.ownerUri}`);
        const scriptPathWithProtocol = args.ownerUri;
        const executor = new scriptExecutionManager_1.ScriptExecutionManager(scriptPathWithProtocol, ScriptExecutionEventsHandler.varInstance, args.executionId);
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptExecutionData, (event) => {
            this.resultDataServer.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionData, event);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptExecutionStarted, (event) => {
            const oracleDeveloperToolsConfig = setup_1.Setup.getExtensionConfigSection();
            const config = new scriptExecutionModels_1.ODTConfigurationChangedEvent();
            config.logLevel = logger_1.FileStreamLogger.Instance.currentLogLevel;
            config.loggingEnabled = logger_1.FileStreamLogger.Instance.enabled;
            config.ownerUri = scriptPathWithProtocol;
            let querySettings = settings_1.Settings.getQueryExecutionSettingsForUri(scriptPathWithProtocol);
            config.dataBatchSize = querySettings.pageSize;
            config.csvDelimiter = querySettings.csvDelimiter;
            config.csvQualifier = querySettings.csvTextQualifier;
            config.rowNubmer = querySettings.rowNumber;
            config.cellTextLength = querySettings.cellTextLength;
            config.tooltipTextLength = querySettings.tooltipTextLength;
            this.resultDataServer.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.MessageName.odtConfigChanged, config);
            const response = new scriptExecutionModels_1.GetUserPreferencesResponse();
            response.executionId = event.executionId;
            response.ownerUri = event.ownerUri;
            response.userPreferences = userPreferenceManager_1.UserPreferenceManager.Instance.readUserPreferencesFromJsonFile();
            response.result = (response.userPreferences !== undefined);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.MessageName.getUserPreferencesRequest, response);
            this.resultDataServer.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionStarted, event);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished, (event) => {
            let uri = event.windowUri ? event.windowUri : event.ownerUri;
            this.resultDataServer.postToClients(uri, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished, event);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptExecutionCancelled, (event) => {
            this.resultDataServer.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionCancelled, event);
        });
        executor.on(scriptExecutionModels_1.MessageName.themeChanged, (event) => {
            this.resultDataServer.postToClients(scriptPathWithProtocol, undefined, scriptExecutionModels_1.MessageName.themeChanged, event);
        });
        executor.on(scriptExecutionModels_1.MessageName.odtConfigChanged, (event) => {
            this.resultDataServer.postToClients(scriptPathWithProtocol, undefined, scriptExecutionModels_1.MessageName.odtConfigChanged, event);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, async (event) => {
            await this.handleSaveQueryResultFinishedEvent(event, scriptPathWithProtocol);
        });
        return executor;
    }
    attachEventHandlers(args) {
        fileLogger.info("Preparing for Script execution");
        let scriptPathWithProtocol;
        if (args instanceof scriptExecutionModels_1.ScriptExecutionMessageBase && args.windowUri != null)
            scriptPathWithProtocol = args.windowUri;
        else
            scriptPathWithProtocol = args.ownerUri;
        const executor = new scriptExecutionManager_1.ScriptExecutionManager(scriptPathWithProtocol, ScriptExecutionEventsHandler.varInstance, args.executionId);
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptExecutionData, (event) => {
            this.resultDataServer.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionData, event);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptExecutionDataFetched, (event) => {
            this.resultDataServer.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionDataFetched, event);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptUserInputRequired, (event) => {
            this.resultDataServer.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptUserInputRequired, event);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptExecutionStarted, async (event) => {
            let uri = event.windowUri ? event.windowUri : event.ownerUri;
            this.clearCurrentMessageList(uri, event.executionId);
            const oracleDeveloperToolsConfig = setup_1.Setup.getExtensionConfigSection();
            const config = new scriptExecutionModels_1.ODTConfigurationChangedEvent();
            config.logLevel = logger_1.FileStreamLogger.Instance.currentLogLevel;
            config.loggingEnabled = logger_1.FileStreamLogger.Instance.enabled;
            config.ownerUri = uri;
            let querySettings = settings_1.Settings.getQueryExecutionSettingsForUri(uri);
            config.dataBatchSize = querySettings.pageSize;
            config.csvDelimiter = querySettings.csvDelimiter;
            config.csvQualifier = querySettings.csvTextQualifier;
            config.rowNubmer = querySettings.rowNumber;
            config.cellTextLength = querySettings.cellTextLength;
            config.tooltipTextLength = querySettings.tooltipTextLength;
            this.resultDataServer.postToClients(uri, event.executionId, scriptExecutionModels_1.MessageName.odtConfigChanged, config);
            if (await this.processIfLoginScriptMessage(event, scriptExecutionModels_1.OracleEventNames.scriptExecutionStarted)) {
                return;
            }
            this.resultDataServer.postToClients(uri, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionStarted, event);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished, async (event) => {
            let uri = event.windowUri ? event.windowUri : event.ownerUri;
            this.clearCurrentMessageList(uri, event.executionId);
            if (await this.processIfLoginScriptMessage(event, scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished)) {
                return;
            }
            this.resetWindowFocus(uri, event.executionId);
            this.resultDataServer.postToClients(uri, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished, event);
            debugManager_1.DebugManager.Instance.stopDebugging(uri, event.debugSessionId, event.debugConnectionCreated);
            if (helper_1.Utils.ProcessingExplainPlanOrExecutionPlanMessage(event.explainMode)) {
                const params = new scriptExecutionModels_1.ScriptExecutionDisposeEventParams();
                params.ownerUri = event.ownerUri;
                params.executionId = event.executionId;
                this.sendQueryExecutionDisposeEventToServer(params);
            }
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptExecutionCancelled, async (event) => {
            if (await this.processIfLoginScriptMessage(event, scriptExecutionModels_1.OracleEventNames.scriptExecutionCancelled)) {
                return;
            }
            this.resultDataServer.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionCancelled, event);
        });
        executor.on(scriptExecutionModels_1.MessageName.themeChanged, (event) => {
            this.resultDataServer.postToClients(scriptPathWithProtocol, undefined, scriptExecutionModels_1.MessageName.themeChanged, event);
        });
        executor.on(scriptExecutionModels_1.MessageName.odtConfigChanged, (event) => {
            this.resultDataServer.postToClients(scriptPathWithProtocol, undefined, scriptExecutionModels_1.MessageName.odtConfigChanged, event);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, async (event) => {
            await this.handleSaveQueryResultFinishedEvent(event, scriptPathWithProtocol);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.scriptCodeObjectOutput, (event) => {
            this.resultDataServer.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptCodeObjectOutput, event);
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.loginScriptExecutionStarted, async (event) => {
            fileLogger.info("Received login script execution started event");
            let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(event.ownerUri, event.executionId);
            this.loginScriptExecutionDetails.set(uniqueId, new loginScriptExecutionInfo());
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.loginScriptExecutionFinished, async (event) => {
            fileLogger.info("Received login script execution finished event");
            try {
                if (event.ownerUri !== constants_1.Constants.loginScriptResultsWindowUri) {
                    this.processLoginScriptFinished(event.ownerUri, event.executionId, scriptExecutionModels_1.OutputTarget.FullScreen);
                }
            }
            catch (err) {
                fileLogger.info("Error on processing login script execution finished event");
                helper.logErroAfterValidating(err);
            }
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.nestedScriptExecutionStarted, async (event) => {
            fileLogger.info("Received nested script execution started event");
            try {
                let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(event.ownerUri, event.executionId);
                let loginScriptInfo = this.loginScriptExecutionDetails.get(uniqueId);
                if (loginScriptInfo) {
                    let nestedScriptExecutionList = loginScriptInfo.nestedScriptExecutionList;
                    if (nestedScriptExecutionList) {
                        let nestedScripts = nestedScriptExecutionList.get(uniqueId);
                        if (!nestedScripts) {
                            fileLogger.info("Creating new nested script list for this login script execution");
                            nestedScripts = [];
                            nestedScriptExecutionList.set(uniqueId, nestedScripts);
                        }
                        nestedScripts.push(event.nestedScript);
                    }
                }
            }
            catch (err) {
                fileLogger.info("Error on processing nested script execution started event");
                helper.logErroAfterValidating(err);
            }
            fileLogger.info("Processed nested script execution started event");
        });
        executor.on(scriptExecutionModels_1.OracleEventNames.nestedScriptExecutionFinished, async (event) => {
            fileLogger.info("Received nested script execution finished event");
            try {
                let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(event.ownerUri, event.executionId);
                let loginScriptInfo = this.loginScriptExecutionDetails.get(uniqueId);
                if (loginScriptInfo) {
                    let nestedScriptExecutionList = loginScriptInfo.nestedScriptExecutionList;
                    if (nestedScriptExecutionList) {
                        let nestedScripts = nestedScriptExecutionList.get(uniqueId);
                        if (nestedScripts) {
                            if (nestedScripts.length > 0 && nestedScripts[nestedScripts.length - 1] === event.nestedScript) {
                                nestedScripts.pop();
                            }
                            else {
                                let outputTarget = (event.ownerUri === constants_1.Constants.loginScriptResultsWindowUri) ? scriptExecutionModels_1.OutputTarget.OutputPane : scriptExecutionModels_1.OutputTarget.FullScreen;
                                let nestedScriptMsg = `${localizedConstants_1.default.endExecutingScript} "${event.nestedScript}"`;
                                this.postLoginScriptExecutionMessage(event.ownerUri, event.executionId, nestedScriptMsg, outputTarget);
                                let loginScriptInfo = this.loginScriptExecutionDetails.get(uniqueId);
                                if (loginScriptInfo) {
                                    loginScriptInfo.isLastMessageError = false;
                                }
                            }
                        }
                    }
                }
            }
            catch (err) {
                fileLogger.info("Error on processing nested script execution finished event");
                helper.logErroAfterValidating(err);
            }
            fileLogger.info("Processed nested script execution finished event");
        });
        return executor;
    }
    async handleSaveQueryResultFinishedEvent(event, scriptPathWithProtocol) {
        if (event.messageType === scriptExecutionModels_1.SaveQueryResultMessageType.Message) {
            if (event.saveDataToFile)
                this.openFile(event.fileName);
            else {
                try {
                    await vscode.env.clipboard.writeText(event.formattedResult);
                }
                catch (err) {
                    fileLogger.error(err);
                    event.messageType = scriptExecutionModels_1.SaveQueryResultMessageType.Error;
                    event.message = localizedConstants_1.default.copyToClipboardFailed;
                }
            }
        }
        this.resultDataServer.postToClients(scriptPathWithProtocol, event.executionId, scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, event);
    }
    openFile(filePath) {
        if (!filePath || filePath == '')
            return;
        this.vscodeConnector.openTextDocument(vscode.Uri.file(filePath))
            .then((document) => {
            vscode.window.showTextDocument(document);
            fileLogger.info("Opened successfully");
        }, (error) => {
            fileLogger.error(`Filed to open result document ${filePath}`);
        });
    }
    ;
    async getDataBatch(args) {
        fileLogger.info("Getting next set of Data " +
            scriptExecutionModels_1.ScriptExecutionDataBatchRequest.displayString(args));
        return this.languageClient.sendRequest(scriptExecutionRequests_1.OracleRequestTypes.dataBatchRequest, args);
    }
    async cancelQuery(cancelParams) {
        fileLogger.info("Cancelling query execution for document "
            + cancelParams.ownerUri);
        const convertedPath = cancelParams.ownerUri;
        const manager = ScriptExecutionEventsHandler.varInstance.runningScripts.get(helper_1.Utils.CreateIdByURIandExecutionId(convertedPath, cancelParams.executionId));
        if (manager.executionStatus !== scriptExecutionModels_1.ExecutionStatus.Finished) {
            ScriptExecutionEventsHandler.varInstance.varStatusManager.displayCancellingExecution(cancelParams.ownerUri);
            return manager.cancelExecution(cancelParams).then((response) => {
                ScriptExecutionEventsHandler.varInstance.varStatusManager.displayCancelledScriptExecution(cancelParams.ownerUri);
                return true;
            }, (error) => {
                return false;
            });
        }
        return undefined;
    }
    isRunning(scriptPathWithProtocol) {
        fileLogger.info("Checking if queries is/are executing for script " +
            scriptPathWithProtocol);
        let result = false;
        const managers = this.getExecutionManagersForUri(scriptPathWithProtocol);
        if (managers) {
            for (let index = 0; index < managers.length; index++) {
                const manager = managers[index];
                fileLogger.info(manager.executionStatus.toString());
                if (manager.executionStatus !== scriptExecutionModels_1.ExecutionStatus.Finished) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }
    resetExecutionStatus(ownerUri, executionId) {
        fileLogger.info("ScriptExecutionEventsHandler.resetExecutionStatus- Start");
        const managers = this.getExecutionManagersForUri(ownerUri);
        if (managers) {
            const manager = managers.find(o => o.executionId === executionId);
            if (manager) {
                manager.executionStatus = scriptExecutionModels_1.ExecutionStatus.NotStarted;
            }
        }
        fileLogger.info("ScriptExecutionEventsHandler.resetExecutionStatus- End");
    }
    getExecutionManagersForUri(scriptPathWithProtocol) {
        let result = [];
        ScriptExecutionEventsHandler.varInstance.runningScripts.forEach((value, key) => {
            if (value.OwnerUri === scriptPathWithProtocol) {
                result.push(value);
            }
        });
        return result;
    }
    handleThemeChanged(param) {
        fileLogger.info("Handling Theme changed for the application");
        if (param.affectsConfiguration("workbench.colorTheme")) {
            const workbench = this.vscodeConnector.getConfiguration("workbench");
            const newTheme = workbench.colorTheme;
            if (this.previousTheme !== newTheme) {
                this.previousTheme = newTheme;
                const eventArgs = new scriptExecutionModels_1.ThemeChangedEvent();
                eventArgs.themeName = newTheme;
                eventArgs.ownerUri = "ConstantURI";
                this.resultDataServer.postToAll(scriptExecutionModels_1.MessageName.themeChanged, eventArgs);
            }
        }
        fileLogger.info("Theme changed for the application");
    }
    handleColorThemeChanged(param) {
        fileLogger.info("Handling Color Theme changed for the application");
        const eventArgs = new scriptExecutionModels_1.ThemeChangedEvent();
        eventArgs.themeName = param.toString();
        eventArgs.ownerUri = "ConstantURI";
        this.resultDataServer.postToAll(scriptExecutionModels_1.MessageName.themeChanged, eventArgs);
        fileLogger.info("Theme changed for the application");
    }
    handleConfigurationChanged(param) {
        fileLogger.info("Handling Configuration changed for the application");
        if (param.affectsConfiguration(constants_1.Constants.extensionConfigSectionName)) {
            this.resultDataServer.postConfigChangedToAll();
        }
        fileLogger.info("Theme changed for the application");
    }
    registerRunner(executer, uri, executionId) {
        let uniqueId = `${uri}/${executionId}`;
        this.runningScripts.set(uniqueId, executer);
    }
    unRegisterRunner(ownerUri, exceutionId = undefined) {
        const managers = this.getExecutionManagersForUri(ownerUri);
        for (let index = 0; index < managers.length; index++) {
            const manager = managers[index];
            this.runningScripts.delete(manager.uniqueId);
        }
    }
    sendQueryExecutionDisposeEventToServer(args) {
        fileLogger.info("Sending Query Execution Dispose event to server for " +
            scriptExecutionModels_1.ScriptExecutionDisposeEventParams.displayString(args));
        return this.languageClient.sendNotification(scriptExecutionRequests_1.OracleNotificationTypes.scriptExecutionDisposeEvent, args);
    }
    sendQueryExecutionClearEventToServer(args) {
        fileLogger.info("Sending Query Execution Clear event to server for " +
            scriptExecutionModels_1.ScriptExecutionClearEventParams.displayString(args));
        return this.languageClient.sendNotification(scriptExecutionRequests_1.OracleNotificationTypes.scriptExecutionClearEvent, args);
    }
    sendQueryExecutionResetEventToServer(args) {
        fileLogger.info("Sending Query Execution Reset event to server");
        return this.languageClient.sendNotification(scriptExecutionRequests_1.OracleNotificationTypes.scriptExecutionResetEvent, args);
    }
    initializer(varStatusManager, vscodeConnector, resultDataServer) {
        this.varStatusManager = varStatusManager;
        this.vscodeConnector = vscodeConnector;
        this.resultDataServer = resultDataServer;
        this.languageClient = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.scriptExecutionStartedEvent, this.onScriptExecutionStarted);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.userInputRequiredEvent, this.onUserInputRequiredEvent);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.scriptExecutionFinishedEvent, this.onScriptExecutionFinished);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.loginScriptExecutionStartedEvent, this.onLoginScriptExecutionStarted);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.loginScriptExecutionFinishedEvent, this.onLoginScriptExecutionFinished);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.nestedScriptExecutionStartedEvent, this.onNestedScriptExecutionStarted);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.nestedScriptExecutionFinishedEvent, this.onNestedScriptExecutionFinished);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.scriptExecutionDataEvent, this.onDataReceived);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.scriptExecutionMessageEvent, this.onMessageReceived);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.scriptExecutionBatchedMessageEvent, this.onBatchMessageReceived);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.scriptExecutionCancelEvent, this.onScriptExecutionCancelled);
        this.languageClient.onNotification(saveQueryResultRequest_1.SaveQueryResultFinishedEvent.event, this.onSaveQueryResultFinishedEvent);
        this.languageClient.onNotification(scriptExecutionRequests_1.CodeObjectOutputEvent.event, this.onCodeObjectOuputEvent);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.scriptExecutionDataFetchedEvent, this.onDataFetchedEventReceived);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.generateSQLFromNLDataEvent, this.onGenerateNLtoSQLExecutionResult);
        this.languageClient.onNotification(scriptExecutionRequests_1.OracleNotificationTypes.generateSQLFromNLErrorEvent, this.onGenerateNLtoSQLErrorEvent);
    }
    async onConfigurationChanged(configEvent) {
        this.handleThemeChanged(configEvent);
        this.handleConfigurationChanged(configEvent);
    }
    onUserInputRequiredEvent(event_obj) {
        let event = new scriptExecutionModels_1.UserInputParams();
        Object.assign(event, event_obj);
        fileLogger.info("HandlingonUserInputRequiredEvent event from server for " +
            event.displayString());
        ScriptExecutionEventsHandler.varInstance.varStatusManager.displayExecutionStarted(event.ownerUri, localizedConstants_1.default.executingMessage);
        const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
        manager.onUserInputRequested(event);
    }
    onScriptExecutionStarted(event_obj) {
        let event = new scriptExecutionModels_1.ScriptExecutionStartedEvent();
        Object.assign(event, event_obj);
        fileLogger.info("Handling script execution started event from server for " +
            event.displayString());
        ScriptExecutionEventsHandler.varInstance.varStatusManager.displayExecutionStarted(event.ownerUri, helper_1.Utils.getExecutionStartedStatusBarMessage(event.generateAction));
        let executingCommandOtherthanTranslate = event.generateAction == scriptExecutionModels_1.Action.None;
        if (executingCommandOtherthanTranslate) {
            const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
            manager.executionStarted(event);
        }
    }
    onScriptExecutionFinished(event_obj) {
        let event = new scriptExecutionModels_1.ScriptExecutionFinishedEvent();
        Object.assign(event, event_obj);
        fileLogger.info("Handling script execution finished event from server for " +
            event.displayString());
        ScriptExecutionEventsHandler.varInstance.varStatusManager.displayExecutionFinished(event.ownerUri, helper_1.Utils.getExecutionFinishedStatusBarMessage(event.generateAction));
        const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
        manager.executionFinished(event);
    }
    onDataReceived(event_obj) {
        let event = new scriptExecutionModels_1.ScriptExecutionDataEvent();
        Object.assign(event, event_obj);
        fileLogger.info("Data Received from Server for " +
            event.displayString());
        const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
        if (manager) {
            manager.onDataEvent(event);
        }
    }
    onDataFetchedEventReceived(event_obj) {
        let event = new scriptExecutionModels_1.ScriptExecutionDataFetchedEvent();
        Object.assign(event, event_obj);
        fileLogger.info("Data fetched event Received from Server for " +
            event.displayString());
        const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
        if (manager) {
            manager.onDataFetchedEvent(event);
        }
    }
    onCodeObjectOuputEvent(event_obj) {
        let event = new scriptExecutionModels_1.UserInputParams();
        Object.assign(event, event_obj);
        fileLogger.info("Data Received from Server for " + event.displayString());
        const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
        if (manager) {
            manager.onCodeObjectOuputEvent(event);
        }
    }
    onSaveQueryResultFinishedEvent(event_obj) {
        let event = new scriptExecutionModels_1.SaveQueryResultFinishedEventParams();
        Object.assign(event, event_obj);
        fileLogger.info("Data Received from Server for " + event.displayString());
        const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
        if (manager) {
            manager.onSaveQueryResultFinishedEvent(event);
        }
    }
    onScriptExecutionCancelled(event_obj) {
        let event = new scriptExecutionModels_1.ScriptExecutionCancelledEventParams();
        Object.assign(event, event_obj);
        fileLogger.info("Data Received from Server for " + event.displayString());
        const manager = ScriptExecutionEventsHandler.varInstance.getExecutionManager(event);
        if (manager) {
            manager.oScriptExecutionCancelled(event);
        }
    }
    getExecutionManager(event) {
        let convertedPath;
        if (event.windowUri)
            convertedPath = event.windowUri;
        else
            convertedPath = event.ownerUri;
        if (event.executionId) {
            convertedPath = `${convertedPath}/${event.executionId}`;
        }
        return ScriptExecutionEventsHandler.varInstance.runningScripts.get(convertedPath);
    }
    async acknowledgeScriptExecutionMessage(event, msgType) {
        try {
            if (event) {
                const ackmessage = new scriptExecutionModels_1.MessageBase();
                ackmessage.type = scriptExecutionModels_1.MessageName.acknowledgeMessageRequest;
                const acknowledgement = new scriptExecutionModels_1.ScriptExecutionAcknowledgeMessageRequestParams();
                if (msgType == scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage) {
                    const simpleMsg = event;
                    acknowledgement.executionId = simpleMsg.executionId;
                    acknowledgement.messageId = simpleMsg.messageId;
                    acknowledgement.ownerUri = simpleMsg.ownerUri;
                    acknowledgement.windowUri = simpleMsg.windowUri;
                    acknowledgement.queryId = simpleMsg.queryId;
                    ackmessage.data = acknowledgement;
                }
                if (msgType == scriptExecutionModels_1.OracleEventNames.scriptExecutionBatchedMessage) {
                    const batchMessage = event;
                    acknowledgement.executionId = batchMessage.executionId;
                    acknowledgement.messageId = batchMessage.messageId;
                    acknowledgement.ownerUri = batchMessage.ownerUri;
                    acknowledgement.windowUri = batchMessage.windowUri;
                    ackmessage.data = acknowledgement;
                }
                fileLogger.info(`Message Type=${msgType} MessageId=${acknowledgement.messageId}`);
                try {
                    this.acknowledgeMesasge(acknowledgement);
                }
                catch (err) {
                    fileLogger.error(err);
                }
            }
        }
        catch (error) {
            fileLogger.info(`Failed to acknowledge message ${msgType}`);
            fileLogger.error(error);
        }
    }
    getwebPanelURI(event, ownerUri) {
        let uri = ownerUri;
        if (event.explainMode && helper_1.Utils.ProcessingExplainPlanOrExecutionPlanMessage(event.explainMode)) {
            uri = helper_1.Utils.getFileURI(event.explainMode, ownerUri);
        }
        else if (event.messageList && event.messageList.length > 0) {
            for (let index = 0; index < event.messageList.length; index++) {
                const element = event.messageList[index];
                if (element.explainMode && helper_1.Utils.ProcessingExplainPlanOrExecutionPlanMessage(element.explainMode)) {
                    uri = helper_1.Utils.getFileURI(element.explainMode, ownerUri);
                    break;
                }
            }
        }
        return uri;
    }
    async acknowledgeAndPostToClients(event, msgType, uri) {
        let uniqueId = "";
        try {
            if (await this.processIfLoginScriptMessage(event, msgType)) {
                return;
            }
            uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(uri, event.executionId);
            fileLogger.info("Processing message from server for " + uniqueId);
            let currentMessage = this.currentMessageList.get(uniqueId);
            if (currentMessage === undefined) {
                fileLogger.info("Processing first message for current execution from server for " + uniqueId);
                currentMessage = new currentScriptExecutionMessage();
                this.currentMessageList.set(uniqueId, currentMessage);
            }
            if (currentMessage.messageBeingRenderedInUI) {
                fileLogger.info("There is a message being processed in UI still, adding this message to the queue");
                currentMessage.messageToBePostedToUI = event;
                currentMessage.typeOfMessageToBePostedToUI = msgType;
            }
            else {
                fileLogger.info("There is no message being processed in UI currently");
                currentMessage.messageBeingRenderedInUI = event;
                currentMessage.messageToBePostedToUI = undefined;
                currentMessage.typeOfMessageToBePostedToUI = undefined;
                fileLogger.info("Sending acknowledgement for this messsage to server and posting the message to UI");
                await this.acknowledgeScriptExecutionMessage(event, msgType);
                this.resultDataServer.postToClients(uri, event.executionId, msgType, event);
            }
            fileLogger.info("Processing of message from server completed for " + uniqueId);
        }
        catch (err) {
            fileLogger.info("Error on of message from server for " + uniqueId);
            fileLogger.error(err);
        }
    }
    async processAcknowledgementFromUi(message) {
        let uniqueId = "";
        try {
            if (message.ownerUri === constants_1.Constants.loginScriptResultsWindowUri) {
                return;
            }
            else if (message.messageType === scriptExecutionModels_1.OracleEventNames.scriptExecutionStarted ||
                message.messageType === scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished ||
                message.messageType === scriptExecutionModels_1.OracleEventNames.scriptExecutionCancelled) {
                return;
            }
            let uri = message.windowUri ? message.windowUri : message.ownerUri;
            uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(uri, message.executionId);
            fileLogger.info("Processing acknowledgement message from UI for " + uniqueId);
            let currentMessage = this.currentMessageList.get(uniqueId);
            if (currentMessage) {
                currentMessage.messageBeingRenderedInUI = undefined;
                if (currentMessage.messageToBePostedToUI) {
                    fileLogger.info("Posting new message in queue to UI");
                    currentMessage.messageBeingRenderedInUI = currentMessage.messageToBePostedToUI;
                    await this.acknowledgeScriptExecutionMessage(currentMessage.messageToBePostedToUI, currentMessage.typeOfMessageToBePostedToUI);
                    let uri = currentMessage.messageToBePostedToUI.windowUri ? currentMessage.messageToBePostedToUI.windowUri :
                        currentMessage.messageToBePostedToUI.ownerUri;
                    this.resultDataServer.postToClients(uri, currentMessage.messageToBePostedToUI.executionId, currentMessage.typeOfMessageToBePostedToUI, currentMessage.messageToBePostedToUI);
                    currentMessage.messageToBePostedToUI = undefined;
                    currentMessage.typeOfMessageToBePostedToUI = undefined;
                    fileLogger.info("Posted new message in queue to UI");
                }
            }
            fileLogger.info("Processed acknowledgement message from UI for " + uniqueId);
        }
        catch (err) {
            fileLogger.info("Error on processing acknowledgement message from UI for " + uniqueId);
            fileLogger.error(err);
        }
    }
    async acknowledgeLoginScriptMessageAndPostToClients(event, msgType) {
        let uniqueId = "";
        try {
            let ownerUri = event.ownerUri;
            uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(ownerUri, event.executionId);
            fileLogger.info("Processing login script execution message started, message type: " + msgType + ", exection id: " + event.executionId);
            if (this.loginScriptMessageList.size > 0) {
                fileLogger.info("There are message lists in login script message queue, number of lists - " + this.loginScriptMessageList.size);
                let [firstKey] = this.loginScriptMessageList.keys();
                if (firstKey === uniqueId) {
                    fileLogger.info("Message list for this login script execution is first in the queue");
                    let messages = this.loginScriptMessageList.get(uniqueId);
                    if (messages.messages.length > 0 || this.processingLoginScriptMessageInUi) {
                        fileLogger.info("Adding this message to queue as there are messages for this execution already in queue or getting processed in UI");
                        messages.messages.push(new loginScriptExecutionMessage(ownerUri, msgType, event.executionId, event));
                        fileLogger.info("Number of messages in the queue for this execution is - " + messages.messages.length);
                    }
                    else {
                        fileLogger.info("There is no message for this execution in queue or getting processed in UI");
                        if (msgType === scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished) {
                            fileLogger.info("Deleting message list for this execution from queue as finished event received");
                            this.loginScriptMessageList.delete(uniqueId);
                        }
                        this.processingLoginScriptMessageInUi = true;
                        fileLogger.info("Posting this message to UI,  message type: " + msgType + ", exection id: " + event.executionId);
                        this.postLoginScriptMessage(ownerUri, event.executionId, msgType, event, scriptExecutionModels_1.OutputTarget.OutputPane);
                    }
                }
                else {
                    fileLogger.info("Message list for this login script execution is not first in the queue");
                    let messages = this.loginScriptMessageList.get(uniqueId);
                    if (!messages) {
                        fileLogger.info("Creating new message list for this login script execution");
                        messages = new loginScriptExecutionMessages();
                        this.loginScriptMessageList.set(uniqueId, messages);
                    }
                    fileLogger.info("Adding this message to the message list for this execution");
                    messages.messages.push(new loginScriptExecutionMessage(ownerUri, msgType, event.executionId, event));
                    fileLogger.info("Number of messages in the queue for this execution is - " + messages.messages.length);
                }
            }
            else {
                fileLogger.info("There is no message in login script message queue, creating a new list for this execution");
                let messages = new loginScriptExecutionMessages();
                this.loginScriptMessageList.set(uniqueId, messages);
                fileLogger.info("Added message list for this execution to queue, number of message lists in queue - " + this.loginScriptMessageList.size);
                if (msgType === scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished) {
                    fileLogger.info("Deleting message list for this execution from queue as finished event received");
                    this.loginScriptMessageList.delete(uniqueId);
                }
                this.processingLoginScriptMessageInUi = true;
                fileLogger.info("Posting this message to UI,  message type: " + msgType + ", exection id: " + event.executionId);
                this.postLoginScriptMessage(ownerUri, event.executionId, msgType, event, scriptExecutionModels_1.OutputTarget.OutputPane);
            }
            fileLogger.info("Processing login script execution message completed, message type: " + msgType + ", exection id: " + event.executionId);
        }
        catch (err) {
            fileLogger.info("Error on processing of login script execution message from server");
            helper.logErroAfterValidating(err);
        }
    }
    async processNextLoginScriptMessage(ownerUri, execId) {
        fileLogger.info("Processing acknowledgement from ui for script execution message started, exection id: " + execId);
        this.processingLoginScriptMessageInUi = false;
        let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(ownerUri, execId);
        try {
            if (this.loginScriptMessageList.size > 0) {
                fileLogger.info("There are message lists in login script message queue, number of lists - " + this.loginScriptMessageList.size);
                let messages = this.loginScriptMessageList.get(uniqueId);
                if (messages) {
                    fileLogger.info("There is a message list for this execution in queue");
                    if (messages.messages.length > 0) {
                        fileLogger.info("There are messages in the message list for this execution, number of messages - " + messages.messages.length);
                        let message = messages.messages.shift();
                        fileLogger.info("Removed the first message from message list for this execution");
                        if (message.messageType === scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished) {
                            fileLogger.info("Deleting message list for this execution from queue as finished event received");
                            this.loginScriptMessageList.delete(uniqueId);
                        }
                        this.processingLoginScriptMessageInUi = true;
                        fileLogger.info("Posting the removed message to UI,  message type: " + message.messageType + ", exection id: " + message.execId);
                        this.postLoginScriptMessage(message.owneruri, message.execId, message.messageType, message.event, scriptExecutionModels_1.OutputTarget.OutputPane);
                    }
                }
                else if (this.loginScriptMessageList.size > 0) {
                    fileLogger.info("There are message lists for login script execution in queue but none for this execution");
                    let [firstKey] = this.loginScriptMessageList.keys();
                    fileLogger.info("Processing message list for next execution in the queue");
                    messages = this.loginScriptMessageList.get(firstKey);
                    if (messages && messages.messages.length > 0) {
                        fileLogger.info("There are messages in the message list for next execution, number of messages - " + messages.messages.length);
                        let message = messages.messages.shift();
                        fileLogger.info("Removed the first message from message list for next execution");
                        if (message.messageType === scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished) {
                            fileLogger.info("Deleting message list for this execution from queue as finished event received");
                            this.loginScriptMessageList.delete(uniqueId);
                        }
                        this.processingLoginScriptMessageInUi = true;
                        fileLogger.info("Posting the removed message to UI,  message type: " + message.messageType + ", exection id: " + message.execId);
                        this.postLoginScriptMessage(message.owneruri, message.execId, message.messageType, message.event, scriptExecutionModels_1.OutputTarget.OutputPane);
                    }
                }
            }
        }
        catch (err) {
            fileLogger.info("Error on processing of login script execution message acknowledgement from UI");
            helper.logErroAfterValidating(err);
        }
    }
    async processIfLoginScriptMessage(event, msgType) {
        let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(event.ownerUri, event.executionId);
        let isLoginScriptMessage = (event.ownerUri === constants_1.Constants.loginScriptResultsWindowUri) ||
            this.loginScriptExecutionDetails.has(uniqueId);
        if (isLoginScriptMessage) {
            if (msgType === scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage
                || msgType === scriptExecutionModels_1.OracleEventNames.scriptExecutionBatchedMessage) {
                fileLogger.info("Sending acknowledgement for this messsage to server");
                await this.acknowledgeScriptExecutionMessage(event, msgType);
            }
            if (event.ownerUri === constants_1.Constants.loginScriptResultsWindowUri) {
                await this.acknowledgeLoginScriptMessageAndPostToClients(event, msgType);
            }
            else {
                this.postLoginScriptMessage(event.ownerUri, event.executionId, msgType, event, scriptExecutionModels_1.OutputTarget.FullScreen);
            }
        }
        return isLoginScriptMessage;
    }
    postLoginScriptMessage(uri, executionId, msgType, event, outputTarget) {
        fileLogger.info("Post login script message to output pane or results window");
        try {
            switch (msgType) {
                case scriptExecutionModels_1.OracleEventNames.scriptExecutionFinished:
                    fileLogger.info("Received script execution finished event");
                    this.processLoginScriptFinished(uri, executionId, scriptExecutionModels_1.OutputTarget.OutputPane);
                    break;
                case scriptExecutionModels_1.OracleEventNames.scriptExecutionCancelled:
                    fileLogger.info("Received script execution cancelled event");
                    logger_1.ChannelLogger.Instance.info(localizedConstants_1.default.loginScriptExecutionCancelled);
                    let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(uri, executionId);
                    let loginScriptInfo = this.loginScriptExecutionDetails.get(uniqueId);
                    if (loginScriptInfo) {
                        loginScriptInfo.isLastMessageError = false;
                    }
                    break;
                case scriptExecutionModels_1.OracleEventNames.scriptExecutionBatchedMessage:
                    fileLogger.info("Received script execution batched message");
                    this.processBatchedMessageForLoginScript(uri, executionId, event, outputTarget);
                    break;
                case scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage:
                    fileLogger.info("Received script execution message");
                    this.postIfLoginScriptStartMessage(event);
                    break;
                default:
                    break;
            }
        }
        catch (err) {
            fileLogger.info("Error on processing script execution message and posting to relevant ui");
            helper.logErroAfterValidating(err);
        }
        finally {
            this.processNextLoginScriptMessage(uri, executionId);
        }
    }
    postIfLoginScriptStartMessage(event) {
        fileLogger.info("Processing login script start message - Start");
        if (event.outputTarget === scriptExecutionModels_1.OutputTarget.OutputPane) {
            fileLogger.info("Posting login script start message to output pane");
            logger_1.ChannelLogger.Instance.info(event.message.trim());
        }
        else {
            fileLogger.info("Posting login script start message to result client");
            event.message = event.message;
            this.resultDataServer.postToClients(event.ownerUri, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage, event);
        }
        let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(event.ownerUri, event.executionId);
        let loginScriptInfo = this.loginScriptExecutionDetails.get(uniqueId);
        if (loginScriptInfo) {
            loginScriptInfo.isLastMessageError = false;
        }
        fileLogger.info("Processing login script start message - End");
    }
    processBatchedMessageForLoginScript(uri, executionId, event, outputTarget) {
        fileLogger.info("Processing login script batched message - Start");
        let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(uri, executionId);
        let loginScriptInfo = this.loginScriptExecutionDetails.get(uniqueId);
        let sampleOutputMsg = event.messageList[0];
        if (sampleOutputMsg.requestMessageType == scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage) {
            let firstMsg = sampleOutputMsg;
            if (firstMsg.messageType === scriptExecutionModels_1.ScriptExecutionMessageType.Error) {
                fileLogger.info("Login script batched message received is an error message");
                let loginScriptInfo = this.loginScriptExecutionDetails.get(uniqueId);
                if (loginScriptInfo) {
                    loginScriptInfo.executedWithErrors = true;
                }
                this.postNestedScriptExecutionMessage(uri, executionId);
                let errorMsgToPost = event.messageList[event.messageList.length - 1];
                let formattedMessage = errorMsgToPost.message.trim();
                if (errorMsgToPost.sqlQuery && !formattedMessage.startsWith(errorMsgToPost.sqlQuery.trim())) {
                    formattedMessage = errorMsgToPost.sqlQuery + constants_1.Constants.newline + formattedMessage;
                }
                if (loginScriptInfo.isLastMessageError) {
                    formattedMessage = constants_1.Constants.newline + formattedMessage;
                }
                if (outputTarget === scriptExecutionModels_1.OutputTarget.OutputPane) {
                    fileLogger.info("Posting login script error message to output pane");
                    logger_1.ChannelLogger.Instance.log(formattedMessage);
                }
                else {
                    fileLogger.info("Posting login script error message to result client");
                    errorMsgToPost.message = formattedMessage;
                    this.resultDataServer.postToClients(event.ownerUri, event.executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage, errorMsgToPost);
                }
                if (loginScriptInfo) {
                    loginScriptInfo.isLastMessageError = true;
                }
            }
        }
        fileLogger.info("Processing login script batched message - End");
    }
    postNestedScriptExecutionMessage(ownerUri, executionId) {
        fileLogger.info("Processing nested script execution message - Start");
        let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(ownerUri, executionId);
        let outputTarget = (ownerUri === constants_1.Constants.loginScriptResultsWindowUri) ? scriptExecutionModels_1.OutputTarget.OutputPane : scriptExecutionModels_1.OutputTarget.FullScreen;
        let loginScriptInfo = this.loginScriptExecutionDetails.get(uniqueId);
        if (loginScriptInfo) {
            let nestedScriptExecutionList = loginScriptInfo.nestedScriptExecutionList;
            if (nestedScriptExecutionList) {
                let nestedScripts = nestedScriptExecutionList.get(uniqueId);
                if (nestedScripts && nestedScripts.length > 0) {
                    fileLogger.info("Posting start message for nested scripts");
                    nestedScripts.forEach((script) => {
                        let nestedScriptMsg = `${localizedConstants_1.default.executingScript} "${script}"`;
                        fileLogger.info("Post nested script execution message to output or results window");
                        this.postLoginScriptExecutionMessage(ownerUri, executionId, nestedScriptMsg, outputTarget);
                        if (loginScriptInfo) {
                            loginScriptInfo.isLastMessageError = false;
                        }
                    });
                }
                nestedScripts = [];
                nestedScriptExecutionList.set(uniqueId, nestedScripts);
            }
        }
        fileLogger.info("Processing nested script execution message - End");
    }
    postLoginScriptExecutionMessage(ownerUri, executionId, msgString, outputTarget) {
        fileLogger.info("Post login script execution message - Start");
        if (outputTarget === scriptExecutionModels_1.OutputTarget.OutputPane) {
            fileLogger.info("Posting login script execution message to output pane");
            logger_1.ChannelLogger.Instance.info(msgString);
        }
        else {
            fileLogger.info("Posting login script execution message to results window");
            let message = new scriptExecutionModels_1.ScriptExecutionMessageEvent();
            message.ownerUri = ownerUri;
            message.executionId = executionId;
            message.messageType = scriptExecutionModels_1.ScriptExecutionMessageType.Message;
            message.outputTarget = scriptExecutionModels_1.OutputTarget.FullScreen;
            message.message = msgString + constants_1.Constants.newline;
            this.resultDataServer.postToClients(ownerUri, executionId, scriptExecutionModels_1.OracleEventNames.scriptExecutionMessage, message);
        }
        fileLogger.info("Post login script execution message - End");
    }
    processLoginScriptFinished(uri, executionId, outputTarget) {
        fileLogger.info("Process login script execution finished message - Start");
        let uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(uri, executionId);
        try {
            let executedWithErrors = false;
            let loginScriptInfo = this.loginScriptExecutionDetails.get(uniqueId);
            if (loginScriptInfo) {
                executedWithErrors = loginScriptInfo.executedWithErrors;
            }
            let messageToPost = "";
            if (executedWithErrors) {
                fileLogger.info("Login script has executed with errors");
                messageToPost = localizedConstants_1.default.loginScriptExecutionFinished;
            }
            else {
                fileLogger.info("Login script has executed successfully");
                messageToPost = localizedConstants_1.default.loginScriptExecutionSucceeded;
            }
            fileLogger.info("Posting login script end message to output pane or results window");
            this.postLoginScriptExecutionMessage(uri, executionId, messageToPost, outputTarget);
        }
        catch (err) {
            fileLogger.info("Error on proocessing login script finished event");
            helper.logErroAfterValidating(err);
        }
        finally {
            this.loginScriptExecutionDetails.delete(uniqueId);
        }
        fileLogger.info("Process login script execution finished message - End");
    }
    clearCurrentMessageList(ownerUri, executionId) {
        let uniqueId = "";
        try {
            uniqueId = helper_1.Utils.CreateIdByURIandExecutionId(ownerUri, executionId);
            fileLogger.info("Clearing current message list for " + uniqueId);
            let currentMessage = this.currentMessageList.get(uniqueId);
            if (currentMessage) {
                this.currentMessageList.delete(uniqueId);
            }
            fileLogger.info("Cleared current message list for " + uniqueId);
        }
        catch (err) {
            fileLogger.info("Error on clearing current message list for " + uniqueId);
            helper.logErroAfterValidating(err);
        }
    }
    resetWindowFocus(ownerUri, executionId) {
        let clients = this.resultDataServer.getClientInfo(ownerUri, executionId);
        if (clients) {
            let activeFile = undefined;
            if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
                activeFile = vscode.window.activeTextEditor.document.fileName;
            }
            for (let client of clients) {
                let parent = client.parentEditor;
                if (parent && parent.document && !parent.document.isClosed) {
                    if (!activeFile || activeFile === parent.document.fileName) {
                        this.vscodeConnector.showTextDocument(parent.document, parent.viewColumn);
                        fileLogger.info("Reset focus from results window to active script");
                        break;
                    }
                }
            }
        }
    }
}
exports.ScriptExecutionEventsHandler = ScriptExecutionEventsHandler;
ScriptExecutionEventsHandler.themeSection = "workbench.colorTheme";
class currentScriptExecutionMessage {
}
exports.currentScriptExecutionMessage = currentScriptExecutionMessage;
class loginScriptExecutionMessages {
    constructor() {
        this.messages = [];
    }
}
exports.loginScriptExecutionMessages = loginScriptExecutionMessages;
class loginScriptExecutionMessage {
    constructor(owneruri, messageType, execId, event) {
        this.owneruri = owneruri;
        this.messageType = messageType;
        this.execId = execId;
        this.event = event;
    }
}
exports.loginScriptExecutionMessage = loginScriptExecutionMessage;
class loginScriptExecutionInfo {
    constructor() {
        this.isLastMessageError = false;
        this.executedWithErrors = false;
        this.nestedScriptExecutionList = new Map();
    }
}
exports.loginScriptExecutionInfo = loginScriptExecutionInfo;
