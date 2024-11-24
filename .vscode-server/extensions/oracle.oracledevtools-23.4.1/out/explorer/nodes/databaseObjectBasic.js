"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryNodeBase = exports.DatabaseObjectBasic = void 0;
const vscode = require("vscode");
const iExplorerNode_1 = require("../iExplorerNode");
const treeNodeBase_1 = require("../treeNodeBase");
const utilities_1 = require("../utilities");
const vscode_1 = require("vscode");
const path = require("path");
const constants_1 = require("../../constants/constants");
const setup_1 = require("../../utilities/setup");
class DatabaseObjectBasic extends treeNodeBase_1.TreeNodeBase {
    constructor(connURI = "", parentPath = "", contextValue = "", imagePath = undefined, expNodeType = iExplorerNode_1.ExplorerNodeType.Leaf, schemaName, objectName = "") {
        super(connURI, parentPath, schemaName + "." + objectName, expNodeType, contextValue, imagePath, schemaName);
        this.objectName = objectName;
        this.isDatabaseObject = true;
    }
    populate(databaseObject) {
        this.setExtendedProperties(databaseObject);
    }
    async getChildren() {
        return null;
    }
    setExtendedProperties(dbo) {
        this.databaseObject = dbo;
        this.schemaName = this.databaseObject.schema;
        this.objectName = this.databaseObject.name;
        this.nodeID = this.objectName;
    }
    get ddexObjectType() {
        return this.ddexType;
    }
    set ddexObjectType(type) {
        this.ddexType = type;
    }
    toString() {
        return this.schemaName + "." + this.objectName + "." + this.ddexObjectType;
    }
}
exports.DatabaseObjectBasic = DatabaseObjectBasic;
class CategoryNodeBase extends treeNodeBase_1.TreeNodeBase {
    constructor(connURI, parentPath, nodeID, context, schemaName) {
        super(connURI, parentPath, nodeID, iExplorerNode_1.ExplorerNodeType.Category, context, new vscode_1.ThemeIcon('file-directory'), schemaName);
        this.expandNodeField = vscode_1.TreeItemCollapsibleState.Collapsed;
        this.expand = () => {
            return this.expandNodeField;
        };
    }
    setExpand(value) {
        this.expandNodeField = value;
    }
    getExpansionState() {
        return this.expandNodeField;
    }
    getTreeItem() {
        let { label, addFiltered } = utilities_1.ExplorerUtilities.getCollectionLabel(this.getNodeIdentifier, this.nodeLabel, this.connectionURI);
        const treeItemObject = {};
        treeItemObject.label = label;
        treeItemObject.collapsibleState = this.getExpansionState();
        treeItemObject.contextValue = this.getContextValue;
        treeItemObject.iconPath = this.getIcon(addFiltered);
        treeItemObject.command = this.getCommandObject();
        treeItemObject.tooltip = this.toolTipMsg == "" ? this.getNodeIdentifier : this.toolTipMsg;
        return treeItemObject;
    }
    getIcon(filtered) {
        if (!DatabaseObjectBasic.iconMap && !DatabaseObjectBasic.iconMapLHC) {
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            let folderLightIconPath = path.join(imagesPath, "light", "folder_lightmode.svg");
            let folderDarkIconPath = path.join(imagesPath, "dark", "folder_darkmode.svg");
            let folderFilteredLightIconPath = path.join(imagesPath, "light", "folder_filter_lightmode.svg");
            let folderFilteredDarkIconPath = path.join(imagesPath, "dark", "folder_filter_darkmode.svg");
            if (!DatabaseObjectBasic.iconMap) {
                DatabaseObjectBasic.iconMap = new Map();
                DatabaseObjectBasic.iconMap.set(utilities_1.ConnFilterType[utilities_1.ConnFilterType.Filtered], new treeNodeBase_1.Icon(folderFilteredDarkIconPath, folderFilteredLightIconPath));
                DatabaseObjectBasic.iconMap.set(utilities_1.ConnFilterType[utilities_1.ConnFilterType.NonFiltered], new treeNodeBase_1.Icon(folderDarkIconPath, folderLightIconPath));
            }
            if (!DatabaseObjectBasic.iconMapLHC) {
                DatabaseObjectBasic.iconMapLHC = new Map();
                DatabaseObjectBasic.iconMapLHC.set(utilities_1.ConnFilterType[utilities_1.ConnFilterType.Filtered], new treeNodeBase_1.Icon(folderFilteredLightIconPath, folderFilteredLightIconPath));
                DatabaseObjectBasic.iconMapLHC.set(utilities_1.ConnFilterType[utilities_1.ConnFilterType.NonFiltered], new treeNodeBase_1.Icon(folderLightIconPath, folderLightIconPath));
            }
        }
        if (setup_1.Setup.CurrentColorThemeKind > vscode.ColorThemeKind.HighContrast) {
            return filtered ? DatabaseObjectBasic.iconMapLHC.get(utilities_1.ConnFilterType[utilities_1.ConnFilterType.Filtered]) : DatabaseObjectBasic.iconMapLHC.get(utilities_1.ConnFilterType[utilities_1.ConnFilterType.NonFiltered]);
        }
        return filtered ? DatabaseObjectBasic.iconMap.get(utilities_1.ConnFilterType[utilities_1.ConnFilterType.Filtered]) : DatabaseObjectBasic.iconMap.get(utilities_1.ConnFilterType[utilities_1.ConnFilterType.NonFiltered]);
    }
}
exports.CategoryNodeBase = CategoryNodeBase;
