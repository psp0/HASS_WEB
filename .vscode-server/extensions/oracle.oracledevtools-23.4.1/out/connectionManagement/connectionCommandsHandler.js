"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const oracleVSCodeConnector_1 = require("../infrastructure/oracleVSCodeConnector");
const Interfaces = require("../models/connectionModels");
const helper = require("../utilities/helper");
const logger = require("./../infrastructure/logger");
const connectionCommandsScenarioManager_1 = require("./connectionCommandsScenarioManager");
const connectionScenarioManager_1 = require("./connectionScenarioManager");
const connectionSettingsHelper_1 = require("./connectionSettingsHelper");
const documentConnectionInformation_1 = require("./documentConnectionInformation");
const fileLogger = logger.FileStreamLogger.Instance;
const events_1 = require("events");
const ConnectionRequestNameSpc = require("../models/connectionRequest");
const LangService = require("../models/intellisenseRequests");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const setup_1 = require("../utilities/setup");
const connectionSettingsManager_1 = require("./connectionSettingsManager");
const utilities_1 = require("../explorer/utilities");
const logger_1 = require("./../infrastructure/logger");
const helper_1 = require("../utilities/helper");
const saveQueryResultRequest_1 = require("../scriptExecution/saveQueryResultRequest");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const vscode_1 = require("vscode");
const oracleCompletionItemProvider_1 = require("../infrastructure/oracleCompletionItemProvider");
const connectionNode_1 = require("../explorer/nodes/connectionNode");
const userPreferenceManager_1 = require("../infrastructure/userPreferenceManager");
const oracleEditorManager_1 = require("../infrastructure/oracleEditorManager");
const connectionRequest_1 = require("../models/connectionRequest");
const path = require("path");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const defaultConnectionManager_1 = require("./defaultConnectionManager");
const childProcess = require("child_process");
const fs_1 = require("fs");
const settings_1 = require("../utilities/settings");
const extension_1 = require("../extension");
const intellisenseConnectionManager_1 = require("./intellisenseConnectionManager");
const DBMSCloudAINameSpc = require("../explorer/dbmsCloudAIRequests");
class ConnectionCommandsHandler {
    constructor(context, statusView, prompter, scriptExecutionCommandHandler, varClient, varVSCcodeConnector, varConnSettingStorageHlpr, connectionLogicMgr) {
        this.prompter = prompter;
        this.scriptExecutionCommandHandler = scriptExecutionCommandHandler;
        this.varClient = varClient;
        this.varVSCcodeConnector = varVSCcodeConnector;
        this.varConnSettingStorageHlpr = varConnSettingStorageHlpr;
        this.connectionLogicMgr = connectionLogicMgr;
        this.requestCount = 0;
        this.onConnectionCompleteEvent = new events_1.EventEmitter();
        this.CONNECTION_COMPLETE_EVENT = "connectionCompleteEvent";
        this.onLoginScriptCompleteEvent = new events_1.EventEmitter();
        this.LOGIN_SCRIPT_COMPLETE_EVENT = "loginScriptCompleteEvent";
        this.lastConnectionType = scriptExecutionModels_1.ConnectionType.EZConnect;
        this.varContext = context;
        this.varStatusBarMgr = statusView;
        this.varPrompter = prompter;
        this.varURIToConnPropDictionary = {};
        if (!this.varClient) {
            this.varClient = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
        }
        if (!this.varVSCcodeConnector) {
            this.varVSCcodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector(context);
        }
        if (!this.varConnSettingStorageHlpr) {
            this.varConnSettingStorageHlpr = new connectionSettingsHelper_1.ConnectionSettingsHelper(context);
        }
        if (!this.connectionLogicMgr) {
            this.connectionLogicMgr = new connectionScenarioManager_1.ConnectionScenarioManager(this, this.varConnSettingStorageHlpr, prompter, this.vscodeConnector, scriptExecutionCommandHandler);
        }
        if (this.varClient !== undefined) {
            this.varClient.onNotification(ConnectionRequestNameSpc.ConnectCompleteEventStronglyTyped.type, this.connectionCompleteEventHandler());
            this.varClient.onNotification(ConnectionRequestNameSpc.TnsUpdatedEventStronglyTyped.type, this.tnsUpdatedEventHandler());
            this.varClient.onNotification(ConnectionRequestNameSpc.dbConnectDisconnectEventStronglyTyped.type, this.dbConnectDisconnectEventHandler());
            this.varClient.onNotification(ConnectionRequestNameSpc.LoginScriptCompleteEventStronglyTyped.type, this.loginScriptCompleteEventHandler());
            this.varClient.onNotification(ConnectionRequestNameSpc.AIProfileUpdatedEventStronglyTyped.type, this.aiProfileUpdatedEventHandler());
        }
        this.addLoginScriptCompleteEventHandler(async (response) => {
            if (response.editorFileUri && response.editorConnectionUri &&
                response.editorFileUri != response.editorConnectionUri) {
                let intelliSenseSettings = settings_1.Settings.Instance.getIntelliSenseSettingsForUri(response.editorFileUri);
                let intelliSenseEnabled = intelliSenseSettings.enabled;
                let rebuildIntelliSense = intelliSenseSettings.rebuildOnConnAssociation;
                intellisenseConnectionManager_1.IntellisenseConnectionManager.instance.associateConnectionIntelliSenseToFile(response.editorFileUri, response.editorConnectionUri, rebuildIntelliSense, intelliSenseEnabled);
            }
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveProfileRequest, (message) => {
            this.handleSaveProfileRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.validationRequest, (message) => {
            this.handleValidationRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getProfileRequest, (message) => {
            this.handleGetProfileRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getConfigFileLocationsRequest, (message) => {
            this.handleGetTNSNamesLocationRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getTNSNamesRequest, (message) => {
            this.handleGetTNSNamesRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.browseRequest, (message) => {
            let browseRequest = message;
            if (browseRequest) {
                if (browseRequest.browseItem === scriptExecutionModels_1.BrowseItem.LoginScript) {
                    this.handleBrowseLoginRequest(message, this);
                }
                else {
                    this.handleBrowseRequest(message, this);
                }
            }
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getAllProfileNamesRequest, (message) => {
            this.handleGetAllProfileNamesRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.updateStatusBarEvent, (message) => {
            this.handleUpdateStatusBarEvent(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getSchemasRequest, (message) => {
            this.handleGetSchemasRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.connectionHelpRequest, (message) => {
            this.handleConnectionHelpRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getConnectionConfigSettingsRequest, (message) => {
            this.handleGetConnectionConfigSettingsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.testConnectionRequest, (message) => {
            this.handleTestConnectionRequest(message, this);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getAIProfilesRequest, (message) => {
            this.handleGetAIProfilesRequest(message, this);
        });
    }
    handleValidationRequest(message, self) {
        let errorResponse = scriptExecutionModels_1.ValidationRequestParams.createResponse(message);
        try {
            logger.FileStreamLogger.Instance.info("handleValidationRequest" + scriptExecutionModels_1.ValidationRequestParams.displayString(message));
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(saveQueryResultRequest_1.ValidationRequest.type, message).then((response) => {
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.MessageName.validationResponse, response);
            }, (error) => {
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.MessageName.validationResponse, errorResponse);
            });
        }
        catch (error) {
            errorResponse.isValid = false;
            errorResponse.message = error.message;
            logger.FileStreamLogger.Instance.error("handleValidateProfileNameRequest " + errorResponse.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.ownerUri, message.executionId, scriptExecutionModels_1.MessageName.validationResponse, errorResponse);
        }
    }
    handleUpdateStatusBarEvent(message, self) {
        fileLogger.info("handleUpdateStatusBarEvent request");
        try {
            logger.FileStreamLogger.Instance.info("handleUpdateStatusBarEvent");
            self.StatusBarMgr.onActiveTextEditorChanged(undefined);
            oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(message);
        }
        catch (err) {
            fileLogger.error(err);
        }
    }
    async handleGetAllProfileNamesRequest(message, self) {
        try {
            logger.FileStreamLogger.Instance.info("GetAllProfileNamesRequest handler - Start");
            const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(self.vscodeConnector);
            let response = scriptExecutionModels_1.GetAllProfileNamesResponse.create(message);
            let userProfiles = helperSettings.retrieveConnProfilesFromConfig(vscode.ConfigurationTarget.Global);
            response.userProfiles = [];
            response.workspaceProfiles = [];
            response.folderProfiles = [];
            response.configurationScopes = [];
            let id = 0;
            response.configurationScopes.push(new scriptExecutionModels_1.ConfigurationScope(vscode.ConfigurationTarget.Global, undefined, helper_1.Utils.getSettingsFileLocation(vscode.ConfigurationTarget.Global, undefined)));
            if (vscode.workspace && vscode.workspace.workspaceFolders) {
                response.configurationScopes.push(new scriptExecutionModels_1.ConfigurationScope(vscode.ConfigurationTarget.Workspace, undefined, helper_1.Utils.getSettingsFileLocation(vscode.ConfigurationTarget.Workspace, undefined)));
            }
            if (userProfiles) {
                userProfiles.forEach(profile => response.userProfiles.push(profile.name));
            }
            let workspaceProfiles = helperSettings.retrieveConnProfilesFromConfig(vscode.ConfigurationTarget.Workspace);
            if (workspaceProfiles) {
                workspaceProfiles.forEach(profile => response.workspaceProfiles.push(profile.name));
            }
            if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                if (!(vscode.workspace.workspaceFolders.length === 1 &&
                    vscode.workspace.workspaceFolders[0].name === vscode.workspace.name)) {
                    vscode.workspace.workspaceFolders.forEach(folder => {
                        response.configurationScopes.push(new scriptExecutionModels_1.ConfigurationScope(vscode.ConfigurationTarget.WorkspaceFolder, folder, helper_1.Utils.getSettingsFileLocation(vscode.ConfigurationTarget.WorkspaceFolder, folder)));
                        let folderProfiles = helperSettings.retrieveConnProfilesFromConfig(vscode.ConfigurationTarget.WorkspaceFolder, folder);
                        let profilesObj = new scriptExecutionModels_1.WorkspaceFolderProfiles();
                        profilesObj.folderName = folder.name;
                        profilesObj.profiles = [];
                        profilesObj.workspaceFolder = folder;
                        response.folderProfiles.push(profilesObj);
                        if (folderProfiles && folderProfiles.length > 0) {
                            let folderProfilenames = [];
                            folderProfiles.forEach(profile => folderProfilenames.push(profile.name));
                            profilesObj.profiles = folderProfilenames;
                        }
                    });
                }
            }
            response.result = true;
            response.osUser = process.env.USERDOMAIN + "\\" + process.env.USERNAME;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getAllProfileNamesResponse, response);
        }
        catch (error) {
            const response = scriptExecutionModels_1.GetAllProfileNamesResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("GetAllProfileNamesRequest handler - Error on fetching profiles");
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getAllProfileNamesResponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        }
        logger.FileStreamLogger.Instance.info("GetAllProfileNamesRequest handler - End");
    }
    handleBrowseRequest(message, self) {
        logger.FileStreamLogger.Instance.info("handleBrowseRequest" + scriptExecutionModels_1.BrowseRequest.displayString(message));
        const options = {};
        options.canSelectFiles = false;
        options.canSelectFolders = true;
        options.canSelectMany = false;
        let defaultPath = message.path;
        if (!defaultPath) {
            defaultPath = settings_1.Settings.getTnsAdmin(vscode.ConfigurationTarget.Global, undefined);
        }
        options.defaultUri = vscode.Uri.file(defaultPath);
        options.openLabel = localizedConstants_1.default.selectFolder;
        vscode.window.showOpenDialog(options).then((uri) => {
            const response = scriptExecutionModels_1.BrowseResponse.create(message);
            response.result = true;
            if (uri && uri.length > 0) {
                response.path = uri[0].fsPath;
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.browseReponse, response);
            logger_1.FileStreamLogger.Instance.info("Sent BrowseResponse successfully");
        }, (error) => {
            const response = scriptExecutionModels_1.BrowseResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("BrowseResponse " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.browseReponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        });
    }
    handleBrowseLoginRequest(message, self) {
        logger.FileStreamLogger.Instance.info("handleBrowseLoginRequest" + scriptExecutionModels_1.BrowseRequest.displayString(message));
        const options = {};
        options.canSelectFiles = true;
        options.canSelectFolders = false;
        options.canSelectMany = false;
        let defaultPath = message.path;
        if (!defaultPath) {
            let globalValue = settings_1.Settings.getLoginScript(vscode.ConfigurationTarget.Global, undefined);
            if (globalValue) {
                defaultPath = globalValue;
            }
            else {
                defaultPath = '';
            }
        }
        options.defaultUri = vscode.Uri.file(defaultPath);
        options.openLabel = localizedConstants_1.default.selectFile;
        vscode.window.showOpenDialog(options).then((uri) => {
            const response = scriptExecutionModels_1.BrowseResponse.create(message);
            response.result = true;
            if (uri && uri.length > 0) {
                response.path = uri[0].fsPath;
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.browseReponse, response);
            logger_1.FileStreamLogger.Instance.info("Sent BrowseResponse successfully");
        }, (error) => {
            const response = scriptExecutionModels_1.BrowseResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("BrowseResponse " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.browseReponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        });
    }
    async handleConnectionHelpRequest(message, self) {
        logger.FileStreamLogger.Instance.info("processing handleConnectionHelpRequest");
        const response = new scriptExecutionModels_1.ConnectionHelpResponse();
        try {
            logger.FileStreamLogger.Instance.info("Launching ODTVSCode connection help page");
            const startCommand = (process.platform === constants_1.Constants.macOSprocessplatform ? constants_1.Constants.macOSOpenCommand :
                process.platform === constants_1.Constants.windowsProcessPlatform ? constants_1.Constants.windowsOpenCommand : constants_1.Constants.linuxOpenCommand);
            logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_1.default.outwindowConnectionPageDialogue, constants_1.Constants.oracleConnectionHelpURL));
            await childProcess.exec(`${startCommand} ${constants_1.Constants.oracleConnectionHelpURL}`);
            response.resultMsg = localizedConstants_1.default.launchedConnectionHelpPage;
            response.result = true;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.connectionHelpResponse, response);
        }
        catch (error) {
            response.resultMsg = localizedConstants_1.default.failedToLaunchConnectionHelpPage + error;
            response.result = false;
            logger.FileStreamLogger.Instance.error(response.resultMsg);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.connectionHelpResponse, response);
        }
    }
    handleGetTNSNamesRequest(message, self) {
        logger.FileStreamLogger.Instance.info("Handle GetTNSNamesRequest - Start");
        try {
            const tnslist = [];
            const getDataSourceRequest = new ConnectionRequestNameSpc.GetDataSourcesRequestParameters();
            getDataSourceRequest.location = message.location;
            getDataSourceRequest.windowUri = message.windowUri;
            getDataSourceRequest.ownerUri = message.ownerUri;
            getDataSourceRequest.executionId = message.executionId;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(ConnectionRequestNameSpc.GetDataSourcesRequest.type, getDataSourceRequest).
                then((lspResponse) => {
                if (lspResponse) {
                    for (const tns of lspResponse.dataSources) {
                        tnslist.push(tns);
                    }
                    const response = scriptExecutionModels_1.GetTNSNamesResponse.create(message);
                    response.tnsnames = tnslist;
                    response.result = true;
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getTNSNamesResponse, response);
                }
            }, (error) => {
                const response = scriptExecutionModels_1.GetTNSNamesResponse.create(message);
                response.result = false;
                response.message = error.message;
                logger.FileStreamLogger.Instance.error("handleGetTNSNamesRequest " + response.message);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getTNSNamesResponse, response);
                helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
            });
        }
        catch (error) {
            const response = scriptExecutionModels_1.GetTNSNamesResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("handleGetTNSNamesRequest " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getTNSNamesResponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        }
        logger.FileStreamLogger.Instance.info("Handle GetTNSNamesRequest - End");
    }
    handleGetTNSNamesLocationRequest(message, self) {
        logger.FileStreamLogger.Instance.info("Handle GetTNSNamesLocationRequest - Start");
        try {
            let config = setup_1.Setup.getExtensionConfigSection();
            const result = [];
            const currentTNSLocation = settings_1.Settings.getTnsAdmin(message.configurationTarget, message.workspaceFolder);
            const currentWalletLocation = settings_1.Settings.getWalletLocation(message.configurationTarget, message.workspaceFolder);
            const response = scriptExecutionModels_1.GetConfigFileLocationsResponse.create(message);
            response.result = true;
            response.tnsLocation = currentTNSLocation;
            response.walletLocation = currentWalletLocation;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getConfigFileLocationsResponse, response);
            logger.FileStreamLogger.Instance.info("Send tns locations");
        }
        catch (error) {
            const response = scriptExecutionModels_1.GetConfigFileLocationsResponse.create(message);
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("Handle GetTNSNamesLocationRequest " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getConfigFileLocationsResponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        }
        logger.FileStreamLogger.Instance.info("Handle GetTNSNamesLocationRequest - End");
    }
    async handleGetProfileRequest(message, self) {
        logger.FileStreamLogger.Instance.info("GetProfileRequest handler - Start.");
        const response = scriptExecutionModels_1.GetProfileResponse.create(message);
        try {
            this.validateGetProfileArgs(message);
            let connPropVsCode;
            const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(self.vscodeConnector);
            const profiles = helperSettings.retrieveConnProfilesFromConfig(message.configurationTarget, connectionSettingsHelper_1.ConnectionSettingsHelper.getWorkspaceFolder(message.workspaceFolder));
            if (profiles && profiles.length > 0) {
                for (let i = 0; i < profiles.length; i++) {
                    if (profiles[i].name === message.profileName) {
                        connPropVsCode = profiles[i];
                        break;
                    }
                }
            }
            if (!connPropVsCode) {
                throw Error(`${localizedConstants_1.default.profileWithProfileNameDoesNotExist}`);
            }
            else {
                let profileUpgraded = false;
                [connPropVsCode, profileUpgraded] = await this.upgradeProfileIfNeeded(connPropVsCode);
            }
            response.profile = connPropVsCode;
            let connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueName(connPropVsCode.uniqueName);
            if (connNode) {
                response.connectionUniqueId = connNode.connectionUniqueId;
                response.defaultConnection = (connNode.connAssocType === connectionNode_1.ConnAssocType.Default);
            }
            response.result = true;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getProfileResponse, response);
            logger.FileStreamLogger.Instance.info(`sent profile ${response.profile.uniqueName}`);
        }
        catch (error) {
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("GetProfileRequest handler - Error on fetching profile");
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getProfileResponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        }
        logger.FileStreamLogger.Instance.info("GetProfileRequest handler - End.");
    }
    handleGetSchemasRequest(message, self) {
        const response = scriptExecutionModels_1.GetSchemasResponse.create(message);
        try {
            const schemas = [];
            logger.FileStreamLogger.Instance.info("GetSchemasRequest" + scriptExecutionModels_1.GetSchemasRequest.displayString(message));
            const getSchemasRequest = new ConnectionRequestNameSpc.GetSchemasRequestParameters();
            this.inheritConfigFileLocations(message.profile);
            const connectionDetails = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(message.profile);
            getSchemasRequest.connectionAttributes = connectionDetails;
            getSchemasRequest.windowUri = message.windowUri;
            getSchemasRequest.ownerUri = message.ownerUri;
            getSchemasRequest.executionId = message.executionId;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(ConnectionRequestNameSpc.GetSchemasRequest.type, getSchemasRequest).
                then((lspResponse) => {
                if (lspResponse) {
                    if (helper.isEmpty(lspResponse.errorMessage)) {
                        if (lspResponse.schemas && lspResponse.schemas.length > 0) {
                            for (const schema of lspResponse.schemas) {
                                schemas.push(schema);
                            }
                        }
                        response.schemas = schemas;
                        response.userIdUsedToConnect = lspResponse.userIdUsedToConnect;
                        response.result = true;
                    }
                    else {
                        response.message = lspResponse.errorMessage;
                        response.result = false;
                        helper_1.AppUtils.ShowErrorAndLog({
                            "message": helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetSchemaInfo, response.message)
                        }, self.vscodeConnector);
                    }
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getSchemasResponse, response);
                }
            }, (error) => {
                response.result = false;
                response.message = error.message;
                logger.FileStreamLogger.Instance.error("handleGetSchemasRequest " + response.message);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getSchemasResponse, response);
                helper_1.AppUtils.ShowErrorAndLog({
                    "message": helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetSchemaInfo, response.message)
                }, self.vscodeConnector);
            });
        }
        catch (error) {
            response.result = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("handleGetSchemasRequest " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getSchemasResponse, response);
            helper_1.AppUtils.ShowErrorAndLog({
                "message": helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetSchemaInfo, response.message)
            }, self.vscodeConnector);
        }
    }
    handleGetAIProfilesRequest(message, self) {
        const response = new scriptExecutionModels_1.GetAIProfilesResponse();
        try {
            const profiles = [];
            logger.FileStreamLogger.Instance.info("Received GetAIProfilesRequest");
            const getAIProfsRequest = new DBMSCloudAINameSpc.GetAIProfilesRequestParameters();
            const connectionDetails = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(message.profile);
            getAIProfsRequest.connectionAttributes = connectionDetails;
            getAIProfsRequest.ownerUri = message.ownerUri;
            getAIProfsRequest.windowUri = message.windowUri;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(DBMSCloudAINameSpc.GetAIProfilesRequest.type, getAIProfsRequest).
                then((lspResponse) => {
                if (lspResponse) {
                    if (helper.isEmpty(lspResponse.errorMessage)) {
                        if (lspResponse.profiles && lspResponse.profiles.length > 0) {
                            for (const prof of lspResponse.profiles) {
                                profiles.push(prof);
                            }
                        }
                        response.profiles = profiles;
                        response.success = true;
                    }
                    else {
                        response.message = lspResponse.errorMessage;
                        response.success = false;
                    }
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getAIProfilesResponse, response);
                }
            }, (error) => {
                response.success = false;
                response.message = error.message;
                logger.FileStreamLogger.Instance.error("handleGetAIProfilesRequest " + response.message);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getAIProfilesResponse, response);
            });
        }
        catch (error) {
            response.success = false;
            response.message = error.message;
            logger.FileStreamLogger.Instance.error("handleGetAIProfilesRequest " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getAIProfilesResponse, response);
        }
    }
    validateGetProfileArgs(msg) {
        if (!msg.profileName) {
            throw Error(localizedConstants_1.default.profileNameCannotBeEmptyForGetProfileNameRequest);
        }
        else {
            return true;
        }
    }
    get vscodeConnector() {
        return this.varVSCcodeConnector;
    }
    get connectionUI() {
        return this.connectionLogicMgr;
    }
    get ConnectionRepository() {
        return this.varConnSettingStorageHlpr;
    }
    get LanguageServerClient() {
        return this.varClient;
    }
    get StatusBarMgr() {
        return this.varStatusBarMgr;
    }
    get connectionCount() { return Object.keys(this.varURIToConnPropDictionary).length; }
    static get Instance() {
        return ConnectionCommandsHandler.instance;
    }
    static CreateInstance(context, statusView, prompter, scriptExecutionCommandHandler, varClient, varVSCcodeConnector, varConnSettingStorageHlpr, connectionLogicMgr) {
        try {
            if (ConnectionCommandsHandler.instance === undefined) {
                ConnectionCommandsHandler.instance = new ConnectionCommandsHandler(context, statusView, prompter, scriptExecutionCommandHandler, varClient, varVSCcodeConnector, varConnSettingStorageHlpr, connectionLogicMgr);
            }
            return ConnectionCommandsHandler.instance;
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
    }
    async handleSaveProfileRequest(message_obj, self) {
        let message = new scriptExecutionModels_1.SaveProfileRequest();
        Object.assign(message, message_obj);
        try {
            logger.FileStreamLogger.Instance.info("handleSaveProfileRequest: " + message.displayString());
            if (!message.profile.uniqueName) {
                message.profile.uniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(message.profile.name, message.profile.configurationTarget, message.profile.workspaceFolder);
            }
            message.profile.workspaceFolder = connectionSettingsHelper_1.ConnectionSettingsHelper.getWorkspaceFolder(message.profile?.workspaceFolder);
            let connNode;
            if (message.saveProfileType !== scriptExecutionModels_1.SaveProfileType.create) {
                connNode = dataExplorerManager_1.DataExplorerManager.Instance.
                    getConnectionNodeFromConnectionUniqueId(message.connectionUniqueId);
                if (!connNode) {
                    const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                    response.result = false;
                    response.message = localizedConstants_1.default.connectionDoesnotExist;
                    logger.FileStreamLogger.Instance.error("handleSaveProfileRequest: " + response.message);
                    self.vscodeConnector.showErrorMessage(response.message);
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
                    return;
                }
                if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.update &&
                    message.profile.uniqueName !== connNode.connectionProperties.uniqueName) {
                    logger.FileStreamLogger.Instance.info("handleSaveProfileRequest: Connection name is also changed, save type is RenameAndUpdate");
                    message.saveProfileType = scriptExecutionModels_1.SaveProfileType.renameAndUpdate;
                }
                else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate &&
                    message.profile.uniqueName === connNode.connectionProperties.uniqueName) {
                    logger.FileStreamLogger.Instance.info("handleSaveProfileRequest: Connection name is not changed, save type is Update");
                    message.saveProfileType = scriptExecutionModels_1.SaveProfileType.update;
                }
                else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.rename &&
                    message.profile.uniqueName === connNode.connectionProperties.uniqueName) {
                    logger.FileStreamLogger.Instance.info("handleSaveProfileRequest: Connection name is not changed, no rename or update needed");
                    const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                    response.profile = connNode.connectionProperties;
                    response.result = true;
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
                    return;
                }
                else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.displayProperties) {
                    logger.FileStreamLogger.Instance.info("handleSaveProfileRequest: Connection name is not changed, save type is display properties");
                    message.saveProfileType = scriptExecutionModels_1.SaveProfileType.displayProperties;
                }
                else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.setDefConnection) {
                    logger.FileStreamLogger.Instance.info("handleSaveProfileRequest: Connection name is not changed, save type is set default connection");
                    message.saveProfileType = scriptExecutionModels_1.SaveProfileType.setDefConnection;
                }
                message.oldConnectionName = connNode.connectionProperties.name;
            }
            if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.create || message.saveProfileType === scriptExecutionModels_1.SaveProfileType.rename ||
                message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate) {
                let profileNameUnique = false;
                if (message.profile) {
                    const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(self.vscodeConnector);
                    if (!helper.isEmpty(message.profile.uniqueName)
                        && helperSettings.checkProfileNameForUniqueness(message.profile.uniqueName)) {
                        profileNameUnique = true;
                    }
                }
                if (!profileNameUnique) {
                    const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                    response.result = false;
                    response.message = localizedConstants_1.default.profileNameNotUnique;
                    logger.FileStreamLogger.Instance.error("handleSaveProfileRequest: " + response.message);
                    self.vscodeConnector.showErrorMessage(response.message);
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
                    return;
                }
            }
            let proceed = false;
            if (message.profile && message.profile.passwordSaved) {
                proceed = await this.ConnectionRepository.canSaveConnCredsInConfigScope(message.profile);
                if (!proceed) {
                    const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                    response.result = false;
                    if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.create) {
                        response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileCreationError, helper_1.Utils.getConnectionLabel(message.profile, message.profile.currentSchema));
                    }
                    else {
                        if (message.oldConnectionName) {
                            response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileUpdateError, message.oldConnectionName);
                        }
                        else {
                            if (connNode) {
                                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileUpdateError, helper_1.Utils.getConnectionLabel(connNode.connectionProperties, connNode.schemaName));
                            }
                            else {
                                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileUpdateError, helper_1.Utils.getConnectionLabel(message.profile, message.profile.currentSchema));
                            }
                        }
                    }
                    response.message = response.message + " " + localizedConstants_1.default.msgSaveConnCredForWorkspaceOrWorkspaceFolderInfo;
                    logger.FileStreamLogger.Instance.info("handleSaveProfileRequest: " + response.message);
                    self.vscodeConnector.showErrorMessage(response.message);
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
                    return;
                }
            }
            proceed = true;
            var useCredStoreSettings = true;
            var promptToConfirm = false;
            switch (message.saveProfileType) {
                case scriptExecutionModels_1.SaveProfileType.create:
                    break;
                case scriptExecutionModels_1.SaveProfileType.rename:
                    useCredStoreSettings = false;
                    if (message.profile.passwordSaved &&
                        message.profile.passwordStore == scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSecretStorage &&
                        settings_1.Settings.getCredStoreSettings(message.profile.configurationTarget, null) === Interfaces.CredStoreSettingOptions.Settings) {
                        message.saveProfileType = scriptExecutionModels_1.SaveProfileType.renameAndUpdate;
                    }
                    break;
                case scriptExecutionModels_1.SaveProfileType.update:
                case scriptExecutionModels_1.SaveProfileType.renameAndUpdate:
                    promptToConfirm = true;
                    break;
                default:
                    useCredStoreSettings = false;
                    break;
            }
            if (promptToConfirm) {
                var msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.closeDocsOnUpdateWarning, helper_1.Utils.getConnectionLabel(connNode.connectionProperties, connNode.schemaName));
                proceed = await helper.Utils.promptForConfirmation(msg, this.vscodeConnector);
            }
            if (proceed) {
                useCredStoreSettings = true;
                if (message.profile.passwordSaved &&
                    message.profile.configurationTarget == vscode.ConfigurationTarget.Global &&
                    message.profile.passwordStore == scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSecretStorage &&
                    settings_1.Settings.getCredStoreSettings(message.profile.configurationTarget, null) == Interfaces.CredStoreSettingOptions.Settings) {
                    msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.confirmCredsMigrationToSettings, helper_1.Utils.getConnectionLabel(connNode.connectionProperties, connNode.schemaName));
                    useCredStoreSettings = await helper.Utils.promptForConfirmation(msg, this.vscodeConnector, false, true);
                    if (useCredStoreSettings) {
                        var z0 = message.profile.password;
                        var z1 = message.profile.proxyPassword;
                        message.profile.password = undefined;
                        message.profile.proxyPassword = undefined;
                        var connPropVsCode = await this.connectionLogicMgr.shallAskForAnyMissingConnInfo(message.profile);
                        if (!connPropVsCode) {
                            message.profile.password = z0;
                            message.profile.proxyPassword = z1;
                            proceed = false;
                            z0 = undefined;
                            z1 = undefined;
                        }
                        else {
                            message.profile.password = connPropVsCode.password;
                            message.profile.proxyPassword = connPropVsCode.proxyPassword;
                        }
                    }
                }
            }
            if (proceed) {
                await this.handleSaveProfileRequestWithProgress(message, connNode, self, useCredStoreSettings);
            }
            else {
                const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                response.result = false;
                logger.FileStreamLogger.Instance.info("handleSaveProfileRequest: User canceled update");
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
                return;
            }
        }
        catch (error) {
            const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
            response.result = false;
            response.message = error.message ? error.message : error.errorMessage;
            logger.FileStreamLogger.Instance.error("handleSaveProfileRequest " + response.message);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        }
    }
    async handleSaveProfileRequestWithProgress(message, connectionNode, self, useCredStoreSettings) {
        let progressTitle = "";
        switch (message.saveProfileType) {
            case scriptExecutionModels_1.SaveProfileType.create:
                progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.creatingConnection, message.profile.uniqueName);
                break;
            case scriptExecutionModels_1.SaveProfileType.rename:
                progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.renamingConnection, message.oldConnectionName, message.profile.uniqueName);
                break;
            case scriptExecutionModels_1.SaveProfileType.renameAndUpdate:
                const oldConnUniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(message.oldConnectionName, message.profile.configurationTarget, message.profile.workspaceFolder);
                progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updatingAndRenamingConnection, oldConnUniqueName, message.profile.uniqueName);
                break;
            case scriptExecutionModels_1.SaveProfileType.update:
            case scriptExecutionModels_1.SaveProfileType.setDefConnection:
            case scriptExecutionModels_1.SaveProfileType.displayProperties:
                progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.updatingConnection, message.profile.uniqueName);
                break;
        }
        vscode.window.withProgress({ location: vscode_1.ProgressLocation.Notification, title: progressTitle }, (progress, token) => {
            var p = new Promise(async (resolve) => {
                try {
                    let tmpConnProps;
                    if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.rename ||
                        message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate) {
                        tmpConnProps = Object.assign({}, connectionNode.connectionProperties);
                    }
                    await this.handleSaveProfileRequestContinue(message, connectionNode, self, useCredStoreSettings);
                    if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.rename ||
                        message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate) {
                        this.connectionLogicMgr.renameRecentlyUsedConnection(tmpConnProps, message.profile);
                        await defaultConnectionManager_1.DefaultConnectionManager.instance.connectionRenamed(tmpConnProps, message.profile);
                    }
                }
                catch (err) {
                    logger_1.FileStreamLogger.Instance.info("Error on updating connection- " + message.profile.uniqueName);
                    helper.logErroAfterValidating(err);
                }
                finally {
                    resolve();
                }
            });
            return p;
        });
    }
    async handleSaveProfileRequestContinue(message, connectionNode, self, useCredStoreSettings) {
        const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
        try {
            this.inheritConfigFileLocations(message.profile);
            if (message.setDefaultConnection || message.unsetDefaultConnection) {
                let assocType = connectionNode_1.ConnAssocType.Default;
                if (message.setDefaultConnection) {
                    assocType = connectionNode_1.ConnAssocType.Default;
                }
                else if (message.unsetDefaultConnection) {
                    assocType = connectionNode_1.ConnAssocType.NonDefault;
                }
                let connNode = undefined;
                if (message.connectionUniqueId) {
                    connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueId(message.connectionUniqueId);
                }
                else {
                    connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueName(message.profile.uniqueName);
                }
                if (connNode) {
                    dataExplorerManager_1.DataExplorerManager.Instance.onSetUnsetDefaultConnection(connNode, assocType, message.saveProfileType === scriptExecutionModels_1.SaveProfileType.setDefConnection);
                }
                else {
                    if (assocType === connectionNode_1.ConnAssocType.Default) {
                        defaultConnectionManager_1.DefaultConnectionManager.instance.updateDefaultConnection(message.profile.name, message.profile.configurationTarget, message.profile.workspaceFolder, false);
                    }
                }
            }
            if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.rename) {
                if (!message.displayPropsUpdated) {
                    response.profile = await dataExplorerManager_1.DataExplorerManager.Instance.renameConnectionFromConnectionUI(message.oldConnectionName, message.profile.name, message.profile.configurationTarget, message.profile.workspaceFolder, useCredStoreSettings);
                    response.result = (response.profile !== undefined);
                }
                else {
                    const oldConnUniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(message.oldConnectionName, message.profile.configurationTarget, message.profile.workspaceFolder);
                    dataExplorerManager_1.DataExplorerManager.Instance.renamedConnectionNodeInfo =
                        new dataExplorerManager_1.ConnectionNodeInfo(oldConnUniqueName, message.profile.uniqueName, connectionNode.connectionUniqueId);
                    const savedProfile = await self.connectionLogicMgr.saveVsCodeProfile(message.profile, oldConnUniqueName, useCredStoreSettings);
                    const systemManager = (0, extension_1.getSystemManager)();
                    let explorerFileUris = systemManager.codeEditorProvider.openfiles;
                    const URIList = this.getUrisAssociatedToConnection(connectionNode, savedProfile, explorerFileUris);
                    systemManager.fileDecorationProvider._onDidChangeFileDecorations.fire(URIList);
                    response.result = true;
                    response.profile = savedProfile;
                }
            }
            else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.setDefConnection) {
                response.result = true;
                response.profile = message.profile;
            }
            else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.displayProperties) {
                const oldConnUniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(message.oldConnectionName, message.profile.configurationTarget, message.profile.workspaceFolder);
                dataExplorerManager_1.DataExplorerManager.Instance.updatingConnectionNodeInfo =
                    new dataExplorerManager_1.ConnectionNodeInfo(oldConnUniqueName, message.profile.uniqueName, connectionNode.connectionUniqueId);
                const savedProfile = await self.connectionLogicMgr.saveVsCodeProfile(message.profile, oldConnUniqueName, useCredStoreSettings);
                const systemManager = (0, extension_1.getSystemManager)();
                let explorerFileUris = systemManager.codeEditorProvider.openfiles;
                const URIList = this.getUrisAssociatedToConnection(connectionNode, savedProfile, explorerFileUris);
                systemManager.fileDecorationProvider._onDidChangeFileDecorations.fire(URIList);
                response.result = true;
                response.profile = savedProfile;
            }
            else {
                let ownerUri;
                if (message.documentUri) {
                    ownerUri = message.documentUri;
                }
                if (helper.isEmpty(ownerUri)) {
                    if (message.ownerUri) {
                        ownerUri = message.ownerUri;
                    }
                    else {
                        ownerUri = helper_1.Utils.getConnectionUri(utilities_1.TreeViewConstants.baseUri, message.profile.uniqueName);
                    }
                }
                let associateToDoc = false;
                let connSource = connectionRequest_1.ConnectionSource.ConnectionDialog;
                if (message.documentUri) {
                    associateToDoc = true;
                    connSource = connectionRequest_1.ConnectionSource.Editor;
                }
                const oldConnUniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(message.oldConnectionName, message.profile.configurationTarget, message.profile.workspaceFolder);
                const connectResult = await self.connect(ownerUri, message.profile, true, false, connSource, false);
                if (connectResult) {
                    dataExplorerManager_1.DataExplorerManager.Instance.connectionToSelect = message.profile.uniqueName;
                    if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate ||
                        message.saveProfileType === scriptExecutionModels_1.SaveProfileType.update) {
                        dataExplorerManager_1.DataExplorerManager.Instance.updatingConnectionNodeInfo =
                            new dataExplorerManager_1.ConnectionNodeInfo(oldConnUniqueName, message.profile.uniqueName, connectionNode.connectionUniqueId);
                    }
                    const savedProfile = await self.connectionLogicMgr.saveVsCodeProfile(message.profile, oldConnUniqueName, useCredStoreSettings);
                    const systemManager = (0, extension_1.getSystemManager)();
                    let explorerFileUris = new Map();
                    const URIList = this.getUrisAssociatedToConnection(connectionNode, savedProfile, explorerFileUris);
                    systemManager.fileDecorationProvider._onDidChangeFileDecorations.fire(URIList);
                    if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.create) {
                        const savedConn = self.getSavedConnectionProperties(ownerUri);
                        let connectionString;
                        if (savedConn !== undefined) {
                            connectionString = savedConn.connectionString;
                        }
                        userPreferenceManager_1.UserPreferenceManager.Instance.saveConnectionUIUserPreferences(message.profile, connectionString);
                    }
                    if (!associateToDoc) {
                        await self.doDisconnect(ownerUri, false);
                    }
                    response.result = true;
                    this.lastConnectionType = savedProfile.connectionType;
                    response.profile = savedProfile;
                    let connectionLabel = helper_1.Utils.getConnectionLabel(message.profile);
                    if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.create && message.documentUri) {
                        response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileCreatedAndConnected, connectionLabel);
                    }
                    else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.create) {
                        response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileCreated, connectionLabel);
                    }
                    else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.renameAndUpdate) {
                        response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.connectionUpdatedAndRenamed, message.oldConnectionName, connectionLabel);
                    }
                    else if (message.saveProfileType === scriptExecutionModels_1.SaveProfileType.update) {
                        response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileUpdated, connectionLabel);
                    }
                    self.vscodeConnector.showInformationMessage(response.message);
                }
                else {
                    const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
                    response.result = false;
                    response.message = localizedConstants_1.default.couldNotconnectToServer;
                    logger.FileStreamLogger.Instance.error("handleSaveProfileRequest " + response.message);
                }
            }
        }
        catch (error) {
            dataExplorerManager_1.DataExplorerManager.Instance.connectionToSelect = undefined;
            dataExplorerManager_1.DataExplorerManager.Instance.updatingConnectionNodeInfo = undefined;
            const response = scriptExecutionModels_1.SaveProfileResponse.create(message);
            response.result = false;
            response.message = error.message ? error.message : error.errorMessage;
            logger.FileStreamLogger.Instance.error("handleSaveProfileRequest " + response.message);
            helper_1.AppUtils.ShowErrorAndLog(error, self.vscodeConnector);
        }
        finally {
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveProfileResponse, response);
        }
    }
    async connectFromExplorer(fileUri, connectionCreds) {
        let valToreturn = false;
        try {
            const selectedItem = {
                label: "testname",
                connectionProperties: connectionCreds,
                matchingEnumType: Interfaces.ConnectionAttributesSelection.SavedProfile,
            };
            let profileUpgraded = false;
            var profileToreturn = null;
            [profileToreturn, profileUpgraded] = await this.upgradeProfileIfNeeded(selectedItem.connectionProperties);
            profileToreturn = await this.connectionUI.shallAskForAnyMissingConnInfo(profileToreturn, true);
            if (!profileToreturn) {
                throw new Error("User input not provided.");
            }
            valToreturn = await this.connect(fileUri, profileToreturn, false, false, connectionRequest_1.ConnectionSource.Explorer);
            if (valToreturn && profileUpgraded) {
                try {
                    await this.connectionLogicMgr.saveVsCodeProfile(profileToreturn, "", true);
                }
                catch (err) {
                    fileLogger.error("Error on saving profile.");
                    helper.logErroAfterValidating(err);
                }
            }
        }
        catch (err) {
            throw err;
        }
        return valToreturn;
    }
    async connect(fileUri, connectionCreds, createProfile, showmessage, connSource, runLoginScript = true) {
        const self = this;
        let myreject;
        let myresolve;
        const promiseToReturn = new Promise((resolve, reject) => { myreject = reject; myresolve = resolve; });
        let requestId = (++this.requestCount).toString();
        const connProperties = new documentConnectionInformation_1.DocumentConnectionInformation();
        connProperties.connectionAttributes = connectionCreds;
        connProperties.isConnecting = true;
        connProperties.createProfile = createProfile;
        connProperties.requestId = requestId;
        self.addConnectionToMap(fileUri, connProperties);
        if (self.StatusBarMgr) {
            self.StatusBarMgr.connectingToDB(fileUri, connectionCreds);
        }
        fileLogger.info(helper.stringFormatterCsharpStyle("Connecting to Oracle database for document."));
        connProperties.connectCompleteHandler = ((connectResult, connCompleteParams, error) => {
            if (error) {
                myreject();
            }
            else {
                myresolve(connectResult);
                if (!runLoginScript)
                    return;
                let loginScriptUri = connectionCreds.loginScript;
                let globalLoginScriptUri = settings_1.Settings.getLoginScript(connectionCreds.configurationTarget, connectionCreds.workspaceFolder);
                if ((helper.isEmpty(loginScriptUri)) && (!helper.isEmpty(globalLoginScriptUri))) {
                    loginScriptUri = globalLoginScriptUri;
                }
                let editorFileUri = undefined;
                let editorConnectionUri = undefined;
                if (connSource === connectionRequest_1.ConnectionSource.Editor) {
                    editorFileUri = fileUri;
                    let connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueName(connectionCreds.uniqueName);
                    if (connNode) {
                        editorConnectionUri = connNode.connectionURI;
                    }
                }
                if (!helper.isEmpty(loginScriptUri)) {
                    if (!(0, fs_1.existsSync)(loginScriptUri)) {
                        logger_1.FileStreamLogger.Instance.error("Could not find login script " + loginScriptUri);
                        let notFoundMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.scriptNotFound, loginScriptUri);
                        logger_1.ChannelLogger.Instance.error(notFoundMsg);
                    }
                    else {
                        this.runLoginScript(fileUri, loginScriptUri, connectionCreds, editorFileUri, editorConnectionUri);
                        return;
                    }
                }
                const params = new ConnectionRequestNameSpc.LoginScriptCompleteEventParams();
                params.ownerUri = fileUri;
                params.connectionUri = fileUri;
                params.currentSchema = connCompleteParams.currentSchema;
                params.connectionId = this.varURIToConnPropDictionary[fileUri].connectionId;
                params.editorFileUri = editorFileUri;
                params.editorConnectionUri = editorConnectionUri;
                params.loginScript = loginScriptUri;
                this.onLoginScriptCompleteEvent.emit(this.LOGIN_SCRIPT_COMPLETE_EVENT, params);
            }
        });
        const connectionDetails = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(connectionCreds);
        const connRequestParameters = new ConnectionRequestNameSpc.ConnectRequestParameters();
        connRequestParameters.requestId = requestId;
        connRequestParameters.ownerUri = fileUri;
        connRequestParameters.connectionAttributes = connectionDetails;
        connRequestParameters.connectionSource = connSource;
        connRequestParameters.filters = dataExplorerManager_1.DataExplorerManager.Instance.getFilterSettings(connectionCreds.filters);
        await self.LanguageServerClient.sendRequest(ConnectionRequestNameSpc.ConnectRequestStronglyTyped.type, connRequestParameters).then((result) => {
            if (!result) {
                myresolve(false);
            }
        }, (err) => {
            myreject(err);
        });
        return promiseToReturn;
    }
    async runLoginScript(ownerUri, loginScriptUri, connAttributes, editorFileUri, editorConnectionUri) {
        if (!helper.isEmpty(loginScriptUri)) {
            try {
                const executeQueryRequest = new scriptExecutionModels_1.ScriptExecuteParams();
                executeQueryRequest.ownerUri = constants_1.Constants.loginScriptResultsWindowUri;
                executeQueryRequest.executionMode = scriptExecutionModels_1.ExecutionMode.File;
                executeQueryRequest.loginScript = true;
                executeQueryRequest.loginScriptUri = loginScriptUri;
                executeQueryRequest.connectionUri = ownerUri;
                executeQueryRequest.connectionName = connAttributes.uniqueName;
                executeQueryRequest.querySettings = settings_1.Settings.getQueryExecutionSettings(connAttributes.configurationTarget, connAttributes.workspaceFolder);
                executeQueryRequest.editorFileUri = editorFileUri;
                executeQueryRequest.editorConnectionUri = editorConnectionUri;
                this.scriptExecutionCommandHandler.startQueryExecution(executeQueryRequest, loginScriptUri, scriptExecutionModels_1.UIDisplayMode.ExecuteScript);
            }
            catch (err) {
                helper.logErroAfterValidating(err);
            }
        }
    }
    changeDatabaseConnectionForDoc(oldUri, newUri) {
        const self = this;
        const process = self.isConnectedToDB(oldUri) && !self.isConnectedToDB(newUri);
        if (process) {
            const connprop = self.getSavedConnectionProperties(oldUri).connectionAttributes;
            self.connect(newUri, connprop, false, false, connectionRequest_1.ConnectionSource.Editor).then((result) => {
                if (result) {
                    self.doDisconnect(oldUri, false);
                }
            });
        }
    }
    async cancelConnectHandler() {
        const self = this;
        try {
            const result = await self.connectionUI.aksToCancelConnection();
            if (result) {
                await self.processCancelConnect();
                const uri = self.vscodeConnector.activeTextEditorUri;
                if (uri) {
                    self.deleteConnectionFromMap(uri);
                }
            }
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
    }
    async clearMRUConnectionList() {
        const self = this;
        let result = await self.connectionLogicMgr.askToClearRecentConnectionsList();
        if (result) {
            await self.ConnectionRepository.clearAllRecentlyUsedConnections();
            await self.vscodeConnector.showInformationMessage(localizedConstants_1.default.msgClearedRecentList);
        }
    }
    textDocumentOpenHandler(doc) {
        const self = this;
        const uri = helper.convertURIToString(doc.uri);
        if (doc.languageId === constants_1.Constants.oracleLanguageID
            && typeof (self.getSavedConnectionProperties(uri)) === "undefined") {
            let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(doc);
            if (!explorerFile) {
                self.StatusBarMgr.displayDefaults(uri);
            }
        }
    }
    addConnectionCompleteEventHandler(handler) {
        this.onConnectionCompleteEvent.on(this.CONNECTION_COMPLETE_EVENT, handler);
    }
    connectionCompleteEventHandler() {
        const self = this;
        return (response) => {
            const connOwnerURI = response.uri;
            const savedConn = self.getSavedConnectionProperties(connOwnerURI);
            if (savedConn !== undefined && savedConn.requestId === response.requestId) {
                fileLogger.info("Processing connection complete event");
                savedConn.isConnecting = false;
                const connectionProps = savedConn.connectionAttributes;
                let mruConnection = {};
                if (helper.isNotEmpty(response.connectionId)) {
                    savedConn.connectionId = response.connectionId;
                    savedConn.errorNumber = undefined;
                    savedConn.errorMessage = undefined;
                    savedConn.connectionSummary = response.connectionSummary;
                    savedConn.connectionString = response.connectionString;
                    fileLogger.info("Connected to Database for Document");
                    const systemManager = (0, extension_1.getSystemManager)();
                    systemManager.fileDecorationProvider._onDidChangeFileDecorations.fire(vscode.Uri.parse(connOwnerURI));
                    self.StatusBarMgr.displayConnectSuccess(connOwnerURI, savedConn.connectionAttributes, savedConn.connectionSummary, response.currentSchema);
                    mruConnection = savedConn.connectionAttributes;
                }
                else {
                    self.connectionErroredOut(connOwnerURI, savedConn, response);
                    const systemManager = (0, extension_1.getSystemManager)();
                    systemManager.fileDecorationProvider._onDidChangeFileDecorations.fire(vscode.Uri.parse(connOwnerURI));
                    mruConnection = undefined;
                }
                self.addConnectionToMRUList(mruConnection);
                let connectSuccess = true;
                if (!mruConnection) {
                    connectSuccess = false;
                }
                savedConn.connectCompleteHandler(connectSuccess, response);
            }
            else {
                fileLogger.info("Connection complete event does not need to be processed");
            }
        };
    }
    getUrisAssociatedToConnection(connectionNode, newProfile, explorerFileUris) {
        let uris = new Array();
        if (connectionNode) {
            uris.push(vscode.Uri.parse(connectionNode.connectionURI));
        }
        for (let x in this.varURIToConnPropDictionary) {
            let connAttributesVsCode = this.varURIToConnPropDictionary[x].connectionAttributes;
            if (connAttributesVsCode.uniqueName === newProfile.uniqueName) {
                uris.push(vscode.Uri.parse(x));
                connAttributesVsCode.color = newProfile.color;
            }
        }
        explorerFileUris.forEach((value, key) => {
            let uri = vscode.Uri.parse(key);
            let params = editorUtils_1.editorUtils.getQueryParameters(uri);
            if (params && params.connectionUri && connectionNode && connectionNode.connectionURI === params.connectionUri) {
                uris.push(uri);
            }
        });
        return uris;
    }
    addLoginScriptCompleteEventHandler(handler) {
        this.onLoginScriptCompleteEvent.on(this.LOGIN_SCRIPT_COMPLETE_EVENT, handler);
    }
    loginScriptCompleteEventHandler() {
        return (response) => {
            this.onLoginScriptCompleteEvent.emit(this.LOGIN_SCRIPT_COMPLETE_EVENT, response);
        };
    }
    tnsUpdatedEventHandler() {
        const self = this;
        return (event) => {
            if (!event.updated) {
                self.vscodeConnector.showErrorMessage(localizedConstants_1.default.msgTnsAdminUpdateFailed);
            }
            self.StatusBarMgr.displayTnsAdmin(event.tnsAdmin);
        };
    }
    textDocumentCloseHandler(doc) {
        const self = this;
        const uri = helper.convertURIToString(doc.uri);
        if (uri in self.varURIToConnPropDictionary) {
            self.varURIToConnPropDictionary[uri].isDocumentOpen = false;
        }
        if (self.isConnectedToDB(uri)) {
            self.doDisconnect(uri, false);
        }
        defaultConnectionManager_1.DefaultConnectionManager.instance.removeFromUserDisconnectedFiles(uri);
        defaultConnectionManager_1.DefaultConnectionManager.instance.removeFromExcludedFilesForDefaultConnection(uri);
        defaultConnectionManager_1.DefaultConnectionManager.instance.removeFromDefaultConnectedFiles(uri);
    }
    async disocnnectRequestHandler() {
        const self = this;
        try {
            const result = await self.connectionLogicMgr.handleDisconnectChoice();
            if (result) {
                return await self.doDisconnect(self.vscodeConnector.activeTextEditorUri, true, true);
            }
            else {
                return false;
            }
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            return false;
        }
    }
    async showConnections() {
        const self = this;
        try {
            var conns = await self.ConnectionRepository.getConnectionListForDropDown(true, true);
            if (conns.length == 0) {
                self.vscodeConnector.showErrorMessage(localizedConstants_1.default.runQueryNoConnection);
                return undefined;
            }
            let profile = await self.connectionUI.displayConnectionList(true, true, undefined);
            if (profile) {
                let profileUpgraded = false;
                var profileToreturn = null;
                [profileToreturn, profileUpgraded] = await this.upgradeProfileIfNeeded(profile);
                profile = await this.connectionLogicMgr.shallAskForAnyMissingConnInfo(profileToreturn);
            }
            return profile;
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            return undefined;
        }
    }
    async removeProfileHandler(connProfile) {
        const self = this;
        try {
            const retVal = await self.connectionUI.removeProfile(connProfile);
            return retVal;
        }
        catch (err) {
            helper.AppUtils.ShowErrorAndLog(err, this.vscodeConnector);
            return false;
        }
    }
    async updateProfileHandler(connProfile) {
        const self = this;
        try {
            const retVal = await self.connectionUI.updateProfile(connProfile);
            return retVal;
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            return false;
        }
    }
    async languageAssociationHandler() {
        const self = this;
        const uri = self.varVSCcodeConnector.activeTextEditorUri;
        const lang = undefined;
        let langfeatureEnabled = undefined;
        if (uri && self.varVSCcodeConnector.isActiveOracleFile) {
            const lang = await self.connectionLogicMgr.askLanguageChange();
            if (!lang) {
                return undefined;
            }
            self.varClient.sendNotification(LangService.LanguageServiceChangedNotification.event, {
                uri,
                language: constants_1.Constants.oracleLanguageID,
                langServiceChosen: lang,
            });
            self.StatusBarMgr.extensionChanged(uri, lang);
            switch (lang) {
                case constants_1.Constants.extensionOwner:
                    langfeatureEnabled = true;
                    break;
                case constants_1.Constants.noneOwner:
                    langfeatureEnabled = false;
                    break;
                default:
                    langfeatureEnabled = undefined;
                    break;
            }
            return langfeatureEnabled;
        }
        else {
            self.varVSCcodeConnector.showWarningMessage(localizedConstants_1.default.msgFileAssociationMissing);
            return undefined;
        }
    }
    async newConnectionHandler(uri) {
        const self = this;
        let showList = true;
        if (!uri) {
            self.vscodeConnector.showWarningMessage(localizedConstants_1.default.msgFileAssociationMissing);
            showList = false;
        }
        else if (!self.vscodeConnector.isActiveOracleFile) {
            try {
                showList = await self.connectionUI.askForLanguageModeChange();
                if (showList) {
                    if (!self.vscodeConnector.chkIfDocumentIsAssociatedWithOracle(uri.toString())) {
                        showList = false;
                        self.vscodeConnector.showWarningMessage(localizedConstants_1.default.msgFileAssociationMissing);
                    }
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                showList = false;
            }
        }
        if (showList) {
            const connProp = await self.connectionUI.displayConnectionList(true, false, uri);
            if (connProp) {
                await this.createConnectionFromConnProps(connProp, uri.toString(), true);
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
        return false;
    }
    async createConnectionFromConnProps(connProp, uri, promptMissingInfo) {
        fileLogger.info("Start creating a new database connection");
        let connPropVsCode = connProp;
        let profileUpgraded = false;
        [connPropVsCode, profileUpgraded] = await this.upgradeProfileIfNeeded(connPropVsCode);
        if (!connPropVsCode) {
            return;
        }
        if (promptMissingInfo) {
            connPropVsCode = await this.connectionLogicMgr.shallAskForAnyMissingConnInfo(connPropVsCode);
        }
        if (connPropVsCode !== undefined) {
            if (this.isConnectedToDB(uri)) {
                fileLogger.info("Disconnect existing connection before creating new connection");
                await this.doDisconnect(uri, false);
                fileLogger.info("Disconnected existing connection");
            }
            const resultOfConnect = await this.connect(uri, connPropVsCode, false, true, connectionRequest_1.ConnectionSource.Editor);
            if (!resultOfConnect) {
                if (!connProp.passwordSaved) {
                    connProp.password = undefined;
                    connProp.proxyPassword = undefined;
                }
            }
            else if (profileUpgraded) {
                try {
                    await this.connectionLogicMgr.saveVsCodeProfile(connPropVsCode, "", true);
                }
                catch (err) {
                    fileLogger.error("Error on saving profile.");
                    helper.logErroAfterValidating(err);
                }
            }
        }
        fileLogger.info("End creating a new database connection");
    }
    async upgradeProfileIfNeeded(connPropVsCode) {
        let upgraded = false;
        if (connPropVsCode && !connPropVsCode.tnsAdmin) {
            this.inheritConfigFileLocations(connPropVsCode);
            upgraded = true;
            if (connPropVsCode.connectionType == scriptExecutionModels_1.ConnectionType.EZConnect) {
                if (!connPropVsCode.dataSource) {
                    if (connPropVsCode.connectionString) {
                        connPropVsCode.connectionType = scriptExecutionModels_1.ConnectionType.ODPConnectionString;
                        connPropVsCode.dataSource = undefined;
                        connPropVsCode.userID = undefined;
                    }
                }
                else {
                    let ds = connPropVsCode.dataSource;
                    let dsparts = ds.match("^([^\:]+):([0-9]+)/(.*$)");
                    if (dsparts && dsparts.length !== 4) {
                        connPropVsCode.connectionType = scriptExecutionModels_1.ConnectionType.Advanced;
                    }
                    let tnsnameslist;
                    if (!dsparts) {
                        if (connPropVsCode.tnsAdmin) {
                            let tnslist = await this.getTnsValues(connPropVsCode.tnsAdmin).catch((error) => {
                                helper.logErroAfterValidating(error);
                            });
                            if (tnslist && tnslist.length > 0) {
                                tnsnameslist = tnslist.map(function (value) {
                                    return value.toUpperCase();
                                });
                            }
                        }
                        if (tnsnameslist && tnsnameslist.length > 0 && tnsnameslist.indexOf(connPropVsCode.dataSource.toUpperCase()) !== -1) {
                            connPropVsCode.connectionType = scriptExecutionModels_1.ConnectionType.TNS;
                        }
                        else {
                            connPropVsCode.connectionType = scriptExecutionModels_1.ConnectionType.Advanced;
                        }
                    }
                }
            }
        }
        if (connPropVsCode && connPropVsCode.passwordSaved) {
            const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
            await helperSettings.PostProcessReadProfileCredsAsync(connPropVsCode);
        }
        return [connPropVsCode, upgraded];
    }
    getTnsValues(tnsLocation) {
        return new Promise((resolve, reject) => {
            fileLogger.info("Fetch TNS values. TNSAdmin: " + tnsLocation);
            let tnslist = [];
            const timer = setTimeout(() => {
                const err = new Error();
                reject(err);
            }, 8000);
            const getDataSourceRequest = new ConnectionRequestNameSpc.GetDataSourcesRequestParameters();
            getDataSourceRequest.location = tnsLocation;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(ConnectionRequestNameSpc.GetDataSourcesRequest.type, getDataSourceRequest).
                then((response) => {
                clearTimeout(timer);
                if (response) {
                    for (const tns of response.dataSources) {
                        tnslist.push(tns);
                    }
                    fileLogger.info("TNS values fetched");
                }
                resolve(tnslist);
            }, (error) => {
                helper.logErroAfterValidating(error);
                clearTimeout(timer);
                reject(error);
            });
        });
    }
    inheritConfigFileLocations(connPropVsCode) {
        if (connPropVsCode) {
            if (!connPropVsCode.tnsAdmin) {
                connPropVsCode.tnsAdmin = settings_1.Settings.getTnsAdmin(connPropVsCode.configurationTarget ? connPropVsCode.configurationTarget : vscode.ConfigurationTarget.Global, connPropVsCode.workspaceFolder);
            }
        }
    }
    isConnectedToDB(uri) {
        const self = this;
        let valToReturn = false;
        if (uri in self.varURIToConnPropDictionary) {
            valToReturn = true;
        }
        return valToReturn;
    }
    async doDisconnect(uri, showmessage, userDisconnect = false) {
        const self = this;
        let reqResult = false;
        if (self.isConnectedToDB(uri)) {
            self.deleteConnectionFromMap(uri);
            self.StatusBarMgr.displayNotConnected(uri);
            const disconnectParams = new ConnectionRequestNameSpc.DisconnectRequestParameters();
            disconnectParams.uri = uri;
            reqResult = await self.LanguageServerClient.sendRequest(ConnectionRequestNameSpc.DisconnectRequestStronglyTyped.type, disconnectParams);
            if (reqResult) {
                if (showmessage) {
                    self.vscodeConnector.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.disConnectedMessage, uri));
                }
                const systemManager = (0, extension_1.getSystemManager)();
                systemManager.fileDecorationProvider._onDidChangeFileDecorations.fire(vscode.Uri.parse(uri));
                oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance.clearCacheForDocument(uri);
                fileLogger.info("Disconnected from database for document");
            }
        }
        else if (self.isConnecting(uri)) {
            await self.cancelConnectHandler();
            reqResult = true;
        }
        else {
            reqResult = true;
        }
        if (userDisconnect) {
            defaultConnectionManager_1.DefaultConnectionManager.instance.addToUserDisconnectedFiles(uri);
        }
        intellisenseConnectionManager_1.IntellisenseConnectionManager.instance.disassociateConnectionIntelliSenseFromFile(uri);
        return reqResult;
    }
    setClient(client) {
        this.varClient = client;
    }
    setStatusView(value) {
        this.varStatusBarMgr = value;
    }
    getConnectionCount() {
        return Object.keys(this.varURIToConnPropDictionary).length;
    }
    isConnecting(uri) {
        const self = this;
        let valtoReturn = false;
        if (uri in self.varURIToConnPropDictionary) {
            valtoReturn = self.varURIToConnPropDictionary[uri].isConnecting;
        }
        return valtoReturn;
    }
    addConnectionToMap(uri, connToAdd) {
        const self = this;
        self.varURIToConnPropDictionary[uri] = connToAdd;
    }
    deleteConnectionFromMap(uri) {
        const self = this;
        delete self.varURIToConnPropDictionary[uri];
    }
    getSavedConnectionProperties(uri) {
        const self = this;
        return self.varURIToConnPropDictionary[uri];
    }
    async processCancelConnect() {
        const self = this;
        const uri = self.vscodeConnector.activeTextEditorUri;
        if (uri) {
            const cancelrequestParams = new ConnectionRequestNameSpc.CancelConnectRequestParameters();
            cancelrequestParams.uri = uri;
            const result = await self.LanguageServerClient.sendRequest(ConnectionRequestNameSpc.CancelConnectRequestStronglyTyped.type, cancelrequestParams);
            if (result) {
                self.StatusBarMgr.displayNotConnected(uri);
                self.vscodeConnector.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.disConnectedMessage, uri));
            }
        }
    }
    connectionErroredOut(fileUri, connection, result) {
        const self = this;
        if (result.errorNumber && result.errorMessage) {
            connection.errorMessage = result.errorMessage;
            connection.errorNumber = result.errorNumber;
        }
        const datasrc = helper.extractDataSource(connection.connectionAttributes.dataSource, connection.connectionAttributes.connectionString);
        self.StatusBarMgr.displayConnectErrors(fileUri, connection.connectionAttributes, result);
        if (fileUri in self.varURIToConnPropDictionary &&
            self.varURIToConnPropDictionary[fileUri].isDocumentOpen) {
            const connectionProps = connection.connectionAttributes;
            const msgToShow = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnectionError, connectionProps.uniqueName) +
                "\r\n" +
                helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgErrorDetails, result.errorMessage ? result.errorMessage : result.messages);
            logger_1.ChannelLogger.Instance.info(msgToShow);
            self.vscodeConnector.showErrorMessage(msgToShow);
        }
    }
    async addConnectionToMRUList(connToAdd) {
        if (connToAdd) {
            await this.varConnSettingStorageHlpr.addRecentlyUsedConnection(connToAdd);
        }
    }
    getConnectionUIArguments(uri, associateFile, databaseInfo) {
        let args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
        var windowURI = constants_1.Constants.connectionWindowUri;
        var windowTitle = localizedConstants_1.default.connectionUITitle;
        if (databaseInfo != null) {
            args.adbDatabaseID = databaseInfo.databaseID;
            args.adbDisplayName = databaseInfo.dbDisplayName;
            args.adbName = databaseInfo.dbName;
            args.isDedicatedDb = databaseInfo.dedicatedDb;
            args.uiMode = databaseInfo.displayMode;
            args.profileName = databaseInfo.profileName;
            switch (databaseInfo.displayMode) {
                case scriptExecutionModels_1.UIDisplayMode.DownloadCredentialsFile:
                    windowURI = constants_1.Constants.adbDownloadCredentialsWindowUri;
                    windowTitle = localizedConstants_1.default.downloadCredentialsTitle;
                    break;
                case scriptExecutionModels_1.UIDisplayMode.AutonomousDatabaseConnectionManagement:
                    windowURI = constants_1.Constants.adbconnectionWindowUri;
                    break;
                default:
                    break;
            }
            windowTitle = `${windowTitle} : ${databaseInfo.dbDisplayName}`;
            const config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
            if (config) {
                args.walletLocation = config.inspect(constants_1.Constants.walletFileFolderPropertyName) ? config.get(constants_1.Constants.walletFileFolderPropertyName) : undefined;
                if ((databaseInfo.displayMode == scriptExecutionModels_1.UIDisplayMode.AutonomousDatabaseConnectionManagement || scriptExecutionModels_1.UIDisplayMode.DownloadCredentialsFile)
                    && args.walletLocation && databaseInfo.dbName) {
                    args.walletLocation = path.join(args.walletLocation, databaseInfo.dbName);
                }
                args.tlsAuthType = databaseInfo.tlsAuthenticationType;
            }
        }
        else {
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.ConnectionManagement;
            args.profileName = "newConnection";
        }
        args.uri = uri;
        args.executionId = (++this.scriptExecutionCommandHandler.scriptExecutionCount).toString();
        args.windowUri = windowURI;
        args.isCreate = true;
        args.windowTitle = windowTitle;
        if (associateFile) {
            args.documentUri = uri;
        }
        args.connectionType = this.lastConnectionType;
        return args;
    }
    async openCreateProfileUI(uri, associateFile, databaseInfo = null) {
        await this.openProfileUI(helper_1.Utils.getConnectionUIArguments(uri, associateFile, databaseInfo, (++this.scriptExecutionCommandHandler.scriptExecutionCount).toString(), this.lastConnectionType));
    }
    openProfileUI(args) {
        this.scriptExecutionCommandHandler.openConnectionManagementPanel(args);
    }
    dbConnectDisconnectEventHandler() {
        const self = this;
        return (event) => {
            fileLogger.info("Handling dbConnectDisconnectEvent event from server.");
            intellisenseConnectionManager_1.IntellisenseConnectionManager.instance.disassociateConnectionIntelliSenseFromFile(event.ownerUri);
            if (event.connected) {
                const connProperties = new documentConnectionInformation_1.DocumentConnectionInformation();
                let connProps = new Interfaces.ConnectionPropertiesExtendedModel();
                connProps.name = event.userId + "@" + event.dataSource;
                connProps.uniqueName = connProps.name;
                connProps.userID = event.userId;
                connProps.dataSource = event.dataSource;
                connProps.dBAPrivilege = event.dbaPrivilege;
                connProperties.connectionAttributes = connProps;
                connProperties.connectionId = event.connectionId;
                let connInfo = new ConnectionRequestNameSpc.ConnectionBriefInfo();
                connInfo.userID = event.userId;
                connInfo.dataSource = event.dataSource;
                connProperties.connectionSummary = connInfo;
                this.addConnectionToMap(event.ownerUri, connProperties);
                self.StatusBarMgr.displayConnectSuccess(event.ownerUri, connProps, undefined);
                intellisenseConnectionManager_1.IntellisenseConnectionManager.instance.buildIntelliSenseOnConnect(event.ownerUri);
            }
            else {
                if (!self.isConnecting(event.ownerUri)) {
                    self.deleteConnectionFromMap(event.ownerUri);
                    self.StatusBarMgr.displayNotConnected(event.ownerUri);
                    self.StatusBarMgr.displayLangServiceStatus(event.ownerUri, "");
                    if (event.showMessage) {
                        self.vscodeConnector.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.disConnectedMessage, event.ownerUri));
                    }
                    let connectionNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(event.ownerUri);
                    if (connectionNode) {
                        dataExplorerManager_1.DataExplorerManager.Instance.onConnectionDisconnect(connectionNode, true);
                    }
                }
                const systemManager = (0, extension_1.getSystemManager)();
                systemManager.fileDecorationProvider._onDidChangeFileDecorations.fire(vscode.Uri.parse(event.ownerUri));
                oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance.clearCacheForDocument(event.ownerUri);
                defaultConnectionManager_1.DefaultConnectionManager.instance.addToUserDisconnectedFiles(event.ownerUri);
            }
            fileLogger.info("Processed dbConnectDisconnectEvent event from server.");
        };
    }
    async handleGetConnectionConfigSettingsRequest(message) {
        fileLogger.info('ConnectionCommandHandler.handleGetConnectionConfigSettingsRequest - Start');
        try {
            const response = new scriptExecutionModels_1.GetConnectionConfigSettingsResponse();
            response.connectionConfigSettings = [];
            let userConnConfigSettings = ConnectionCommandsHandler.getConnectionConfigurationSettings(vscode.ConfigurationTarget.Global, undefined);
            response.connectionConfigSettings.push(userConnConfigSettings);
            let workspaceConnConfigSettings = ConnectionCommandsHandler.getConnectionConfigurationSettings(vscode.ConfigurationTarget.Workspace, undefined);
            response.connectionConfigSettings.push(workspaceConnConfigSettings);
            let folderConConfigSettings;
            if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                if (!(vscode.workspace.workspaceFolders.length === 1 &&
                    vscode.workspace.workspaceFolders[0].name === vscode.workspace.name)) {
                    vscode.workspace.workspaceFolders.forEach(folder => {
                        folderConConfigSettings = ConnectionCommandsHandler.getConnectionConfigurationSettings(vscode.ConfigurationTarget.WorkspaceFolder, folder);
                        response.connectionConfigSettings.push(folderConConfigSettings);
                    });
                }
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getConnectionConfigSettingsResponse, response);
        }
        catch (error) {
            fileLogger.error('Error in processing handleGetConnectionConfigSettingsRequest');
            helper.logErroAfterValidating(error);
        }
        fileLogger.info('ConnectionCommandHandler.handleGetConnectionConfigSettingsRequest - End');
    }
    static getConnectionConfigurationSettings(configurationTarget, workspaceFolder) {
        let settings = new scriptExecutionModels_1.ConnectionConfigurationSettings();
        settings.configurationTarget = configurationTarget;
        settings.workspaceFolder = workspaceFolder;
        settings.tnsAdminLocation = settings_1.Settings.getTnsAdmin(configurationTarget, workspaceFolder);
        settings.walletFileLocation = settings_1.Settings.getWalletLocation(configurationTarget, workspaceFolder);
        settings.loginScript = settings_1.Settings.getLoginScript(configurationTarget, workspaceFolder);
        return settings;
    }
    fileHasErrors(uri) {
        const self = this;
        if (uri in self.varURIToConnPropDictionary && self.varURIToConnPropDictionary[uri].errorMessage) {
            return true;
        }
        return false;
    }
    async updateConnectionsOnFilterUpdate(connNode, unequalCollections) {
        fileLogger.info('ConnectionCommandsHandler.updateConnectionsOnFilterUpdate - Start');
        try {
            if (connNode && connNode.connectionURI && connNode.connectionProperties) {
                let connFilterSettings = dataExplorerManager_1.DataExplorerManager.Instance.getFilterSettings(connNode.connectionProperties.filters);
                let request = new ConnectionRequestNameSpc.UpdateConnectionFiltersRequestParameters();
                request.ownerUri = connNode.connectionURI;
                request.filters = connFilterSettings;
                let response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(ConnectionRequestNameSpc.UpdateConnectionFiltersRequest.type, request);
                fileLogger.info('ConnectionCommandsHandler.updateConnectionsOnFilterUpdate - sent UpdateConnectionFilters Request');
                if (response.rebuildIntelliSense) {
                    fileLogger.info('ConnectionCommandsHandler.updateConnectionsOnFilterUpdate - check if IntelliSense filter updated');
                    if (unequalCollections.indexOf(constants_1.Constants.connectionColl) > -1 ||
                        unequalCollections.indexOf(constants_1.Constants.tables) > -1 ||
                        unequalCollections.indexOf(constants_1.Constants.views) > -1 ||
                        unequalCollections.indexOf(constants_1.Constants.procedures) > -1 ||
                        unequalCollections.indexOf(constants_1.Constants.functions) > -1 ||
                        unequalCollections.indexOf(constants_1.Constants.packages) > -1 ||
                        unequalCollections.indexOf(constants_1.Constants.synonyms) > -1 ||
                        unequalCollections.indexOf(constants_1.Constants.sequences) > -1) {
                        fileLogger.info('ConnectionCommandsHandler.updateConnectionsOnFilterUpdate - should rebuild IntelliSense');
                        let rebuildIntelliSense = true;
                        if (response.promptToRebuildIntelliSense) {
                            fileLogger.info('ConnectionCommandsHandler.updateConnectionsOnFilterUpdate - prompt to rebuild IntelliSense');
                            let promtMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.rebuildIntelliSenseOnFilterUpdate, helper_1.Utils.getConnectionLabel(connNode.connectionProperties, connNode.schemaName));
                            rebuildIntelliSense = await helper.Utils.promptForConfirmation(promtMsg, this.vscodeConnector);
                        }
                        if (rebuildIntelliSense) {
                            fileLogger.info('ConnectionCommandsHandler.updateConnectionsOnFilterUpdate - user opted to rebuild IntelliSense');
                            intellisenseConnectionManager_1.IntellisenseConnectionManager.instance.rebuildIntelliSense(connNode.connectionURI, true);
                            fileLogger.info('ConnectionCommandsHandler.updateConnectionsOnFilterUpdate - sent rebuildIntelliSense Request');
                        }
                    }
                }
            }
        }
        catch (error) {
            fileLogger.error('ConnectionCommandsHandler.updateConnectionsOnFilterUpdate - Error');
            helper.logErroAfterValidating(error);
        }
        fileLogger.info('ConnectionCommandsHandler.updateConnectionsOnFilterUpdate - End');
    }
    async handleTestConnectionRequest(message, self) {
        const response = scriptExecutionModels_1.TestConnectionResponse.create(message);
        try {
            logger.FileStreamLogger.Instance.info("ConnectionCommandsHanlder.handleTestConnectionRequest - Start");
            const parameters = new ConnectionRequestNameSpc.TestConnectionRequestParameters();
            this.inheritConfigFileLocations(message.profile);
            const connectionDetails = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(message.profile);
            parameters.connectionAttributes = connectionDetails;
            parameters.windowUri = message.windowUri;
            parameters.ownerUri = message.ownerUri;
            parameters.executionId = message.executionId;
            logger.FileStreamLogger.Instance.info("ConnectionCommandsHanlder.handleTestConnectionRequest - Sending test request to server");
            let testConnResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(ConnectionRequestNameSpc.TestConnectionRequest.type, parameters);
            if (testConnResponse) {
                if (testConnResponse.result) {
                    self.vscodeConnector.showInformationMessage(localizedConstants_1.default.testConnectionSucceeded);
                }
                else {
                    const connectionProps = message.profile;
                    const errMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.testConnectionFailed, connectionProps.name) +
                        "\r\n" + helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgErrorDetails, testConnResponse.message);
                    self.vscodeConnector.showErrorMessage(errMsg);
                }
                response.result = testConnResponse.result;
                response.message = testConnResponse.message;
            }
        }
        catch (error) {
            logger.FileStreamLogger.Instance.info("ConnectionCommandsHanlder.handleTestConnectionRequest - Error");
            response.result = false;
            if (error) {
                response.message = error?.message;
            }
            logger.FileStreamLogger.Instance.error(response.message);
            let errMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.testConnectionFailed, "");
            self.vscodeConnector.showErrorMessage(errMessage);
        }
        finally {
            logger.FileStreamLogger.Instance.info("ConnectionCommandsHanlder.handleTestConnectionRequest - Posting response to UI");
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.testConnectionResponse, response);
        }
        logger.FileStreamLogger.Instance.info("ConnectionCommandsHanlder.handleTestConnectionRequest - End");
    }
    aiProfileUpdatedEventHandler() {
        const self = this;
        return (event) => {
            if (!event.updated) {
                self.vscodeConnector.showErrorMessage(localizedConstants_1.default.unableToSetAIProfileMsg);
            }
        };
    }
}
exports.default = ConnectionCommandsHandler;
