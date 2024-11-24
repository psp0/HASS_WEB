"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = exports.Setup = void 0;
const fs = require("fs");
const os = require("os");
const path = require("path");
const process = require("process");
const util = require("util");
const vscode_1 = require("vscode");
const localizedConstants_1 = require("../constants/localizedConstants");
const constants_1 = require("../constants/constants");
const logger_1 = require("../infrastructure/logger");
const helper = require("./helper");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const connectionSettingsManager_1 = require("../connectionManagement/connectionSettingsManager");
const vscode = require("vscode");
const settings_1 = require("./settings");
const oracleVSCodeConnector_1 = require("../infrastructure/oracleVSCodeConnector");
class Setup {
    static getDefaultValue() {
        const { targetDir, userHomeLocation } = Setup.GetSourceAndDestDir();
        return targetDir;
    }
    static async setPlsqlDebuggerProgram(dotnetRuntimeMajorVersion, dotnetRuntimePath) {
        logger_1.FileStreamLogger.Instance.info(`Setting Dotnet Runtime Path For PL/SQL Debugger Program to ${dotnetRuntimePath}`);
        this.plsqlDotnetRuntimePath = dotnetRuntimePath;
        logger_1.FileStreamLogger.Instance.info(`Setting Dotnet Runtime MajorVersion for PL/SQL Debugger Program to ${dotnetRuntimeMajorVersion}`);
        switch (dotnetRuntimeMajorVersion) {
            case 6:
                {
                    this.plsqlDebuggerProgram = constants_1.Constants.debugAdapter60DllName;
                    break;
                }
            case 8:
                {
                    this.plsqlDebuggerProgram = constants_1.Constants.debugAdapter80DllName;
                    break;
                }
            default:
                break;
        }
        logger_1.FileStreamLogger.Instance.info(`PL/SQL Debugger program set to ${this.plsqlDebuggerProgram}`);
    }
    static async setDefaultLocationsForFiles(extensionPath) {
        logger_1.FileStreamLogger.Instance.info(`Start - setDefaultLocationsForFiles`);
        await this.setDefaultLocationsForConfigFiles(extensionPath);
        await this.setDefaultLocationForBookmarkDirectory();
        await this.setDefaultLocationForDownloadsDirectory();
        logger_1.FileStreamLogger.Instance.info(`End - setDefaultLocationsForFiles`);
    }
    static async migrateConfigurationSettings(extensionPath) {
        try {
            logger_1.FileStreamLogger.Instance.info("Start - MigrateConfigurationSettings...");
            const config = this.getExtensionConfigSection();
            const oldConfig = vscode_1.workspace.getConfiguration(constants_1.Constants.oldExtensionConfigSectionName);
            if (oldConfig !== undefined && oldConfig !== null &&
                config !== undefined && config !== null) {
                logger_1.FileStreamLogger.Instance.info("Starting migration of configuration settings to the new settings...");
                if (oldConfig.has(constants_1.Constants.loggingEnablePropertyName)) {
                    let configurationEntries = oldConfig.inspect(constants_1.Constants.loggingEnablePropertyName);
                    if (configurationEntries.defaultValue !== undefined &&
                        configurationEntries.globalValue === undefined &&
                        configurationEntries.workspaceValue === undefined &&
                        configurationEntries.workspaceFolderValue === undefined) {
                        logger_1.FileStreamLogger.Instance.info("No migration required. Enable logging using default value in old configuration");
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("Starting migration of enable logging from old configuration...");
                        logger_1.FileStreamLogger.Instance.info("Start updating enable logging in new configuration...");
                        await config.update(constants_1.Constants.loggingEnablePropertyName, oldConfig.get(constants_1.Constants.loggingEnablePropertyName), true);
                        logger_1.FileStreamLogger.Instance.info("Done updating enable logging in new configuration");
                        logger_1.FileStreamLogger.Instance.info("Start removing enable logging from old configuration...");
                        await oldConfig.update(constants_1.Constants.loggingEnablePropertyName, undefined, true);
                        logger_1.FileStreamLogger.Instance.info("Done removing enable logging from old configuration");
                        logger_1.FileStreamLogger.Instance.info("Done migration of enable logging from old configuration");
                    }
                }
                if (oldConfig.has(constants_1.Constants.loggingLevelPropertyName)) {
                    let configurationEntries = oldConfig.inspect(constants_1.Constants.loggingLevelPropertyName);
                    if (configurationEntries.defaultValue !== undefined &&
                        configurationEntries.globalValue === undefined &&
                        configurationEntries.workspaceValue === undefined &&
                        configurationEntries.workspaceFolderValue === undefined) {
                        logger_1.FileStreamLogger.Instance.info("No migration required. Logging level using default value in old configuration");
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("Starting migration of logging level from old configuration...");
                        logger_1.FileStreamLogger.Instance.info("Start updating logging level in new configuration...");
                        await config.update(constants_1.Constants.loggingLevelPropertyName, oldConfig.get(constants_1.Constants.loggingLevelPropertyName), true);
                        logger_1.FileStreamLogger.Instance.info("Done updating logging level in new configuration");
                        logger_1.FileStreamLogger.Instance.info("Start removing logging level from old configuration...");
                        await oldConfig.update(constants_1.Constants.loggingLevelPropertyName, undefined, true);
                        logger_1.FileStreamLogger.Instance.info("Done removing logging level from old configuration");
                        logger_1.FileStreamLogger.Instance.info("Done migration of logging level from old configuration");
                    }
                }
                if (oldConfig.has(constants_1.Constants.intellisenseEnablePropertyName)) {
                    let configurationEntries = oldConfig.inspect(constants_1.Constants.intellisenseEnablePropertyName);
                    if (configurationEntries.defaultValue !== undefined &&
                        configurationEntries.globalValue === undefined &&
                        configurationEntries.workspaceValue === undefined &&
                        configurationEntries.workspaceFolderValue === undefined) {
                        logger_1.FileStreamLogger.Instance.info("No migration required. Enable intellisense using default value in old configuration");
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("Starting migration of enable intellisense from old configuration...");
                        logger_1.FileStreamLogger.Instance.info("Start updating enable intellisense in new configuration...");
                        await config.update(constants_1.Constants.intellisenseEnablePropertyName, oldConfig.get(constants_1.Constants.intellisenseEnablePropertyName), true);
                        logger_1.FileStreamLogger.Instance.info("Done updating enable intellisense in new configuration");
                        logger_1.FileStreamLogger.Instance.info("Start removing enable intellisense from old configuration...");
                        await oldConfig.update(constants_1.Constants.intellisenseEnablePropertyName, undefined, true);
                        logger_1.FileStreamLogger.Instance.info("Done removing enable intellisense from old configuration");
                        logger_1.FileStreamLogger.Instance.info("Done migration of enable intellisense from old configuration");
                    }
                }
                if (oldConfig.has(constants_1.Constants.oldDataBatchSizePropertyName)) {
                    let configurationEntries = oldConfig.inspect(constants_1.Constants.oldDataBatchSizePropertyName);
                    if (configurationEntries.defaultValue !== undefined &&
                        configurationEntries.globalValue === undefined &&
                        configurationEntries.workspaceValue === undefined &&
                        configurationEntries.workspaceFolderValue === undefined) {
                        logger_1.FileStreamLogger.Instance.info("No migration required. Query dataBatchSize using default value in old configuration");
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("Starting migration of query dataBatchSize from old configuration...");
                        logger_1.FileStreamLogger.Instance.info("Start updating query resultset pageSize in new configuration...");
                        await config.update(constants_1.Constants.resultSetPageSizePropertyName, oldConfig.get(constants_1.Constants.oldDataBatchSizePropertyName), true);
                        logger_1.FileStreamLogger.Instance.info("Done updating query resultset pageSize in new configuration");
                        logger_1.FileStreamLogger.Instance.info("Start removing query dataBatchSize from old configuration...");
                        await oldConfig.update(constants_1.Constants.oldDataBatchSizePropertyName, undefined, true);
                        logger_1.FileStreamLogger.Instance.info("Done removing query dataBatchSize from old configuration");
                        logger_1.FileStreamLogger.Instance.info("Done migration of query dataBatchSize from old configuration");
                    }
                }
                if (oldConfig.has(constants_1.Constants.oldConfigFilesLocationPropertyName)) {
                    let configurationEntries = oldConfig.inspect(constants_1.Constants.oldConfigFilesLocationPropertyName);
                    if (configurationEntries.defaultValue !== undefined &&
                        configurationEntries.globalValue === undefined &&
                        configurationEntries.workspaceValue === undefined &&
                        configurationEntries.workspaceFolderValue === undefined) {
                        logger_1.FileStreamLogger.Instance.info("No migration required. Connection config files location using default value in old configuration");
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("Starting migration of connection config files location from old configuration...");
                        logger_1.FileStreamLogger.Instance.info("Start updating connection config files folder in new configuration...");
                        await config.update(constants_1.Constants.configFileFolderPropertyName, oldConfig.get(constants_1.Constants.oldConfigFilesLocationPropertyName), true);
                        logger_1.FileStreamLogger.Instance.info("Done updating connection config files folder in new configuration");
                        logger_1.FileStreamLogger.Instance.info("Start removing network config files location from old configuration...");
                        await oldConfig.update(constants_1.Constants.oldConfigFilesLocationPropertyName, undefined, true);
                        logger_1.FileStreamLogger.Instance.info("Done removing network config files location from old configuration");
                        logger_1.FileStreamLogger.Instance.info("Done migration of connection config files location from old configuration");
                    }
                }
                if (oldConfig.has(constants_1.Constants.oldWalletFileLocationPropertyName)) {
                    let configurationEntries = oldConfig.inspect(constants_1.Constants.oldWalletFileLocationPropertyName);
                    if (configurationEntries.defaultValue !== undefined &&
                        configurationEntries.globalValue === undefined &&
                        configurationEntries.workspaceValue === undefined &&
                        configurationEntries.workspaceFolderValue === undefined) {
                        logger_1.FileStreamLogger.Instance.info("No migration required. Connection wallet files location using default value in old configuration");
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("Starting migration of connection wallet file location from old configuration...");
                        logger_1.FileStreamLogger.Instance.info("Start updating connection wallet file folder in new configuration...");
                        await config.update(constants_1.Constants.walletFileFolderPropertyName, oldConfig.get(constants_1.Constants.oldWalletFileLocationPropertyName), true);
                        logger_1.FileStreamLogger.Instance.info("Done updating connection wallet file folder in new configuration");
                        logger_1.FileStreamLogger.Instance.info("Start removing network wallet file location from old configuration...");
                        await oldConfig.update(constants_1.Constants.oldWalletFileLocationPropertyName, undefined, true);
                        logger_1.FileStreamLogger.Instance.info("Start removing network wallet file location from old configuration");
                        logger_1.FileStreamLogger.Instance.info("Done migration of connection wallet file location from old configuration");
                    }
                }
                if (oldConfig.has(constants_1.Constants.maxRecentlyUsedConnsPropertyName)) {
                    let configurationEntries = oldConfig.inspect(constants_1.Constants.maxRecentlyUsedConnsPropertyName);
                    if (configurationEntries.defaultValue !== undefined &&
                        configurationEntries.globalValue === undefined &&
                        configurationEntries.workspaceValue === undefined &&
                        configurationEntries.workspaceFolderValue === undefined) {
                        logger_1.FileStreamLogger.Instance.info("No migration required. Max recently used connections count using default value in old configuration");
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("Starting migration of max recently used connections count from old configuration...");
                        logger_1.FileStreamLogger.Instance.info("Start updating max recently used connection in new configuration...");
                        await config.update(constants_1.Constants.maxRecentlyUsedConnsPropertyName, oldConfig.get(constants_1.Constants.maxRecentlyUsedConnsPropertyName), true);
                        logger_1.FileStreamLogger.Instance.info("Done updating max recently used connection in new configuration");
                        logger_1.FileStreamLogger.Instance.info("Start removing max recently used connection from old configuration...");
                        await oldConfig.update(constants_1.Constants.maxRecentlyUsedConnsPropertyName, undefined, true);
                        logger_1.FileStreamLogger.Instance.info("Start removing max recently used connection from old configuration");
                        logger_1.FileStreamLogger.Instance.info("Done migration of max recently used connections count from old configuration");
                    }
                }
                if (oldConfig.has(constants_1.Constants.oldOracleConnectionSettingsPropertyName)) {
                    let configurationEntries = oldConfig.inspect(constants_1.Constants.oldOracleConnectionSettingsPropertyName);
                    if (configurationEntries.defaultValue !== undefined &&
                        configurationEntries.globalValue === undefined &&
                        configurationEntries.workspaceValue === undefined &&
                        configurationEntries.workspaceFolderValue === undefined) {
                        logger_1.FileStreamLogger.Instance.info("No migration required. Connection settings using default value in old configuration");
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("Starting migration of connection settings from old configuration...");
                        logger_1.FileStreamLogger.Instance.info("Start updating oracle explorer connections in new configuration...");
                        await config.update(constants_1.Constants.connectionSettingsPropertyName, oldConfig.get(constants_1.Constants.oldOracleConnectionSettingsPropertyName), true);
                        logger_1.FileStreamLogger.Instance.info("Done updating oracle explorer connections in new configuration");
                        logger_1.FileStreamLogger.Instance.info("Start removing oracle explorer connections from old configuration...");
                        await oldConfig.update(constants_1.Constants.oldOracleConnectionSettingsPropertyName, undefined, true);
                        logger_1.FileStreamLogger.Instance.info("Done removing oracle explorer connections from old configuration");
                        logger_1.FileStreamLogger.Instance.info("Done migration of connection settings from old configuration");
                    }
                }
                logger_1.FileStreamLogger.Instance.info("Done Migration of configuration settings to the new settings");
            }
            else {
                logger_1.FileStreamLogger.Instance.info("No settings to migrate");
            }
            logger_1.FileStreamLogger.Instance.info("Done migrating configuration settings");
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.warn("Error - MigrateConfigurationSettings");
            logger_1.FileStreamLogger.Instance.warn(error);
        }
        finally {
            logger_1.FileStreamLogger.Instance.info("End - MigrateConfigurationSettings");
        }
    }
    static async migrateStorageValues(extContext) {
        try {
            logger_1.FileStreamLogger.Instance.info("Start - MigrateStorageValues.");
            logger_1.FileStreamLogger.Instance.info("Start - MigrateStorageValues - 19.3.4");
            let connProps = extContext.globalState.get(constants_1.Constants.recentUsedConnections);
            if (connProps) {
                logger_1.FileStreamLogger.Instance.info("Starting migration of recent connections from 19.3.4.");
                extContext.globalState.update(constants_1.Constants.recentUsedConnections, undefined);
                logger_1.FileStreamLogger.Instance.info("Removed old storage for recent connections.");
                if (connProps.length > 0) {
                    let connNames = connProps.map(connProp => connProp.name);
                    if (connNames && connNames.length > 0) {
                        let recentConnections = [];
                        const connSettingsHelper = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(new oracleVSCodeConnector_1.OracleVSCodeConnector(extContext));
                        const latestProfiles = connSettingsHelper.retrieveAllConnections(true);
                        if (latestProfiles && latestProfiles.length > 0) {
                            connNames.forEach(connName => {
                                if (connName) {
                                    let index = latestProfiles.findIndex(prof => prof.name === connName);
                                    if (index > 0) {
                                        let profile = latestProfiles.splice(index, 1)[0];
                                        recentConnections.push(new scriptExecutionModels_1.RecentConnection(connName, profile.configurationTarget, profile.workspaceFolder));
                                    }
                                }
                            });
                            logger_1.FileStreamLogger.Instance.info("Updating new storage for recent connections.");
                            extContext.globalState.update(constants_1.Constants.recentlyUsedOracleConnectionsAndScope, recentConnections);
                            logger_1.FileStreamLogger.Instance.info("Done migration of recent connections.");
                        }
                    }
                }
                logger_1.FileStreamLogger.Instance.info("Done migration of recent connections from 19.3.4.");
            }
            logger_1.FileStreamLogger.Instance.info("End - MigrateStorageValues - 19.3.4");
            logger_1.FileStreamLogger.Instance.info("Start - MigrateStorageValues - 21.3");
            let connNames = extContext.globalState.get(constants_1.Constants.recentlyUsedOracleConnections);
            if (connNames && connNames.length > 0) {
                logger_1.FileStreamLogger.Instance.info("Starting migration of recent connections from 21.3.");
                extContext.globalState.update(constants_1.Constants.recentlyUsedOracleConnections, undefined);
                logger_1.FileStreamLogger.Instance.info("Removed old storage for recent connections.");
                let recentConnections = [];
                const connSettingsHelper = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(new oracleVSCodeConnector_1.OracleVSCodeConnector(extContext));
                const latestProfiles = connSettingsHelper.retrieveAllConnections(true);
                if (latestProfiles && latestProfiles.length > 0) {
                    connNames.forEach(connName => {
                        if (connName) {
                            let index = latestProfiles.findIndex(prof => prof.name === connName);
                            if (index > 0) {
                                let profile = latestProfiles.splice(index, 1)[0];
                                recentConnections.push(new scriptExecutionModels_1.RecentConnection(connName, profile.configurationTarget, profile.workspaceFolder));
                            }
                        }
                    });
                    logger_1.FileStreamLogger.Instance.info("Updating new storage for recent connections.");
                    extContext.globalState.update(constants_1.Constants.recentlyUsedOracleConnectionsAndScope, recentConnections);
                    logger_1.FileStreamLogger.Instance.info("Done migration of recent connections from 21.3.");
                }
            }
            logger_1.FileStreamLogger.Instance.info("End - MigrateStorageValues - 21.3");
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.warn("Error - MigrateStorageValues.");
            logger_1.FileStreamLogger.Instance.warn(error);
        }
        finally {
            logger_1.FileStreamLogger.Instance.info("End - MigrateStorageValues.");
        }
    }
    static async migrateFilesAssociationsSetting(extensionPath) {
        try {
            logger_1.FileStreamLogger.Instance.info("Start - MigrateFilesAssociationsSetting");
            const config = this.getExtensionConfigSection();
            if (config !== undefined && config !== null &&
                config.has(constants_1.Constants.oldFilesAssociationsSettingsPropertyName)) {
                let configurationEntries = config.inspect(constants_1.Constants.oldFilesAssociationsSettingsPropertyName);
                if (configurationEntries.defaultValue !== undefined &&
                    configurationEntries.globalValue === undefined &&
                    configurationEntries.workspaceValue === undefined &&
                    configurationEntries.workspaceFolderValue === undefined) {
                    logger_1.FileStreamLogger.Instance.info("No migration required. Enable Files Associations using default value");
                }
                else {
                    logger_1.FileStreamLogger.Instance.info("Reading File Associations setting value");
                    let enableFilesAssociations = config.get(constants_1.Constants.oldFilesAssociationsSettingsPropertyName, true);
                    logger_1.FileStreamLogger.Instance.info("Done Reading File Associations setting value");
                    let configurationTarget = vscode_1.ConfigurationTarget.Global;
                    if (configurationEntries.workspaceFolderValue !== null &&
                        configurationEntries.workspaceFolderValue !== undefined &&
                        configurationEntries.workspaceFolderValue === enableFilesAssociations) {
                        configurationTarget = vscode_1.ConfigurationTarget.WorkspaceFolder;
                    }
                    else if (configurationEntries.workspaceValue !== null &&
                        configurationEntries.workspaceValue !== undefined &&
                        configurationEntries.workspaceValue === enableFilesAssociations) {
                        configurationTarget = vscode_1.ConfigurationTarget.Workspace;
                    }
                    logger_1.FileStreamLogger.Instance.info("Starting migration of Files Associations setting");
                    if (!enableFilesAssociations) {
                        logger_1.FileStreamLogger.Instance.info("Updating new File Extensions Associations setting to empty array");
                        await config.update(constants_1.Constants.fileExtnAssociationsSettingsPropertyName, [], configurationTarget);
                    }
                    logger_1.FileStreamLogger.Instance.info("Removing Files Associations setting");
                    await config.update(constants_1.Constants.oldFilesAssociationsSettingsPropertyName, undefined, configurationTarget);
                    logger_1.FileStreamLogger.Instance.info("Removed Files Associations setting");
                }
                logger_1.FileStreamLogger.Instance.info("Done migrating Files Associations setting");
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error - MigrateFilesAssociationsSetting");
            logger_1.FileStreamLogger.Instance.warn(error);
        }
        finally {
            logger_1.FileStreamLogger.Instance.info("End - MigrateFilesAssociationsSetting");
        }
    }
    static async setDefaultLocationsForConfigFiles(extensionPath) {
        logger_1.FileStreamLogger.Instance.info("Starting setDefaultLocationsForFiles...");
        if (Setup.isConfigUpdateRequired()) {
            const { targetDir, userHomeLocation } = Setup.GetSourceAndDestDir();
            if (userHomeLocation) {
                await Setup.CreateDirectory(targetDir, userHomeLocation);
                logger_1.FileStreamLogger.Instance.info("Created Directories.");
                await Setup.updateConfigFileLocation(targetDir);
                ConfigManager.initialize(extensionPath);
                logger_1.FileStreamLogger.Instance.info("Done setDefaultLocationsForFiles.");
            }
            else {
                logger_1.FileStreamLogger.Instance.warn(`Invalid User home value ${userHomeLocation}`);
            }
        }
    }
    static async migrateOldConnections(extContext) {
        try {
            logger_1.FileStreamLogger.Instance.info("Start - MigrateOldConnections");
            const connSettingsHelper = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(new oracleVSCodeConnector_1.OracleVSCodeConnector(extContext));
            const profiles = connSettingsHelper.retrieveAllConnections(true);
            if (profiles && profiles.length > 0) {
                for (let ip = 0; ip < profiles.length; ip++) {
                    let prof = profiles[ip];
                    if (prof.enableFiltersForIntellisense !== undefined && prof.enableFiltersForIntellisense !== null) {
                        let newProfile = Object.assign({}, prof);
                        newProfile.enableFiltersForIntellisense = undefined;
                        await connSettingsHelper.addConnection(newProfile, newProfile.uniqueName);
                    }
                }
                ;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.warn(error);
        }
        finally {
            logger_1.FileStreamLogger.Instance.info("End - MigrateOldConnections.");
        }
    }
    static async migrateConnectionCreds(extContext) {
        try {
            logger_1.FileStreamLogger.Instance.info("Start - MigrateConnectionCreds");
            const connSettingsHelper = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(new oracleVSCodeConnector_1.OracleVSCodeConnector(extContext));
            logger_1.FileStreamLogger.Instance.info(`Get connection configuration credential store settings value`);
            let credStoreSetting = settings_1.Settings.getConfigValue(constants_1.Constants.credStoreSettingName, vscode_1.ConfigurationTarget.Global, undefined, true);
            if (credStoreSetting === constants_1.Constants.credStoreSettingValueSecretStorage) {
                logger_1.FileStreamLogger.Instance.info(`Checking for connections to migrate credential store`);
                let vscodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector(extContext);
                let profiles = [];
                let userConfigConns = connSettingsHelper.retrieveConnProfilesFromConfig(vscode.ConfigurationTarget.Global);
                profiles = profiles.concat(userConfigConns);
                let wkspcConfigConns = connSettingsHelper.retrieveConnProfilesFromConfig(vscode.ConfigurationTarget.Workspace);
                profiles = profiles.concat(wkspcConfigConns);
                let wkspcFldrConfigConns = connSettingsHelper.retrieveConnProfilesFromConfig(vscode.ConfigurationTarget.WorkspaceFolder);
                profiles = profiles.concat(wkspcFldrConfigConns);
                if (profiles && profiles.length > 0) {
                    var shouldPromptForMigration = false;
                    var profile = null;
                    for (var i = 0; i < profiles.length; i++) {
                        profile = profiles[i];
                        if (profile &&
                            profile.passwordSaved &&
                            (profile.passwordStore === undefined || profile.passwordStore === null ||
                                (profile.passwordStore && profile.passwordStore === scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSettings)) &&
                            ((profile.password && profile.password.length > 0) ||
                                (profile.proxyPassword && profile.proxyPassword.length > 0))) {
                            shouldPromptForMigration = true;
                        }
                    }
                    if (shouldPromptForMigration) {
                        logger_1.FileStreamLogger.Instance.info(`Get connection configuration credential store migration prompt settings value`);
                        var promptForMigration = settings_1.Settings.getConfigValue(constants_1.Constants.showCredStoreMigrationPrompt, vscode_1.ConfigurationTarget.Global, undefined, true);
                        if (promptForMigration) {
                            logger_1.FileStreamLogger.Instance.info(`Prompt for connection credential migration`);
                            var confirmKeyRingAvailable = null;
                            if (process.platform !== constants_1.Constants.windowsProcessPlatform) {
                                confirmKeyRingAvailable = localizedConstants_1.default.confirmCredsKeyRingAvailable;
                            }
                            var answers = await helper.Utils.promptForConfirmationWithNoShowAgain(localizedConstants_1.default.confirmCredsMigrationToSecretStore, confirmKeyRingAvailable, localizedConstants_1.default.msgShowConnCredsMigrationPrompt, vscodeConnector);
                            if (answers) {
                                if (!answers.showPrompt) {
                                    logger_1.FileStreamLogger.Instance.info(`Updating Show Connection Credential Migration Prompt Setting value to false`);
                                    await settings_1.Settings.updateConfigValue(constants_1.Constants.showCredStoreMigrationPrompt, false, vscode_1.ConfigurationTarget.Global, undefined);
                                    logger_1.FileStreamLogger.Instance.info(`Updated Show Connection Credential Migration Prompt Setting value to false`);
                                }
                                if (answers.proceed) {
                                    logger_1.FileStreamLogger.Instance.info(`Migrating connections credentials from settings to vscode secret storage`);
                                    if (await Setup.updateConnectionProfiles(extContext, profiles, connSettingsHelper, vscodeConnector)) {
                                        logger_1.FileStreamLogger.Instance.info(`Successfully migrated connections credentials from settings to vscode secret storage`);
                                    }
                                    else {
                                        logger_1.FileStreamLogger.Instance.info(`Failed to migrate connections credentials from settings to vscode secret storage`);
                                    }
                                }
                            }
                            if (!answers || (answers && !answers.proceed)) {
                                vscodeConnector.showInformationMessage(localizedConstants_1.default.msgRecommendCredsMigrationToSecretStore);
                                logger_1.FileStreamLogger.Instance.info(localizedConstants_1.default.msgRecommendCredsMigrationToSecretStore);
                            }
                            if (confirmKeyRingAvailable) {
                                logger_1.ChannelLogger.Instance.info(`${localizedConstants_1.default.msgKeyringTroubleshootingInfo}${constants_1.Constants.newline}${constants_1.Constants.vscodeKeyringTroubleshootingInfoUrl}${constants_1.Constants.newline}${constants_1.Constants.vscodeSecretStorageInfoUrl}`);
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.warn(error);
        }
        finally {
            logger_1.FileStreamLogger.Instance.info("End - MigrateConnectionCreds.");
        }
    }
    static async updateConnectionProfiles(extContext, profiles, connSettingsHelper, vscodeConnector) {
        logger_1.FileStreamLogger.Instance.info("Start - updateConnectionProfiles");
        let userProfilesUpdated = false;
        let wkspcProfilesUpdated = false;
        let wkspcFldrProfilesUpdated = new Map();
        let profileUpdated = false;
        let issueFound = false;
        try {
            if (profiles) {
                var profile = null;
                var failedConnLabels = [];
                var migratedConnLabels = [];
                var z0 = null;
                var z1 = null;
                for (var i = 0; i < profiles.length; i++) {
                    profile = profiles[i];
                    z0 = null;
                    z1 = null;
                    issueFound = false;
                    if (profile && profile.passwordSaved) {
                        if ((profile.passwordStore === undefined || profile.passwordStore === null ||
                            (profile.passwordStore && profile.passwordStore === scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSettings)) &&
                            ((profile.password && profile.password.length > 0) ||
                                (profile.proxyPassword && profile.proxyPassword.length > 0))) {
                            try {
                                logger_1.FileStreamLogger.Instance.info(`Connection [${i}]: Migrating connection credentials to vscode secret storage`);
                                z0 = profile.password;
                                z1 = profile.proxyPassword;
                                connSettingsHelper.PreProcessSaveProfile(profile, true);
                                try {
                                    logger_1.FileStreamLogger.Instance.info(`Connection [${i}]: Saving connection credentials to vscode secret storage`);
                                    await connSettingsHelper.addConnectionCredsToSecretStore(profile);
                                    logger_1.FileStreamLogger.Instance.info(`Connection [${i}]: Saved connection credentials to vscode secret storage`);
                                }
                                catch (error) {
                                    issueFound = true;
                                    logger_1.FileStreamLogger.Instance.error(`Connection [${i}]: Error saving connection credentials to vscode secret storage`);
                                    logger_1.FileStreamLogger.Instance.error(`${error}`);
                                }
                                finally {
                                    if (z0 !== null && z0 !== undefined) {
                                        profile.password = z0;
                                    }
                                    if (z1 !== null && z1 !== undefined) {
                                        profile.proxyPassword = z1;
                                    }
                                }
                                var connSecret = null;
                                if (!issueFound) {
                                    try {
                                        logger_1.FileStreamLogger.Instance.info(`Connection [${i}]: Fetching connection credentials from vscode secret storage`);
                                        connSecret = await connSettingsHelper.getConnectionCredsFromSecretStore(profile);
                                        logger_1.FileStreamLogger.Instance.info(`Connection [${i}]: Fetched connection credentials from vscode secret storage`);
                                        if (!connSecret) {
                                            issueFound = true;
                                            logger_1.FileStreamLogger.Instance.warn(`Connection [${i}]: Failed to get connection credentials from vscode secret storage`);
                                        }
                                    }
                                    catch (error) {
                                        issueFound = true;
                                        logger_1.FileStreamLogger.Instance.error(`Connection [${i}]: Error fetching connection credentials from vscode secret storage`);
                                        logger_1.FileStreamLogger.Instance.error(`${error}`);
                                    }
                                }
                                var cszValid = false;
                                var zValid = false;
                                if (!issueFound) {
                                    logger_1.FileStreamLogger.Instance.info(`Connection [${i}]: Validating connection credentials from vscode secret storage`);
                                    issueFound = true;
                                    if (connSecret && connSecret.z0 !== undefined && connSecret.z0 !== null) {
                                        cszValid = true;
                                    }
                                    if (z0 !== null && z0 !== undefined) {
                                        zValid = true;
                                    }
                                    if (cszValid && zValid && z0.length == connSecret.z0.length) {
                                        for (var x = 0; x < z0.length; x++) {
                                            if (z0[x] != connSecret.z0[x])
                                                break;
                                        }
                                        if (x == z0.length) {
                                            issueFound = false;
                                        }
                                    }
                                    else if (!cszValid && !zValid) {
                                        issueFound = false;
                                    }
                                    if (issueFound) {
                                        logger_1.FileStreamLogger.Instance.warn(`Connection [${i}]: Failed - Connection credential z0 from vscode secret storage is different from credential z0 on the connection profile`);
                                    }
                                    else {
                                        issueFound = true;
                                        cszValid = false;
                                        zValid = false;
                                        if (connSecret && connSecret.z1 !== undefined && connSecret.z1 !== null) {
                                            cszValid = true;
                                        }
                                        if (z1 !== null && z1 !== undefined) {
                                            zValid = true;
                                        }
                                        if (cszValid && zValid && z1.length == connSecret.z1.length) {
                                            for (var x = 0; x < z1.length; x++) {
                                                if (z1[x] != connSecret.z1[x])
                                                    break;
                                            }
                                            if (x == z1.length) {
                                                issueFound = false;
                                            }
                                        }
                                        else if (!cszValid && !zValid) {
                                            issueFound = false;
                                        }
                                        if (issueFound) {
                                            logger_1.FileStreamLogger.Instance.warn(`Connection [${i}]: Failed - Connection credential z1 from vscode secret storage is different from credential z1 on the connection profile`);
                                        }
                                    }
                                }
                                connSecret = null;
                                if (issueFound) {
                                    logger_1.FileStreamLogger.Instance.warn(`Connection [${i}]: Failed validating connection credentials from vscode secret storage`);
                                }
                                else {
                                    logger_1.FileStreamLogger.Instance.info(`Connection [${i}]: Successfully validated connection credentials from vscode secret storage`);
                                }
                            }
                            catch (error) {
                                issueFound = true;
                                if (error) {
                                    logger_1.FileStreamLogger.Instance.warn(`Connection [${i}]: ${error}`);
                                }
                            }
                            if (issueFound) {
                                logger_1.FileStreamLogger.Instance.warn(`Connection [${i}]: Failed migrating connection credential to vscode secret storage`);
                                failedConnLabels.push(helper.Utils.getConnectionLabel(profile, null, true));
                                continue;
                            }
                            delete profile.password;
                            delete profile.proxyPassword;
                            profile.passwordStore = scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSecretStorage;
                            profileUpdated = true;
                            switch (profile.configurationTarget) {
                                case vscode_1.ConfigurationTarget.Global:
                                    userProfilesUpdated = true;
                                    break;
                                case vscode_1.ConfigurationTarget.Workspace:
                                    wkspcProfilesUpdated = true;
                                    break;
                                case vscode_1.ConfigurationTarget.WorkspaceFolder:
                                    if (wkspcFldrProfilesUpdated && profile.workspaceFolder && profile.workspaceFolder.index > -1) {
                                        wkspcFldrProfilesUpdated.set(profile.workspaceFolder.index, true);
                                    }
                                    break;
                                default:
                                    break;
                            }
                            logger_1.FileStreamLogger.Instance.info(`Connection [${i}]: Successfully migrated connection credential to vscode secret storage`);
                            migratedConnLabels.push(helper.Utils.getConnectionLabel(profile, null, true));
                        }
                    }
                }
                if (profileUpdated) {
                    logger_1.FileStreamLogger.Instance.info(`Updating connections in vscode settings`);
                    var userConfigConns = [];
                    var wkspConfigConns = [];
                    var fldrConns = null;
                    var wkspcFldrConfigConns = new Map();
                    profiles.forEach((profile) => {
                        switch (profile.configurationTarget) {
                            case vscode.ConfigurationTarget.Global:
                                if (userProfilesUpdated) {
                                    if (profile.password === undefined || profile.password === null) {
                                        delete profile.password;
                                    }
                                    if (profile.proxyPassword === undefined || profile.proxyPassword === null) {
                                        delete profile.proxyPassword;
                                    }
                                    userConfigConns.push(profile);
                                }
                                break;
                            case vscode.ConfigurationTarget.Workspace:
                                if (wkspcProfilesUpdated) {
                                    if (profile.password === undefined || profile.password === null) {
                                        delete profile.password;
                                    }
                                    if (profile.proxyPassword === undefined || profile.proxyPassword === null) {
                                        delete profile.proxyPassword;
                                    }
                                    wkspConfigConns.push(profile);
                                }
                                break;
                            case vscode.ConfigurationTarget.WorkspaceFolder:
                                if (wkspcFldrProfilesUpdated && wkspcFldrProfilesUpdated.size > 0 &&
                                    profile.workspaceFolder && profile.workspaceFolder.index > -1 &&
                                    wkspcFldrProfilesUpdated.has(profile.workspaceFolder.index)) {
                                    if (!wkspcFldrConfigConns.has(profile.workspaceFolder.index)) {
                                        fldrConns = [];
                                        wkspcFldrConfigConns.set(profile.workspaceFolder.index, fldrConns);
                                    }
                                    fldrConns = wkspcFldrConfigConns.get(profile.workspaceFolder.index);
                                    if (fldrConns) {
                                        if (profile.password === undefined || profile.password === null) {
                                            delete profile.password;
                                        }
                                        if (profile.proxyPassword === undefined || profile.proxyPassword === null) {
                                            delete profile.proxyPassword;
                                        }
                                        fldrConns.push(profile);
                                        wkspcFldrConfigConns.set(profile.workspaceFolder.index, fldrConns);
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    });
                    if (userConfigConns.length > 0) {
                        await connSettingsHelper.replaceProfilesinSettings(userConfigConns, vscode_1.ConfigurationTarget.Global, null);
                    }
                    if (wkspConfigConns.length > 0) {
                        await connSettingsHelper.replaceProfilesinSettings(wkspConfigConns, vscode_1.ConfigurationTarget.Workspace, null);
                    }
                    if (wkspcFldrConfigConns.size > 0) {
                        await connSettingsHelper.replaceWorkspaceFolderProfilesinSettings(wkspcFldrConfigConns);
                    }
                    logger_1.FileStreamLogger.Instance.info(`Updated connections in vscode settings`);
                }
                var msg = null;
                if (failedConnLabels && failedConnLabels.length > 0) {
                    issueFound = true;
                    logger_1.FileStreamLogger.Instance.info(localizedConstants_1.default.msgSomeConnCredsMigrationsFailed);
                    vscodeConnector.showWarningMessage(localizedConstants_1.default.msgSomeConnCredsMigrationsFailed);
                    msg = localizedConstants_1.default.msgFailedConnCredsMigrationDetails;
                    for (var n = 0; n < failedConnLabels.length; n++) {
                        msg = msg + constants_1.Constants.newline + failedConnLabels[n];
                    }
                    msg = msg + constants_1.Constants.newline + helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgMoreInfoAt, constants_1.Constants.vscodeSecretStorageInfoUrl);
                    logger_1.ChannelLogger.Instance.info(msg);
                }
                else {
                    logger_1.FileStreamLogger.Instance.info("Migrated connection passwords from settings file to secure storage successfully");
                    vscodeConnector.showInformationMessage(localizedConstants_1.default.msgConnCredsMigrationsSuccess);
                }
                if (migratedConnLabels && migratedConnLabels.length > 0) {
                    msg = localizedConstants_1.default.msgSuccessConnCredsMigrationDetails;
                    for (var n = 0; n < migratedConnLabels.length; n++) {
                        msg = msg + "\r\n" + migratedConnLabels[n];
                    }
                    msg = msg + "\r\n";
                    logger_1.ChannelLogger.Instance.info(msg);
                }
                migratedConnLabels = null;
                failedConnLabels = null;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.warn(localizedConstants_1.default.msgConnCredsMigrationsFailed);
            logger_1.FileStreamLogger.Instance.warn(error);
            vscodeConnector.showWarningMessage(localizedConstants_1.default.msgConnCredsMigrationsFailed);
        }
        finally {
            logger_1.FileStreamLogger.Instance.info("End - updateConnectionProfiles");
        }
        return !issueFound;
    }
    static getExtensionConfigSection(scope = null) {
        return settings_1.Settings.getExtensionConfigSection(scope);
    }
    static async setDefaultLocationForBookmarkDirectory() {
        logger_1.FileStreamLogger.Instance.info("Start - setDefaultLocationForBookmarkDirectory");
        try {
            const config = this.getExtensionConfigSection();
            if (config !== null && config !== undefined) {
                const bookMarkDirectoryDefault = Setup.isDefault(config.get(constants_1.Constants.bookMarkFileFolderPropertyName));
                if (bookMarkDirectoryDefault) {
                    let bookMarkDir = helper.Utils.getExtensionDirectory();
                    if (bookMarkDir) {
                        logger_1.FileStreamLogger.Instance.info(`Setting config value of property ${constants_1.Constants.bookMarkFileFolderPropertyName} to value ${bookMarkDir}`);
                        config.update(constants_1.Constants.bookMarkFileFolderPropertyName, bookMarkDir, true);
                        logger_1.FileStreamLogger.Instance.info("Configuration updated successfully");
                    }
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error on updating BookmarkDirectory in configuration");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        logger_1.FileStreamLogger.Instance.info("End - setDefaultLocationForBookmarkDirectory");
    }
    static async setDefaultLocationForDownloadsDirectory() {
        logger_1.FileStreamLogger.Instance.info("Start - setDefaultLocationForDownloadsDirectory");
        try {
            const config = this.getExtensionConfigSection();
            if (config !== null && config !== undefined) {
                const downloadsDirectoryDefault = Setup.isDefault(config.get(constants_1.Constants.downloadsFolderPropertyName));
                if (downloadsDirectoryDefault) {
                    const { targetDir, userHomeLocation } = Setup.GetSourceAndDestDir();
                    if (userHomeLocation) {
                        let downloadsDir = path.join(userHomeLocation, constants_1.Constants.downloadsFolder);
                        logger_1.FileStreamLogger.Instance.info(`Setting config value of property ${constants_1.Constants.downloadsFolderPropertyName} to value ${downloadsDir}`);
                        config.update(constants_1.Constants.downloadsFolderPropertyName, downloadsDir, true);
                        logger_1.FileStreamLogger.Instance.info("Configuration updated successfully for downloads directory");
                    }
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error on updating Downloads Directory in configuration");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        logger_1.FileStreamLogger.Instance.info("End - setDefaultLocationForDownloadsDirectory");
    }
    static isConfigUpdateRequired() {
        let result = false;
        logger_1.FileStreamLogger.Instance.info("Check if updating connection configuration values is required");
        result = this.isUpdateRequiredForConfig(constants_1.Constants.configFileFolderPropertyName);
        if (!result) {
            result = this.isUpdateRequiredForConfig(constants_1.Constants.walletFileFolderPropertyName);
        }
        logger_1.FileStreamLogger.Instance.info(`Result from if configuration update required: ${result}`);
        return result;
    }
    static isUpdateRequiredForConfig(configPropName) {
        try {
            let configValue = settings_1.Settings.getConfigValue(configPropName, vscode_1.ConfigurationTarget.Global, undefined, true);
            if (configValue === constants_1.Constants.defaultValueMoniker) {
                return true;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error on checking if update required for configuration");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        return false;
    }
    static isDefault(value) {
        let result;
        if (value === constants_1.Constants.defaultValueMoniker) {
            result = true;
        }
        else {
            result = false;
        }
        return result;
    }
    static async updateConfigFileLocation(fileLocation) {
        try {
            await this.updateConfigFileLocationIfDefault(constants_1.Constants.configFileFolderPropertyName, fileLocation);
            await this.updateConfigFileLocationIfDefault(constants_1.Constants.walletFileFolderPropertyName, fileLocation);
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error on updating connection configuration file lcoation");
            logger_1.FileStreamLogger.Instance.error(error);
        }
    }
    static async updateConfigFileLocationIfDefault(configPropName, valueToSet) {
        try {
            logger_1.FileStreamLogger.Instance.info(`Set config file  path of property ${configPropName} to value ${valueToSet}`);
            let newConfigValue = valueToSet;
            let globalValue = settings_1.Settings.getConfigValue(configPropName, vscode_1.ConfigurationTarget.Global, undefined, true);
            if (globalValue === constants_1.Constants.defaultValueMoniker) {
                await settings_1.Settings.updateConfigValue(configPropName, newConfigValue, vscode_1.ConfigurationTarget.Global, undefined);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error on updating configuration");
            logger_1.FileStreamLogger.Instance.error(error);
        }
    }
    static getShowMissingDotnetCoreRuntimeDialog(context) {
        let retval = true;
        let filePath = "";
        try {
            filePath = path.join(context.extensionPath, constants_1.Constants.dotnetConfigDontShowDialogFilename);
            if (fs.existsSync(filePath)) {
                retval = false;
            }
            logger_1.FileStreamLogger.Instance.info(filePath + " file exists status: " + retval);
        }
        catch (fileError) {
            logger_1.FileStreamLogger.Instance.error("Error checking existence of " + filePath + ": " + fileError);
        }
        logger_1.FileStreamLogger.Instance.info("getShowMissingDotnetCoreRuntimeDialog returning: " + retval);
        return retval;
    }
    static async updateShowMissingDotnetCoreRuntimeDialog(context, flag) {
        if (!flag) {
            return;
        }
        const filename = constants_1.Constants.dotnetConfigDontShowDialogFilename;
        let filePath = "";
        try {
            const promisifiedWriteFile = util.promisify(fs.writeFile);
            filePath = path.join(context.extensionPath, filename);
            logger_1.FileStreamLogger.Instance.info(`Creating file ${filePath}`);
            promisifiedWriteFile(filePath, "").then(() => {
                logger_1.FileStreamLogger.Instance.info("Success");
            }).catch((error) => {
                logger_1.FileStreamLogger.Instance.error("Failed with error: " + error);
            });
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on creating file " + filePath);
            logger_1.FileStreamLogger.Instance.error(error);
        }
    }
    static async CreateDirectory(targetDir, beginingOfPath) {
        const promisifiedExists = util.promisify(fs.exists);
        const existDir = await promisifiedExists(targetDir);
        if (!existDir) {
            const promisifiedMkdir = util.promisify(fs.mkdir);
            const pathPortions = [constants_1.Constants.oracle, constants_1.Constants.network, constants_1.Constants.admin];
            let currentPath = beginingOfPath;
            for (let index = 0; index < pathPortions.length; index++) {
                const part = pathPortions[index];
                currentPath = path.join(currentPath, part);
                const exist = await promisifiedExists(currentPath);
                if (!exist) {
                    await promisifiedMkdir(currentPath);
                    logger_1.FileStreamLogger.Instance.info(`Created=${currentPath}`);
                }
            }
        }
    }
    static GetSourceAndDestDir() {
        const platformType = os.type();
        const isWindows = platformType === "Windows_NT";
        logger_1.FileStreamLogger.Instance.info(`Platformtype=${platformType}`);
        let userHomeLocation = "";
        if (isWindows) {
            const userProfile = process.env[constants_1.Constants.userProfile];
            logger_1.FileStreamLogger.Instance.info(`userProfile=${userProfile}`);
            userHomeLocation = userProfile;
        }
        else {
            const homeDir = os.homedir();
            logger_1.FileStreamLogger.Instance.info(`homeDir=${homeDir}`);
            userHomeLocation = homeDir;
        }
        const targetDir = path.join(userHomeLocation, constants_1.Constants.networkAdminPathPortion);
        logger_1.FileStreamLogger.Instance.info(`TargetDir=${targetDir}`);
        return { targetDir, userHomeLocation };
    }
    static GetLocalIPAddresses() {
        var ipV4Addresses = [];
        var ipV6Addresses = [];
        try {
            var interfaces = os.networkInterfaces();
            for (var k in interfaces) {
                for (var k2 in interfaces[k]) {
                    var address = interfaces[k][k2];
                    if (!address.internal) {
                        if (address.family == "IPv4") {
                            ipV4Addresses.push(address.address);
                        }
                        else {
                            ipV6Addresses.push(address.address);
                        }
                    }
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error on getting local IP Addresses");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        return ipV4Addresses.concat(ipV6Addresses);
    }
    static async migrateSettings(context) {
        await Setup.migrateConfigurationSettings(context.extensionPath);
        await Setup.migrateStorageValues(context);
        await Setup.migrateOldConnections(context);
        await Setup.setDefaultLocationsForFiles(context.extensionPath);
        await Setup.migrateFilesAssociationsSetting(context.extensionPath);
        Setup.migrateConnectionCreds(context);
    }
}
exports.Setup = Setup;
Setup.plsqlDebuggerProgram = "";
Setup.plsqlDotnetRuntimePath = "";
Setup.CurrentColorThemeKind = vscode_1.ColorThemeKind.Light;
class ConfigManager {
    get extensionPath() {
        return this.extensionPathField;
    }
    set extensionPath(v) {
        this.extensionPathField = v;
    }
    static get instance() {
        return ConfigManager.instanceField;
    }
    static set instance(v) {
        ConfigManager.instanceField = v;
    }
    static initialize(extensionPath) {
        if (!ConfigManager.instanceField) {
            ConfigManager.instanceField = new ConfigManager();
            ConfigManager.instance.extensionPath = extensionPath;
        }
    }
}
exports.ConfigManager = ConfigManager;
