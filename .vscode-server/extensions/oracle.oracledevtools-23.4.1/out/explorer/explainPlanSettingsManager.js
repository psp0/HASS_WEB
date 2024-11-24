"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainPlanSettingsManager = void 0;
const vscode = require("vscode");
const connectionSettingsHelper_1 = require("../connectionManagement/connectionSettingsHelper");
const constants_1 = require("../constants/constants");
const logger = require("../infrastructure/logger");
const helper = require("./../utilities/helper");
const explainPlanUtils_1 = require("./explainPlanUtils");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const settings_1 = require("../utilities/settings");
const localizedConstants_1 = require("./../constants/localizedConstants");
const utilities_1 = require("./utilities");
const fileLogger = logger.FileStreamLogger.Instance;
class explainPlanSettingsManager {
    constructor(scriptExecuter, vsCodeConnector) {
        this.scriptExecuter = scriptExecuter;
        this.vsCodeConnector = vsCodeConnector;
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getExplainPlanSettingsRequest, (message) => {
            this.handleGetExplainPlanSettingsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveExplainPlanSettingsRequest, (message) => {
            this.handleSaveExplainPlanSettingsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.confirmChangeScopeRequest, (message) => {
            this.handleConfirmChangeScopeRequest(message);
        });
    }
    async openExplainPlanSettings(connNode) {
        try {
            const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
            args.uri = utilities_1.TreeViewConstants.explainPlanSettingsUri;
            args.executionId = (++this.scriptExecuter.scriptExecutionCount).toString();
            args.windowUri = constants_1.Constants.explainPlanSettingsWindowUri;
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.explainPlanSettings;
            args.windowTitle = localizedConstants_1.default.explainPlanSettingsUITitle;
            args.configurationTarget = vscode.ConfigurationTarget.Global;
            if (connNode) {
                args.configurationTarget = connNode.connectionProperties.configurationTarget;
                args.workspaceFolderName = connNode.connectionProperties.workspaceFolder?.name;
                args.workspaceFolderUri = connNode.connectionProperties.workspaceFolder?.uri?.toString();
                args.workspaceFolderIndex = connNode.connectionProperties.workspaceFolder?.index;
            }
            this.scriptExecuter.openExplainPlanSettingsPanel(args);
        }
        catch (err) {
            fileLogger.error(err);
        }
    }
    async handleSaveExplainPlanSettingsRequest(message) {
        fileLogger.info('Received SaveExplainPlanSettingsRequest');
        const response = new scriptExecutionModels_1.SaveExplainPlanSettingsResponse();
        let explainSettings, propertyName, saveSuccess, saveFailed;
        try {
            response.explainSettingType = message.explainSettingType;
            switch (message.explainSettingType) {
                case explainPlanUtils_1.ExplainSettingType.ExplainPlan:
                    propertyName = constants_1.Constants.explainPlanSettingProperty;
                    explainSettings = explainPlanUtils_1.explainPlanUtils.processExplainPlanConfigToSave(message.config);
                    saveSuccess = localizedConstants_1.default.explainPlanSettingsSavedMsg;
                    saveFailed = localizedConstants_1.default.explainPlanSettingsSaveFailedMsg;
                    break;
                case explainPlanUtils_1.ExplainSettingType.ExecutionPlan:
                    propertyName = constants_1.Constants.executionPlanSettingProperty;
                    explainSettings = explainPlanUtils_1.explainPlanUtils.processExplainPlanConfigToSave(message.config);
                    saveSuccess = localizedConstants_1.default.executionPlanSettingsSavedMsg;
                    saveFailed = localizedConstants_1.default.executionPlanSettingsSaveFailedMsg;
                    break;
                case explainPlanUtils_1.ExplainSettingType.DBMSExplainPlan:
                    propertyName = constants_1.Constants.dbmsExplainPlanSettingProperty;
                    explainSettings = explainPlanUtils_1.explainPlanUtils.processDBMSPlanConfigToSave(message.config, true);
                    saveSuccess = localizedConstants_1.default.dbmsExplainPlanSettingsSavedMsg;
                    saveFailed = localizedConstants_1.default.dbmsExplainPlanSettingsSaveFailedMsg;
                    break;
                case explainPlanUtils_1.ExplainSettingType.DBMSExecutionPlan:
                    propertyName = constants_1.Constants.dbmsExecutionPlanSettingProperty;
                    explainSettings = explainPlanUtils_1.explainPlanUtils.processDBMSPlanConfigToSave(message.config, true);
                    saveSuccess = localizedConstants_1.default.dbmsExecutionPlanSettingsSavedMsg;
                    saveFailed = localizedConstants_1.default.dbmsExecutionPlanSettingsSaveFailedMsg;
                    break;
            }
            if (explainSettings && propertyName) {
                await settings_1.Settings.updateConfigValue(propertyName, explainSettings, message.configurationTarget, connectionSettingsHelper_1.ConnectionSettingsHelper.getWorkspaceFolder(message.workspaceFolder));
                response.success = true;
                response.message = saveSuccess;
            }
            else {
                response.success = false;
                response.message = saveFailed;
            }
        }
        catch (error) {
            response.message = saveFailed + error;
            response.success = false;
            fileLogger.error(error);
        }
        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveExplainPlanSettingsResponse, response);
    }
    async handleGetExplainPlanSettingsRequest(message) {
        fileLogger.info('Received GetExplainPlanSettingsRequest request');
        const response = new scriptExecutionModels_1.GetExplainPlanSettingsResponse();
        try {
            let workspaceFolder = connectionSettingsHelper_1.ConnectionSettingsHelper.getWorkspaceFolder(message.workspaceFolder);
            response.configurationTarget = message.configurationTarget;
            response.workspaceFolder = workspaceFolder;
            response.defaultConfig = explainPlanUtils_1.explainPlanUtils.getExplainSettingDefaultValues();
            response.config = [];
            let userConfig = explainPlanUtils_1.explainPlanUtils.getExplainAndExecutionPlanConfigForUI(vscode.ConfigurationTarget.Global, undefined);
            response.config.push(userConfig);
            let workspaceConfig = explainPlanUtils_1.explainPlanUtils.getExplainAndExecutionPlanConfigForUI(vscode.ConfigurationTarget.Workspace, undefined);
            response.config.push(workspaceConfig);
            let folderCompilerSettings;
            if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                if (!(vscode.workspace.workspaceFolders.length === 1 &&
                    vscode.workspace.workspaceFolders[0].name === vscode.workspace.name)) {
                    vscode.workspace.workspaceFolders.forEach(folder => {
                        folderCompilerSettings = explainPlanUtils_1.explainPlanUtils.getExplainAndExecutionPlanConfigForUI(vscode.ConfigurationTarget.WorkspaceFolder, folder);
                        response.config.push(folderCompilerSettings);
                    });
                }
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getExplainPlanSettingsResponse, response);
        }
        catch (error) {
            fileLogger.error('Error in GetExplainPlanSettingsRequest');
            helper.logErroAfterValidating(error);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getExplainPlanSettingsResponse, response);
        }
    }
    async handleConfirmChangeScopeRequest(message) {
        fileLogger.info("explainSettingsManager.handleConfirmChangeScopeRequest - Start");
        const confirmChangeScopeResponse = new scriptExecutionModels_1.ConfirmChangeScopeResponse();
        confirmChangeScopeResponse.configurationTarget = message.configurationTarget;
        confirmChangeScopeResponse.workspaceFolder = message.workspaceFolder;
        confirmChangeScopeResponse.scopeChangeSource = message.scopeChangeSource;
        confirmChangeScopeResponse.proceed = false;
        try {
            confirmChangeScopeResponse.proceed = await helper.Utils.promptForConfirmation(localizedConstants_1.default.confirmChangeScopePrompt, this.vsCodeConnector);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.confirmChangeScopeResponse + message.scopeChangeSource, confirmChangeScopeResponse);
        }
        catch (error) {
            fileLogger.info("explainSettingsManager.handleConfirmChangeScopeRequest - Error on processing request");
            fileLogger.error(error);
        }
        fileLogger.info("explainSettingsManager.handleConfirmChangeScopeRequest - End");
    }
}
exports.explainPlanSettingsManager = explainPlanSettingsManager;
