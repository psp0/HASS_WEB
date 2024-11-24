"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XMLTableNode = exports.ObjectTableNode = exports.RelationalTableNode = void 0;
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const tableConstraintCategoryNode_1 = require("./tableConstraintCategoryNode");
const tableIndexCategoryNode_1 = require("./tableIndexCategoryNode");
const vscode_1 = require("vscode");
const constants_1 = require("../../constants/constants");
class RelationalTableNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, constants_1.TreeViewConstants.relationalTableStr, new vscode_1.ThemeIcon('symbol-constant'), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    async getChildren() {
        let nodes = [];
        let restrictions = [];
        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.tableObj.schema));
        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.tableObj.name));
        let columnNodes = await utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableColumn, restrictions);
        nodes.push(...columnNodes);
        const parentPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
        let constraintsNode = new tableConstraintCategoryNode_1.TableConstraintCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableConstraint, this.schemaName);
        nodes.push(constraintsNode);
        let indexesNode = new tableIndexCategoryNode_1.TableIndexCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableIndex, this.schemaName);
        nodes.push(indexesNode);
        return nodes;
    }
    setExtendedProperties(dbo) {
        this.tableObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.RelationalTableNode = RelationalTableNode;
class ObjectTableNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, constants_1.TreeViewConstants.objectTableStr, new vscode_1.ThemeIcon('symbol-constant'), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    async getChildren() {
        let nodes = [];
        let restrictions = [];
        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.tableObj.schema));
        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.tableObj.name));
        let columnNodes = await utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableColumn, restrictions);
        nodes.push(...columnNodes);
        const parentPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
        let constraintsNode = new tableConstraintCategoryNode_1.TableConstraintCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableConstraint, this.schemaName);
        nodes.push(constraintsNode);
        let indexesNode = new tableIndexCategoryNode_1.TableIndexCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableIndex, this.schemaName);
        nodes.push(indexesNode);
        return nodes;
    }
    setExtendedProperties(dbo) {
        this.tableObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.ObjectTableNode = ObjectTableNode;
class XMLTableNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, constants_1.TreeViewConstants.xmlTableStr, new vscode_1.ThemeIcon('symbol-constant'), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    async getChildren() {
        let nodes = [];
        let restrictions = [];
        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.tableObj.schema));
        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.tableObj.name));
        let columnNodes = await utilities_1.ExplorerUtilities.getChildNodes(this, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableColumn, restrictions);
        nodes.push(...columnNodes);
        const parentPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
        let constraintsNode = new tableConstraintCategoryNode_1.TableConstraintCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableConstraint, this.schemaName);
        nodes.push(constraintsNode);
        let indexesNode = new tableIndexCategoryNode_1.TableIndexCategoryNode(this.getConnectionURI, parentPath, this.tableObj.schema, this.tableObj.name, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableIndex, this.schemaName);
        nodes.push(indexesNode);
        return nodes;
    }
    setExtendedProperties(dbo) {
        this.tableObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.XMLTableNode = XMLTableNode;
