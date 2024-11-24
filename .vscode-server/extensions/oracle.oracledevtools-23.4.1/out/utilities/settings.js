"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const vscode_1 = require("vscode");
const vscode = require("vscode");
const connectionCommandsHandler_1 = require("../connectionManagement/connectionCommandsHandler");
const constants_1 = require("../constants/constants");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const logger_1 = require("../infrastructure/logger");
const intellisenseModels_1 = require("../models/intellisenseModels");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const helper = require("../utilities/helper");
const connectionModels_1 = require("../models/connectionModels");
class Settings {
    constructor() {
        this.documentIntelliSenseSettings = new Map();
    }
    static get Instance() {
        return Settings.instance;
    }
    static CreateInstance() {
        try {
            if (Settings.instance === undefined) {
                Settings.instance = new Settings();
            }
            return Settings.instance;
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.error("Error on creating Settings instance");
            helper.logErroAfterValidating(err);
        }
    }
    async onConfigurationChanged(param) {
        if (param.affectsConfiguration(constants_1.Constants.intelliSenseSettingsPropertyFullName)) {
            this.documentIntelliSenseSettings.clear();
        }
    }
    static getExtensionConfigSection(scope = null) {
        return vscode_1.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName, scope);
    }
    static getVscodeConfigSection(section, scope = null) {
        return vscode_1.workspace.getConfiguration(section, scope);
    }
    static getConfigValue(configName, configurationTarget, workspaceFolder, checkDefault) {
        logger_1.FileStreamLogger.Instance.info("Getting configuration settings value: " + configName + " - Start");
        let configValue;
        try {
            let config = Settings.getExtensionConfigSection(workspaceFolder);
            let configEntries;
            configEntries = config.inspect(configName);
            switch (configurationTarget) {
                case vscode.ConfigurationTarget.Global:
                    configValue = configEntries.globalValue;
                    break;
                case vscode.ConfigurationTarget.Workspace:
                    configValue = configEntries.workspaceValue;
                    break;
                case vscode.ConfigurationTarget.WorkspaceFolder:
                    configValue = configEntries.workspaceFolderValue;
                    break;
            }
            if (checkDefault && configValue === undefined) {
                configValue = configEntries.defaultValue;
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on getting configuration settingss: " + configName);
            helper.logErroAfterValidating(err);
        }
        logger_1.FileStreamLogger.Instance.info("Getting configuration settings value: " + configName + " - End");
        return configValue;
    }
    static async updateConfigValue(configName, configValue, configurationTarget, workspaceFolder) {
        logger_1.FileStreamLogger.Instance.info("Updating configuration settings value: " + configName + " - Start");
        try {
            let config = Settings.getExtensionConfigSection(workspaceFolder);
            if (config) {
                await config.update(configName, configValue, configurationTarget);
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on updating configuration settings: " + configName);
            throw err;
        }
        finally {
            this.updateConfigSnippetSettings();
        }
        logger_1.FileStreamLogger.Instance.info("Updating configuration settings value: " + configName + " - End");
    }
    static async updateConfigSnippetSettings() {
        try {
            logger_1.FileStreamLogger.Instance.info("Updating configuration settings value: " + "editor" + " - Start");
            const intellisenseEnabled = vscode.workspace.getConfiguration('oracledevtools')?.get('intellisense.enable');
            const snippetsEnabled = vscode.workspace.getConfiguration('editor')?.get('suggest.showSnippets');
            let updateConfig = intellisenseEnabled != null && intellisenseEnabled != undefined
                && snippetsEnabled != null && snippetsEnabled != undefined ? intellisenseEnabled && snippetsEnabled : true;
            let intellisenseConfig = intellisenseEnabled != null && intellisenseEnabled != undefined ? intellisenseEnabled : true;
            const quickSuggestionsConfig = intellisenseConfig ? JSON.parse('{"comments": "on", "strings": "on", "other": "on"}')
                : JSON.parse('{"comments": "off", "strings": "off", "other": "off"}');
            const oldConfig = vscode.workspace.getConfiguration();
            oldConfig.update('[oraclesql]', {
                "editor.suggest.showSnippets": updateConfig,
                "editor.quickSuggestions": quickSuggestionsConfig,
            }, vscode.ConfigurationTarget.Global);
        }
        catch (e) {
            logger_1.FileStreamLogger.Instance.info("Error on updating configuration settings: " + "editor");
        }
        logger_1.FileStreamLogger.Instance.info("Updating configuration settings value: " + "editor" + " - End");
    }
    static getEffectiveConfigValue(configName, configurationTarget, workspaceFolder, checkDefault) {
        let [configValue, defaultValue] = this.getEffectiveConfigValueWithDefault(configName, configurationTarget, workspaceFolder, checkDefault);
        return configValue;
    }
    static getEffectiveConfigValueWithDefault(configName, configurationTarget, workspaceFolder, checkDefault) {
        logger_1.FileStreamLogger.Instance.info("Getting effective configuration settings value: " + configName + " - Start");
        let configValue, defaultValue;
        let configEntries;
        try {
            let config = Settings.getExtensionConfigSection(workspaceFolder);
            configEntries = config.inspect(configName);
            switch (configurationTarget) {
                case vscode.ConfigurationTarget.Global:
                    configValue = configEntries.globalValue;
                    break;
                case vscode.ConfigurationTarget.Workspace:
                    configValue = configEntries.workspaceValue;
                    if (configValue === undefined) {
                        configValue = configEntries.globalValue;
                    }
                    break;
                case vscode.ConfigurationTarget.WorkspaceFolder:
                    configValue = configEntries.workspaceFolderValue;
                    if (configValue === undefined) {
                        configValue = configEntries.workspaceValue;
                    }
                    if (configValue === undefined) {
                        configValue = configEntries.globalValue;
                    }
                    break;
            }
            if (checkDefault && configValue === undefined) {
                configValue = configEntries.defaultValue;
            }
            defaultValue = configEntries.defaultValue;
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on getting effective configuration settingss: " + configName);
            helper.logErroAfterValidating(err);
        }
        logger_1.FileStreamLogger.Instance.info("Getting effective configuration settings value: " + configName + " - End");
        return [configValue, configEntries?.defaultValue];
    }
    static getEffectiveConfigValueForDoc(configName, editorDoc, section = null) {
        let [configValue, defaultValue] = this.getEffectiveConfigValueForDocWithDefault(configName, editorDoc, section);
        return configValue;
    }
    static getEffectiveConfigValueForDocWithDefault(configName, editorDoc, section = null) {
        logger_1.FileStreamLogger.Instance.info("Getting effective configuration settings value for doc: " + configName + " - Start");
        let configValue;
        let configEntries;
        try {
            let config;
            let uri = editorDoc?.uri;
            let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(editorDoc);
            if (!explorerFile) {
                config = section == null ? Settings.getExtensionConfigSection(uri) : Settings.getVscodeConfigSection(section, uri);
                configEntries = config.inspect(configName);
                configValue = configEntries.workspaceFolderValue;
            }
            if (!configValue) {
                let connProps;
                if (explorerFile) {
                    let params = editorUtils_1.editorUtils.getQueryParameters(editorDoc?.uri);
                    if (params) {
                        let connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(params.connectionUri);
                        connProps = connNode.connectionProperties;
                    }
                }
                else {
                    let docConnectionInfo = connectionCommandsHandler_1.default.Instance.getSavedConnectionProperties(uri.toString());
                    if (docConnectionInfo) {
                        connProps = docConnectionInfo.connectionAttributes;
                    }
                }
                if (connProps) {
                    config = section == null ? Settings.getExtensionConfigSection(connProps.workspaceFolder) :
                        Settings.getVscodeConfigSection(section, connProps.workspaceFolder);
                    configEntries = config.inspect(configName);
                    switch (connProps.configurationTarget) {
                        case vscode.ConfigurationTarget.Global:
                            configValue = configEntries.globalValue;
                            break;
                        case vscode.ConfigurationTarget.Workspace:
                            configValue = configEntries.workspaceValue;
                            if (configValue === undefined) {
                                configValue = configEntries.globalValue;
                            }
                            break;
                        case vscode.ConfigurationTarget.WorkspaceFolder:
                            configValue = configEntries.workspaceFolderValue;
                            if (configValue === undefined) {
                                configValue = configEntries.workspaceValue;
                            }
                            if (configValue === undefined) {
                                configValue = configEntries.globalValue;
                            }
                            break;
                    }
                }
            }
            if (!configValue) {
                config = section == null ? Settings.getExtensionConfigSection(uri) : Settings.getVscodeConfigSection(section, uri);
                configEntries = config.inspect(configName);
                configValue = configEntries.workspaceFolderValue;
                if (configValue === undefined) {
                    configValue = configEntries.workspaceValue;
                }
                if (configValue === undefined) {
                    configValue = configEntries.globalValue;
                }
                if (configValue === undefined) {
                    configValue = configEntries.defaultValue;
                }
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on getting effective configuration settingss for doc: " + configName);
            helper.logErroAfterValidating(err);
        }
        logger_1.FileStreamLogger.Instance.info("Getting effective configuration settings value for doc: " + configName + " - End");
        return [configValue, configEntries?.defaultValue];
    }
    static getDefaultConfigValue(configName) {
        let config = Settings.getExtensionConfigSection();
        let configEntries;
        configEntries = config.inspect(configName);
        return configEntries?.defaultValue;
    }
    static getTnsAdmin(configurationTarget, workspaceFolder) {
        return Settings.getEffectiveConfigValue(constants_1.Constants.configFileFolderPropertyName, configurationTarget, workspaceFolder, false);
    }
    static getWalletLocation(configurationTarget, workspaceFolder) {
        return Settings.getEffectiveConfigValue(constants_1.Constants.walletFileFolderPropertyName, configurationTarget, workspaceFolder, false);
    }
    static getLoginScript(configurationTarget, workspaceFolder) {
        return Settings.getEffectiveConfigValue(constants_1.Constants.loginScriptPropertyName, configurationTarget, workspaceFolder, true);
    }
    static getSynonymDepth(document) {
        if (!document) {
            document = vscode.window.activeTextEditor?.document;
        }
        return Settings.getEffectiveConfigValueForDoc(constants_1.Constants.synonymDepth, document);
    }
    getIntelliSenseSettingsForDoc(editorDoc) {
        logger_1.FileStreamLogger.Instance.info("Settings -  getIntelliSenseSettingsForDoc - Start");
        let documentIntelliSenseSettings = new intellisenseModels_1.IntelliSenseSettings();
        if (editorDoc && editorDoc.uri) {
            let docUri = editorDoc.uri.toString();
            documentIntelliSenseSettings = this.documentIntelliSenseSettings.get(docUri);
            if (!documentIntelliSenseSettings) {
                documentIntelliSenseSettings = new intellisenseModels_1.IntelliSenseSettings(Settings.getEffectiveConfigValueForDoc(constants_1.Constants.intellisenseEnablePropertyName, editorDoc), intellisenseModels_1.caseMap[Settings.getEffectiveConfigValueForDoc(constants_1.Constants.intellisenseKeywordCasingPropertyName, editorDoc)], intellisenseModels_1.caseMap[Settings.getEffectiveConfigValueForDoc(constants_1.Constants.intellisenseObjectNameCasingPropertyName, editorDoc)], Settings.getEffectiveConfigValueForDoc(constants_1.Constants.synonymDepth, editorDoc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.rebuildIntelliSense, editorDoc));
                this.documentIntelliSenseSettings.set(docUri, documentIntelliSenseSettings);
            }
        }
        logger_1.FileStreamLogger.Instance.info("Settings -  getIntelliSenseSettingsForDoc - End");
        return documentIntelliSenseSettings;
    }
    getIntelliSenseSettingsForUri(ownerUri) {
        logger_1.FileStreamLogger.Instance.info("Settings -  getIntelliSenseSettingsForUri - Start");
        let documentIntelliSenseSettings = new intellisenseModels_1.IntelliSenseSettings();
        documentIntelliSenseSettings = this.documentIntelliSenseSettings.get(ownerUri);
        if (!documentIntelliSenseSettings) {
            let editorDoc = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === ownerUri);
            if (editorDoc) {
                documentIntelliSenseSettings = new intellisenseModels_1.IntelliSenseSettings(Settings.getEffectiveConfigValueForDoc(constants_1.Constants.intellisenseEnablePropertyName, editorDoc), intellisenseModels_1.caseMap[Settings.getEffectiveConfigValueForDoc(constants_1.Constants.intellisenseKeywordCasingPropertyName, editorDoc)], intellisenseModels_1.caseMap[Settings.getEffectiveConfigValueForDoc(constants_1.Constants.intellisenseObjectNameCasingPropertyName, editorDoc)], Settings.getEffectiveConfigValueForDoc(constants_1.Constants.synonymDepth, editorDoc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.rebuildIntelliSense, editorDoc));
            }
            else {
                let connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUri(ownerUri);
                if (connNode) {
                    let configurationTarget = connNode.connectionProperties.configurationTarget;
                    let workspaceFolder = connNode.connectionProperties.workspaceFolder;
                    documentIntelliSenseSettings = new intellisenseModels_1.IntelliSenseSettings(Settings.getEffectiveConfigValue(constants_1.Constants.intellisenseEnablePropertyName, configurationTarget, workspaceFolder, true), intellisenseModels_1.caseMap[Settings.getEffectiveConfigValue(constants_1.Constants.intellisenseKeywordCasingPropertyName, configurationTarget, workspaceFolder, true)], intellisenseModels_1.caseMap[Settings.getEffectiveConfigValue(constants_1.Constants.intellisenseObjectNameCasingPropertyName, configurationTarget, workspaceFolder, true)], Settings.getEffectiveConfigValue(constants_1.Constants.synonymDepth, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.rebuildIntelliSense, configurationTarget, workspaceFolder, true));
                }
            }
            this.documentIntelliSenseSettings.set(ownerUri, documentIntelliSenseSettings);
        }
        logger_1.FileStreamLogger.Instance.info("Settings -  getIntelliSenseSettingsForUri - End");
        return documentIntelliSenseSettings;
    }
    static getQueryExecutionSettingsForDoc(doc, explainPlanMode = scriptExecutionModels_1.ExplainPlanMode.None) {
        logger_1.FileStreamLogger.Instance.info("Settings -  getQueryExecutionSettingsForDoc - Start");
        let querySettings = new scriptExecutionModels_1.QuerySettings(Settings.getEffectiveConfigValueForDoc(constants_1.Constants.autoCommitPropertyName, doc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.clearResultsWindowPropertyName, doc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.echoPropertyName, doc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.delimiterPropertyName, doc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.textQualifierPropertyName, doc), explainPlanMode == scriptExecutionModels_1.ExplainPlanMode.None ?
            Settings.getEffectiveConfigValueForDoc(constants_1.Constants.resultSetRowLimitPropertyName, doc) : -1, Settings.getEffectiveConfigValueForDoc(constants_1.Constants.generateSQLTimeoutPropertyName, doc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.resultSetPageSizePropertyName, doc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.unsupportedCommandsShowWarningPropertyName, doc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.openQueryResultsWindowPropertyName, doc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.resultSetRowNumber, doc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.resultSetCellTextLength, doc), Settings.getEffectiveConfigValueForDoc(constants_1.Constants.resultSetTooltipTextLength, doc));
        logger_1.FileStreamLogger.Instance.info("Settings -  getQueryExecutionSettingsForDoc - End");
        return querySettings;
    }
    static getQueryExecutionSettings(configurationTarget, workspaceFolder, explainPlanMode = scriptExecutionModels_1.ExplainPlanMode.None) {
        logger_1.FileStreamLogger.Instance.info("Settings -  getQueryExecutionSettings - Start");
        let querySettings = new scriptExecutionModels_1.QuerySettings(Settings.getEffectiveConfigValue(constants_1.Constants.autoCommitPropertyName, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.clearResultsWindowPropertyName, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.echoPropertyName, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.delimiterPropertyName, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.textQualifierPropertyName, configurationTarget, workspaceFolder, true), explainPlanMode == scriptExecutionModels_1.ExplainPlanMode.None ?
            Settings.getEffectiveConfigValue(constants_1.Constants.resultSetRowLimitPropertyName, configurationTarget, workspaceFolder, true) : -1, Settings.getEffectiveConfigValue(constants_1.Constants.generateSQLTimeoutPropertyName, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.resultSetPageSizePropertyName, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.unsupportedCommandsShowWarningPropertyName, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.openQueryResultsWindowPropertyName, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.resultSetRowNumber, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.resultSetCellTextLength, configurationTarget, workspaceFolder, true), Settings.getEffectiveConfigValue(constants_1.Constants.resultSetTooltipTextLength, configurationTarget, workspaceFolder, true));
        logger_1.FileStreamLogger.Instance.info("Settings -  getQueryExecutionSettings - End");
        return querySettings;
    }
    static getQueryExecutionSettingsForUri(ownerUri) {
        logger_1.FileStreamLogger.Instance.info("Settings -  getQueryExecutionSettingsForUri - Start");
        let querySettings = new scriptExecutionModels_1.QuerySettings();
        let editorDoc = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === ownerUri);
        if (editorDoc) {
            querySettings = Settings.getQueryExecutionSettingsForDoc(editorDoc);
        }
        logger_1.FileStreamLogger.Instance.info("Settings -  getQueryExecutionSettingsForUri - End");
        return querySettings;
    }
    static getRealTimeSqlMonitoringSettings(configurationTarget, workspaceFolder) {
        logger_1.FileStreamLogger.Instance.info("Settings -  getRealTimeSqlMonitoringSettings - Start");
        let rtsmSettings = new scriptExecutionModels_1.RtsmSettings(Settings.getEffectiveConfigValue(constants_1.Constants.rtsmShowLicenseDialog, configurationTarget, workspaceFolder, true));
        logger_1.FileStreamLogger.Instance.info("Settings -  getRealTimeSqlMonitoringSettings - End");
        return rtsmSettings;
    }
    static getCredStoreSettings(configurationTarget, workspaceFolder) {
        let retVal = connectionModels_1.CredStoreSettingOptions.Settings;
        logger_1.FileStreamLogger.Instance.info("Settings -  getCredStoreSettings - Start");
        let credStoreVal = Settings.getEffectiveConfigValue(constants_1.Constants.credStoreSettingName, configurationTarget, workspaceFolder, true);
        if (credStoreVal === constants_1.Constants.credStoreSettingValueSecretStorage) {
            retVal = connectionModels_1.CredStoreSettingOptions.SecretStorage;
        }
        logger_1.FileStreamLogger.Instance.info("Settings -  getCredStoreSettings - End");
        return retVal;
    }
}
exports.Settings = Settings;
