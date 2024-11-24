"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userNode = void 0;
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const tableCategoryNode_1 = require("./tableCategoryNode");
const viewCategoryNode_1 = require("./viewCategoryNode");
const procedureCategoryNode_1 = require("./procedureCategoryNode");
const functionCategoryNode_1 = require("./functionCategoryNode");
const packageCategoryNode_1 = require("./packageCategoryNode");
const triggerCategoryNode_1 = require("./triggerCategoryNode");
const synonymCategoryNode_1 = require("./synonymCategoryNode");
const sequenceCategoryNode_1 = require("./sequenceCategoryNode");
const vscode_1 = require("vscode");
const scriptExecutionModels_1 = require("../../models/scriptExecutionModels");
class userNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.userStr, new vscode_1.ThemeIcon('account'), iExplorerNode_1.ExplorerNodeType.Category, schemaName, objectName);
    }
    async getChildren() {
        return new Promise((resolve) => {
            if (!this.children) {
                resolve(this.getSubChildren());
            }
            else {
                resolve(this.children);
            }
        });
    }
    setExtendedProperties(dbo) {
        super.setExtendedProperties(dbo);
        this.schemaName = this.objectName;
    }
    getSubChildren() {
        if (!this.children) {
            const arrtoRet = [];
            const prtPath = utilities_1.ExplorerUtilities.getNodePath(this.getParentPath, this.getNodeIdentifier);
            let visColl = utilities_1.ExplorerUtilities.getVisibleCollections(this);
            let getAll = visColl.length === 0;
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
            this.children = arrtoRet;
        }
        return this.children;
    }
}
exports.userNode = userNode;
