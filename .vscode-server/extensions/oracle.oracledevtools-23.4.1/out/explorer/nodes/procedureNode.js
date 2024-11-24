"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcedureNode = void 0;
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
class ProcedureNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.procedureStr, new treeNodeBase_1.Icon(), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    async getChildren() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.procedureObj && !this.children) {
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
        this.procedureObj = dbo;
        super.setExtendedProperties(dbo);
    }
    getStatusToIcon(codeObjStatus) {
        logger_1.FileStreamLogger.Instance.info("ProcedureNode.getStatusToIcon: Procedure Object Status: " + codeObjStatus);
        if (!ProcedureNode.map && !ProcedureNode.lhcMap) {
            let imagesPath = path.join(constants_1.Constants.extensionRootPath, constants_1.Constants.explorer, constants_1.Constants.images);
            let procNodeDarkIconPath = path.join(imagesPath, "dark", "procedure.svg");
            let procNodeLightIconPath = path.join(imagesPath, "light", "procedure.svg");
            let procNodeXDarkIconPath = path.join(imagesPath, "dark", "procedure_x.svg");
            let procNodeXLightIconPath = path.join(imagesPath, "light", "procedure_x.svg");
            let procNodeDbgDarkIconPath = path.join(imagesPath, "dark", "procedure_dbg.svg");
            let procNodeDbgLightIconPath = path.join(imagesPath, "light", "procedure_dbg.svg");
            if (!ProcedureNode.map) {
                ProcedureNode.map = new Map();
                ProcedureNode.map.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                ProcedureNode.map.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(procNodeDarkIconPath, procNodeLightIconPath));
                ProcedureNode.map.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(procNodeXDarkIconPath, procNodeXLightIconPath));
                ProcedureNode.map.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(procNodeDbgDarkIconPath, procNodeDbgLightIconPath));
                ProcedureNode.map.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(procNodeXDarkIconPath, procNodeXLightIconPath));
            }
            if (!ProcedureNode.lhcMap) {
                ProcedureNode.lhcMap = new Map();
                ProcedureNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.None, undefined);
                ProcedureNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Valid, new treeNodeBase_1.Icon(procNodeLightIconPath, procNodeDarkIconPath));
                ProcedureNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.Invalid, new treeNodeBase_1.Icon(procNodeXLightIconPath, procNodeXDarkIconPath));
                ProcedureNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.ValidCompiledDebug, new treeNodeBase_1.Icon(procNodeDbgLightIconPath, procNodeDbgDarkIconPath));
                ProcedureNode.lhcMap.set(databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug, new treeNodeBase_1.Icon(procNodeXLightIconPath, procNodeXDarkIconPath));
            }
        }
        if (setup_1.Setup.CurrentColorThemeKind > vscode_1.ColorThemeKind.HighContrast) {
            return ProcedureNode.lhcMap.get(codeObjStatus);
        }
        return ProcedureNode.map.get(codeObjStatus);
    }
    get getObjectStatus() {
        if (this.procedureObj.status === "VALID") {
            if (this.procedureObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.ValidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Valid;
            }
        }
        else if (this.procedureObj.status === "INVALID") {
            if (this.procedureObj.isCompiledWithDebug) {
                return databaseObjects_1.CodeObjectStatus.InvalidCompiledDebug;
            }
            else {
                return databaseObjects_1.CodeObjectStatus.Invalid;
            }
        }
        return databaseObjects_1.CodeObjectStatus.None;
    }
    get getIconPath() {
        if (!this.procedureObj) {
            logger_1.FileStreamLogger.Instance.info("ProcedureNode.getIconPath: Missing Procedure Object");
            return undefined;
        }
        return this.getStatusToIcon(this.getObjectStatus);
    }
}
exports.ProcedureNode = ProcedureNode;
