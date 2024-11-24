"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootWebPageArguments = exports.ScriptExecutionCommandHandler = void 0;
const fs_1 = require("fs");
const path = require("path");
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const fs = require("fs");
const dataExplorerRequests_1 = require("../explorer/dataExplorerRequests");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const scriptExecutionRequests_1 = require("../models/scriptExecutionRequests");
const helper_1 = require("../utilities/helper");
const localizedConstants_1 = require("./../constants/localizedConstants");
const logger_1 = require("./../infrastructure/logger");
const resultsDataServer_1 = require("./resultsDataServer");
const saveQueryResultRequest_1 = require("./saveQueryResultRequest");
const scriptExecutionEventsHandler_1 = require("./scriptExecutionEventsHandler");
const queryHistoryRequests_1 = require("../explorer/queryHistoryRequests");
const queryBookmarkRequest_1 = require("../explorer/queryBookmarkRequest");
const utilities_1 = require("../explorer/utilities");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const userPreferenceManager_1 = require("../infrastructure/userPreferenceManager");
const oracleEditorManager_1 = require("../infrastructure/oracleEditorManager");
const setup_1 = require("../utilities/setup");
const helper = require("../utilities/helper");
const settings_1 = require("../utilities/settings");
const realTimeSqlMonitorServiceProvider_1 = require("../infrastructure/realTimeSqlMonitorServiceProvider");
const fileLogger = logger_1.FileStreamLogger.Instance;
class ScriptExecutionCommandHandler {
    constructor(scriptEventManager, vscodeConnector, customServer, statusbarManager) {
        this.scriptEventManager = scriptEventManager;
        this.vscodeConnector = vscodeConnector;
        this.customServer = customServer;
        this.statusbarManager = statusbarManager;
        this.varScriptExecutionCount = 0;
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.getDataBatch, (message) => {
            this.dataBatchRequestHandler(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.cancelQuery, (message) => {
            this.cancelQuery(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.saveAllRequest, (message) => {
            this.handleSaveAllRequestMessage(message);
        });
        customServer.addMessageHandler(scriptExecutionModels_1.MessageName.saveExplainPlanRequest, (message) => {
            this.handleExplainPlanSaveRequestMessage(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.OracleEventNames.scriptSaveQueryResultCancelRequest, (message) => {
            this.handleCancelSaveAllRequestMessage(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.consumeUserInputRequest, (message) => {
            this.handleConsumeUserInputRequestMessage(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.clearRequest, (message) => {
            this.handleClearRequest(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.updateToolbarEvent, (message) => {
            this.handleUpdateToolbarEventRequest(message);
        });
        this.customServer.addMessageHandler(scriptExecutionModels_1.MessageName.acknowledgeMessageRequest, (message) => {
            this.handleAcknowledgeMessageRequest(message);
        });
        customServer.addMessageHandler(scriptExecutionModels_1.MessageName.rtsmActionRequest, (message) => {
            this.handleRtsmRequestMessage(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.rerunQueryRequest, (message) => {
            this.handleRerunQueryRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.sortAndFilterRequest, (message) => {
            this.handleSortAndFilterRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.overflowDataRequest, (message) => {
            this.handleOverflowDataRequest(message);
        });
    }
    handleAcknowledgeMessageRequest(message_obj) {
        let message = new scriptExecutionModels_1.ScriptExecutionAcknowledgeMessageRequestParams();
        Object.assign(message, message_obj);
        fileLogger.info("handleAcknowledgeMessageRequest request" + message.displayString());
        this.scriptEventManager.processAcknowledgementFromUi(message);
    }
    handleUpdateToolbarEventRequest(message) {
        fileLogger.info("handleUpdateToolbarEventRequest request");
        try {
            logger_1.FileStreamLogger.Instance.info("handleUpdateToolbarEventRequest");
            oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(message);
        }
        catch (err) {
            fileLogger.error(err);
        }
        fileLogger.info("handleUpdateToolbarEventRequest  fullfilled.");
    }
    handleClearRequest(message_obj) {
        try {
            let message = new scriptExecutionModels_1.ScriptExecutionClearEventParams();
            Object.assign(message, message_obj);
            let scriptUri = message.ownerUri;
            let currentExecutionId = message.executionId;
            let clearCurrentExecution = false;
            let managers = scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance.getExecutionManagersForUri(scriptUri);
            for (let index = 0; index < managers.length; index++) {
                if (managers[index].executionId == message.executionId &&
                    managers[index].executionStatus == scriptExecutionModels_1.ExecutionStatus.Finished) {
                    clearCurrentExecution = true;
                }
            }
            for (let index = 0; index < message.previousExecutionList.length; index++) {
                const executionId = message.previousExecutionList[index];
                if (executionId.toString() != currentExecutionId) {
                    scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance.unRegisterRunner(scriptUri, executionId);
                }
                else if (clearCurrentExecution) {
                    scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance.unRegisterRunner(scriptUri, executionId);
                }
            }
            this.scriptEventManager.sendQueryExecutionClearEventToServer(message);
        }
        catch (error) {
            helper_1.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
        }
    }
    get scriptExecutionCount() {
        return this.varScriptExecutionCount;
    }
    set scriptExecutionCount(value) {
        this.varScriptExecutionCount = value;
    }
    cancelAllScriptExecution(scriptPath) {
        const runningScripts = this.customServer.getExecutionInfo(scriptPath);
        runningScripts.forEach((clientInfo) => {
            const cancelParams = new scriptExecutionModels_1.CancelScriptExecutionParams();
            cancelParams.executionId = clientInfo.executionId;
            cancelParams.ownerUri = clientInfo.ownerUri;
            this.cancelQuery(cancelParams);
        });
    }
    handleCancelSaveAllRequestMessage(message) {
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(saveQueryResultRequest_1.SaveQueryResultCancelRequest.type, message).then(() => {
            logger_1.FileStreamLogger.Instance.info("Save cancel request accepted .");
        }, (error) => {
            logger_1.FileStreamLogger.Instance.error(`Failed to save data ${message.ownerUri}/${message.executionId}`);
            const errorResponse = new scriptExecutionModels_1.SaveQueryResultFinishedEventParams();
            errorResponse.ownerUri = message.ownerUri;
            errorResponse.queryId = message.queryId;
            errorResponse.messageType = scriptExecutionModels_1.SaveQueryResultMessageType.Error;
            errorResponse.message = error;
            this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, errorResponse);
        });
        logger_1.FileStreamLogger.Instance.info("sent cancel save request request sccessfully sent");
    }
    async handleExplainPlanSaveRequestMessage(message) {
        const options = {};
        options.filters = {};
        options.filters[scriptExecutionModels_1.DataFormat[message.fileFormat]] = helper_1.Utils.getExtension(message.fileFormat);
        fileLogger.info('Received handleExplainPlanSaveRequestMessage');
        const response = new scriptExecutionModels_1.SaveExplainPlanRequestResponse();
        response.ownerUri = message.ownerUri;
        response.queryId = message.queryId;
        response.queryResultId = message.queryResultId;
        try {
            if (message && message.fileFormat) {
                const options = {};
                switch (message.fileFormat) {
                    case scriptExecutionModels_1.DataFormat.JSON:
                        options.filters = { 'JSON': ['json'] };
                        break;
                    case scriptExecutionModels_1.DataFormat.TEXT:
                        options.filters = { 'TEXT': ['txt'] };
                        break;
                    default:
                        options.filters = { 'All types': ['*'] };
                        break;
                }
                let fileToSave = await vscode.window.showSaveDialog(options);
                if (fileToSave && fileToSave.fsPath) {
                    fs.writeFileSync(fileToSave.fsPath, message.data);
                    let document = await vscode.workspace.openTextDocument(fileToSave);
                    await vscode.window.showTextDocument(document, { preview: false });
                    response.status = scriptExecutionModels_1.SaveExplainPlanStatus.Success;
                    response.filePath = fileToSave.fsPath;
                    response.message = (0, helper_1.stringFormatterCsharpStyle)(localizedConstants_1.default.savedToFile, fileToSave.fsPath);
                }
                else {
                    response.status = scriptExecutionModels_1.SaveExplainPlanStatus.UserCancel;
                }
            }
        }
        catch (error) {
            fileLogger.error(error);
            response.status = scriptExecutionModels_1.SaveExplainPlanStatus.Error;
            response.message = (0, helper_1.stringFormatterCsharpStyle)(localizedConstants_1.default.errorInSavingToFile, error.message);
        }
        this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.MessageName.saveExplainPlanRequestResponse, response);
    }
    async handleRtsmRequestMessage(message) {
        return realTimeSqlMonitorServiceProvider_1.RealTimeSqlMonitorServiceProvider.instance.handleRtsmRequestMessage(message);
    }
    handleSaveAllRequestMessage(message) {
        if (!message.saveDataToFile) {
            this.saveQueryResultRequest(message);
            return;
        }
        const options = {};
        options.filters = {};
        options.filters[scriptExecutionModels_1.DataFormat[message.fileFormat]] = helper_1.Utils.getExtension(message.fileFormat);
        vscode.window.showSaveDialog(options).then((response) => {
            if (response) {
                let isRemoteEnvironment = (this.vscodeConnector.ExtensionContext.extension.extensionKind === vscode.ExtensionKind.Workspace) || (vscode.env.remoteName !== undefined) || (vscode.env.uiKind === vscode.UIKind.Web);
                if (isRemoteEnvironment && response.scheme === constants_1.Constants.schemeVscodeLocal) {
                    logger_1.FileStreamLogger.Instance.info(`Failed to save data ${message.ownerUri}. Cannot access local location.`);
                    const errorResponse = new scriptExecutionModels_1.SaveQueryResultFinishedEventParams();
                    errorResponse.ownerUri = message.ownerUri;
                    errorResponse.queryId = message.queryId;
                    errorResponse.queryResultId = message.queryResultId;
                    errorResponse.messageType = scriptExecutionModels_1.SaveQueryResultMessageType.Error;
                    errorResponse.message = localizedConstants_1.default.saveQueryNoLocalAccess;
                    this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, errorResponse);
                }
                else {
                    message.fileName = response.fsPath;
                    this.saveQueryResultRequest(message);
                }
            }
            else {
                logger_1.FileStreamLogger.Instance.info("User cancelled save dialog all errored");
                const errorResponse = new scriptExecutionModels_1.SaveQueryResultFinishedEventParams();
                errorResponse.ownerUri = message.ownerUri;
                errorResponse.queryId = message.queryId;
                errorResponse.queryResultId = message.queryResultId;
                errorResponse.messageType = scriptExecutionModels_1.SaveQueryResultMessageType.UserCancel;
                this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, errorResponse);
            }
        }, (error) => {
            logger_1.FileStreamLogger.Instance.error(`Failed to save data ${message.ownerUri}`);
            const errorResponse = new scriptExecutionModels_1.SaveQueryResultFinishedEventParams();
            errorResponse.ownerUri = message.ownerUri;
            errorResponse.queryId = message.queryId;
            errorResponse.queryResultId = message.queryResultId;
            errorResponse.messageType = scriptExecutionModels_1.SaveQueryResultMessageType.Error;
            errorResponse.message = error;
            this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, errorResponse);
        });
    }
    saveQueryResultRequest(message) {
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(saveQueryResultRequest_1.SaveQueryResultRequest.type, message).then((result) => {
            this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.MessageName.saveAllResponse, result);
            userPreferenceManager_1.UserPreferenceManager.Instance.saveResultsWindowUserPreferences(message.fileFormat);
            logger_1.FileStreamLogger.Instance.info("Save request sccessfully sent");
        }, (error) => {
            logger_1.FileStreamLogger.Instance.error(`Failed to save data ${message.ownerUri}`);
            const errorResponse = new scriptExecutionModels_1.SaveQueryResultFinishedEventParams();
            errorResponse.ownerUri = message.ownerUri;
            errorResponse.queryId = message.queryId;
            errorResponse.queryResultId = message.queryResultId;
            errorResponse.messageType = scriptExecutionModels_1.SaveQueryResultMessageType.Error;
            errorResponse.message = error;
            errorResponse.saveDataToFile = message.saveDataToFile;
            this.customServer.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.OracleEventNames.saveQueryResultFinishedEvent, errorResponse);
        });
    }
    cancelQuery(message) {
        fileLogger.info("Handle cancel query request");
        try {
            const args = message;
            if (ScriptExecutionCommandHandler.validateCancelRequestParams(args)) {
                scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance
                    .cancelQuery(args)
                    .then(() => {
                    fileLogger.info("Cancel query request successfully made.");
                })
                    .catch((err) => {
                    fileLogger.error(err);
                });
            }
        }
        catch (err) {
            fileLogger.error(err);
        }
    }
    getWindowTitle(fileName, explainPlanMode) {
        let prefix = localizedConstants_1.default.resultsWindowPrefix;
        let windowTitle = path.basename(fileName);
        switch (explainPlanMode) {
            case scriptExecutionModels_1.ExplainPlanMode.ExplainPlanGrid:
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExplainPlanText:
                prefix = localizedConstants_1.default.explainPlanWindowPrefix;
                break;
            case scriptExecutionModels_1.ExplainPlanMode.ExecutionPlanGrid:
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExecutionPlanText:
                prefix = localizedConstants_1.default.executionPlanWindowPrefix;
                break;
            default:
                break;
        }
        return `${prefix}: ${windowTitle}`;
    }
    startQueryExecution(args, fileName, uiMode, title = null) {
        fileLogger.info("Query execution is starting for " +
            args.displayString() +
            "file:" +
            fileName);
        const self = this;
        fileLogger.info("Script execution Params " + args.ownerUri);
        args.executionId = (++this.scriptExecutionCount).toString();
        let windowTitle;
        if (title === null) {
            windowTitle = path.basename(fileName);
            windowTitle = this.getWindowTitle(fileName, args.explainMode);
        }
        else
            windowTitle = title;
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning || args.loginScript) {
            this.scriptEventManager
                .executeScript(scriptExecutionRequests_1.OracleRequestTypes.scriptExecute, args)
                .then(() => {
                fileLogger.info("Query execution started.Received response from server.");
                let inputArgs = new RootWebPageArguments();
                if (args.windowUri == null) {
                    inputArgs.uri = args.ownerUri;
                    inputArgs.windowUri = args.ownerUri;
                }
                else {
                    inputArgs.uri = args.windowUri;
                    inputArgs.windowUri = args.windowUri;
                }
                inputArgs.executionId = args.executionId;
                inputArgs.uiMode = uiMode;
                if (args.loginScript) {
                    const existingView = this.preProcessLoginScriptExecution(args);
                    this.handleSuccessfullyQueuedLoginScriptExecution(args, self, existingView, uiMode, inputArgs);
                }
                else {
                    if (args.isRtsmRequest) {
                        let connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUri(args.connectionUri);
                        inputArgs.rtsmId = connNode.connectionUniqueId;
                    }
                    this.handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, uiMode, inputArgs, inputArgs.uri);
                }
            }, (err) => {
                this.handleFailureToQueueScriptExecution(err, args, self, existingPanel);
            });
        }
    }
    startGenerateSQLFromNLQueryExecution(args, fileName, uiMode, title = null) {
        fileLogger.info("GenerateSQL from NL Query execution is starting for " +
            args.displayString() +
            "file:" +
            fileName);
        const self = this;
        fileLogger.info("Script execution Params " + args.ownerUri);
        args.executionId = (++this.scriptExecutionCount).toString();
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning) {
            this.scriptEventManager
                .executeScript(scriptExecutionRequests_1.OracleRequestTypes.scriptExecute, args)
                .then(() => {
                fileLogger.info("GenerateSQL execution started.Received response from server.");
            }, (err) => {
                this.handleFailureToQueueScriptExecution(err, args, self, existingPanel);
            });
        }
    }
    preProcessScriptExecution(args) {
        let existingPanel;
        let uri;
        if (args instanceof scriptExecutionModels_1.ScriptExecutionMessageBase && args.windowUri)
            uri = args.windowUri;
        else
            uri = args.ownerUri;
        const isRunning = this.isRunning(uri);
        if (isRunning && !(args.loginScript)) {
            this.vscodeConnector.showInformationMessage(localizedConstants_1.default.scriptIsAlreadyExecutingOrCancelRunningExecution);
        }
        else if (args.loginScript) {
            existingPanel = undefined;
        }
        else {
            let webPanelURI = uri;
            const clientList = this.customServer.getClientInfo(webPanelURI, undefined);
            if (clientList && clientList.length > 0) {
                existingPanel = clientList[0].panel;
            }
            else {
                existingPanel = this.customServer.getFromDetachedPanels(webPanelURI);
            }
            this.scriptEventManager.unRegisterRunner(webPanelURI);
            if (!existingPanel) {
                this.closeResultWindow(webPanelURI);
                this.customServer.unRegisterClient(webPanelURI);
            }
        }
        return { isRunning, existingPanel };
    }
    preProcessLoginScriptExecution(args) {
        let existingView = false;
        const clientList = this.customServer.getClientInfo(args.windowUri ? args.windowUri : args.ownerUri, undefined);
        if (clientList && clientList.length > 0) {
            existingView = true;
        }
        this.scriptEventManager.unRegisterRunner(args.ownerUri);
        if (!existingView) {
            this.customServer.unRegisterClient(args.ownerUri);
        }
        return existingView;
    }
    startShowDataExecution(args, operationUri) {
        fileLogger.info("Show Data execution is starting for " +
            dataExplorerRequests_1.DataExplorerBasicObjectPropertiesParams.displayString(args) +
            "file:" +
            operationUri);
        const self = this;
        fileLogger.info(`"Show Data execution Params uri  ${args.ownerUri} executionId ${args.executionId}`);
        args.executionId = (++this.scriptExecutionCount).toString();
        let windowTitle = operationUri;
        windowTitle = `Data > ${windowTitle}>${args.schemaName}.${args.objectName}`;
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning) {
            this.scriptEventManager
                .showObjectData(dataExplorerRequests_1.DataExplorerShowObjectDataRequest.type, args)
                .then(() => {
                let inputArgs = new RootWebPageArguments();
                inputArgs.uri = args.ownerUri;
                inputArgs.executionId = args.executionId;
                inputArgs.windowUri = args.ownerUri;
                inputArgs.uiMode = scriptExecutionModels_1.UIDisplayMode.ShowData;
                this.handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, scriptExecutionModels_1.UIDisplayMode.ShowData, inputArgs);
            }, (error) => {
                this.handleFailureToQueueScriptExecution(error, args, self, existingPanel);
                if (error.code === utilities_1.DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                    let connectionNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(args.connectionUri);
                    if (connectionNode) {
                        dataExplorerManager_1.DataExplorerManager.Instance.onConnectionDisconnect(connectionNode, true);
                    }
                }
            });
            fileLogger.info("Show Data Query executionstarted");
        }
    }
    startHistObjectExecution(args) {
        const self = this;
        fileLogger.info(`Script execution Params uri  ${args.ownerUri} executionId ${args.executionId}`);
        args.executionId = (++this.scriptExecutionCount).toString();
        let windowTitle = localizedConstants_1.default.history;
        windowTitle = `Run > ${windowTitle}`;
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning) {
            this.scriptEventManager
                .runHistObject(queryHistoryRequests_1.QueryHistoryRunObjectRequest.type, args)
                .then(() => {
                let inputArgs = new RootWebPageArguments();
                inputArgs.uri = args.ownerUri;
                inputArgs.executionId = args.executionId;
                inputArgs.windowUri = args.ownerUri;
                inputArgs.uiMode = scriptExecutionModels_1.UIDisplayMode.RunCodeObject;
                this.handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, scriptExecutionModels_1.UIDisplayMode.RunCodeObject, inputArgs);
            }, (err) => {
                this.handleFailureToQueueScriptExecution(err, args, self, existingPanel);
            });
            fileLogger.info("Query execution started");
        }
    }
    startBookmarkObjectExecution(args) {
        const self = this;
        fileLogger.info(`Script execution Params uri  ${args.ownerUri} executionId ${args.executionId}`);
        args.executionId = (++this.scriptExecutionCount).toString();
        let windowTitle = localizedConstants_1.default.bookmark;
        windowTitle = `Run : ${args.bookMarkFolderName}.${args.bookMarkItemName}`;
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning) {
            this.scriptEventManager
                .runBookmarkObject(queryBookmarkRequest_1.RunBookmarkRequest.type, args)
                .then(() => {
                let inputArgs = new RootWebPageArguments();
                inputArgs.uri = args.ownerUri;
                inputArgs.executionId = args.executionId;
                inputArgs.windowUri = args.ownerUri;
                inputArgs.uiMode = scriptExecutionModels_1.UIDisplayMode.RunCodeObject;
                this.handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, scriptExecutionModels_1.UIDisplayMode.RunCodeObject, inputArgs);
            }, (err) => {
                this.handleFailureToQueueScriptExecution(err, args, self, existingPanel);
            });
            fileLogger.info("Query execution started");
        }
    }
    startCodeExecution(args, operationUri, connectionName, requestFromFile) {
        fileLogger.info("Query execution is starting for " +
            dataExplorerRequests_1.RunCodeObjectRequestParams.displayString(args) +
            "file:" +
            operationUri);
        const self = this;
        fileLogger.info(`Script execution Params uri  ${args.ownerUri} executionId ${args.executionId}`);
        args.executionId = (++this.scriptExecutionCount).toString();
        let windowTitle = operationUri;
        windowTitle = `Run > ${windowTitle}`;
        const objectnameforTitle = this.getObjectNameForTitle(args);
        if ((objectnameforTitle && this.getObjectNameForTitle.length > 0)) {
            windowTitle = `${windowTitle}>${objectnameforTitle}`;
        }
        const { isRunning, existingPanel } = this.preProcessScriptExecution(args);
        if (!isRunning) {
            this.scriptEventManager
                .runCodeObject(dataExplorerRequests_1.RunCodeObjectRequestStronglyTyped.type, args)
                .then((values) => {
                let inputArgs = new RootWebPageArguments();
                inputArgs.uri = args.ownerUri;
                inputArgs.executionId = args.executionId;
                inputArgs.windowUri = args.ownerUri;
                inputArgs.uiMode = scriptExecutionModels_1.UIDisplayMode.RunCodeObject;
                inputArgs.connectionName = connectionName;
                let codeObjectFileConnUri = requestFromFile ? args.connectionUri : null;
                this.handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, scriptExecutionModels_1.UIDisplayMode.RunCodeObject, inputArgs, null, codeObjectFileConnUri);
            }, (err) => {
                this.handleFailureToQueueScriptExecution(err, args, self, existingPanel);
            });
            fileLogger.info("Query execution started");
        }
    }
    isRunning(scriptUri) {
        fileLogger.info("Check if query execution is in progress for " + scriptUri);
        return this.scriptEventManager.isRunning(scriptUri);
    }
    async cancelScriptExecution(cancelParams) {
        fileLogger.info("Cancel query execution for " + cancelParams.ownerUri);
        const result = await this.scriptEventManager.cancelQuery(cancelParams);
        if (result && result !== true) {
            this.vscodeConnector.showInformationMessage(localizedConstants_1.default.couldNotCancelScriptExecution);
        }
        return result;
    }
    openResultsWindow(scriptUri, connectionUri, windowTitle, executionId, existingPanel, uiMode, inputArgs, originalURI = null, codeObjectFileConnUri = null) {
        fileLogger.info("Open Results window for script uri");
        return new Promise((resolve, reject) => {
            try {
                this.openPanel(windowTitle, connectionUri, scriptUri, executionId, existingPanel, uiMode, inputArgs, originalURI, codeObjectFileConnUri);
                resolve();
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.log(error);
                reject();
            }
        });
    }
    openResultsView(scriptUri, executionId, existingView, uiMode, inputArgs) {
        fileLogger.info("Open Results window for script uri");
        return new Promise((resolve, reject) => {
            try {
                this.openView(scriptUri, executionId, existingView, uiMode, inputArgs);
                resolve();
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.log(error);
                reject();
            }
        });
    }
    static generateHtml(vscodeConnector, params, panel) {
        const onDiskPath = vscode.Uri.file(constants_1.Constants.websiteOutPath);
        const baseURI = panel.webview.asWebviewUri(onDiskPath);
        params.baseDirectory = baseURI;
        params.locale = vscodeConnector.language;
        const workbench = vscodeConnector.getConfiguration("workbench");
        const theme = workbench.colorTheme;
        if (theme.toUpperCase().indexOf("DARK") > -1) {
            params.customTheme = "dark";
            params.themeName = "black";
        }
        else {
            params.customTheme = "light";
            params.themeName = "white";
        }
        params.themeFilePath = `css/${params.themeName}/0.0.1/web/${params.themeName}.css`;
        if (!(0, fs_1.existsSync)(path.join(constants_1.Constants.websiteOutPath, params.themeFilePath))) {
            params.themeFilePath = `css/${params.themeName}/0.0.1/web/${params.themeName}.min.css`;
            params.useMinified = true;
        }
        const content = (0, fs_1.readFileSync)(constants_1.Constants.indexHtmlOutPath, "utf8");
        const data = ScriptExecutionCommandHandler.fillTemplate(content, params);
        return data;
    }
    static fillTemplate(templateString, templateVars) {
        return new Function("return `" + templateString + "`;").call(templateVars);
    }
    handleSuccessfullyQueuedScriptExecution(windowTitle, args, self, existingPanel, uiMode, inputArgs, originalURI = null, codeObjectFileConnUri = null) {
        this.openResultsWindow(inputArgs.windowUri, args.connectionUri, windowTitle, inputArgs.executionId, existingPanel, uiMode, inputArgs, originalURI, codeObjectFileConnUri).then(() => {
            fileLogger.info("Preview open success.");
            this.customServer.removeFromDetachedPanels(args.ownerUri);
        }, (error) => {
            logger_1.FileStreamLogger.Instance.log(error);
            const cancelParams = new scriptExecutionModels_1.CancelScriptExecutionParams();
            cancelParams.executionId = args.executionId;
            cancelParams.ownerUri = args.ownerUri;
            this.cancelScriptExecution(cancelParams).then(() => {
                fileLogger.info("Canceled running script on window close");
            }, (error) => {
                logger_1.FileStreamLogger.Instance.log(error);
                fileLogger.error("Could not Cancel running script on window close " +
                    args.ownerUri);
            });
            this.vscodeConnector.showErrorMessage(localizedConstants_1.default.unableToOpenResultUI);
            this.scriptEventManager.unRegisterRunner(args.ownerUri, args.executionId);
            self.customServer.unRegisterClient(args.ownerUri, args.executionId);
        });
    }
    handleSuccessfullyQueuedLoginScriptExecution(args, self, existingView, uiMode, inputArgs) {
        this.openResultsView(args.ownerUri, args.executionId, existingView, uiMode, inputArgs).then(() => {
            fileLogger.info("Preview open success.");
        }, (error) => {
            logger_1.FileStreamLogger.Instance.log(error);
            const cancelParams = new scriptExecutionModels_1.CancelScriptExecutionParams();
            cancelParams.executionId = args.executionId;
            cancelParams.ownerUri = args.ownerUri;
            this.cancelScriptExecution(cancelParams).then(() => {
                fileLogger.info("Canceled running script on window close");
            }, (error) => {
                logger_1.FileStreamLogger.Instance.log(error);
                fileLogger.error("Could not Cancel running script on window close " +
                    args.ownerUri);
            });
            this.vscodeConnector.showErrorMessage(localizedConstants_1.default.unableToOpenResultUI);
            this.scriptEventManager.unRegisterRunner(args.ownerUri, args.executionId);
            self.customServer.unRegisterClient(args.ownerUri, args.executionId);
        });
    }
    getObjectNameForTitle(requestParams) {
        let valToReturn = "";
        if (requestParams.parentName && requestParams.parentName.length > 0) {
            valToReturn = (0, helper_1.stringFormatterCsharpStyle)("{0}.{1}.{2}", requestParams.schemaName, requestParams.parentName, requestParams.objectName);
        }
        else {
            valToReturn = (0, helper_1.stringFormatterCsharpStyle)("{0}.{1}", requestParams.schemaName, requestParams.objectName);
        }
        return valToReturn;
    }
    handleFailureToQueueScriptExecution(err, args, self, existingPanel) {
        this.vscodeConnector.showErrorMessage(err.message);
        this.scriptEventManager.unRegisterRunner(args.ownerUri, args.executionId);
        self.customServer.unRegisterClient(args.ownerUri, args.executionId);
        if (existingPanel) {
            self.customServer.addToDetachedPanels(args.ownerUri, existingPanel);
        }
    }
    dataBatchRequestHandler(message_obj) {
        fileLogger.info("Handle data batch request");
        let message = new scriptExecutionModels_1.ScriptExecutionDataBatchRequest();
        Object.assign(message, message_obj);
        try {
            fileLogger.info(message.displayString());
            if (ScriptExecutionCommandHandler.validateBatchRequestParams(message)) {
                scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance
                    .getDataBatch(message)
                    .then(() => {
                    fileLogger.info("Data batch request successfully made.");
                })
                    .catch((err) => {
                    fileLogger.error(err);
                });
            }
        }
        catch (err) {
            fileLogger.error(err);
        }
    }
    openView(scriptUri, executionId, existingView, uiMode, inputArgs) {
        resultsDataServer_1.ResultDataServer.instanceSingle.registerLoginScriptClient(scriptUri, executionId);
    }
    static getReactWebviewContent(uiMode, panel, windowUri, connectionUri, executionId, querySettings, vscodeConnector) {
        let webviewInitData = new Map();
        webviewInitData["uimode"] = uiMode;
        webviewInitData["windowUri"] = windowUri;
        webviewInitData["connectionUri"] = connectionUri;
        webviewInitData["executionId"] = executionId;
        const { enable, loglevel } = (0, logger_1.getLoggingConfig)();
        webviewInitData["logLevel"] = loglevel;
        webviewInitData["loggingEnabled"] = enable;
        webviewInitData["dataBatchSize"] = querySettings.pageSize;
        webviewInitData["csvDelimiter"] = querySettings.csvDelimiter;
        webviewInitData["csvQualifier"] = querySettings.csvTextQualifier;
        webviewInitData["showRowNumber"] = querySettings.rowNumber;
        webviewInitData["cellTextLength"] = querySettings.cellTextLength;
        webviewInitData["tooltipTextLength"] = querySettings.tooltipTextLength;
        webviewInitData["maxRows"] = querySettings.maxRows;
        webviewInitData["locale"] = vscodeConnector.language;
        let intDataStr = JSON.stringify(webviewInitData);
        const reactAppPathOnDisk = vscode.Uri.file(path.join(constants_1.Constants.extensionPath, "out", "webview", "odtvscodeview.js"));
        const odtWebviewUri = panel.webview.asWebviewUri(reactAppPathOnDisk);
        const reactModulePathOnDisk = vscode.Uri.file(path.join(constants_1.Constants.extensionPath, "out", "webview", "module-react.js"));
        const reactModuleUri = panel.webview.asWebviewUri(reactModulePathOnDisk);
        const agGridModulePathOnDisk = vscode.Uri.file(path.join(constants_1.Constants.extensionPath, "out", "webview", "module-aggrid.js"));
        const agGridModuleUri = panel.webview.asWebviewUri(agGridModulePathOnDisk);
        const muiModulePathOnDisk = vscode.Uri.file(path.join(constants_1.Constants.extensionPath, "out", "webview", "module-mui.js"));
        const muiModuleUri = panel.webview.asWebviewUri(muiModulePathOnDisk);
        return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
        window.acquireVsCodeApi = acquireVsCodeApi;
        window.initData = ${intDataStr}; 
        </script>
        <script src="${reactModuleUri}"></script>
        <script src="${agGridModuleUri}"></script>
        <script src="${muiModuleUri}"></script>
    </head>
    <body style="overflow-y: scroll; padding:0 0px;" oncontextmenu="return false">
        <div id="root"></div>
        <script src="${odtWebviewUri}"></script>
    </body>
    </html>`;
    }
    useReactWebview(uiMode) {
        let retVal = false;
        switch (uiMode) {
            case scriptExecutionModels_1.UIDisplayMode.ExecuteScript:
            case scriptExecutionModels_1.UIDisplayMode.ExecuteSQLStatement:
            case scriptExecutionModels_1.UIDisplayMode.ShowData:
                retVal = true;
                break;
            default:
                retVal = false;
                break;
        }
        return retVal;
    }
    openPanel(windowTitle, connectionUri, scriptUri, executionId, existingPanel, uiMode, inputArgs, originalURI = null, codeObjectFileConnUri = null) {
        let panel = existingPanel;
        let isOwnerActiveScript = false;
        let isDiffViewColumn = false;
        if (!existingPanel) {
            panel = vscode.window.createWebviewPanel("OraclePLSResults", windowTitle, vscode.ViewColumn.Active, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            if (uiMode !== scriptExecutionModels_1.UIDisplayMode.ShowData) {
                let querySettings = new scriptExecutionModels_1.QuerySettings();
                if (uiMode === scriptExecutionModels_1.UIDisplayMode.RunCodeObject) {
                    if (!helper.isEmpty(codeObjectFileConnUri)) {
                        let connectionNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(codeObjectFileConnUri);
                        let connProps = connectionNode.connectionProperties;
                        querySettings = settings_1.Settings.getQueryExecutionSettings(connProps.configurationTarget, connProps.workspaceFolder);
                    }
                }
                else {
                    let uri = helper_1.Utils.getScriptFileURI(scriptUri);
                    querySettings = settings_1.Settings.getQueryExecutionSettingsForUri(uri);
                    if (helper_1.Utils.explainPlanORExecutionPlanDisplayMode(uiMode)) {
                        uri = originalURI;
                    }
                }
                let openDirection = querySettings.openResultsWindow;
                if (openDirection === constants_1.Constants.rightStr) {
                    isDiffViewColumn = true;
                    this.vscodeConnector.executeCommand('workbench.action.moveEditorToRightGroup').then((result) => {
                        fileLogger.info("Moved results window to right group");
                    }, (error) => {
                        fileLogger.error("Moving results window: " + error);
                    });
                }
                else if (openDirection === constants_1.Constants.belowStr) {
                    isDiffViewColumn = true;
                    this.vscodeConnector.executeCommand('workbench.action.moveEditorToBelowGroup').then((result) => {
                        fileLogger.info("Moved results window to below group");
                    }, (error) => {
                        fileLogger.error("Moving results window: " + error);
                    });
                }
            }
        }
        let resetWindowState = existingPanel && (uiMode ==
            scriptExecutionModels_1.UIDisplayMode.ConnectionManagement);
        if (helper_1.Utils.explainPlanORExecutionPlanDisplayMode(uiMode)) {
            isOwnerActiveScript = originalURI === this.vscodeConnector.activeTextEditorUri;
        }
        else {
            isOwnerActiveScript = scriptUri === this.vscodeConnector.activeTextEditorUri;
        }
        if (!existingPanel || resetWindowState) {
            panel.title = windowTitle;
            let args;
            if (inputArgs) {
                args = inputArgs;
            }
            else {
                args = new RootWebPageArguments();
            }
            args.uri = scriptUri;
            args.executionId = executionId;
            args.windowUri = scriptUri;
            args.uiMode = uiMode;
            let querySettings = settings_1.Settings.getQueryExecutionSettingsForUri(args.uri);
            if (!(helper_1.Utils.explainPlanORExecutionPlanDisplayMode(uiMode))) {
                args.dataBatchSize = setup_1.Setup.getExtensionConfigSection().get(constants_1.Constants.resultSetPageSizePropertyName);
            }
            if (inputArgs.uiMode == scriptExecutionModels_1.UIDisplayMode.RealTimeSqlMonitoringDetail) {
                realTimeSqlMonitorServiceProvider_1.RealTimeSqlMonitorServiceProvider.instance.RegisterRtsmDetailPanel(panel, inputArgs);
            }
            if (this.useReactWebview(uiMode)) {
                panel.webview.html = ScriptExecutionCommandHandler.getReactWebviewContent(uiMode, panel, scriptUri, connectionUri, executionId, querySettings, this.vscodeConnector);
            }
            else {
                panel.webview.html = ScriptExecutionCommandHandler.generateHtml(this.vscodeConnector, args, panel);
            }
            panel.onDidDispose(() => {
                this.closeResultWindow(scriptUri);
                if (inputArgs.uiMode == scriptExecutionModels_1.UIDisplayMode.RealTimeSqlMonitoringDetail) {
                    realTimeSqlMonitorServiceProvider_1.RealTimeSqlMonitorServiceProvider.instance.UnregisterRtsmDetailPanel(inputArgs);
                }
            }, undefined, this.vscodeConnector.ExtensionContext.subscriptions);
            panel.onDidChangeViewState((e) => {
                if (e && e.webviewPanel) {
                    if (e.webviewPanel.active && e.webviewPanel.visible) {
                        this.statusbarManager.onActiveTextEditorChanged(undefined);
                        if (uiMode == scriptExecutionModels_1.UIDisplayMode.ExecuteScript ||
                            uiMode == scriptExecutionModels_1.UIDisplayMode.ExecuteSQLStatement) {
                            fileLogger.info("Sending Update toolbar event to ScriptResultsModule");
                            let updateParams = new scriptExecutionModels_1.ToolbarEvent();
                            updateParams.ownerUri = scriptUri;
                            updateParams.executionId = executionId;
                            updateParams.windowUri = scriptUri;
                            updateParams.commandName = scriptExecutionModels_1.MessageName.toolbarUpdateEvent;
                            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(scriptUri, executionId, scriptExecutionModels_1.MessageName.toolbarEvent, updateParams);
                        }
                        else {
                            fileLogger.info("Hide toolbar for Webview");
                            oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(null);
                        }
                    }
                    else {
                        fileLogger.info("Window is either not active or visible");
                        if (this.vscodeConnector.activeTextEditor) {
                            oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(null);
                        }
                    }
                }
            });
            if (resetWindowState) {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(scriptUri);
            }
            let parentEditor = null;
            if (isOwnerActiveScript && isDiffViewColumn) {
                parentEditor = this.vscodeConnector.activeTextEditor;
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, scriptUri, executionId, parentEditor);
            if (!existingPanel) {
                let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(scriptUri, executionId);
                if (clients) {
                    clients.forEach(client => {
                        resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
                    });
                }
            }
        }
        if (existingPanel && !resetWindowState) {
            isDiffViewColumn = this.vscodeConnector.activeTextEditor && (existingPanel.viewColumn !== this.vscodeConnector.activeTextEditor.viewColumn);
            let parentEditor = null;
            if (this.isScriptExecutionMode(uiMode) && isOwnerActiveScript && isDiffViewColumn) {
                parentEditor = this.vscodeConnector.activeTextEditor;
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, scriptUri, executionId, parentEditor);
            let clearWindow = (uiMode == scriptExecutionModels_1.UIDisplayMode.ShowData || helper_1.Utils.explainPlanORExecutionPlanDisplayMode(uiMode) || uiMode == scriptExecutionModels_1.UIDisplayMode.RunCodeObject) ? true
                : (uiMode == scriptExecutionModels_1.UIDisplayMode.ExecuteSQLStatement || uiMode == scriptExecutionModels_1.UIDisplayMode.ExecuteScript)
                    ? settings_1.Settings.getQueryExecutionSettingsForUri(scriptUri).clearResultsWindow : false;
            if (clearWindow) {
                const clearParams = new scriptExecutionModels_1.ToolbarEvent();
                clearParams.ownerUri = scriptUri;
                clearParams.executionId = executionId;
                clearParams.windowUri = scriptUri;
                clearParams.commandName = scriptExecutionModels_1.MessageName.toolbarClearClicked;
                clearParams.currentUIMode = uiMode;
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(scriptUri, executionId, scriptExecutionModels_1.MessageName.toolbarEvent, clearParams);
            }
            let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(scriptUri, executionId);
            if (clients) {
                clients.forEach(client => {
                    let readyEvent = new scriptExecutionModels_1.ReceiverReadyEvent();
                    readyEvent.ownerUri = scriptUri;
                    readyEvent.executionId = executionId;
                    resultsDataServer_1.ResultDataServer.instanceSingle.handleReadyRequest(readyEvent);
                });
            }
        }
        if (helper_1.Utils.explainPlanORExecutionPlanDisplayMode(uiMode) && existingPanel && resetWindowState) {
            isDiffViewColumn = this.vscodeConnector.activeTextEditor && (existingPanel.viewColumn !== this.vscodeConnector.activeTextEditor.viewColumn);
        }
        if (this.isScriptExecutionMode(uiMode)) {
            panel.reveal(panel.viewColumn);
        }
        else {
            let preserveFocus = existingPanel && isOwnerActiveScript && isDiffViewColumn;
            panel.reveal(panel.viewColumn, preserveFocus);
        }
    }
    openConnectionManagementPanel(args) {
        let viewType = args.uiMode === scriptExecutionModels_1.UIDisplayMode.AutonomousDatabaseConnectionManagement ? "OracleADBConnectionManagement" : "OracleConnectionManagement";
        helper_1.Utils.openWebviewPanel(args, viewType, "Connection page is active and visible", this.vscodeConnector);
    }
    isScriptExecutionMode(uiMode) {
        return (uiMode === scriptExecutionModels_1.UIDisplayMode.ExecuteSQLStatement || uiMode === scriptExecutionModels_1.UIDisplayMode.ExecuteScript);
    }
    openFormatterSettingsPanel(args, toolbar) {
        helper_1.Utils.openWebviewPanel(args, "OracleFormatterSettings", "Formatter settings page is active and visible", this.vscodeConnector, toolbar ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active);
    }
    openExplainPlanSettingsPanel(args) {
        helper_1.Utils.openWebviewPanel(args, "OracleExplainPlanSettings", "Explain plan and Execution plan settings page is active and visible", this.vscodeConnector);
    }
    openCompilerSettingsPanel(args) {
        const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri);
        const clientInfo = clients && clients.length > 0 ? clients[0] : null;
        let existingPanel = clientInfo ? clientInfo.panel : null;
        let panel = existingPanel;
        if (!panel) {
            panel = vscode.window.createWebviewPanel("OracleCompilerSettings", args.windowTitle, vscode.ViewColumn.Active, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
        }
        panel.webview.html = ScriptExecutionCommandHandler.generateHtml(this.vscodeConnector, args, panel);
        panel.onDidDispose(() => {
            resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
        }, undefined, this.vscodeConnector.ExtensionContext.subscriptions);
        panel.onDidChangeViewState((e) => {
            if (e && e.webviewPanel) {
                if (e.webviewPanel.active && e.webviewPanel.visible) {
                    fileLogger.info("Compiler settings page is active and visible");
                    this.statusbarManager.onActiveTextEditorChanged(undefined);
                }
            }
        });
        panel.reveal(panel.viewColumn, false);
        if (existingPanel) {
            resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
        }
        resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, args.windowUri, args.executionId);
        if (!existingPanel) {
            let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri, args.executionId);
            if (clients) {
                clients.forEach(client => {
                    resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
                });
            }
        }
    }
    openFilterSettingsPanel(args) {
        helper_1.Utils.openWebviewPanel(args, "OracleFilterSettings", "Filter settings page is active and visible", this.vscodeConnector);
    }
    closeResultWindow(scriptUri) {
        fileLogger.info("Closing query results window for script");
        const clientInfos = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(scriptUri);
        for (let index = 0; index < clientInfos.length; index++) {
            const clientInfo = clientInfos[index];
            if (clientInfo) {
                const params = new scriptExecutionModels_1.ScriptExecutionDisposeEventParams();
                params.ownerUri = clientInfo.ownerUri;
                params.executionId = clientInfo.executionId;
                this.scriptEventManager.sendQueryExecutionDisposeEventToServer(params);
                scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance.unRegisterRunner(clientInfo.ownerUri, clientInfo.executionId);
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(clientInfo.ownerUri, clientInfo.executionId);
                fileLogger.info("Closed query results window for script");
            }
        }
    }
    resetScriptExecution(scriptUri) {
        const params = new scriptExecutionModels_1.ScriptExecutionResetEventParams();
        params.ownerUri = scriptUri;
        this.scriptEventManager.sendQueryExecutionResetEventToServer(params);
    }
    handleConsumeUserInputRequestMessage(message_obj) {
        let message = new scriptExecutionModels_1.UserInputParams();
        Object.assign(message, message_obj);
        logger_1.FileStreamLogger.Instance.info("User input received in extension " + message.displayString());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(saveQueryResultRequest_1.ConsumeUserInputRequest.type, message).then((response) => {
            logger_1.FileStreamLogger.Instance.info("User input received in successfully");
        }, (error) => {
            logger_1.FileStreamLogger.Instance.warn("User input not accepted .");
        });
    }
    getNextExecutionID() {
        return (++this.scriptExecutionCount).toString();
    }
    async handleRerunQueryRequest(rerunRequest) {
        try {
            logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleRerunRequest - Start");
            if (this.isRunning(rerunRequest.ownerUri)) {
                logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleRerunRequest - Another execution in progress.");
                this.vscodeConnector.showInformationMessage(localizedConstants_1.default.scriptIsAlreadyExecutingOrCancelRunningExecution);
                return;
            }
            this.scriptEventManager.resetExecutionStatus(rerunRequest.ownerUri, rerunRequest.executionId);
            const rerunParams = new scriptExecutionModels_1.RerunQueryRequestParams();
            rerunParams.ownerUri = rerunRequest.ownerUri;
            rerunParams.windowUri = rerunRequest.windowUri;
            rerunParams.connectionUri = rerunRequest.connectionUri;
            rerunParams.executionId = rerunRequest.executionId;
            rerunParams.queryId = rerunRequest.queryId;
            rerunParams.queryResultId = rerunRequest.queryResultId;
            rerunParams.executionMode = scriptExecutionModels_1.ExecutionMode.None;
            rerunParams.explainMode = scriptExecutionModels_1.ExplainPlanMode.None;
            rerunParams.explainPlanDetail = null;
            rerunParams.querySettings = settings_1.Settings.getQueryExecutionSettingsForUri(rerunRequest.ownerUri);
            rerunParams.querySettings.maxRows = rerunRequest.maxRows;
            rerunParams.scriptFileName = rerunRequest.ownerUri;
            rerunParams.windowUri = rerunRequest.ownerUri;
            rerunParams.updateIntellisense = false;
            rerunParams.displayMode = rerunRequest.displayMode;
            let response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(scriptExecutionRequests_1.RerunQueryRequest.type, rerunParams);
            if (!response.rerun) {
                logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleRerunRequest - Error response from server");
                let errMsg = localizedConstants_1.default.rerunQueryError;
                if (response.message) {
                    errMsg = errMsg + " : " + response.message;
                }
                logger_1.FileStreamLogger.Instance.info(errMsg);
                this.vscodeConnector.showErrorMessage(errMsg);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleRerunRequest - Error");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleRerunRequest - End");
    }
    async handleSortAndFilterRequest(sortAndFilterRequest) {
        logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleSortAndFilterRequest - Start");
        let response = { id: sortAndFilterRequest.id, sorted: false, message: undefined };
        try {
            response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(scriptExecutionRequests_1.SortAndFilterRequest.type, sortAndFilterRequest);
            if (!response.sorted) {
                logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleSortAndFilterRequest - Error response from server");
                let errMsg = localizedConstants_1.default.sortAndFilterError;
                if (response.message) {
                    errMsg = errMsg + " : " + response.message;
                }
                logger_1.FileStreamLogger.Instance.info(errMsg);
                this.vscodeConnector.showErrorMessage(errMsg);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleSortAndFilterRequest - Error");
            helper.logErroAfterValidating(error);
        }
        finally {
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(sortAndFilterRequest.ownerUri, sortAndFilterRequest.executionId, scriptExecutionModels_1.MessageName.sortAndFilterResponse, response);
        }
        logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleSortAndFilterRequest - End");
    }
    async handleOverflowDataRequest(overflowDataRequest) {
        logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleOverflowDataRequest - Start");
        let response = { id: overflowDataRequest.id, success: false, data: undefined };
        try {
            response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(scriptExecutionRequests_1.GetOverflowDataRequest.type, overflowDataRequest);
            if (!response.success) {
                logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleOverflowDataRequest - Error response from server");
                let errMsg = localizedConstants_1.default.errorFetchingOverflowData;
                this.vscodeConnector.showErrorMessage(errMsg);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleOverflowDataRequest - Error");
            helper.logErroAfterValidating(error);
        }
        finally {
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(overflowDataRequest.ownerUri, overflowDataRequest.executionId, scriptExecutionModels_1.MessageName.overflowDataResponse, response);
        }
        logger_1.FileStreamLogger.Instance.info("ScriptExecutionCommandHandler.handleOverflowDataRequest - End");
    }
}
exports.ScriptExecutionCommandHandler = ScriptExecutionCommandHandler;
ScriptExecutionCommandHandler.validateBatchRequestParams = (args) => {
    if (args.ownerUri && args.batchId && args.queryId && args.executionId && args.queryResultId) {
        return true;
    }
    else {
        return false;
    }
};
ScriptExecutionCommandHandler.validateCancelRequestParams = (args) => {
    if (args.ownerUri) {
        return true;
    }
    else {
        return false;
    }
};
class RootWebPageArguments {
    get windowTitle() {
        return this.varWindowTitle;
    }
    set windowTitle(value) {
        this.varWindowTitle = value;
    }
    get baseDirectory() {
        return this.varBaseDirectory;
    }
    set baseDirectory(value) {
        this.varBaseDirectory = value;
    }
    get locale() {
        return this.varLocale;
    }
    set locale(value) {
        this.varLocale = value;
    }
    get uri() {
        return this.varURI;
    }
    set uri(value) {
        this.varURI = value;
    }
    get baseTheme() {
        return this.varBaseTheme;
    }
    set baseTheme(value) {
        this.varBaseTheme = value;
    }
    get customTheme() {
        return this.varCustomTheme;
    }
    set customTheme(value) {
        this.varCustomTheme = value;
    }
    get executionId() {
        return this.executionIdField;
    }
    set executionId(v) {
        this.executionIdField = v;
    }
    get uiMode() {
        return this.varUIDisplayMode;
    }
    set uiMode(v) {
        this.varUIDisplayMode = v;
    }
    get isCreate() {
        return this.varIsCreate;
    }
    set isCreate(value) {
        this.varIsCreate = value;
    }
    get profileName() {
        return this.varProfileName;
    }
    set profileName(value) {
        this.varProfileName = value;
    }
    get regionName() {
        return this.varRegionName;
    }
    set regionName(value) {
        this.varRegionName = value;
    }
    get windowUri() {
        return this.varWindowUri;
    }
    set windowUri(value) {
        this.varWindowUri = value;
    }
    get adbDisplayName() {
        return this.varadbDisplayName;
    }
    set adbDisplayName(value) {
        this.varadbDisplayName = value;
    }
    get compartmentName() {
        return this.varcompartmentName;
    }
    set compartmentName(value) {
        this.varcompartmentName = value;
    }
    get compartmentFullPath() {
        return this.varcompartmentFullPath;
    }
    set compartmentFullPath(value) {
        this.varcompartmentFullPath = value;
    }
    get adbWorkLoadType() {
        return this.varadbWorkLoadType;
    }
    set adbWorkLoadType(value) {
        this.varadbWorkLoadType = value;
    }
    get adbName() {
        return this.varadbName;
    }
    set adbName(value) {
        this.varadbName = value;
    }
    get adbDatabaseID() {
        return this.varadbDatabaseID;
    }
    set adbDatabaseID(value) {
        this.varadbDatabaseID = value;
    }
    get walletLocation() {
        return this.varwalletLocation;
    }
    set walletLocation(value) {
        this.varwalletLocation = value;
    }
    get documentUri() {
        return this.varDocumentUri;
    }
    set documentUri(v) {
        this.varDocumentUri = v;
    }
    get connectionName() {
        return this._connectionName;
    }
    set connectionName(v) {
        this._connectionName = v;
    }
    get isDedicatedDb() {
        return this.varIsDedicatedDb;
    }
    set isDedicatedDb(value) {
        this.varIsDedicatedDb = value;
    }
    get tlsAuthType() {
        return this.vartlsAuthType;
    }
    set tlsAuthType(value) {
        this.vartlsAuthType = value;
    }
}
exports.RootWebPageArguments = RootWebPageArguments;
