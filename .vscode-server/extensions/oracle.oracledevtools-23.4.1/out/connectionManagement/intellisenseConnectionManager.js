"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionSharingInfo = exports.IntellisenseConnectionManager = void 0;
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const connectionRequest_1 = require("../models/connectionRequest");
const connectionCommandsScenarioManager_1 = require("./connectionCommandsScenarioManager");
const helper = require("../utilities/helper");
const localizedConstants_1 = require("../constants/localizedConstants");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const extension_1 = require("../extension");
const connectionCommandsHandler_1 = require("./connectionCommandsHandler");
class IntellisenseConnectionManager {
    constructor(statusbarMgr) {
        this.intelliSenseSharingInfo = new ConnectionSharingInfo();
        this.statusbarManger = statusbarMgr;
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(connectionRequest_1.intellisenseDisassociatedEvent.type, this.IntelliSenseDisassociatedEventHandler());
    }
    static CreateInstance(statusbarMgr) {
        try {
            if (!IntellisenseConnectionManager.varInstance) {
                IntellisenseConnectionManager.varInstance = new IntellisenseConnectionManager(statusbarMgr);
            }
            return IntellisenseConnectionManager.instance;
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
    }
    static get instance() {
        return IntellisenseConnectionManager.varInstance;
    }
    isSharingConnectionIntelliSense(connUri, fileUri) {
        return (this.intelliSenseSharingInfo.sharedFiles.has(fileUri) && this.intelliSenseSharingInfo.sharedFiles.get(fileUri) === connUri);
    }
    addToIntelliSenseSharedFiles(connUri, fileUri) {
        if (!this.isSharingConnectionIntelliSense(connUri, fileUri)) {
            this.intelliSenseSharingInfo.sharedFiles.set(fileUri, connUri);
            let sharedFiles = this.intelliSenseSharingInfo.sharedConnections.get(connUri);
            if (!sharedFiles) {
                sharedFiles = [];
                this.intelliSenseSharingInfo.sharedConnections.set(connUri, sharedFiles);
            }
            if (!sharedFiles.includes(fileUri)) {
                sharedFiles.push(fileUri);
            }
        }
    }
    getIntelliSenseConnectionUri(fileUri) {
        return this.intelliSenseSharingInfo.sharedFiles.get(fileUri);
    }
    async associateConnectionIntelliSenseToFile(editorFileUri, editorConnectionUri, rebuildIntelliSense, intelliSenseEnabled) {
        let connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUri(editorConnectionUri);
        if (connNode) {
            if (rebuildIntelliSense || !this.isSharingConnectionIntelliSense(editorConnectionUri, editorFileUri)) {
                let statusText = localizedConstants_1.default.updatingIntellisenseMessage;
                if (this.intelliSenseSharingInfo.sharedConnections.has(editorConnectionUri)) {
                    statusText = this.statusbarManger.getLangServiceStatusText(editorConnectionUri);
                }
                else {
                    let editorExists = false;
                    (0, extension_1.getSystemManager)().codeEditorProvider.openfiles.forEach((value, key) => {
                        if (value.connectionUri === editorConnectionUri) {
                            editorExists = true;
                        }
                    });
                    if (editorExists) {
                        statusText = "";
                    }
                }
                this.addToIntelliSenseSharedFiles(editorConnectionUri, editorFileUri);
                if (intelliSenseEnabled) {
                    this.updateStatusbarOnBuildIntelliSense(editorConnectionUri, statusText);
                }
                const requestParams = new connectionRequest_1.AssociateIntelliSenseRequestParameters();
                requestParams.connectionUri = editorConnectionUri;
                if (editorFileUri && editorConnectionUri && editorFileUri !== editorConnectionUri) {
                    requestParams.connectionAttributes = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(connectionCommandsHandler_1.default.Instance.getSavedConnectionProperties(editorFileUri).connectionAttributes);
                }
                else {
                    requestParams.connectionAttributes = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(connNode.connectionProperties);
                }
                requestParams.fileUri = editorFileUri;
                requestParams.filters = dataExplorerManager_1.DataExplorerManager.Instance.getFilterSettings(connNode.connectionProperties.filters);
                requestParams.rebuildIntelliSense = rebuildIntelliSense;
                await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(connectionRequest_1.AssociateIntelliSenseRequest.type, requestParams);
            }
        }
    }
    disassociateConnectionIntelliSenseFromFile(uri) {
        let sharingInfo = this.intelliSenseSharingInfo;
        if (sharingInfo.sharedFiles.has(uri)) {
            let connUri = sharingInfo.sharedFiles[uri];
            sharingInfo.sharedFiles.delete(uri);
            let sharedFiles = sharingInfo.sharedConnections.get(connUri);
            if (sharedFiles) {
                const index = sharedFiles.indexOf(uri, 0);
                if (index > -1) {
                    sharedFiles.splice(index, 1);
                    if (sharedFiles.length < 1) {
                        sharingInfo.sharedConnections.delete(connUri);
                    }
                }
            }
        }
    }
    rebuildIntelliSense(fileUri, forceRebuild) {
        let intelliSenseUri = fileUri;
        let connUri = this.getIntelliSenseConnectionUri(fileUri);
        if (connUri) {
            intelliSenseUri = connUri;
        }
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendNotification(intellisenseRequests_1.RebuildIntelliSenseNotification.event, { uri: intelliSenseUri, forceRebuild: forceRebuild });
    }
    async buildIntelliSenseOnConnect(fielUri) {
        IntellisenseConnectionManager.instance.addToIntelliSenseSharedFiles(fielUri, fielUri);
        this.updateStatusbarOnBuildIntelliSense(fielUri, localizedConstants_1.default.updatingIntellisenseMessage);
        await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendNotification(intellisenseRequests_1.BuildIntelliSenseOnConnectNotification.event, {
            ownerUri: fielUri, connectionSource: connectionRequest_1.ConnectionSource.Editor
        });
    }
    IntelliSenseDisassociatedEventHandler() {
        return (response) => {
            IntellisenseConnectionManager.instance.disassociateConnectionIntelliSenseFromFile(response.flieUri);
        };
    }
    updateStatusbarOnBuildIntelliSense(uri, statusText) {
        this.statusbarManger.displayLangServiceStatus(uri, statusText);
    }
}
exports.IntellisenseConnectionManager = IntellisenseConnectionManager;
class ConnectionSharingInfo {
    constructor() {
        this.sharedFiles = new Map();
        this.sharedConnections = new Map();
    }
}
exports.ConnectionSharingInfo = ConnectionSharingInfo;
