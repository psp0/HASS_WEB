"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableCategoryNode = void 0;
const scriptExecutionModels_1 = require("../../models/scriptExecutionModels");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const objectTableCategoryNode_1 = require("./objectTableCategoryNode");
const relationalTableCategoryNode_1 = require("./relationalTableCategoryNode");
const xmlTableCategoryNode_1 = require("./xmlTableCategoryNode");
const vscode_1 = require("vscode");
class TableCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, schemaName, visibleCollections) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.tablesStr, utilities_1.TreeViewConstants.tablesStr, schemaName);
        this.visibleCollections = visibleCollections;
    }
    async getChildren() {
        return this.getSubChildren();
    }
    getSubChildren() {
        if (!this.children) {
            const arrtoRet = [];
            const prtPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
            let catNode;
            let getAll = this.visibleCollections.length === 0;
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.RelationalTables) > -1) {
                catNode = new relationalTableCategoryNode_1.RelationalTableCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.ObjectTables) > -1) {
                catNode = new objectTableCategoryNode_1.ObjectTableCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.XMLTables) > -1) {
                catNode = new xmlTableCategoryNode_1.XMLTableCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            this.children = arrtoRet;
        }
        this.expandNodeField = vscode_1.TreeItemCollapsibleState.Expanded;
        return this.children;
    }
}
exports.TableCategoryNode = TableCategoryNode;
