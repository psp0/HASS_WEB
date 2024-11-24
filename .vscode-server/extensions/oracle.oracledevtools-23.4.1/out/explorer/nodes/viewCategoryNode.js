"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewCategoryNode = void 0;
const scriptExecutionModels_1 = require("../../models/scriptExecutionModels");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const materializedViewCategoryNode_1 = require("./materializedViewCategoryNode");
const objectViewCategoryNode_1 = require("./objectViewCategoryNode");
const relationalViewCategoryNode_1 = require("./relationalViewCategoryNode");
const xmlViewCategoryNode_1 = require("./xmlViewCategoryNode");
const vscode_1 = require("vscode");
class ViewCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, schemaName, visibleCollections) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.viewsStr, utilities_1.TreeViewConstants.viewsStr, schemaName);
        this.visibleCollections = visibleCollections;
    }
    async getChildren() {
        if (!this.children) {
            const arrtoRet = [];
            const prtPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
            let catNode;
            let getAll = this.visibleCollections.length === 0;
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.RelationalViews) > -1) {
                catNode = new relationalViewCategoryNode_1.RelationalViewCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.ObjectViews) > -1) {
                catNode = new objectViewCategoryNode_1.ObjectViewCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.XMLViews) > -1) {
                catNode = new xmlViewCategoryNode_1.XMLViewCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.MaterializedViews) > -1) {
                catNode = new materializedViewCategoryNode_1.MaterializedViewCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            this.children = arrtoRet;
        }
        this.expandNodeField = vscode_1.TreeItemCollapsibleState.Expanded;
        return this.children;
    }
}
exports.ViewCategoryNode = ViewCategoryNode;
