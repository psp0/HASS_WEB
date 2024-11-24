"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerCategoryNode = void 0;
const scriptExecutionModels_1 = require("../../models/scriptExecutionModels");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const tableTriggerCategoryNode_1 = require("./tableTriggerCategoryNode");
const vscode_1 = require("vscode");
class TriggerCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, schemaName, visibleCollections) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.triggersStr, utilities_1.TreeViewConstants.triggersStr, schemaName);
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
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.TableTriggers) > -1) {
                catNode = new tableTriggerCategoryNode_1.TableTriggerCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.ViewTriggers) > -1) {
                catNode = new tableTriggerCategoryNode_1.ViewTriggerCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.SchemaTriggers) > -1) {
                catNode = new tableTriggerCategoryNode_1.SchemaTriggerCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            if (getAll || this.visibleCollections.indexOf(scriptExecutionModels_1.FilterCollectionType.DatabaseTriggers) > -1) {
                catNode = new tableTriggerCategoryNode_1.DatabaseTriggerCategoryNode(this.getConnectionURI, prtPath, this.schemaName);
                arrtoRet.push(catNode);
            }
            this.children = arrtoRet;
        }
        this.expandNodeField = vscode_1.TreeItemCollapsibleState.Expanded;
        return this.children;
    }
}
exports.TriggerCategoryNode = TriggerCategoryNode;
