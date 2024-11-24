"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbmsCloudAIManager = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const logger = require("../infrastructure/logger");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const localizedConstants_1 = require("../constants/localizedConstants");
const helper_1 = require("../utilities/helper");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const dataExplorerManager_1 = require("./dataExplorerManager");
const connectionRequest_1 = require("../models/connectionRequest");
const ConnectionRequestNameSpc = require("../models/connectionRequest");
const utilities_1 = require("./utilities");
const dbmsCloudAIRequests_1 = require("./dbmsCloudAIRequests");
const helper = require("../utilities/helper");
const connectionCommandsScenarioManager_1 = require("../connectionManagement/connectionCommandsScenarioManager");
const connectionSettingsManager_1 = require("../connectionManagement/connectionSettingsManager");
const fileLogger = logger.FileStreamLogger.Instance;
class DbmsCloudAIManager {
    constructor(connCmdHdlr, vscodeConnector) {
        this.connectionCmdHandler = connCmdHdlr;
        this.vscodeConnector = vscodeConnector;
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveCredentialRequest, (message) => {
            this.handleSaveCredentialRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveAiProfileRequest, (message) => {
            this.handleSaveProfileRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveLLMAccessConfigRequest, (message) => {
            this.handleSaveLLMAccessConfigRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.llmConfigGetSchemasRequest, (message) => {
            this.handleLLMConfigGetSchemasRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.llmConfigGetCredentialsRequest, (message) => {
            this.handleGetCredentialsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getTablesViewsRequest, (message) => {
            this.handleGetTablesViewsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getConnectedUserRequest, (message) => {
            this.handleGetConnectedUserRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.configAIGetConnectionsInfoRequest, (message) => {
            this.handleGetConnectionsInfoRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.configAIGetAIProfilesRequest, (message) => {
            this.handleGetAIProfilesRequest(message);
        });
    }
    static CreateInstance(connCmdHdlr, vscodeConnector) {
        try {
            if (DbmsCloudAIManager.instance === undefined) {
                DbmsCloudAIManager.instance = new DbmsCloudAIManager(connCmdHdlr, vscodeConnector);
            }
            return DbmsCloudAIManager.instance;
        }
        catch (error) {
            (0, helper_1.logErroAfterValidating)(new Error(error));
        }
    }
    static get Instance() {
        return DbmsCloudAIManager.instance;
    }
    async openConfigureAIProvider(connNode) {
        fileLogger.info("Opening Configure Select AI Provider Network Access page");
        try {
            const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
            args.uri = utilities_1.TreeViewConstants.configureAIProviderUri;
            args.executionId = "1";
            args.windowUri = constants_1.Constants.configureAIProviderUri;
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.ConfigureAIProvider;
            args.windowTitle = localizedConstants_1.default.configureAIProviderTitle;
            const connProps = connNode.connectionProperties;
            args.connectionUniqueId = connNode.connectionUniqueId;
            args.profileName = connProps.name;
            args.configurationTarget = connProps.configurationTarget;
            args.workspaceFolderName = connProps.workspaceFolder?.name;
            args.workspaceFolderUri = connProps.workspaceFolder?.uri?.toString();
            args.workspaceFolderIndex = connProps.workspaceFolder?.index;
            this.openAIConfigurationPanel(args, "OracleAIProviderAccessConfiguration");
        }
        catch (error) {
            fileLogger.info("Error on opening Configure Select AI Provider Network Access page");
            helper.logErroAfterValidating(error);
        }
    }
    async openManageAIProfiles(connNode) {
        fileLogger.info("Opening Manage AI Profiles page");
        try {
            const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
            args.uri = utilities_1.TreeViewConstants.manageAIProfilesUri;
            args.executionId = "1";
            args.windowUri = constants_1.Constants.manageAIProfilesUri;
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.ManageAIProfiles;
            args.windowTitle = localizedConstants_1.default.manageAIProfilesTitle;
            const connProps = connNode.connectionProperties;
            args.connectionUniqueId = connNode.connectionUniqueId;
            args.profileName = connProps.name;
            args.configurationTarget = connProps.configurationTarget;
            args.workspaceFolderName = connProps.workspaceFolder?.name;
            args.workspaceFolderUri = connProps.workspaceFolder?.uri?.toString();
            args.workspaceFolderIndex = connProps.workspaceFolder?.index;
            this.openAIConfigurationPanel(args, "OracleManageAIProfiles");
        }
        catch (error) {
            fileLogger.info("Error on opening Manage AI Profiles page");
            helper.logErroAfterValidating(error);
        }
    }
    async getConnectionInfo(connUniqueId, connName, isConfigureProfile = true) {
        let connectionDetails = null;
        let errorMessage = null;
        const connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueId(connUniqueId);
        if (!connNode) {
            if (isConfigureProfile) {
                errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.selectAIProfileConnectionDeleted, connName);
            }
            else {
                errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.selectAIProviderConnectionDeleted, connName);
            }
            throw new Error(errorMessage);
        }
        else {
            let connPropsVSCode = connNode.connectionProperties;
            if (connPropsVSCode.name !== connName) {
                if (isConfigureProfile) {
                    errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.selectAIProfileConnectionRenamed, connName, connPropsVSCode.name);
                }
                else {
                    errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.selectAIProviderConnectionRenamed, connName, connPropsVSCode.name);
                }
                throw new Error(errorMessage);
            }
            if (connPropsVSCode && connPropsVSCode.passwordSaved) {
                const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
                await helperSettings.PostProcessReadProfileCredsAsync(connPropsVSCode);
            }
            let profile = await this.connectionCmdHandler.connectionLogicMgr.shallAskForAnyMissingConnInfo(connPropsVSCode, true);
            if (!profile) {
                throw new Error(localizedConstants_1.default.notConnectedMissingCreds);
            }
            connectionDetails = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(profile);
        }
        return connectionDetails;
    }
    getConnectionFilters(connUniqueId) {
        let filters = [];
        const connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueId(connUniqueId);
        if (connNode) {
            filters = connNode.filterSettings;
        }
        return filters;
    }
    async handleSaveCredentialRequest(message) {
        fileLogger.info("Received Save Credential Request");
        try {
            fileLogger.info("Processing Save Credential Request - " + scriptExecutionModels_1.SaveCredentialRequest.displayString(message));
            const createCredParams = new dbmsCloudAIRequests_1.CreateCredentialRequestParams();
            createCredParams.ownerUri = message.ownerUri;
            createCredParams.credentialName = message.credentialName;
            createCredParams.key = message.apiKey;
            createCredParams.username = message.username;
            createCredParams.connectionAttributes = await this.getConnectionInfo(message.connectionUniqueId, message.connectionName);
            let createCredResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dbmsCloudAIRequests_1.CreateCredentialRequest.type, createCredParams);
            fileLogger.info("Received CreateCredentialResponse from server - " + scriptExecutionModels_1.SaveCredentialRequest.displayString(message));
            const response = scriptExecutionModels_1.SaveCredentialResponse.create(message);
            if (createCredResponse && createCredResponse.messageType == dbmsCloudAIRequests_1.LLMConfigMessageType.Success) {
                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.createCredentialSuccessMsg, message.credentialName, message.connectionName);
                response.success = true;
                fileLogger.info("Successfully created credential");
            }
            else {
                response.success = false;
                if (createCredResponse && createCredResponse.message) {
                    response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.createCredentialFailMsg, message.credentialName, message.connectionName, createCredResponse.message);
                    fileLogger.info("Failed to create credential. " + createCredResponse.message);
                }
                else {
                    response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.createCredentialFailMsg, message.credentialName, message.connectionName, "");
                    fileLogger.info("Failed to create credential");
                }
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveCredentialResponse, response);
        }
        catch (error) {
            fileLogger.error("Error on saving new credential - " + scriptExecutionModels_1.SaveCredentialRequest.displayString(message));
            const response = scriptExecutionModels_1.SaveCredentialResponse.create(message);
            response.success = false;
            let errmsg = error.message;
            if (errmsg) {
                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.createCredentialFailMsg, message.credentialName, message.connectionName, errmsg);
                fileLogger.error(errmsg);
            }
            else {
                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.createCredentialFailMsg, message.credentialName, message.connectionName, "");
                fileLogger.error("Error message for saving new credential is unavailable.");
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveCredentialResponse, response);
        }
        fileLogger.info("Save Credential Request processed");
    }
    async handleSaveProfileRequest(message) {
        fileLogger.info("Received Save AI Profile Request");
        try {
            fileLogger.info("Processing Save AI Profile Request - " + scriptExecutionModels_1.SaveAiProfileRequest.displayString(message));
            const createProfParams = new dbmsCloudAIRequests_1.CreateAIProfileRequestParams();
            createProfParams.ownerUri = message.ownerUri;
            createProfParams.profileName = message.profileName;
            createProfParams.provider = message.provider;
            createProfParams.credentialName = message.credentialName;
            createProfParams.model = message.model;
            createProfParams.objectList = message.objectList;
            createProfParams.connectionAttributes = await this.getConnectionInfo(message.connectionUniqueId, message.connectionName);
            let createProfileResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dbmsCloudAIRequests_1.CreateAIProfileRequest.type, createProfParams);
            fileLogger.info("SaveAiProfileRequest received response from server - " + scriptExecutionModels_1.SaveAiProfileRequest.displayString(message));
            const response = scriptExecutionModels_1.SaveAiProfileResponse.create(message);
            if (createProfileResponse && createProfileResponse.messageType == dbmsCloudAIRequests_1.LLMConfigMessageType.Success) {
                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.createProfileSuccessMsg, message.profileName, message.connectionName);
                response.success = true;
                fileLogger.info("Successfully created AI Profile");
            }
            else {
                response.success = false;
                if (createProfileResponse && createProfileResponse.message) {
                    response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.createProfileFailedMsg, message.profileName, message.connectionName, createProfileResponse.message);
                    fileLogger.info("Failed to create AI Profile. " + createProfileResponse.message);
                }
                else {
                    response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.createProfileFailedMsg, message.profileName, message.connectionName, "");
                    fileLogger.info("Failed to create AI Profile. Error unavailable.");
                }
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveAiProfileResponse, response);
        }
        catch (error) {
            fileLogger.error("Error on saving AI profile - " + scriptExecutionModels_1.SaveAiProfileRequest.displayString(message));
            const response = scriptExecutionModels_1.SaveAiProfileResponse.create(message);
            response.success = false;
            let errmsg = error.message;
            if (errmsg) {
                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.createProfileFailedMsg, message.profileName, message.connectionName, errmsg);
                fileLogger.error(errmsg);
            }
            else {
                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.createProfileFailedMsg, message.profileName, message.connectionName, "");
                fileLogger.error("Error message for saving AI profile is unavailable.");
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveAiProfileResponse, response);
        }
        fileLogger.info("SaveAiProfile request processed");
    }
    async handleSaveLLMAccessConfigRequest(message) {
        fileLogger.info("Received Configure Select AI Provider Network Access request");
        try {
            fileLogger.info("Processing Configure Select AI Provider Network Access request - " + scriptExecutionModels_1.SaveLLMAccessConfigRequest.displayString(message));
            const configLLMParams = new dbmsCloudAIRequests_1.ConfigLLMAccessRequestParams();
            configLLMParams.ownerUri = message.ownerUri;
            configLLMParams.connectedUser = message.connectedUser;
            configLLMParams.username = message.username;
            configLLMParams.host = message.host;
            configLLMParams.connectionAttributes = await this.getConnectionInfo(message.connectionUniqueId, message.connectionName, false);
            let configLLMResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dbmsCloudAIRequests_1.ConfigLLMAccessRequest.type, configLLMParams);
            fileLogger.info("Configure Select AI Provider Network Access received response from server - " + scriptExecutionModels_1.SaveLLMAccessConfigRequest.displayString(message));
            const response = scriptExecutionModels_1.SaveLLMAccessConfigResponse.create(message);
            if (configLLMResponse && configLLMResponse.messageType == dbmsCloudAIRequests_1.LLMConfigMessageType.Success) {
                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.llmAccessConfigSuccessMsg, message.username, message.connectionName);
                response.success = true;
                fileLogger.info("Successfully configured Select AI Provider Network Access");
            }
            else {
                response.success = false;
                if (configLLMResponse && configLLMResponse.message) {
                    response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.llmAccessConfigFailedMsg, message.username, message.connectionName, configLLMResponse.message);
                    fileLogger.info("Failed to configure Select AI Provider Network Access. " + configLLMResponse.message);
                }
                else {
                    response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.llmAccessConfigFailedMsg, message.username, message.connectionName, "");
                    fileLogger.info("Failed to configure Select AI Provider Network Access. Error unavailable.");
                }
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveLLMAccessConfigResponse, response);
        }
        catch (error) {
            fileLogger.error("Error on Configure Select AI Provider Network Access - " + scriptExecutionModels_1.SaveLLMAccessConfigRequest.displayString(message));
            const response = scriptExecutionModels_1.SaveLLMAccessConfigResponse.create(message);
            response.success = false;
            let errmsg = error.message;
            if (errmsg) {
                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.llmAccessConfigFailedMsg, message.username, message.connectionName, errmsg);
                fileLogger.error(errmsg);
            }
            else {
                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.llmAccessConfigFailedMsg, message.username, message.connectionName, "");
                fileLogger.error("Error message for Configure Select AI Provider Network Access is unavailable.");
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveLLMAccessConfigResponse, response);
        }
        fileLogger.info("Configure Select AI Provider Network Access request processed");
    }
    async handleLLMConfigGetSchemasRequest(message) {
        fileLogger.info("Received Select AI Provider GetSchemasRequest");
        try {
            fileLogger.info("Processing Select AI Provider GetSchemasRequest - " + scriptExecutionModels_1.LLMConfigGetSchemasRequest.displayString(message));
            const getLLMConfigUsersParams = new connectionRequest_1.GetSchemasRequestParameters();
            getLLMConfigUsersParams.ownerUri = message.ownerUri;
            getLLMConfigUsersParams.windowUri = message.windowUri;
            getLLMConfigUsersParams.executionId = message.executionId;
            getLLMConfigUsersParams.connectionAttributes = await this.getConnectionInfo(message.connectionUniqueId, message.connectionName, message.ownerUri === utilities_1.TreeViewConstants.manageAIProfilesUri);
            let lspResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(connectionRequest_1.GetSchemasRequest.type, getLLMConfigUsersParams);
            fileLogger.info("Select AI Provider GetSchemasRequest received response from server - " + scriptExecutionModels_1.LLMConfigGetSchemasRequest.displayString(message));
            const response = scriptExecutionModels_1.LLMConfigGetSchemasResponse.create(message);
            const schemas = [];
            if (lspResponse && helper.isEmpty(lspResponse.errorMessage)) {
                if (lspResponse.schemas && lspResponse.schemas.length > 0) {
                    for (const schema of lspResponse.schemas) {
                        schemas.push(schema);
                    }
                }
                if (lspResponse.userIdUsedToConnect)
                    response.userIdUsedToConnect = lspResponse.userIdUsedToConnect;
                fileLogger.info("Received schemas");
            }
            else {
                if (lspResponse && lspResponse.errorMessage) {
                    response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetSchemaInfo, lspResponse.errorMessage);
                    fileLogger.info("Failed to get schemas. " + lspResponse.errorMessage);
                }
                else {
                    response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetSchemaInfo, "");
                    fileLogger.info("Failed to get schemas. Error unavailable.");
                }
            }
            response.schemas = schemas;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.llmConfigGetSchemasResponse, response);
        }
        catch (error) {
            fileLogger.error("Error on Select AI Provider GetSchemasRequest - " + scriptExecutionModels_1.LLMConfigGetSchemasRequest.displayString(message));
            const response = scriptExecutionModels_1.LLMConfigGetSchemasResponse.create(message);
            response.schemas = [];
            let errmsg = error.message;
            if (errmsg) {
                response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetSchemaInfo, errmsg);
                fileLogger.error(errmsg);
            }
            else {
                response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetSchemaInfo, "");
                fileLogger.error("Error message for Select AI Provider GetSchemasRequest is unavailable");
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.llmConfigGetSchemasResponse, response);
        }
        fileLogger.info("Select AI Provider GetSchemasRequest processed");
    }
    async handleGetCredentialsRequest(message) {
        fileLogger.info("Received Configure Select AI GetCredentialsRequest");
        try {
            fileLogger.info("Received Configure Select AI GetCredentialsRequest - " + scriptExecutionModels_1.LLMConfigGetCredentialsRequest.displayString(message));
            const getCredsParams = new dbmsCloudAIRequests_1.GetLLMConfigCredentialsRequestParameters();
            getCredsParams.ownerUri = message.ownerUri;
            getCredsParams.connectionAttributes = await this.getConnectionInfo(message.connectionUniqueId, message.connectionName);
            let lspResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dbmsCloudAIRequests_1.GetLLMConfigCredentialsRequest.type, getCredsParams);
            fileLogger.info("GetCredentialsRequest received response from server - " + scriptExecutionModels_1.LLMConfigGetCredentialsRequest.displayString(message));
            const response = scriptExecutionModels_1.LLMConfigGetCredentialsResponse.create(message);
            const credentials = [];
            if (lspResponse && helper.isEmpty(lspResponse.errorMessage)) {
                if (lspResponse.credentials && lspResponse.credentials.length > 0) {
                    for (const cred of lspResponse.credentials) {
                        credentials.push(cred);
                    }
                }
                fileLogger.info("Received credentials");
            }
            else {
                if (lspResponse && lspResponse.errorMessage) {
                    response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.getCredentialsFailedMsg, lspResponse.errorMessage);
                    fileLogger.info("Failed to get credentials. " + lspResponse.errorMessage);
                }
                else {
                    response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.getCredentialsFailedMsg, "");
                    fileLogger.error("Error message for Configure Select AI GetCredentialsRequest is unavailable");
                }
            }
            response.credentials = credentials;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.llmConfigGetCredentialsResponse, response);
        }
        catch (error) {
            fileLogger.error("Error on Configure Select AI GetCredentialsRequest - " + scriptExecutionModels_1.LLMConfigGetCredentialsRequest.displayString(message));
            const response = scriptExecutionModels_1.LLMConfigGetCredentialsResponse.create(message);
            response.credentials = [];
            let errmsg = error.message;
            if (errmsg) {
                response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.getCredentialsFailedMsg, errmsg);
                fileLogger.error(errmsg);
            }
            else {
                response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.getCredentialsFailedMsg, "");
                fileLogger.error("Error message for Configure Select AI GetCredentialsRequest is unavailable");
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.llmConfigGetCredentialsResponse, response);
        }
        fileLogger.info("Configure Select AI GetCredentialsRequest processed");
    }
    async handleGetTablesViewsRequest(message) {
        fileLogger.info("Received GetTablesViewsRequest");
        try {
            fileLogger.info("Received GetTablesViewsRequest - " + scriptExecutionModels_1.GetTablesViewsRequest.displayString(message));
            const reqParams = new dbmsCloudAIRequests_1.GetLLMConfigObjectListRequestParameters();
            reqParams.ownerUri = message.ownerUri;
            reqParams.schema = message.schema;
            reqParams.connectionAttributes = await this.getConnectionInfo(message.connectionUniqueId, message.connectionName);
            reqParams.filters = this.getConnectionFilters(message.connectionUniqueId);
            let lspResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dbmsCloudAIRequests_1.GetLLMConfigObjectListRequest.type, reqParams);
            fileLogger.info("GetTablesViewsRequest received response from server - " + scriptExecutionModels_1.GetTablesViewsRequest.displayString(message));
            const response = scriptExecutionModels_1.GetTablesViewsResponse.create(message);
            const tables = [];
            const views = [];
            if (lspResponse && helper.isEmpty(lspResponse.errorMessage)) {
                if (lspResponse.tables && lspResponse.tables.length > 0) {
                    for (let table of lspResponse.tables) {
                        tables.push(table);
                    }
                }
                if (lspResponse.views && lspResponse.views.length > 0) {
                    for (let view of lspResponse.views) {
                        views.push(view);
                    }
                }
                fileLogger.info("Received tables and views");
            }
            else {
                if (lspResponse && lspResponse.errorMessage) {
                    response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.getTablesViewsFailedMsg, lspResponse.errorMessage);
                    fileLogger.info("Failed to get tables and views. " + lspResponse.errorMessage);
                }
                else {
                    response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.getTablesViewsFailedMsg, "");
                    fileLogger.error("Error message for Configure Select AI GetTablesViewsRequest is unavailable");
                }
            }
            response.tables = tables;
            response.views = views;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getTablesViewsResponse, response);
        }
        catch (error) {
            fileLogger.error("Error on Configure Select AI GetTablesViewsRequest - " + scriptExecutionModels_1.GetTablesViewsRequest.displayString(message));
            const response = scriptExecutionModels_1.GetTablesViewsResponse.create(message);
            response.tables = [];
            response.views = [];
            let errmsg = error.message;
            if (errmsg) {
                response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.getTablesViewsFailedMsg, errmsg);
                fileLogger.error(errmsg);
            }
            else {
                response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.getTablesViewsFailedMsg, "");
                fileLogger.error("Error message for Configure Select AI GetTablesViewsRequest is unavailable");
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getTablesViewsResponse, response);
        }
        fileLogger.info("GetTablesViewsRequest processed");
    }
    async handleGetConnectedUserRequest(message) {
        fileLogger.info("Received Select AI GetConnectedUserRequest");
        try {
            fileLogger.info("Received GetConnectedUserRequest - " + scriptExecutionModels_1.GetConnectedUserRequest.displayString(message));
            const getUserRequest = new ConnectionRequestNameSpc.GetConnectedUserRequestParameters();
            getUserRequest.ownerUri = message.ownerUri;
            getUserRequest.executionId = message.executionId;
            getUserRequest.windowUri = message.windowUri;
            getUserRequest.connectionAttributes = await this.getConnectionInfo(message.connectionUniqueId, message.connectionName);
            let getConnUserResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(ConnectionRequestNameSpc.GetConnectedUserRequest.type, getUserRequest);
            fileLogger.info("GetConnectedUserRequest received response from server - " + scriptExecutionModels_1.GetConnectedUserRequest.displayString(message));
            const response = scriptExecutionModels_1.GetConnectedUserResponse.create(message);
            if (getConnUserResponse && helper.isEmpty(getConnUserResponse.errorMessage) && getConnUserResponse.connectedUser) {
                response.connectedUser = getConnUserResponse.connectedUser;
                fileLogger.info("Received connected user");
            }
            else {
                response.connectedUser = "";
                if (getConnUserResponse && helper.isEmpty(getConnUserResponse.errorMessage)) {
                    response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetConnectedUserMsg, getConnUserResponse.errorMessage);
                    fileLogger.info("Failed to get connected user. " + getConnUserResponse.errorMessage);
                }
                else {
                    response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetConnectedUserMsg, "");
                    fileLogger.error("Error message for Configure Select AI GetConnectedUserRequest is unavailable");
                }
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getConnectedUserResponse, response);
        }
        catch (error) {
            fileLogger.error("Error on Configure Select AI GetConnectedUserRequest - " + scriptExecutionModels_1.GetConnectedUserRequest.displayString(message));
            const response = scriptExecutionModels_1.GetConnectedUserResponse.create(message);
            response.connectedUser = "";
            let errmsg = error.message;
            if (errmsg) {
                response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetConnectedUserMsg, errmsg);
                fileLogger.error(errmsg);
            }
            else {
                response.errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.unableToGetConnectedUserMsg, "");
                fileLogger.error("Error message for Configure Select AI GetConnectedUserRequest is unavailable");
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getConnectedUserResponse, response);
        }
        fileLogger.info("GetConnectedUserRequest processed");
    }
    handleGetConnectionsInfoRequest(message) {
        fileLogger.info("Received ConfigAIGetConnectionsInfoRequest");
        const response = new scriptExecutionModels_1.ConfigAIGetConnectionsInfoResponse();
        let profilesInfo = [];
        let connNode = undefined;
        try {
            const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
            const profiles = helperSettings.retrieveAllConnections(true);
            if (profiles && profiles.length > 0) {
                profiles.forEach((prof) => {
                    connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueName(prof.uniqueName);
                    if (connNode) {
                        profilesInfo.push([prof.name, prof.uniqueName, connNode.connectionUniqueId]);
                    }
                });
            }
        }
        catch (error) {
            let errmsg = error.message;
            if (errmsg) {
                fileLogger.error("Error on ConfigAIGetConnectionsInfoRequest. " + errmsg);
            }
            else {
                fileLogger.error("Error on ConfigAIGetConnectionsInfoRequest ");
            }
        }
        response.profilesInfo = profilesInfo;
        fileLogger.info("Processed ConfigAIGetConnectionsInfoRequest");
        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.configAIGetConnectionsInfoResponse, response);
    }
    async handleGetAIProfilesRequest(message) {
        fileLogger.info("Received ConfigAIGetAIProfilesRequest");
        try {
            fileLogger.info("Processing ConfigAIGetAIProfilesRequest - " + scriptExecutionModels_1.ConfigAIGetAIProfilesRequest.displayString(message));
            const profiles = [];
            const getAIProfsRequest = new dbmsCloudAIRequests_1.GetAIProfilesRequestParameters();
            getAIProfsRequest.ownerUri = message.ownerUri;
            getAIProfsRequest.windowUri = message.windowUri;
            getAIProfsRequest.connectionAttributes = await this.getConnectionInfo(message.connectionUniqueId, message.connectionName);
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dbmsCloudAIRequests_1.GetAIProfilesRequest.type, getAIProfsRequest).
                then((lspResponse) => {
                fileLogger.info("ConfigAIGetAIProfilesRequest received response from server - " + scriptExecutionModels_1.ConfigAIGetAIProfilesRequest.displayString(message));
                const response = scriptExecutionModels_1.GetAIProfilesResponse.create(message);
                if (lspResponse && helper.isEmpty(lspResponse.errorMessage)) {
                    if (lspResponse.profiles && lspResponse.profiles.length > 0) {
                        for (const prof of lspResponse.profiles) {
                            profiles.push(prof);
                        }
                    }
                    response.success = true;
                    fileLogger.info("Received AI Profiles");
                }
                else {
                    response.success = false;
                    if (lspResponse && lspResponse.errorMessage) {
                        fileLogger.info("Failed to get AI Profiles for " + lspResponse.errorMessage);
                    }
                    else {
                        fileLogger.info("Failed to get AI Profiles");
                    }
                }
                response.profiles = profiles;
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getAIProfilesResponse, response);
            }, (error) => {
                fileLogger.error("Error on GetAIProfilesRequest - " + scriptExecutionModels_1.ConfigAIGetAIProfilesRequest.displayString(message));
                const response = scriptExecutionModels_1.GetAIProfilesResponse.create(message);
                response.success = false;
                response.profiles = [];
                if (error.message) {
                    fileLogger.error(error.message);
                }
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getAIProfilesResponse, response);
            });
        }
        catch (error) {
            fileLogger.error("Error on GetAIProfilesRequest - " + scriptExecutionModels_1.ConfigAIGetAIProfilesRequest.displayString(message));
            const response = scriptExecutionModels_1.GetAIProfilesResponse.create(message);
            response.success = false;
            response.profiles = [];
            if (error.message) {
                fileLogger.error(error.message);
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getAIProfilesResponse, response);
        }
    }
    openAIConfigurationPanel(args, viewType) {
        const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri);
        const clientInfo = clients && clients.length > 0 ? clients[0] : null;
        let existingPanel = clientInfo ? clientInfo.panel : null;
        let panel = existingPanel;
        if (!panel) {
            panel = vscode.window.createWebviewPanel(viewType, args.windowTitle, vscode.ViewColumn.Active, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            panel.webview.html = scriptExcutionCommandHandler_1.ScriptExecutionCommandHandler.generateHtml(this.vscodeConnector, args, panel);
            panel.onDidDispose(async () => {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
            }, undefined, this.vscodeConnector.ExtensionContext.subscriptions);
            panel.onDidChangeViewState((e) => {
                if (e && e.webviewPanel) {
                    if (e.webviewPanel.active && e.webviewPanel.visible) {
                        fileLogger.info(`${args.windowTitle} page is active and visible`);
                    }
                }
            });
            resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, args.windowUri, args.executionId);
            let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri, args.executionId);
            if (clients) {
                clients.forEach(client => {
                    client.ready = true;
                    resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
                });
            }
        }
        else {
            panel.title = args.windowTitle;
            const clearParams = new scriptExecutionModels_1.clearPageEvent();
            clearParams.ownerUri = args.windowUri;
            clearParams.executionId = args.executionId;
            clearParams.windowUri = args.windowUri;
            clearParams.profileName = args.profileName;
            clearParams.workspaceFolderName = args.workspaceFolderName;
            clearParams.workspaceFolderUri = args.workspaceFolderUri;
            clearParams.workspaceFolderIndex = args.workspaceFolderIndex;
            clearParams.configurationTarget = args.configurationTarget;
            clearParams.isCreate = args.isCreate;
            clearParams.uri = args.uri;
            clearParams.documentUri = args.documentUri;
            clearParams.walletLocation = args.walletLocation;
            clearParams.isDedicatedDb = args.isDedicatedDb;
            clearParams.displayMode = args.uiMode;
            clearParams.tlsAuthenticationType = args.tlsAuthType;
            clearParams.adbDatabaseID = args.adbDatabaseID;
            clearParams.workloadType = args.adbWorkLoadType;
            clearParams.connectionUniqueId = args.connectionUniqueId;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(args.windowUri, args.executionId, scriptExecutionModels_1.MessageName.clearPageEvent, clearParams);
        }
        panel.reveal(panel.viewColumn, false);
    }
}
exports.DbmsCloudAIManager = DbmsCloudAIManager;
