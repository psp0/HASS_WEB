"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataExplorerModel = void 0;
const events_1 = require("events");
const connectionSettingsManager_1 = require("../connectionManagement/connectionSettingsManager");
const logger_1 = require("../infrastructure/logger");
const connectionNode_1 = require("./nodes/connectionNode");
const utilities_1 = require("./utilities");
const constants_1 = require("../constants/constants");
const editorUtils_1 = require("./editors/editorUtils");
const defaultConnectionManager_1 = require("../connectionManagement/defaultConnectionManager");
const helper_1 = require("../utilities/helper");
const connectionSettingsHelper_1 = require("../connectionManagement/connectionSettingsHelper");
const vscode = require("vscode");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
class DataExplorerModel {
    constructor(baseUri, vscodeConnector, connectionCommandsHandler, dataExplorerManager) {
        this.baseUri = baseUri;
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandsHandler = connectionCommandsHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.modelChanged = new events_1.EventEmitter();
        this.MODEL_CHANGED = "modeChangedEvent";
        this.connectionsRefreshed = new events_1.EventEmitter();
        this.CONNECTIONS_REFRESHED = "connectionsRefreshedEvent";
    }
    raiseModelChangedEvent() {
        this.modelChanged.emit(this.MODEL_CHANGED);
    }
    get rootNodes() {
        if (!this.rootNodesField) {
            this.rootNodesField = [];
            this.rootNodesField = this.generateRootNodes();
            this.connectionsRefreshed.emit(this.CONNECTIONS_REFRESHED);
        }
        return this.rootNodesField;
    }
    async handleProfileChanged(param) {
        logger_1.FileStreamLogger.Instance.info("Handling Configuration changed for the application");
        if (param.affectsConfiguration(constants_1.Constants.connectionSettingsPropertyFullName)) {
            await this.handleProfileAdded();
        }
        else if (param.affectsConfiguration(constants_1.Constants.defaultConnectionSettingsPropertyFullName)) {
            if (this.rootNodesField) {
                let [defaultConnName, configurationTarget, workspaceFolder] = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnectionForActiveScope();
                let modelChanged = false;
                this.dataExplorerManager.updateExplorerDefaultConnection();
                if (modelChanged) {
                    this.raiseModelChangedEvent();
                }
            }
        }
        logger_1.FileStreamLogger.Instance.info("oracleConnections changed.");
    }
    getChildren(node) {
        return node ? node.getChildren() : this.rootNodes;
    }
    addModelChangedHandler(handler) {
        this.modelChanged.on(this.MODEL_CHANGED, handler);
    }
    addConnectionsRefreshedHandler(handler) {
        this.connectionsRefreshed.on(this.CONNECTIONS_REFRESHED, handler);
    }
    async handleProfileAdded() {
        await this.reloadAll(false);
    }
    async reloadAll(isUserRefresh) {
        let profilesChanged = false;
        const connSettingHelper = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
        const latestProfiles = connSettingHelper.retrieveAllConnections(true);
        vscode.commands.executeCommand("setContext", "oracleDBObjectExplorer.connectionCount", latestProfiles ? latestProfiles.length : 0);
        const latestProfilesDic = new Map();
        latestProfiles.forEach((profile) => { latestProfilesDic.set(profile.uniqueName, profile); });
        const explorerProfileDic = new Map();
        const explorerConnectionNodeDic = new Map();
        let [defaultConnName, configurationTarget, workspaceFolder] = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnectionForActiveScope();
        let defaultConn = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(defaultConnName, configurationTarget, workspaceFolder);
        if (this.rootNodesField) {
            this.rootNodesField.forEach((item) => { explorerProfileDic.set(item.connectionProperties.uniqueName, item.connectionProperties); });
            this.rootNodesField.forEach((item) => { explorerConnectionNodeDic.set(item.connectionProperties.uniqueName, item); });
        }
        const allProfileNames = [];
        latestProfilesDic.forEach(item => allProfileNames.push(item.uniqueName));
        explorerProfileDic.forEach(item => {
            if (allProfileNames.indexOf(item.uniqueName) == -1) {
                allProfileNames.push(item.uniqueName);
            }
        });
        let newRootNodes = [];
        for (let index = 0; index < allProfileNames.length; index++) {
            const profileName = allProfileNames[index];
            if (latestProfilesDic.has(profileName) && !explorerProfileDic.has(profileName)) {
                let isNewnameOfRenamedNode = (this.dataExplorerManager.renamedConnectionNodeInfo &&
                    this.dataExplorerManager.renamedConnectionNodeInfo.newConnectionUniqueName === profileName);
                if (isNewnameOfRenamedNode) {
                    let connNode = explorerConnectionNodeDic.get(this.dataExplorerManager.renamedConnectionNodeInfo.oldConnectionUniqueName);
                    connNode.nodeLabel = latestProfilesDic.get(profileName).name;
                    connNode.connectionNodeLabelObservable(connNode.nodeLabel);
                    connNode.connectionProperties.uniqueName = profileName;
                    connNode.connectionProperties.name = connNode.nodeLabel;
                    const profile = latestProfilesDic.get(profileName);
                    connNode.connectionProperties.addSettingsScopeToConnectionName = profile.addSettingsScopeToConnectionName;
                    connNode.connectionProperties.addCurrentSchemaToConnectionName = profile.addCurrentSchemaToConnectionName;
                    connNode.connectionProperties.color = profile.color;
                    connNode.connectionProperties.useCompatibleNamesDirectoryPath = profile.useCompatibleNamesDirectoryPath;
                    if (profile.useConnectionCredsFromWalletFile) {
                        connNode.connectionProperties.useConnectionCredsFromWalletFile = profile.useConnectionCredsFromWalletFile;
                    }
                    newRootNodes.push(connNode);
                    await editorUtils_1.editorUtils.updateExplorerFileOnConnectionRename(connNode);
                    profilesChanged = true;
                }
                else {
                    const profile = latestProfilesDic.get(profileName);
                    const connObject = new connectionNode_1.ConnectionNode(helper_1.Utils.getConnectionUri(this.baseUri, profile.uniqueName), this.baseUri, profile.uniqueName, profile.name, profile, this.connectionCommandsHandler, this.dataExplorerManager, (profile.uniqueName === defaultConn ? connectionNode_1.ConnAssocType.Default : connectionNode_1.ConnAssocType.NonDefault));
                    if (this.dataExplorerManager.updatingConnectionNodeInfo &&
                        this.dataExplorerManager.updatingConnectionNodeInfo.newConnectionUniqueName === profile.uniqueName) {
                        connObject.connectionUniqueId = this.dataExplorerManager.updatingConnectionNodeInfo.connectionUniqueId;
                    }
                    newRootNodes.push(connObject);
                    profilesChanged = true;
                }
            }
            else if (!latestProfilesDic.has(profileName) && explorerProfileDic.has(profileName)) {
                let isOldnameOfRenamedNode = (this.dataExplorerManager.renamedConnectionNodeInfo &&
                    this.dataExplorerManager.renamedConnectionNodeInfo.oldConnectionUniqueName === profileName);
                if (!isOldnameOfRenamedNode) {
                    const deletedConnection = explorerConnectionNodeDic.get(profileName);
                    deletedConnection.connectionNodeDeletedObservable(true);
                    await this.connectionCommandsHandler.doDisconnect(deletedConnection.connectionURI, false);
                }
                profilesChanged = true;
            }
            else if (latestProfilesDic.has(profileName) && explorerProfileDic.has(profileName)) {
                let explorerProfile = explorerProfileDic.get(profileName);
                let latestProfile = latestProfilesDic.get(profileName);
                if (explorerProfile.passwordSaved &&
                    explorerProfile.passwordStore &&
                    explorerProfile.passwordStore == scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSecretStorage &&
                    (explorerProfile.password || explorerProfile.proxyPassword) &&
                    latestProfile.passwordSaved &&
                    latestProfile.passwordStore &&
                    latestProfile.passwordStore == scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSecretStorage &&
                    (latestProfile.password == null || latestProfile.password == undefined) &&
                    (latestProfile.proxyPassword == null || latestProfile.proxyPassword == undefined)) {
                    let connSecret = await connSettingHelper.getConnectionCredsFromSecretStore(latestProfile);
                    if (connSecret !== undefined && connSecret !== null) {
                        latestProfile.password = connSecret.z0;
                        latestProfile.proxyPassword = connSecret.z1;
                        connSecret = null;
                    }
                }
                let [propsEqual, displayPropsDiffer] = utilities_1.ExplorerUtilities.isProfilesEqual(latestProfile, explorerProfile);
                if (!propsEqual) {
                    const deletedConnection = explorerConnectionNodeDic.get(profileName);
                    await this.connectionCommandsHandler.doDisconnect(deletedConnection.connectionURI, false);
                    const profile = latestProfile;
                    const connObject = new connectionNode_1.ConnectionNode(helper_1.Utils.getConnectionUri(this.baseUri, profile.uniqueName), this.baseUri, profile.uniqueName, profile.name, profile, this.connectionCommandsHandler, this.dataExplorerManager, (profile.uniqueName === defaultConn ? connectionNode_1.ConnAssocType.Default : connectionNode_1.ConnAssocType.NonDefault));
                    if (this.dataExplorerManager.updatingConnectionNodeInfo &&
                        this.dataExplorerManager.updatingConnectionNodeInfo.newConnectionUniqueName === profile.uniqueName) {
                        connObject.connectionUniqueId = this.dataExplorerManager.updatingConnectionNodeInfo.connectionUniqueId;
                    }
                    newRootNodes.push(connObject);
                    profilesChanged = true;
                }
                else {
                    const connectionNode = explorerConnectionNodeDic.get(profileName);
                    if (displayPropsDiffer) {
                        const profile = latestProfilesDic.get(profileName);
                        if (this.dataExplorerManager.updatingConnectionNodeInfo &&
                            this.dataExplorerManager.updatingConnectionNodeInfo.newConnectionUniqueName === profile.uniqueName) {
                            connectionNode.connectionProperties.addSettingsScopeToConnectionName = profile.addSettingsScopeToConnectionName;
                            connectionNode.connectionProperties.addCurrentSchemaToConnectionName = profile.addCurrentSchemaToConnectionName;
                            connectionNode.connectionProperties.color = profile.color;
                            profilesChanged = true;
                        }
                    }
                    let unequalCollections = utilities_1.ExplorerUtilities.unequalCollectionFilters(latestProfilesDic.get(profileName), explorerProfileDic.get(profileName));
                    let filtersUpdated = unequalCollections;
                    if (filtersUpdated.length > 0) {
                        const profile = latestProfilesDic.get(profileName);
                        connectionNode.connectionProperties.filters = profile.filters;
                        await connectionNode.initFilterSettings();
                        if (connectionNode.status === connectionNode_1.ConnectionStatus.Connected) {
                            await utilities_1.ExplorerUtilities.refreshFilteredNodes(filtersUpdated, connectionNode);
                        }
                        await this.connectionCommandsHandler.updateConnectionsOnFilterUpdate(connectionNode, unequalCollections);
                        profilesChanged = true;
                    }
                    else {
                        if (isUserRefresh) {
                            connectionNode.reset();
                        }
                    }
                    newRootNodes.push(connectionNode);
                }
            }
        }
        if (isUserRefresh || profilesChanged) {
            this.rootNodesField = newRootNodes;
            this.raiseModelChangedEvent();
            await this.dataExplorerManager.onConnectionsRefreshed();
            if (this.dataExplorerManager.connectionToSelect) {
                let connNodeToSelect = newRootNodes.find((node) => (node.
                    connectionProperties.uniqueName === this.dataExplorerManager.connectionToSelect));
                if (connNodeToSelect) {
                    this.dataExplorerManager.selectNode(connNodeToSelect);
                }
            }
        }
        this.resetRecentOperationData();
    }
    resetRecentOperationData() {
        this.dataExplorerManager.renamedConnectionNodeInfo = undefined;
        this.dataExplorerManager.connectionToSelect = undefined;
        this.dataExplorerManager.updatingConnectionNodeInfo = undefined;
    }
    async handleProfileRemoved() {
        await this.reloadAll(false);
    }
    generateRootNodes() {
        const arrtoret = [];
        let [defaultConnName, configurationTarget, workspaceFolder] = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnectionForActiveScope();
        const connSettingHelper = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
        const profiles = connSettingHelper.retrieveAllConnections(true);
        vscode.commands.executeCommand("setContext", "oracleDBObjectExplorer.connectionCount", profiles ? profiles.length : 0);
        profiles.forEach((profile) => {
            let isDefaultConnection = helper_1.Utils.areConnectionPropertiesIdentical(defaultConnName, configurationTarget, workspaceFolder, profile.name, profile.configurationTarget, profile.workspaceFolder);
            const connObject = new connectionNode_1.ConnectionNode(helper_1.Utils.getConnectionUri(this.baseUri, profile.uniqueName), this.baseUri, profile.name, profile.name, profile, this.connectionCommandsHandler, this.dataExplorerManager, (isDefaultConnection ? connectionNode_1.ConnAssocType.Default : connectionNode_1.ConnAssocType.NonDefault));
            arrtoret.push(connObject);
        });
        this.copyPwdIfNeeded(this.lastRootNodes, arrtoret);
        this.lastRootNodes = null;
        return arrtoret;
    }
    copyPwdIfNeeded(oldConnNodes, newConnNodes) {
        if (oldConnNodes && oldConnNodes.length > 0 && newConnNodes && newConnNodes.length > 0) {
            oldConnNodes.forEach((oldConnNode) => {
                if (!oldConnNode.connectionProperties.passwordSaved && oldConnNode.connectionProperties.password) {
                    const newConnNode = newConnNodes.find((a) => a.connectionURI === oldConnNode.connectionURI);
                    if (newConnNode && !newConnNode.connectionProperties.passwordSaved &&
                        oldConnNode.connectionProperties.connectionType === newConnNode.connectionProperties.connectionType &&
                        oldConnNode.connectionProperties.userID === newConnNode.connectionProperties.userID &&
                        oldConnNode.status === connectionNode_1.ConnectionStatus.Connected) {
                        newConnNode.connectionProperties.password = oldConnNode.connectionProperties.password;
                    }
                }
            });
        }
    }
}
exports.DataExplorerModel = DataExplorerModel;
