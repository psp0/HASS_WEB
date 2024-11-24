"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryHistoryManager = exports.QueryHistoryTreeDataProvider = exports.QueryHistoryModel = exports.QueryHistoryNode = exports.QueryHistoryGroupNode = void 0;
const vscode = require("vscode");
const events_1 = require("events");
const iExplorerNode_1 = require("./iExplorerNode");
const treeNodeBase_1 = require("./treeNodeBase");
const utilities_1 = require("./utilities");
const helper = require("../utilities/helper");
const helper_1 = require("../utilities/helper");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const question_1 = require("../prompts/question");
const queryBookmarkManager_1 = require("./queryBookmarkManager");
const util_1 = require("util");
const connectionRequest_1 = require("../models/connectionRequest");
const extension_1 = require("./../extension");
const editorUtils_1 = require("./editors/editorUtils");
class QueryHistoryGroupNode extends treeNodeBase_1.TreeNodeBase {
    constructor(groupName) {
        super("", "", groupName, iExplorerNode_1.ExplorerNodeType.Category, utilities_1.TreeViewConstants.historyGroupStr, new vscode.ThemeIcon('file-directory'), "");
    }
    getChildren() {
        return this.children;
    }
}
exports.QueryHistoryGroupNode = QueryHistoryGroupNode;
class QueryHistoryNode extends treeNodeBase_1.TreeNodeBase {
    constructor(sqlQuery, groupName, ownerUri) {
        super("", groupName, sqlQuery, iExplorerNode_1.ExplorerNodeType.Leaf, utilities_1.TreeViewConstants.historyItemStr, new vscode.ThemeIcon('history'), "");
        this.sqlQuery = sqlQuery;
        this.ownerUri = ownerUri;
    }
    getCommandObject() {
        return {
            command: constants_1.Constants.selectHistoryItem,
            title: constants_1.Constants.edit,
            arguments: [this],
        };
    }
    getTreeItem() {
        const treeItemObject = {};
        treeItemObject.label = this.getNodeIdentifier;
        treeItemObject.collapsibleState = this.getExpansionState();
        treeItemObject.contextValue = this.getContextValue;
        treeItemObject.iconPath = this.getIconPath;
        treeItemObject.tooltip = this.sqlQuery;
        return treeItemObject;
    }
}
exports.QueryHistoryNode = QueryHistoryNode;
class QueryHistoryModel {
    constructor() {
        this.modelChanged = new events_1.EventEmitter();
        this.MODEL_CHANGED = constants_1.Constants.modelChangedEvent;
    }
    get rootNodes() {
        return QueryHistoryModel.data;
    }
    hasData() {
        return QueryHistoryModel.data.length == 0 ? false : true;
    }
    updateModel(params) {
        switch (params.dataOp) {
            case (helper_1.Operation.Insert):
                {
                    this.insertData(params.queryVal, params.groupName, params.ownerUri, params.uniqueId);
                    break;
                }
            case (helper_1.Operation.Delete):
                {
                    this.deleteData(params.node);
                    break;
                }
            case (helper_1.Operation.DeleteAll):
                {
                    this.deleteAll();
                    break;
                }
        }
        this.modelChanged.emit(this.MODEL_CHANGED);
    }
    insertData(queryVal, groupName, ownerUri, uniqueId) {
        var newHistNode = new QueryHistoryNode(queryVal, groupName, ownerUri);
        if (!QueryHistoryModel.histMap.has(groupName)) {
            var grpHistNode = new QueryHistoryGroupNode(groupName);
            QueryHistoryModel.histMap.set(groupName, grpHistNode);
            grpHistNode.children = [newHistNode];
            QueryHistoryModel.data.unshift(grpHistNode);
        }
        else {
            var grpNode = QueryHistoryModel.histMap.get(groupName);
            if (grpNode.children && grpNode.children.length > 0) {
                grpNode.children = grpNode.children.filter((item) => item.sqlQuery != newHistNode.sqlQuery);
            }
            grpNode.children.unshift(newHistNode);
        }
    }
    deleteData(node) {
        if (node instanceof QueryHistoryNode) {
            QueryHistoryModel.histMap.get(node.parentPath).removeChild(node);
        }
        else {
            let grpNodeIndex = QueryHistoryModel.data.indexOf(node);
            if (grpNodeIndex > -1) {
                QueryHistoryModel.histMap.delete(node.getNodeIdentifier);
                QueryHistoryModel.data.splice(grpNodeIndex, 1);
            }
        }
    }
    deleteAll() {
        QueryHistoryModel.histMap.clear();
        QueryHistoryModel.data = [];
    }
    getChildren(node) {
        return node ? node.getChildren() : this.rootNodes;
    }
    addModelChangedHandler(handler) {
        this.modelChanged.on(this.MODEL_CHANGED, handler);
    }
}
exports.QueryHistoryModel = QueryHistoryModel;
QueryHistoryModel.data = [];
QueryHistoryModel.histMap = new Map();
class QueryHistoryTreeDataProvider {
    constructor(model) {
        this.model = model;
        this._varonDidChangeTreeData = new vscode.EventEmitter();
        this.nodes = new Map();
        this.onDidChangeTreeData = this._varonDidChangeTreeData.event;
        model.addModelChangedHandler((data) => {
            this.varonDidChangeTreeData.fire(data);
        });
    }
    get varonDidChangeTreeData() {
        return this._varonDidChangeTreeData;
    }
    set varonDidChangeTreeData(value) {
        this._varonDidChangeTreeData = value;
    }
    getTreeItem(element) {
        return element ? element.getTreeItem() : null;
    }
    async getChildren(element) {
        let children = await this.model.getChildren(element);
        if (children) {
            children.forEach((child) => {
                this.nodes.set(child.getNodeIdentifier, child);
            });
        }
        return Promise.resolve(children);
    }
}
exports.QueryHistoryTreeDataProvider = QueryHistoryTreeDataProvider;
class QueryHistoryManager {
    constructor(connectionCommandsHandler, vsCodeConnector, scriptExecutor, fileLogger, prompter, untitledDcoumentProvider) {
        this.connectionCommandsHandler = connectionCommandsHandler;
        this.vsCodeConnector = vsCodeConnector;
        this.scriptExecutor = scriptExecutor;
        this.fileLogger = fileLogger;
        this.prompter = prompter;
        this.untitledDocumentProvider = untitledDcoumentProvider;
        this.queryHistDataModel = new QueryHistoryModel();
        const treeDataProvider = new QueryHistoryTreeDataProvider(this.queryHistDataModel);
        vscode.window.createTreeView(constants_1.Constants.historyTreeview, { treeDataProvider });
        vscode.commands.registerCommand(constants_1.Constants.editHistoryItem, async (queryHistNode) => {
            try {
                this.fileLogger.info("Edit handler invoked");
                this.handleEdit(queryHistNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.openHistoryItem, async (queryHistNode) => {
            try {
                this.fileLogger.info("Open to editor handler invoked");
                this.openHistoryItem(queryHistNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.selectHistoryItem, async (queryHistNode) => {
            try {
                this.fileLogger.info("Select Handler invoked");
                this.handleEdit(queryHistNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.runHistoryItem, async (queryHistNode) => {
            try {
                this.fileLogger.info("Run Handler Invoked");
                this.handleRun(queryHistNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.deleteHistoryItem, async (queryHistNode) => {
            try {
                this.fileLogger.info("Delete Handler Invoked");
                this.handleDelete(queryHistNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.clearAllHistory, async () => {
            try {
                this.fileLogger.info("Clear All invoked");
                this.handleClearAll();
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.bookmarkQueryItemCommand, async (queryHistNode) => {
            try {
                this.fileLogger.info("Bookmark Handler Invoked");
                this.handleBookmarkQuery(queryHistNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        this.fileLogger.info("History module instantiated");
    }
    static CreateInstance(connectionCommandsHandler, vsCodeConnector, scriptExecutor, fileLogger, prompter, untitledDcoumentProvider) {
        try {
            if (QueryHistoryManager.pvtInstance == undefined) {
                QueryHistoryManager.pvtInstance = new QueryHistoryManager(connectionCommandsHandler, vsCodeConnector, scriptExecutor, fileLogger, prompter, untitledDcoumentProvider);
            }
            return QueryHistoryManager.pvtInstance;
        }
        catch (err) {
            helper.logErroAfterValidating(new Error(err));
        }
    }
    static Instance() {
        return QueryHistoryManager.pvtInstance;
    }
    updateModel(query, ownerUri, uniqueId) {
        if (!(0, util_1.isNullOrUndefined)(query) && !query.startsWith('--') && !query.startsWith('/*')) {
            let config = this.vsCodeConnector.getConfiguration(constants_1.Constants.extensionConfigSectionName);
            let enableHistory = false;
            if (config !== null && config !== undefined) {
                enableHistory = config.get(constants_1.Constants.historyEnablePropertyName);
            }
            if (enableHistory) {
                let connInfo = this.connectionCommandsHandler.getSavedConnectionProperties(ownerUri);
                if (connInfo) {
                    var conProperties = connInfo.connectionAttributes;
                    let formattedQuery = this.formatQueryString(query);
                    this.queryHistDataModel.updateModel({
                        dataOp: helper_1.Operation.Insert, queryVal: formattedQuery,
                        groupName: conProperties.uniqueName, ownerUri: ownerUri,
                        uniqueId: uniqueId
                    });
                }
            }
        }
    }
    formatQueryString(query) {
        var finalQuery = '';
        if (query.endsWith('/') || query.endsWith(';\r\n') ||
            query.endsWith(';\n')) {
            finalQuery += query;
        }
        else {
            if (query.endsWith(';') ||
                (!query.endsWith('\n') && !query.endsWith('\r\n'))) {
                finalQuery = finalQuery + query + '\n';
            }
        }
        return finalQuery;
    }
    async openHistoryItem(queryHistNode) {
        try {
            this.untitledDocumentProvider.createAndOpen(queryHistNode.sqlQuery);
        }
        catch (error) {
            helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
        }
    }
    async handleEdit(queryHistNode) {
        let systemManager = (0, extension_1.getSystemManager)();
        if (!systemManager.lastActiveTextEditor || !systemManager.lastActiveTextEditor.document || systemManager.lastActiveTextEditor.document.isClosed) {
            systemManager.lastActiveTextEditor = undefined;
        }
        let editor = this.vsCodeConnector.activeTextEditor != undefined ? this.vsCodeConnector.activeTextEditor :
            systemManager.lastActiveTextEditor;
        if (!editor || !editor.document || editor.document.languageId !== constants_1.Constants.oracleLanguageID) {
            let document = await vscode.workspace.openTextDocument({ language: constants_1.Constants.oracleLanguageID, content: "" });
            await vscode.languages.setTextDocumentLanguage(document, constants_1.Constants.oracleLanguageID);
            editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.Active, false);
        }
        if (editor) {
            let success;
            var selection = editor.selection;
            var pos = new vscode.Position(selection.end.line, selection.end.character);
            try {
                success = await editor.edit((editbuilder) => {
                    editbuilder.insert(pos, queryHistNode.getNodeIdentifier);
                });
            }
            catch (error) {
                systemManager.lastActiveTextEditor = undefined;
                let editor = await editorUtils_1.editorUtils.getNewEditor();
                if (editor && editor.document) {
                    selection = editor.selection;
                    success = await editor.edit((editbuilder) => {
                        editbuilder.insert(new vscode.Position(selection.end.line, selection.end.character), queryHistNode.getNodeIdentifier);
                    });
                }
            }
            if (success) {
                vscode.commands.executeCommand(constants_1.Constants.focusCurrentEditor);
            }
        }
    }
    async handleDelete(queryHistNode) {
        const question = {
            type: question_1.QuestionTypes.confirm,
            name: queryHistNode instanceof QueryHistoryNode ?
                localizedConstants_1.default.deleteHistoryItemConfirmation : localizedConstants_1.default.deleteHistoryFolderConfirmation,
            message: queryHistNode instanceof QueryHistoryNode ?
                localizedConstants_1.default.deleteHistoryItemConfirmation : localizedConstants_1.default.deleteHistoryFolderConfirmation,
        };
        try {
            const proceed = await this.prompter.promptSingle(question);
            if (proceed == undefined || !proceed) {
                return;
            }
            this.queryHistDataModel.updateModel({ dataOp: helper_1.Operation.Delete, node: queryHistNode });
        }
        catch (err) {
            helper.AppUtils.ShowErrorAndLog(err, this.vsCodeConnector);
        }
    }
    async handleClearAll() {
        if (!this.queryHistDataModel.hasData()) {
            return false;
        }
        const question = {
            type: question_1.QuestionTypes.confirm,
            name: localizedConstants_1.default.clearAllHistoryConfirmation,
            message: localizedConstants_1.default.clearAllHistoryConfirmation,
        };
        try {
            const proceed = await this.prompter.promptSingle(question);
            if (proceed == undefined || !proceed) {
                return;
            }
            this.queryHistDataModel.updateModel({ dataOp: helper_1.Operation.DeleteAll });
        }
        catch (err) {
            helper.AppUtils.ShowErrorAndLog(err, this.vsCodeConnector);
        }
    }
    async handleRun(queryHistNode) {
        try {
            var conProps = await this.connectionCommandsHandler.showConnections();
            if (conProps != undefined) {
                var connected = await this.connectionCommandsHandler.connect(QueryHistoryManager.ownerIdentifier, conProps, false, false, connectionRequest_1.ConnectionSource.QueryHistory);
                if (connected) {
                    utilities_1.QueryHistoryUtil.RunHistObject(queryHistNode, this.scriptExecutor, QueryHistoryManager.ownerIdentifier);
                }
            }
        }
        catch (err) {
            helper.AppUtils.ShowErrorAndLog(new Error(err), this.vsCodeConnector);
        }
    }
    async handleBookmarkQuery(queryHistNode) {
        try {
            queryBookmarkManager_1.QueryBookmarkManager.Instance().addQueryToBookmarks(queryHistNode.sqlQuery);
        }
        catch (err) {
            helper.AppUtils.ShowErrorAndLog(err, this.vsCodeConnector);
        }
    }
}
exports.QueryHistoryManager = QueryHistoryManager;
QueryHistoryManager.ownerIdentifier = constants_1.Constants.historyOwnerIdentifier;
