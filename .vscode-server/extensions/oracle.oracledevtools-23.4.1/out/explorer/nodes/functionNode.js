"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionNode = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const databaseObjects_1 = require("../databaseObjects");
const treeNodeBase_1 = require("../treeNodeBase");
const constants_1 = require("../../constants/constants");
const logger_1 = require("../../infrastructure/logger");
const setup_1 = require("../../utilities/setup");
class FunctionNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.functionStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    async getChildren() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.functionObj && !this.children) {
                    let restrictions = [];
                    restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.schemaName));
                    restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.objectName));
                    this.children = await utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_FunctionParameter, restrictions);
                }
                return resolve(this.children);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    setExtendedProperties(dbo) {
        this.functionObj = dbo;
        super.setExtendedProperties(dbo);
    }
    get getObjectStatus() {
        if (this.functionObj.status === "VALID") {
            if (this.functionObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.ValidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Valid;
            }
        }
        else if (this.functionObj.status === "INVALID") {
            if (this.functionObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Invalid;
            }
        }
        return databaseObjects_1.CodeObjectStatus.None;
    }
    getStatusToIcon(status) {
        if (!FunctionNode.map && !FunctionNode.lhcMap) {
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            let functionNodeDarkIconPath = path.join(imagesPath, "dark", "procedure.svg");
            let functionNodeLightIconPath = path.join(imagesPath, "light", "procedure.svg");
            let functionNodeXDarkIconPath = path.join(imagesPath, "dark", "procedure_x.svg");
            let functionNodeXLightIconPath = path.join(imagesPath, "light", "procedure_x.svg");
            let functionNodeDbgDarkIconPath = path.join(imagesPath, "dark", "procedure_dbg.svg");
            let functionNodeDbgLightIconPath = path.join(imagesPath, "light", "procedure_dbg.svg");
            if (!FunctionNode.map) {
                FunctionNode.map = new Map();
                FunctionNode.map.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                FunctionNode.map.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(functionNodeDarkIconPath, functionNodeLightIconPath));
                FunctionNode.map.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(functionNodeXDarkIconPath, functionNodeXLightIconPath));
                FunctionNode.map.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(functionNodeDbgDarkIconPath, functionNodeDbgLightIconPath));
                FunctionNode.map.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(functionNodeXDarkIconPath, functionNodeXLightIconPath));
            }
            if (!FunctionNode.lhcMap) {
                FunctionNode.lhcMap = new Map();
                FunctionNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                FunctionNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(functionNodeLightIconPath, functionNodeDarkIconPath));
                FunctionNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(functionNodeXLightIconPath, functionNodeXDarkIconPath));
                FunctionNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(functionNodeDbgLightIconPath, functionNodeDbgDarkIconPath));
                FunctionNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(functionNodeXLightIconPath, functionNodeXDarkIconPath));
            }
        }
        if (setup_1.Setup.CurrentColorThemeKind > vscode_1.ColorThemeKind.HighContrast) {
            return FunctionNode.lhcMap.get(status);
        }
        return FunctionNode.map.get(status);
    }
    get getIconPath() {
        if (!this.functionObj) {
            logger_1.FileStreamLogger.Instance.info("FunctionNode.getIconPath: Missing Function Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.FunctionNode = FunctionNode;
