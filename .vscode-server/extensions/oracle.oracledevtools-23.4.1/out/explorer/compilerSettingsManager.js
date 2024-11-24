"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerSettingsManager = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const userPreferenceManager_1 = require("../infrastructure/userPreferenceManager");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const logger = require("../infrastructure/logger");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const localizedConstants_1 = require("./../constants/localizedConstants");
const utilities_1 = require("../explorer/utilities");
const helper = require("./../utilities/helper");
const connectionSettingsHelper_1 = require("../connectionManagement/connectionSettingsHelper");
const settings_1 = require("../utilities/settings");
const fileLogger = logger.FileStreamLogger.Instance;
class CompilerSettingsManager {
    constructor(scriptExecuter) {
        this.scriptExecuter = scriptExecuter;
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getCompilerSettingsRequest, (message) => {
            this.handleGetCompilerSettingsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveCompilerSettingsRequest, (message) => {
            this.handleSaveCompilerSettingsRequest(message);
        });
    }
    async openCompilerSettings(connNode) {
        try {
            const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
            args.uri = utilities_1.TreeViewConstants.compilerSettingsUri;
            args.executionId = (++this.scriptExecuter.scriptExecutionCount).toString();
            args.windowUri = constants_1.Constants.compilerSettingsWindowUri;
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.CompilerSettings;
            args.windowTitle = localizedConstants_1.default.compilerSettingsUITitle;
            args.configurationTarget = vscode.ConfigurationTarget.Global;
            if (connNode) {
                args.configurationTarget = connNode.connectionProperties.configurationTarget;
                args.workspaceFolderName = connNode.connectionProperties.workspaceFolder?.name;
                args.workspaceFolderUri = connNode.connectionProperties.workspaceFolder?.uri?.toString();
                args.workspaceFolderIndex = connNode.connectionProperties.workspaceFolder?.index;
            }
            this.scriptExecuter.openCompilerSettingsPanel(args);
        }
        catch (err) {
            fileLogger.error(err);
        }
    }
    async handleSaveCompilerSettingsRequest(message) {
        fileLogger.info('Recevied SaveCompilerSettingsRequest');
        const response = new scriptExecutionModels_1.SaveCompilerSettingsResponse();
        try {
            const compilerSettings = this.processCompilerFlagsToSave(message.compileConfig, message.compileDebugConfig);
            await settings_1.Settings.updateConfigValue(constants_1.Constants.compilerSettingsPropertyName, compilerSettings, message.configurationTarget, connectionSettingsHelper_1.ConnectionSettingsHelper.getWorkspaceFolder(message.workspaceFolder));
            userPreferenceManager_1.UserPreferenceManager.Instance.saveCompilerSettingsUserPreferences(message.configType);
            response.message = localizedConstants_1.default.compilerSettingsSavedMsg;
            response.success = true;
        }
        catch (error) {
            response.message = localizedConstants_1.default.compilerSettingSaveFailedMsg + error;
            response.success = false;
            fileLogger.error(error);
        }
        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveCompilerSettingsResponse, response);
    }
    processCompilerFlagsToSave(compileFlags, compileDebugFlags) {
        let settingsObject = {};
        try {
            for (const [key, value] of Object.entries(compileFlags)) {
                settingsObject[constants_1.Constants.compileDotStr + key] = value;
            }
            for (const [key, value] of Object.entries(compileDebugFlags)) {
                settingsObject[constants_1.Constants.compileDebugDotStr + key] = value;
            }
        }
        catch (error) {
            fileLogger.error('Error in processCompilerFlagsToSave: ' + error);
        }
        return settingsObject;
    }
    async handleGetCompilerSettingsRequest(message) {
        fileLogger.info('Received GetCompilerSettingsRequest request');
        try {
            let workspaceFolder = connectionSettingsHelper_1.ConnectionSettingsHelper.getWorkspaceFolder(message.workspaceFolder);
            const response = new scriptExecutionModels_1.GetCompilerSettingsResponse();
            response.configurationTarget = message.configurationTarget;
            response.workspaceFolder = workspaceFolder;
            response.compilerSettings = [];
            let userCompilerSettings = CompilerSettingsManager.getCompierSettings(vscode.ConfigurationTarget.Global, undefined);
            response.compilerSettings.push(userCompilerSettings);
            let workspaceCompilerSettings = CompilerSettingsManager.getCompierSettings(vscode.ConfigurationTarget.Workspace, undefined);
            response.compilerSettings.push(workspaceCompilerSettings);
            let folderCompilerSettings;
            if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                if (!(vscode.workspace.workspaceFolders.length === 1 &&
                    vscode.workspace.workspaceFolders[0].name === vscode.workspace.name)) {
                    vscode.workspace.workspaceFolders.forEach(folder => {
                        folderCompilerSettings = CompilerSettingsManager.getCompierSettings(vscode.ConfigurationTarget.WorkspaceFolder, folder);
                        response.compilerSettings.push(folderCompilerSettings);
                    });
                }
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getCompilerSettingsResponse, response);
        }
        catch (error) {
            fileLogger.error('Error in handleGetCompilerSettingsRequest');
            helper.logErroAfterValidating(error);
        }
    }
    static getCompierSettings(configurationTarget, workspaceFolder) {
        let compilerSettings = new scriptExecutionModels_1.CompilerSettings();
        try {
            compilerSettings.configurationTarget = configurationTarget;
            compilerSettings.workspaceFolder = workspaceFolder;
            const compilerFlags = settings_1.Settings.getEffectiveConfigValue(constants_1.Constants.compilerSettingsPropertyName, configurationTarget, workspaceFolder, true);
            compilerSettings.compileConfig = CompilerSettingsManager.processCompilerFlagsFromSettings(compilerFlags, false);
            compilerSettings.compileDebugConfig = CompilerSettingsManager.processCompilerFlagsFromSettings(compilerFlags, true);
            let userPref = userPreferenceManager_1.UserPreferenceManager.Instance.readUserPreferencesFromJsonFile();
            compilerSettings.configType = userPref && userPref.compilerProperties && userPref.compilerProperties.lastConfiguration ? userPref.compilerProperties.lastConfiguration : scriptExecutionModels_1.CompileConfig.Compile;
        }
        catch (error) {
            fileLogger.error('Error in getting effective compiler flags');
            helper.logErroAfterValidating(error);
        }
        return compilerSettings;
    }
    static processCompilerFlagsFromSettings(compileFlags, debug) {
        let processedFlags = {}, id;
        let configType = debug ? constants_1.Constants.compileDebugDotStr : constants_1.Constants.compileDotStr;
        try {
            this.compilerFlagsStrList.forEach(flag => {
                id = configType + flag;
                if (compileFlags[id] !== undefined)
                    processedFlags[flag] = compileFlags[id];
            });
        }
        catch (error) {
            fileLogger.error('Error in processCompilerFlagsFromSettings: ' + error);
        }
        return processedFlags;
    }
}
exports.CompilerSettingsManager = CompilerSettingsManager;
CompilerSettingsManager.compilerFlagsStrList = [
    "enableFlags",
    "optimizeLevel",
    "plscopeIdentifiers",
    "plscopeStatements",
    "allWarnings",
    "informationalWarnings",
    "performanceWarnings",
    "severeWarnings"
];
