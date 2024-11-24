"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debuggerSettingsManager = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const logger = require("../infrastructure/logger");
const localizedConstants_1 = require("./../constants/localizedConstants");
const helper = require("./../utilities/helper");
const dataExplorerRequests_1 = require("./dataExplorerRequests");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const connectionSettingsHelper_1 = require("../connectionManagement/connectionSettingsHelper");
const settings_1 = require("../utilities/settings");
const fileLogger = logger.FileStreamLogger.Instance;
class debuggerSettingsManager {
    constructor() {
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getDebuggerSettingsRequest, (message) => {
            this.handleGetDebuggerSettingsRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveDebuggerSettingsRequest, (message) => {
            this.handleSaveDebuggerSettingsRequest(message);
        });
    }
    async handleSaveDebuggerSettingsRequest(message) {
        fileLogger.info('Recevied SaveDebuggerSettingsRequest');
        const response = new scriptExecutionModels_1.SaveDebuggerSettingsResponse();
        response.saved = false;
        try {
            let requestParams = new dataExplorerRequests_1.PlsqlValidateSettingsRequestParams();
            requestParams.startPort = message.debugSettings.startPort;
            requestParams.endPort = message.debugSettings.endPort;
            requestParams.hostIp = message.debugSettings.ipAddress;
            let validateResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.
                sendRequest(dataExplorerRequests_1.PlsqlValidateSettingsRequest.type, requestParams);
            if (validateResponse.messageType === dataExplorerRequests_1.PlsqlValidateSettingsMessageType.Success) {
                response.debugSettings = message.debugSettings;
                let settingsObject = {};
                settingsObject[constants_1.Constants.settingsIPAddressPropertyName] = message.debugSettings.ipAddress;
                settingsObject[constants_1.Constants.settingsStartPortPropertyName] = message.debugSettings.startPort;
                settingsObject[constants_1.Constants.settingsEndPortPropertyName] = message.debugSettings.endPort;
                await settings_1.Settings.updateConfigValue(constants_1.Constants.debuggerSettingsPropertyName, settingsObject, message.debugSettings.configurationTarget, connectionSettingsHelper_1.ConnectionSettingsHelper.getWorkspaceFolder(message.debugSettings.workspaceFolder));
                response.message = localizedConstants_1.default.debuggerSettingsSavedMsg;
                response.saved = true;
            }
            else {
                response.message = validateResponse.message;
            }
        }
        catch (error) {
            response.message = localizedConstants_1.default.debuggerSettingSaveFailedMsg + error;
            fileLogger.info('Error on processing SaveDebuggerSettingsRequest');
            fileLogger.error(error);
        }
        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveDebuggerSettingsResponse, response);
        fileLogger.info('SaveDebuggerSettingsRequest processed');
    }
    async handleGetDebuggerSettingsRequest(message) {
        fileLogger.info('Received GetDebuggerSettingsRequest request');
        try {
            let ipAddrs = [];
            let workspaceFolder = connectionSettingsHelper_1.ConnectionSettingsHelper.getWorkspaceFolder(message.workspaceFolder);
            const response = new scriptExecutionModels_1.GetDebuggerSettingsResponse();
            response.configurationTarget = message.configurationTarget;
            response.workspaceFolder = workspaceFolder;
            response.debugSettings = [];
            let [userDebugSettings, ipAddresses, hostname] = await debuggerSettingsManager.getDebugSettingsAndIpAddresses(vscode.ConfigurationTarget.Global, undefined);
            response.debugSettings.push(userDebugSettings);
            if (hostname)
                ipAddrs.push(hostname);
            if (ipAddresses && ipAddresses.length > 0) {
                ipAddresses.forEach((ia) => {
                    ipAddrs.push(ia);
                });
            }
            response.ipAddresses = ipAddrs;
            let workspaceDebugSettings = await debuggerSettingsManager.getDebugSettings(vscode.ConfigurationTarget.Workspace, undefined);
            response.debugSettings.push(workspaceDebugSettings);
            let folderDebugSettings;
            if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                if (!(vscode.workspace.workspaceFolders.length === 1 &&
                    vscode.workspace.workspaceFolders[0].name === vscode.workspace.name)) {
                    vscode.workspace.workspaceFolders.forEach(folder => {
                        folderDebugSettings = debuggerSettingsManager.getDebugSettings(vscode.ConfigurationTarget.WorkspaceFolder, folder);
                        response.debugSettings.push(folderDebugSettings);
                    });
                }
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getDebuggerSettingsResponse, response);
        }
        catch (error) {
            fileLogger.error('Error in processing GetDebuggerSettingsRequests');
            helper.logErroAfterValidating(error);
        }
        fileLogger.info('GetDebuggerSettingsRequest processed');
    }
    static async getLocalIPAddresses() {
        fileLogger.info('getLocalIPAddresses - Start');
        let hostIPs = [];
        let hostname = "";
        try {
            let requestParams = new dataExplorerRequests_1.GetIPAddressesRequestParameters();
            let response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.
                sendRequest(dataExplorerRequests_1.GetIPAddressesRequest.type, requestParams);
            if (response) {
                if (response.ipAddresses && response.ipAddresses.length > 0)
                    hostIPs = response.ipAddresses;
                if (response.hostname)
                    hostname = response.hostname;
            }
        }
        catch (error) {
            fileLogger.error('Error in getting IP Addresses');
            helper.logErroAfterValidating(error);
        }
        fileLogger.info('getLocalIPAddresses - End');
        return [hostIPs, hostname];
    }
    static async getDebugSettingsAndIpAddresses(configurationTarget, workspaceFolder) {
        let settings = debuggerSettingsManager.getDebugSettings(configurationTarget, workspaceFolder);
        let [ipAddresses, hostname] = await debuggerSettingsManager.getLocalIPAddresses();
        if (!settings.ipAddress) {
            if (hostname) {
                settings.ipAddress = hostname;
            }
            else if (ipAddresses && ipAddresses.length > 0) {
                settings.ipAddress = ipAddresses[0];
            }
        }
        return [settings, ipAddresses, hostname];
    }
    static getDebugSettings(configurationTarget, workspaceFolder) {
        let settings = new DebugSettings();
        settings.configurationTarget = configurationTarget,
            settings.workspaceFolder = workspaceFolder;
        try {
            const debuggerSettings = settings_1.Settings.getEffectiveConfigValue(constants_1.Constants.debuggerSettingsPropertyName, configurationTarget, workspaceFolder, true);
            if (debuggerSettings) {
                settings.ipAddress = debuggerSettings[constants_1.Constants.settingsIPAddressPropertyName];
                settings.startPort = debuggerSettings[constants_1.Constants.settingsStartPortPropertyName];
                settings.endPort = debuggerSettings[constants_1.Constants.settingsEndPortPropertyName];
            }
        }
        catch (error) {
            fileLogger.error('Error in reading debugger settings from configuration.');
            helper.logErroAfterValidating(error);
        }
        if (!settings.startPort) {
            settings.startPort = 65000;
        }
        if (!settings.endPort) {
            settings.endPort = 65535;
        }
        return settings;
    }
}
exports.debuggerSettingsManager = debuggerSettingsManager;
class DebugSettings {
}
