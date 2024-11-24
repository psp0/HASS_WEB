"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnAssocType = exports.ConnectionStatus = exports.ConnectionNode = void 0;
const vscode = require("vscode");
const path = require("path");
const vscode_1 = require("vscode");
const iExplorerNode_1 = require("../iExplorerNode");
const treeNodeBase_1 = require("../treeNodeBase");
const setup_1 = require("../../utilities/setup");
const utilities_1 = require("../utilities");
const ConnectionRequestNameSpc = require("./../../models/connectionRequest");
const functionCategoryNode_1 = require("./functionCategoryNode");
const packageCategoryNode_1 = require("./packageCategoryNode");
const procedureCategoryNode_1 = require("./procedureCategoryNode");
const sequenceCategoryNode_1 = require("./sequenceCategoryNode");
const synonymCategoryNode_1 = require("./synonymCategoryNode");
const tableCategoryNode_1 = require("./tableCategoryNode");
const viewCategoryNode_1 = require("./viewCategoryNode");
const triggerCategoryNode_1 = require("./triggerCategoryNode");
const scriptExecutionModels_1 = require("../../models/scriptExecutionModels");
const constants_1 = require("../../constants/constants");
const userCatetoryNode_1 = require("./userCatetoryNode");
const helper = require("../../utilities/helper");
const helper_1 = require("../../utilities/helper");
const ko = require("knockout");
class ConnectionNode extends treeNodeBase_1.TreeNodeBase {
    constructor(connURI, parentPath, nodeId, nodeLabel, connectionProperties, connectionCommandsHandler, dataExplorerManager, connAssocType) {
        super(connURI + ConnectionNode.connectionUriCount, parentPath, nodeId, iExplorerNode_1.ExplorerNodeType.Category, utilities_1.TreeViewConstants.connectionStr, new treeNodeBase_1.Icon(), "");
        this.nodeLabel = nodeLabel;
        this.connectionProperties = connectionProperties;
        this.connectionCommandsHandler = connectionCommandsHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.connAssocType = connAssocType;
        this.statusField = ConnectionStatus.Disconnected;
        this.connBanner = null;
        this.connectionNodeDeletedObservable = ko.observable(false);
        this.expandNodeField = vscode_1.TreeItemCollapsibleState.Collapsed;
        this.expand = () => {
            return this.expandNodeField;
        };
        this.connectionId = ConnectionNode.connectionUriCount;
        this.connectionUniqueId = ConnectionNode.connectionUriCount;
        ConnectionNode.connectionUriCount = ConnectionNode.connectionUriCount + 1;
        this.setNodeIdentifier = utilities_1.ExplorerUtilities.getConnectionNodeID(nodeId, this.connectionId, ConnectionStatus.Disconnected, ConnectionStatus.Disconnected, this.getNodeIdentifier, this.connAssocType);
        this.currentConnAssocType = this.connAssocType;
        this.initFilterSettings();
        this.connectionNodeLabelObservable = ko.observable(nodeLabel);
    }
    setExpand(value) {
        this.expandNodeField = value;
    }
    getExpansionState() {
        return this.expandNodeField;
    }
    get getContextValue() {
        let context = ConnectionStatus[this.status] + this.contextValue;
        if (this.connAssocType === ConnAssocType.Default) {
            context = ConnAssocType[ConnAssocType.Default] + context;
        }
        return context;
    }
    get getIconPath() {
        let connFilterType = helper_1.Utils.isConnectionCategoryFiltered(this.connectionProperties) ? utilities_1.ConnFilterType.Filtered : utilities_1.ConnFilterType.NonFiltered;
        const icon = this.statusToIcon(this.status, this.currentConnAssocType, connFilterType);
        if (icon) {
            return icon;
        }
        else {
            return undefined;
        }
    }
    get status() {
        return this.statusField;
    }
    set status(val) {
        this.statusField = val;
    }
    get filterSettings() {
        return this.connFilterSettings;
    }
    getTreeItem() {
        const treeItemObject = {};
        treeItemObject.id = this.getNodeIdentifier;
        treeItemObject.label = helper_1.Utils.getConnectionLabel(this.connectionProperties, this.schemaName, true);
        treeItemObject.collapsibleState = this.getExpansionState();
        treeItemObject.contextValue = this.getContextValue;
        treeItemObject.iconPath = this.getIconPath;
        treeItemObject.command = this.getCommandObject();
        treeItemObject.tooltip = helper_1.Utils.getConnectionTooltip(this.connectionProperties, this.schemaName);
        treeItemObject.resourceUri = vscode.Uri.parse(this.connectionURI);
        if (treeItemObject.tooltip) {
            let screenReaderInfo = this.connAssocType === ConnAssocType.Default ? constants_1.Constants.defaultConnectionLabel : "";
            screenReaderInfo += treeItemObject.tooltip.replace(/\n/g, " . ");
            treeItemObject.accessibilityInformation = { label: screenReaderInfo };
        }
        return treeItemObject;
    }
    async getChildren() {
        try {
            if (!this.children) {
                switch (this.status) {
                    case ConnectionStatus.Connected:
                        this.children = this.getChildNodes();
                        break;
                    case ConnectionStatus.Disconnected:
                        await this.dataExplorerManager.onConnectionConnect(this);
                        break;
                    case ConnectionStatus.Errored:
                        await this.dataExplorerManager.onConnectionConnect(this);
                        break;
                    case ConnectionStatus.Connecting:
                        break;
                }
            }
        }
        catch (err) {
            this.status = ConnectionStatus.Disconnected;
            helper.logErroAfterValidating(new Error(err));
        }
        return this.children;
    }
    async connectToDatabase() {
        return new Promise(async (resolve, reject) => {
            this.status = ConnectionStatus.Connecting;
            this.connectionCommandsHandler.addLoginScriptCompleteEventHandler((response) => {
                if (response.connectionUri === this.getConnectionURI) {
                    if (response.connectionId && response.connectionId !== null) {
                        this.status = ConnectionStatus.Connected;
                        this.schemaName = response.currentSchema;
                        this.children = this.getChildNodes();
                        resolve(true);
                    }
                    else {
                        this.onConnectError(false);
                        resolve(false);
                    }
                }
            });
            await this.connectionCommandsHandler.connectFromExplorer(this.getConnectionURI, this.connectionProperties).then((response) => {
                if (!response) {
                    this.onConnectError(true);
                    resolve(false);
                }
            }).catch((error) => {
                this.onConnectError(true);
                resolve(false);
            });
        });
    }
    onConnectError(removeFromMap) {
        if (removeFromMap) {
            this.connectionCommandsHandler.deleteConnectionFromMap(this.getConnectionURI);
        }
        this.status = ConnectionStatus.Errored;
        if (!this.connectionProperties.passwordSaved) {
            this.connectionProperties.password = undefined;
            this.connectionProperties.proxyPassword = undefined;
        }
    }
    getCommandObject() {
        return {
            command: "oracleDBObjectExplorer.explorerNodeSelected",
            title: "Explorer Node Selected",
            arguments: [this],
        };
    }
    statusToIcon(status, assocType, connFilterType) {
        let hclight = vscode_1.ColorThemeKind.HighContrast + 1;
        if (!ConnectionNode.map) {
            ConnectionNode.map = new Map();
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            let connectedDarkIconPath = path.join(imagesPath, "dark", "instance.svg");
            let connectedLightIconPath = path.join(imagesPath, "light", "instance.svg");
            let disconnectedDarkIconPath = path.join(imagesPath, "dark", "database-x.svg");
            let disconnectedLightIconPath = path.join(imagesPath, "light", "database-x.svg");
            let connectingDarkIconPath = path.join(imagesPath, "dark", "database-clock.svg");
            let connectingLightIconPath = path.join(imagesPath, "light", "database-clock.svg");
            let defConConnectedDarkIconPath = path.join(imagesPath, "dark", "instance-default.svg");
            let defConConnectedLightIconPath = path.join(imagesPath, "light", "instance-default.svg");
            let defConDisconnectedDarkIconPath = path.join(imagesPath, "dark", "database-x-default.svg");
            let defConDisconnectedLightIconPath = path.join(imagesPath, "light", "database-x-default.svg");
            let defConConnectingDarkIconPath = path.join(imagesPath, "dark", "database-clock.svg");
            let defConConnectingLightIconPath = path.join(imagesPath, "light", "database-clock.svg");
            let connectedFilteredDarkIconPath = path.join(imagesPath, "dark", "instance_filter_darkmode.svg");
            let connectedFilteredLightIconPath = path.join(imagesPath, "light", "instance_filter_lightmode.svg");
            let defConnectedFilteredDarkIconPath = path.join(imagesPath, "dark", "default_connection_filter_darkmode.svg");
            let defConnectedFilteredLightIconPath = path.join(imagesPath, "light", "default_connection_filter_lightmode.svg");
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connected] + ConnAssocType[ConnAssocType.NonDefault], new treeNodeBase_1.Icon(connectedDarkIconPath, connectedLightIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Disconnected] + ConnAssocType[ConnAssocType.NonDefault], new treeNodeBase_1.Icon(disconnectedDarkIconPath, disconnectedLightIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connecting] + ConnAssocType[ConnAssocType.NonDefault], new treeNodeBase_1.Icon(connectingDarkIconPath, connectingLightIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Errored] + ConnAssocType[ConnAssocType.NonDefault], new treeNodeBase_1.Icon(disconnectedDarkIconPath, disconnectedLightIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connected] + ConnAssocType[ConnAssocType.Default], new treeNodeBase_1.Icon(defConConnectedDarkIconPath, defConConnectedLightIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Disconnected] + ConnAssocType[ConnAssocType.Default], new treeNodeBase_1.Icon(defConDisconnectedDarkIconPath, defConDisconnectedLightIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connecting] + ConnAssocType[ConnAssocType.Default], new treeNodeBase_1.Icon(defConConnectingDarkIconPath, defConConnectingLightIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Errored] + ConnAssocType[ConnAssocType.Default], new treeNodeBase_1.Icon(defConDisconnectedDarkIconPath, defConDisconnectedLightIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connected] + ConnAssocType[ConnAssocType.NonDefault] + hclight, new treeNodeBase_1.Icon(connectedLightIconPath, connectedDarkIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Disconnected] + ConnAssocType[ConnAssocType.NonDefault] + hclight, new treeNodeBase_1.Icon(disconnectedLightIconPath, disconnectedDarkIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connecting] + ConnAssocType[ConnAssocType.NonDefault] + hclight, new treeNodeBase_1.Icon(connectingLightIconPath, connectingDarkIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Errored] + ConnAssocType[ConnAssocType.NonDefault] + hclight, new treeNodeBase_1.Icon(disconnectedLightIconPath, disconnectedDarkIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connected] + ConnAssocType[ConnAssocType.Default] + hclight, new treeNodeBase_1.Icon(defConConnectedLightIconPath, defConConnectedDarkIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Disconnected] + ConnAssocType[ConnAssocType.Default] + hclight, new treeNodeBase_1.Icon(defConDisconnectedLightIconPath, defConDisconnectedDarkIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connecting] + ConnAssocType[ConnAssocType.Default] + hclight, new treeNodeBase_1.Icon(defConConnectingLightIconPath, defConConnectingDarkIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Errored] + ConnAssocType[ConnAssocType.Default] + hclight, new treeNodeBase_1.Icon(defConDisconnectedLightIconPath, defConDisconnectedDarkIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connected] + ConnAssocType[ConnAssocType.NonDefault] + utilities_1.ConnFilterType[utilities_1.ConnFilterType.Filtered], new treeNodeBase_1.Icon(connectedFilteredDarkIconPath, connectedFilteredLightIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connected] + ConnAssocType[ConnAssocType.Default] + utilities_1.ConnFilterType[utilities_1.ConnFilterType.Filtered], new treeNodeBase_1.Icon(defConnectedFilteredDarkIconPath, defConnectedFilteredLightIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connected] + ConnAssocType[ConnAssocType.NonDefault] + utilities_1.ConnFilterType[utilities_1.ConnFilterType.Filtered] + hclight, new treeNodeBase_1.Icon(connectedFilteredLightIconPath, connectedFilteredDarkIconPath));
            ConnectionNode.map.set(ConnectionStatus[ConnectionStatus.Connected] + ConnAssocType[ConnAssocType.Default] + utilities_1.ConnFilterType[utilities_1.ConnFilterType.Filtered] + hclight, new treeNodeBase_1.Icon(defConnectedFilteredLightIconPath, defConnectedFilteredDarkIconPath));
        }
        let key = ConnectionStatus[status] + ConnAssocType[assocType];
        if (status === ConnectionStatus.Connected && connFilterType === utilities_1.ConnFilterType.Filtered) {
            key = key + utilities_1.ConnFilterType[utilities_1.ConnFilterType.Filtered];
        }
        if (setup_1.Setup.CurrentColorThemeKind > vscode_1.ColorThemeKind.HighContrast) {
            key = key + hclight;
        }
        return ConnectionNode.map.get(key);
    }
    getChildNodes() {
        if (!this.children) {
            const arrtoRet = [];
            const prtPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier + this.connectionId.toString());
            let visColl = utilities_1.ExplorerUtilities.getVisibleCollections(this);
            let getAll = visColl.length === 0;
            let filteredCollections = [];
            this.connFilterSettings.forEach((cf) => {
                if (cf.enableFiltersForExplorer)
                    filteredCollections.push(cf.collectionType);
            });
            let catNode;
            let getTables = (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.ObjectTables) > -1) ||
                (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.RelationalTables) > -1) || (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.XMLTables) > -1);
            if (getAll || getTables) {
                catNode = new tableCategoryNode_1.TableCategoryNode(this.getConnectionURI, prtPath, this.schemaName, visColl);
                arrtoRet.push(catNode);
            }
            let getViews = (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.RelationalViews) > -1) ||
                (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.ObjectViews) > -1) ||
                (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.XMLViews) > -1) ||
                (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.MaterializedViews) > -1);
            if (getAll || getViews) {
                catNode = new viewCategoryNode_1.ViewCategoryNode(this.getConnectionURI, prtPath, this.schemaName, visColl);
                arrtoRet.push(catNode);
            }
            if (getAll || visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.Procedures) > -1) {
                catNode = new procedureCategoryNode_1.ProcedureCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.Functions) > -1) {
                catNode = new functionCategoryNode_1.FunctionCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.Packages) > -1) {
                catNode = new packageCategoryNode_1.PackageCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            let getTriggers = (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.ViewTriggers) > -1) ||
                (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.TableTriggers) > -1) ||
                (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.SchemaTriggers) > -1) ||
                (visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.DatabaseTriggers) > -1);
            if (getAll || getTriggers) {
                catNode = new triggerCategoryNode_1.TriggerCategoryNode(this.getConnectionURI, prtPath, this.schemaName, visColl);
                arrtoRet.push(catNode);
            }
            if (getAll || visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.Synonyms) > -1) {
                catNode = new synonymCategoryNode_1.SynonymCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.Sequences) > -1) {
                catNode = new sequenceCategoryNode_1.SequenceCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || visColl.indexOf(scriptExecutionModels_1.FilterCollectionType.OtherUsers) > -1) {
                catNode = new userCatetoryNode_1.userCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            this.children = arrtoRet;
        }
        return this.children;
    }
    async initFilterSettings() {
        this.connFilterSettings = this.dataExplorerManager.getFilterSettings(this.connectionProperties.filters);
        let request = new ConnectionRequestNameSpc.UpdateConnectionFiltersRequestParameters();
        request.ownerUri = this.connectionURI;
        request.filters = this.connFilterSettings;
    }
}
exports.ConnectionNode = ConnectionNode;
ConnectionNode.connectionUriCount = 1;
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus[ConnectionStatus["Connected"] = 1] = "Connected";
    ConnectionStatus[ConnectionStatus["Disconnected"] = 2] = "Disconnected";
    ConnectionStatus[ConnectionStatus["Errored"] = 3] = "Errored";
    ConnectionStatus[ConnectionStatus["Connecting"] = 4] = "Connecting";
})(ConnectionStatus = exports.ConnectionStatus || (exports.ConnectionStatus = {}));
var ConnAssocType;
(function (ConnAssocType) {
    ConnAssocType[ConnAssocType["Default"] = 1] = "Default";
    ConnAssocType[ConnAssocType["NonDefault"] = 2] = "NonDefault";
})(ConnAssocType = exports.ConnAssocType || (exports.ConnAssocType = {}));
