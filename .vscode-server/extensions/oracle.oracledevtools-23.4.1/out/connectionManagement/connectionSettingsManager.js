"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleVSCodeConnectionSettingsManager = void 0;
const vscode = require("vscode");
const oracleVSCodeConnector_1 = require("../infrastructure/oracleVSCodeConnector");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const connectionModels_1 = require("../models/connectionModels");
const helper = require("../utilities/helper");
const setup_1 = require("../utilities/setup");
const constants_1 = require("../constants/constants");
const connectionSettingsHelper_1 = require("./connectionSettingsHelper");
const documentConnectionInformation_1 = require("./documentConnectionInformation");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const logger_1 = require("../infrastructure/logger");
const helper_1 = require("../utilities/helper");
const settings_1 = require("../utilities/settings");
class OracleVSCodeConnectionSettingsManager {
    constructor(vscodeConnector) {
        this.vscodeConnector = vscodeConnector;
        this.connComparer = (a, b) => {
            const nameA = a.uniqueName ? a.uniqueName : (a.dataSource ? a.dataSource : a.connectionString);
            const nameB = b.uniqueName ? b.uniqueName : (b.dataSource ? b.dataSource : b.connectionString);
            return nameA.localeCompare(nameB);
        };
        if (!this.vscodeConnector) {
            this.vscodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector();
        }
    }
    async addConnection(connProfile, oldConnectionUniqueName, useCredStoreSettings = false) {
        if (connProfile.passwordSaved) {
            if (oldConnectionUniqueName) {
                await this.deleteConnectionCredsFromSecretStore(oldConnectionUniqueName, connProfile.configurationTarget, connProfile.workspaceFolder);
            }
            let credStore = connectionModels_1.CredStoreSettingOptions.Settings;
            if (useCredStoreSettings) {
                credStore = settings_1.Settings.getCredStoreSettings(connProfile.configurationTarget, connProfile.workspaceFolder);
            }
            else {
                switch (connProfile.passwordStore) {
                    case scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSettings:
                        credStore = connectionModels_1.CredStoreSettingOptions.Settings;
                        break;
                    case scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSecretStorage:
                        credStore = connectionModels_1.CredStoreSettingOptions.SecretStorage;
                        break;
                    default:
                        break;
                }
            }
            switch (credStore) {
                case connectionModels_1.CredStoreSettingOptions.SecretStorage:
                    this.PreProcessSaveProfile(connProfile, true);
                    connProfile.passwordStore = scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSecretStorage;
                    await this.addConnectionCredsToSecretStore(connProfile);
                    connProfile.password = undefined;
                    connProfile.proxyPassword = undefined;
                    return this.addConnectionToSettings(connProfile, oldConnectionUniqueName);
                    break;
                case connectionModels_1.CredStoreSettingOptions.Settings:
                    connProfile.passwordStore = scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSettings;
                    return this.addConnectionToSettings(connProfile, oldConnectionUniqueName);
                    break;
                default:
                    break;
            }
        }
        else
            return this.addConnectionToSettings(connProfile, oldConnectionUniqueName);
    }
    async addConnectionToSettings(connProfile, oldConnectionUniqueName) {
        const self = this;
        let strdConnProfiles = this.retrieveConnProfilesFromConfig(connProfile.configurationTarget, connProfile.workspaceFolder);
        if (oldConnectionUniqueName) {
            strdConnProfiles = strdConnProfiles.filter((item) => ((item.uniqueName != connProfile.uniqueName) && (item.uniqueName != oldConnectionUniqueName)));
        }
        else {
            strdConnProfiles = strdConnProfiles.filter((item) => (item.uniqueName != connProfile.uniqueName));
        }
        strdConnProfiles.push(connProfile);
        await self.replaceProfilesinSettings(strdConnProfiles, connProfile.configurationTarget, connProfile.workspaceFolder);
    }
    retrieveAllConnections(fetchWorkSpaceConn) {
        logger_1.FileStreamLogger.Instance.info("retrieveAllConnections - Retrieve all connections from all scopes - Start");
        const self = this;
        let conns = [];
        try {
            let userConfigConns = self.retrieveConnProfilesFromConfig(vscode.ConfigurationTarget.Global);
            userConfigConns = userConfigConns.sort(this.connComparer);
            conns = conns.concat(userConfigConns);
            if (fetchWorkSpaceConn) {
                let wkspcConfigConns = self.retrieveConnProfilesFromConfig(vscode.ConfigurationTarget.Workspace);
                wkspcConfigConns = wkspcConfigConns.sort(this.connComparer);
                conns = conns.concat(wkspcConfigConns);
                const wkspcFldrConfigConns = self.retrieveConnProfilesFromConfig(vscode.ConfigurationTarget.WorkspaceFolder);
                conns = conns.concat(wkspcFldrConfigConns);
            }
            let connNamesMap = {};
            if (conns.length > 0) {
                conns = conns.filter((conn) => {
                    if (connNamesMap[conn.uniqueName] !== undefined)
                        return false;
                    connNamesMap[conn.uniqueName] = true;
                    return conn.connectionString || conn.dataSource;
                });
            }
        }
        catch (error) {
            documentConnectionInformation_1.fileLogger.error("Error on retrieving all connection profiles from user, workspace and folder scopes");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("retrieveAllConnections - Retrieve all connections from all scopes - Start");
        return conns;
    }
    async deleteConnection(connProfile) {
        const self = this;
        let connProfiles = self.retrieveConnProfilesFromConfig(connProfile.configurationTarget, connProfile.workspaceFolder);
        let profileFound = (connProfiles.find(profile => profile.uniqueName === connProfile.uniqueName) != null);
        connProfiles = connProfiles.filter(profile => profile.uniqueName != connProfile.uniqueName);
        await self.replaceProfilesinSettings(connProfiles, connProfile.configurationTarget, connProfile.workspaceFolder);
        await this.deleteConnectionCredsFromSecretStore(connProfile.uniqueName, connProfile.configurationTarget, connProfile.workspaceFolder);
        return profileFound;
    }
    retrieveConnProfilesFromConfig(configScope, workspaceFolder = null) {
        documentConnectionInformation_1.fileLogger.info(`connectionSettingsManager.retrieveConnProfilesFromConfig (Configuration Target: ${configScope}, Workspace Folder: ${workspaceFolder}) - Start`);
        let profilesToReturn;
        let config;
        let connConfigurationEntries;
        try {
            switch (configScope) {
                case vscode.ConfigurationTarget.Global:
                    config = setup_1.Setup.getExtensionConfigSection();
                    connConfigurationEntries = config.inspect(constants_1.Constants.connectionSettingsPropertyName);
                    profilesToReturn = connConfigurationEntries.globalValue;
                    if (profilesToReturn)
                        profilesToReturn.forEach(element => {
                            element.configurationTarget = configScope;
                            element.workspaceFolder = undefined;
                            element.uniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(element.name, configScope);
                        });
                    break;
                case vscode.ConfigurationTarget.Workspace:
                    config = setup_1.Setup.getExtensionConfigSection();
                    connConfigurationEntries = config.inspect(constants_1.Constants.connectionSettingsPropertyName);
                    profilesToReturn = connConfigurationEntries.workspaceValue;
                    if (profilesToReturn)
                        profilesToReturn.forEach(element => {
                            element.configurationTarget = configScope;
                            element.workspaceFolder = undefined;
                            element.uniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(element.name, configScope);
                        });
                    break;
                case vscode.ConfigurationTarget.WorkspaceFolder:
                    if (workspaceFolder) {
                        config = setup_1.Setup.getExtensionConfigSection(workspaceFolder);
                        connConfigurationEntries = config.inspect(constants_1.Constants.connectionSettingsPropertyName);
                        profilesToReturn = connConfigurationEntries.workspaceFolderValue;
                        if (profilesToReturn)
                            profilesToReturn.forEach(element => {
                                element.configurationTarget = configScope;
                                element.workspaceFolder = workspaceFolder;
                                element.uniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(element.name, configScope, workspaceFolder);
                            });
                    }
                    else {
                        if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                            profilesToReturn = [];
                            if (vscode.workspace.workspaceFolders.length === 1 && vscode.workspace.name === vscode.workspace.workspaceFolders[0].name)
                                return profilesToReturn;
                            let folderConnections = null;
                            for (let i = 0; i < vscode.workspace.workspaceFolders.length; ++i) {
                                config = setup_1.Setup.getExtensionConfigSection(vscode.workspace.workspaceFolders[i]);
                                connConfigurationEntries = config.inspect(constants_1.Constants.connectionSettingsPropertyName);
                                if (connConfigurationEntries.workspaceFolderValue) {
                                    connConfigurationEntries.workspaceFolderValue.forEach(item => {
                                        item.configurationTarget = configScope;
                                        item.workspaceFolder = vscode.workspace.workspaceFolders[i];
                                        item.uniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(item.name, configScope, item.workspaceFolder);
                                    });
                                }
                                folderConnections = connConfigurationEntries.workspaceFolderValue;
                                if (folderConnections) {
                                    folderConnections = folderConnections.sort(this.connComparer);
                                    profilesToReturn = profilesToReturn.concat(folderConnections);
                                }
                            }
                        }
                    }
                    break;
            }
            if (profilesToReturn === undefined) {
                profilesToReturn = [];
            }
            else {
                profilesToReturn = profilesToReturn.filter((profile, index, self) => {
                    let validProfile = false;
                    let itemIndex = self.findIndex((item) => (helper_1.Utils.areConnectionPropertiesIdentical(item.name, item.configurationTarget, item.workspaceFolder, profile.name, profile.configurationTarget, profile.workspaceFolder)));
                    if (index === itemIndex &&
                        profile.name && profile.name.trim().length > 0) {
                        validProfile = true;
                    }
                    return validProfile;
                });
            }
            this.PostProcessReadProfiles(profilesToReturn);
        }
        catch (error) {
            documentConnectionInformation_1.fileLogger.error("Error on retrieving connection profiles from config scope");
            helper.logErroAfterValidating(error);
        }
        finally {
            documentConnectionInformation_1.fileLogger.info(`connectionSettingsManager.retrieveConnProfilesFromConfig (Configuration Target: ${configScope}, Workspace Folder: ${workspaceFolder}) - End`);
        }
        return profilesToReturn;
    }
    async PostProcessReadProfileCredsAsync(profile) {
        if (profile.passwordSaved && !profile.password && !profile.proxyPassword &&
            profile.passwordStore !== undefined && profile.passwordStore == scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSecretStorage) {
            let connSecret = await this.getConnectionCredsFromSecretStore(profile);
            if (connSecret !== undefined && connSecret !== null) {
                profile.password = connSecret.z0;
                profile.proxyPassword = connSecret.z1;
            }
        }
    }
    PostProcessReadProfile(profile) {
        profile.password = helper.Utils.toCodePointArray(profile.password);
        profile.proxyPassword = helper.Utils.toCodePointArray(profile.proxyPassword);
        this.updateProfileCredentialProperties(profile);
    }
    PostProcessReadProfiles(profilesToReturn) {
        if (profilesToReturn) {
            profilesToReturn.forEach((profile) => {
                this.PostProcessReadProfile(profile);
            });
        }
    }
    updateProfileCredentialProperties(profile) {
        if (profile.password || profile.proxyPassword) {
            if (!profile.passwordSaved) {
                profile.passwordSaved = true;
            }
            if ((profile.password && (profile.password === "" || profile.password.length === 0)) ||
                (profile.proxyPassword && (profile.proxyPassword === "" || profile.proxyPassword.length === 0))) {
                profile.passwordEmptyByUser = true;
            }
        }
    }
    checkProfileNameForUniqueness(connUniqueName) {
        let connNodes = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodes();
        let connNode = connNodes.find(node => node.connectionProperties.uniqueName === connUniqueName);
        return !connNode;
    }
    async replaceWorkspaceFolderProfilesinSettings(connProfiles) {
        const self = this;
        if (connProfiles && connProfiles.size > 0) {
            var profiles = null;
            for (let [key, value] of connProfiles) {
                profiles = value;
                if (profiles && profiles.length > 0) {
                    if (profiles[0].workspaceFolder) {
                        await self.replaceProfilesinSettings(profiles, vscode.ConfigurationTarget.WorkspaceFolder, profiles[0].workspaceFolder);
                    }
                }
            }
        }
    }
    async replaceProfilesinSettings(connProfiles, configurationTarget, workspaceFolder) {
        const self = this;
        connProfiles.forEach((profile) => {
            if (profile.password === null || profile.password === undefined) {
                delete profile.password;
            }
            if (profile.proxyPassword === null || profile.proxyPassword === undefined) {
                delete profile.proxyPassword;
            }
            if (profile.passwordStore && !profile.passwordSaved) {
                delete profile.passwordStore;
            }
        });
        this.PreProcessSaveProfiles(connProfiles);
        await setup_1.Setup.getExtensionConfigSection(workspaceFolder).update(constants_1.Constants.connectionSettingsPropertyName, connProfiles, configurationTarget);
    }
    PreProcessSaveProfiles(connProfiles) {
        if (connProfiles) {
            connProfiles.forEach((profile) => {
                this.PreProcessSaveProfile(profile);
            });
        }
    }
    PreProcessSaveProfile(connProfile, processCredsOnly = false) {
        if (connProfile) {
            if (connProfile.password) {
                connProfile.password = String.fromCodePoint(...connProfile.password);
            }
            if (connProfile.proxyPassword) {
                connProfile.proxyPassword = String.fromCodePoint(...connProfile.proxyPassword);
            }
            if (!processCredsOnly) {
                delete connProfile.uniqueName;
                delete connProfile.configurationTarget;
                delete connProfile.workspaceFolder;
            }
        }
    }
    async addConnectionCredsToSecretStore(connProfile) {
        try {
            let key = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionNameForSecretStore(connProfile.uniqueName, connProfile.configurationTarget, connProfile.workspaceFolder);
            documentConnectionInformation_1.fileLogger.info(`Saving connection creds to VSCode Secret Storage`);
            await this.vscodeConnector.ExtensionContext.secrets.store(key, JSON.stringify(new connectionModels_1.ConnectionCredProperties(helper.Utils.toCodePointArray(connProfile.password), helper.Utils.toCodePointArray(connProfile.proxyPassword))));
            documentConnectionInformation_1.fileLogger.info(`Saved connection creds to VSCode Secret Storage`);
        }
        catch (error) {
            documentConnectionInformation_1.fileLogger.error("Failed to save connection creds to VSCode Secret Storage");
            documentConnectionInformation_1.fileLogger.error(error);
        }
    }
    async deleteConnectionCredsFromSecretStore(connUniqueName, configurationTarget, workspaceFolder) {
        try {
            if (connUniqueName !== undefined && connUniqueName !== null) {
                let key = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionNameForSecretStore(connUniqueName, configurationTarget, workspaceFolder);
                if (await this.vscodeConnector.ExtensionContext.secrets.get(key) !== undefined) {
                    documentConnectionInformation_1.fileLogger.info(`Deleting connection creds from VSCode Secret Storage`);
                    await this.vscodeConnector.ExtensionContext.secrets.delete(key);
                    documentConnectionInformation_1.fileLogger.info(`Deleted connection creds from VSCode Secret Storage`);
                }
            }
        }
        catch (error) {
            documentConnectionInformation_1.fileLogger.error("Failed to delete connection creds from VSCode Secret Storage");
            documentConnectionInformation_1.fileLogger.error(error);
        }
    }
    async getConnectionCredsFromSecretStore(connProfile) {
        let connCreds = null;
        try {
            let key = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionNameForSecretStore(connProfile.uniqueName, connProfile.configurationTarget, connProfile.workspaceFolder);
            documentConnectionInformation_1.fileLogger.info(`Get connection creds from VSCode Secret Storage`);
            if (await this.vscodeConnector.ExtensionContext.secrets.get(key) !== undefined) {
                documentConnectionInformation_1.fileLogger.info(`Returning connection creds from VSCode Secret Storage`);
                connCreds = JSON.parse(await this.vscodeConnector.ExtensionContext.secrets.get(key));
            }
            else {
                documentConnectionInformation_1.fileLogger.info(`Connection Not Found in VSCode Secret Storage. Returning null.`);
            }
        }
        catch (error) {
            documentConnectionInformation_1.fileLogger.error("Failed getting connection creds from VSCode Secret Storage");
            documentConnectionInformation_1.fileLogger.error(error);
        }
        return connCreds;
    }
}
exports.OracleVSCodeConnectionSettingsManager = OracleVSCodeConnectionSettingsManager;
