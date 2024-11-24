"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionSettingsHelper = void 0;
const vscode = require("vscode");
const Constants = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const logger_1 = require("../infrastructure/logger");
const oracleVSCodeConnector_1 = require("../infrastructure/oracleVSCodeConnector");
const connectionModels_1 = require("./../models/connectionModels");
const scriptExecutionModels_1 = require("./../models/scriptExecutionModels");
const helper = require("./../utilities/helper");
const connectionSettingsManager_1 = require("./connectionSettingsManager");
const setup_1 = require("../utilities/setup");
const helper_1 = require("./../utilities/helper");
const settings_1 = require("../utilities/settings");
class ConnectionSettingsHelper {
    constructor(extContext, connSettingsManager, varVSCodeConnector) {
        this.extContext = extContext;
        this.connSettingsManager = connSettingsManager;
        this.varVSCodeConnector = varVSCodeConnector;
        if (!this.varVSCodeConnector) {
            this.vscodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector(extContext);
        }
        if (!this.connSettingsManager) {
            this.connSettingsManager = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
        }
    }
    get vscodeConnector() {
        return this.varVSCodeConnector;
    }
    set vscodeConnector(value) {
        this.varVSCodeConnector = value;
    }
    async getConnectionListForDropDown(showExistingProfiles, showExistingProfilesOnly = false) {
        const self = this;
        let connList = [];
        if (showExistingProfiles) {
            connList = await self.retrieveAllConnections();
        }
        if (!showExistingProfilesOnly) {
            connList.push({
                label: localizedConstants_1.default.labelNewConnection,
                connectionProperties: undefined,
                matchingEnumType: connectionModels_1.ConnectionAttributesSelection.CreateNew,
            });
        }
        return connList;
    }
    async getSavedConnectionProfilesList(workspaceProfiles) {
        const self = this;
        return Promise.resolve(self.getSavedConnectionProfiles(workspaceProfiles));
    }
    getRecentlyUsedConnectionList() {
        const self = this;
        let values = self.getValuesFromConfigState(Constants.Constants.recentlyUsedOracleConnectionsAndScope);
        if (!values) {
            values = [];
        }
        return values;
    }
    async saveConnectionProfileToConfig(oracleConnectionProfile, oldConnectionUniqueName, useCredStoreSettings = false) {
        const self = this;
        let savedProfile;
        if (oracleConnectionProfile.passwordSaved) {
            savedProfile = Object.assign({}, oracleConnectionProfile);
            if (savedProfile.password === null || savedProfile.password === undefined) {
                delete savedProfile.password;
            }
            if (savedProfile.proxyPassword === null || savedProfile.proxyPassword === undefined) {
                delete savedProfile.proxyPassword;
            }
        }
        else {
            savedProfile = Object.assign({}, oracleConnectionProfile, { password: undefined }, { proxyPassword: undefined });
            delete savedProfile.password;
            delete savedProfile.proxyPassword;
        }
        await self.connSettingsManager.addConnection(savedProfile, oldConnectionUniqueName, useCredStoreSettings);
        helper.setConnectionPropertiesDefault(oracleConnectionProfile);
        return oracleConnectionProfile;
    }
    async deleteRecentlyUsedConnection(connProp) {
        try {
            const self = this;
            let recentConns = self.getRecentlyUsedConnectionList();
            if (recentConns && recentConns.length > 0) {
                let tmpConnProp = connProp;
                let index = recentConns.findIndex(recentConn => this.isRecentConnSameAsSavedConn(recentConn, tmpConnProp));
                if (index > -1) {
                    recentConns.splice(index, 1);
                    await self.extContext.globalState.update(Constants.Constants.recentlyUsedOracleConnectionsAndScope, recentConns);
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on deleting recently used connections on connection delete.");
            helper.logErroAfterValidating(error);
        }
    }
    async renameRecentlyUsedConnection(oldConn, newConn) {
        try {
            const self = this;
            let recentConns = self.getRecentlyUsedConnectionList();
            if (recentConns && recentConns.length > 0) {
                let index = recentConns.findIndex(recentConn => this.isRecentConnSameAsSavedConn(recentConn, oldConn));
                if (index > -1) {
                    recentConns[index] = new scriptExecutionModels_1.RecentConnection(newConn.name, newConn.configurationTarget, newConn.workspaceFolder);
                    await self.extContext.globalState.update(Constants.Constants.recentlyUsedOracleConnectionsAndScope, recentConns);
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on updating recently used connections on connection rename.");
            helper.logErroAfterValidating(error);
        }
    }
    async addRecentlyUsedConnection(connProp) {
        try {
            const self = this;
            let tmpConnProp = connProp;
            let recentConns = self.getRecentlyUsedConnectionList();
            if (recentConns) {
                if (recentConns.length === 0) {
                    recentConns.push(new scriptExecutionModels_1.RecentConnection(tmpConnProp.name, tmpConnProp.configurationTarget, tmpConnProp.workspaceFolder));
                }
                else {
                    let index = recentConns.findIndex(recentConn => this.isRecentConnSameAsSavedConn(recentConn, tmpConnProp));
                    if (index > -1) {
                        recentConns.splice(index, 1);
                    }
                    recentConns.unshift(new scriptExecutionModels_1.RecentConnection(tmpConnProp.name, tmpConnProp.configurationTarget, tmpConnProp.workspaceFolder));
                }
                let maxRecentConns = self.connectionCountInRecentList();
                if (recentConns.length > maxRecentConns) {
                    recentConns = recentConns.slice(0, maxRecentConns);
                }
                await self.extContext.globalState.update(Constants.Constants.recentlyUsedOracleConnectionsAndScope, recentConns);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on updating recently used connections on add a connection.");
            helper.logErroAfterValidating(error);
        }
    }
    async clearAllRecentlyUsedConnections() {
        const self = this;
        try {
            await self.extContext.globalState.update(Constants.Constants.recentlyUsedOracleConnectionsAndScope, []);
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
        return;
    }
    async deleteConnectionProfile(oracleConnectionProfile, keepCredentialStore = false) {
        const self = this;
        const profileFound = await self.connSettingsManager.deleteConnection(oracleConnectionProfile);
        await self.deleteRecentlyUsedConnection(oracleConnectionProfile);
        return profileFound;
    }
    async retrieveAllConnections() {
        let connList = [];
        try {
            const self = this;
            const tmprecentConnections = this.getRecentlyUsedConnectionList();
            let savedProfiles = self.connSettingsManager.retrieveAllConnections(true);
            const connectionsInRecentList = [];
            self.addConnections(connectionsInRecentList, tmprecentConnections, savedProfiles);
            const recentConnectionsItems = connectionsInRecentList.map((connProp) => self.getConnectionDropDownItem(connProp, connectionModels_1.ConnectionAttributesSelection.Recent));
            connList = connList.concat(recentConnectionsItems);
            const savedConnectionItems = savedProfiles.map((connProp) => self.getConnectionDropDownItem(connProp, connectionModels_1.ConnectionAttributesSelection.SavedProfile));
            connList = connList.concat(savedConnectionItems);
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on retrieving connection list for connection dropdown.");
            helper.logErroAfterValidating(error);
        }
        return connList;
    }
    isRecentConnSameAsSavedConn(recentConn, savedConn) {
        return recentConn.name === savedConn.name && recentConn.configurationTarget === savedConn.configurationTarget &&
            ((!recentConn.workspaceFolder && !savedConn.workspaceFolder) ||
                (recentConn.workspaceFolder && savedConn.workspaceFolder &&
                    recentConn.workspaceFolder.name === savedConn.workspaceFolder.name &&
                    recentConn.workspaceFolder.index === savedConn.workspaceFolder.index));
    }
    async getSavedConnectionProfiles(workSpaceProfiles) {
        const self = this;
        const connsList = self.connSettingsManager.retrieveAllConnections(workSpaceProfiles);
        const connProfileList = connsList.map((connProp) => {
            return self.getConnectionDropDownItem(connProp, connectionModels_1.ConnectionAttributesSelection.SavedProfile);
        });
        return Promise.resolve(connProfileList);
    }
    getValuesFromConfigState(configName) {
        const self = this;
        const configValuesStored = self.extContext.globalState.get(configName);
        return configValuesStored;
    }
    connectionCountInRecentList() {
        const self = this;
        const configValues = setup_1.Setup.getExtensionConfigSection();
        let connCount = configValues[Constants.Constants.maxRecentlyUsedConnsPropertyName];
        if (typeof (connCount) !== "number" || connCount <= 0) {
            connCount = Constants.Constants.maxRecentlyUsedConnsCount;
        }
        return connCount;
    }
    getConnectionDropDownItem(connProp, dropDownItemType) {
        return {
            label: helper_1.Utils.getConnectionLabel(connProp),
            description: helper.getConnectionDescForSelections(helper_1.Utils.getConnectionLabel(connProp), connProp),
            detail: helper.getPicklistDetails(connProp),
            connectionProperties: connProp,
            matchingEnumType: dropDownItemType,
        };
    }
    addConnections(connections, valuestoCopyFrom, savedProfiles) {
        if (valuestoCopyFrom) {
            for (const recentConn of valuestoCopyFrom) {
                let index = savedProfiles.findIndex(connProp => this.isRecentConnSameAsSavedConn(recentConn, connProp));
                if (index > -1) {
                    let connProp = savedProfiles.splice(index, 1)[0];
                    if (connProp.connectionString || connProp.dataSource) {
                        const connection = helper.setConnectionPropertiesDefault(connProp);
                        connections.push(connection);
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.error(localizedConstants_1.default.msgConnWithNoConnStringOrDataSourc);
                        logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.msgConnWithNoConnStringOrDataSourc);
                    }
                }
            }
        }
    }
    static getUniqueConnectionName(connectionName, configurationTarget, workspaceFolder = null) {
        let uniqueConnName = connectionName;
        let nameExt = "";
        switch (configurationTarget) {
            case vscode.ConfigurationTarget.Global:
                break;
            case vscode.ConfigurationTarget.Workspace:
                nameExt = Constants.Constants.workspace;
                break;
            case vscode.ConfigurationTarget.WorkspaceFolder:
                if (workspaceFolder && workspaceFolder.name) {
                    nameExt = `${Constants.Constants.folder}_${workspaceFolder.name}_${workspaceFolder.index}`;
                }
                break;
        }
        if (nameExt) {
            uniqueConnName = `${uniqueConnName}(${nameExt})`;
        }
        return uniqueConnName;
    }
    static getWorkspaceFolder(workspaceFolder) {
        let folder = undefined;
        if (vscode.workspace && vscode.workspace.workspaceFolders && workspaceFolder && workspaceFolder.name) {
            folder = vscode.workspace.workspaceFolders.find(obj => obj.name === workspaceFolder.name && obj.index === workspaceFolder.index);
        }
        return folder;
    }
    static getUniqueConnectionNameForSecretStore(connectionUniqueName, configurationTarget, workspaceFolder = null) {
        let uniqName = `${Constants.Constants.extensionOwner}.${Constants.Constants.connectionSettingsPropertyFullName}.{${connectionUniqueName}}`;
        switch (configurationTarget) {
            case vscode.ConfigurationTarget.Global:
                break;
            case vscode.ConfigurationTarget.Workspace:
                if (vscode.workspace.workspaceFolders)
                    uniqName = `${uniqName}{${vscode.workspace.workspaceFolders[0].uri.fsPath}}`;
                break;
            case vscode.ConfigurationTarget.WorkspaceFolder:
                if (workspaceFolder && workspaceFolder.uri) {
                    uniqName = `${uniqName}{${workspaceFolder.uri.fsPath}}`;
                }
                break;
            default:
                break;
        }
        return uniqName;
    }
    async canSaveConnCredsInConfigScope(connProperties) {
        let retval = true;
        let saveCredOptions = settings_1.Settings.getCredStoreSettings(connProperties.configurationTarget, connProperties.workspaceFolder);
        if (saveCredOptions === connectionModels_1.CredStoreSettingOptions.Settings) {
            switch (connProperties.configurationTarget) {
                case vscode.ConfigurationTarget.Workspace:
                    retval = false;
                    break;
                case vscode.ConfigurationTarget.WorkspaceFolder:
                    retval = false;
                    break;
                default:
                    break;
            }
        }
        return retval;
    }
}
exports.ConnectionSettingsHelper = ConnectionSettingsHelper;
