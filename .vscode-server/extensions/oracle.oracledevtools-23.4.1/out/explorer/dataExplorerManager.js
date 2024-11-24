"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionNodeInfo = exports.ObjectNodeProperties = exports.DataExplorerManager = void 0;
const fs = require("fs");
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const helper = require("../utilities/helper");
const extension_1 = require("./../extension");
const logger_1 = require("./../infrastructure/logger");
const dataExplorerModel_1 = require("./dataExplorerModel");
const dataExplorerRequests_1 = require("./dataExplorerRequests");
const dataExplorerTreeDataProvider_1 = require("./dataExplorerTreeDataProvider");
const connectionNode_1 = require("./nodes/connectionNode");
const utilities_1 = require("./utilities");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const connectionSettingsManager_1 = require("../connectionManagement/connectionSettingsManager");
const path = require("path");
const vscode_1 = require("vscode");
const codeNavigationRequests_1 = require("../models/codeNavigationRequests");
const editorUtils_1 = require("./editors/editorUtils");
const question_1 = require("../prompts/question");
const adapter_1 = require("../prompts/adapter");
const setup_1 = require("../utilities/setup");
const documentConnectionInformation_1 = require("../connectionManagement/documentConnectionInformation");
const compilerSettingsManager_1 = require("./compilerSettingsManager");
const intellisenseModels_1 = require("../models/intellisenseModels");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const defaultConnectionManager_1 = require("../connectionManagement/defaultConnectionManager");
const connectionSettingsHelper_1 = require("../connectionManagement/connectionSettingsHelper");
const helper_1 = require("../utilities/helper");
const realTimeSqlMonitorServiceProvider_1 = require("../infrastructure/realTimeSqlMonitorServiceProvider");
const oracleCodeGenerationConstants_1 = require("../infrastructure/oracleCodeGeneration/oracleCodeGenerationConstants");
const oracleCodeGenerationUtils_1 = require("../infrastructure/oracleCodeGeneration/oracleCodeGenerationUtils");
class DataExplorerManager {
    constructor(vsCodeConnector, connectionCommandsHandler, context, scriptExecutor, filtersManager) {
        this.baseUri = utilities_1.TreeViewConstants.baseUri;
        this.vscodeConnector = undefined;
        this.describePanels = {};
        this.genStmtResponseCnt = 0;
        this.cloneFlag = true;
        this.prevConnName = "";
        this.connectionCommandsHandler = connectionCommandsHandler;
        this.extensionContext = context;
        this.dataExpModel = new dataExplorerModel_1.DataExplorerModel(this.baseUri, vsCodeConnector, connectionCommandsHandler, this);
        const treeDataProvider = new dataExplorerTreeDataProvider_1.DataExplorerTreeDataProvider(this.dataExpModel);
        utilities_1.ExplorerUtilities.registerRefreshMethod(treeDataProvider);
        this.dataExpTreeView = vscode.window.createTreeView(utilities_1.TreeViewConstants.explorerViewName, { treeDataProvider, canSelectMany: true });
        this.vscodeConnector = vsCodeConnector;
        this.scriptExecutor = scriptExecutor;
        this.treeDataProvider = treeDataProvider;
        this.generateStmtQueue = new Map();
        this.filtersManager = filtersManager;
        vscode.commands.registerCommand(constants_1.Constants.cmdRefreshAll, async () => {
            try {
                await this.dataExpModel.reloadAll(true);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerEditScriptCommand, async (treeNode, selectedNodes) => {
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerEditScript));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                let node = nodes[index];
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(node, node.ddexObjectType, this);
                let connectionNode = this.getConnectionNode(node.connectionURI);
                await editorUtils_1.editorUtils.openEditor(editorUri, connectionNode);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerDownloadScriptCommand, async (treeNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerDownloadScript));
                return;
            }
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, treeNode.ddexObjectType, this);
                await editorUtils_1.editorUtils.downloadEditorScript(editorUri, this, this.vscodeConnector, this.connectionCommandsHandler);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerDownloadPackageSpecCommand, async (treeNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerDownloadPackageSpec));
                return;
            }
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package, this);
                await editorUtils_1.editorUtils.downloadEditorScript(editorUri, this, this.vscodeConnector, this.connectionCommandsHandler);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerDownloadPackageBodyCommand, async (treeNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerDownloadPackageBody));
                return;
            }
            if (treeNode) {
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNode, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody, this);
                await editorUtils_1.editorUtils.downloadEditorScript(editorUri, this, this.vscodeConnector, this.connectionCommandsHandler);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerSaveToDatabaseCommand, async () => {
            await this.onSaveToDatabase();
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdRunCodeObjectFromFile, async () => {
            await this.onRunCodeObjectFromfile();
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdCompileObjectFromFile, async () => {
            await this.onCompileObjectFromFile(false);
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdCompileDebugObjectFromFile, async () => {
            await this.onCompileObjectFromFile(true);
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerRunCodeObjectCommand, async (treeNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerRunCodeObject));
                return;
            }
            if (treeNode) {
                let connectionNode = this.getConnectionNode(treeNode.connectionURI);
                let objectProperties = new ObjectNodeProperties(treeNode, connectionNode);
                let editorDoc = editorUtils_1.editorUtils.getEditorDocument(treeNode, treeNode.ddexObjectType, this);
                let [canRunCodeObject, saved] = await this.confirmToSaveBeforeRun(editorDoc, false);
                if (canRunCodeObject) {
                    await utilities_1.ExplorerUtilities.runCodeObjectFromOENode(objectProperties, scriptExecutor, this, false, undefined, undefined, undefined);
                }
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerCompileObjectCommand, async (treeNode, selectedNodes) => {
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerCompileObject));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                let node = nodes[index];
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(node, node.ddexObjectType, this);
                let editorDoc = editorUtils_1.editorUtils.getEditorDocumentFromUri(editorUri);
                await this.compileObject(editorUri, editorDoc, false);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerCompileDebugObjectCommand, async (treeNode, selectedNodes) => {
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerCompileDebugObject));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                let node = nodes[index];
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(node, node.ddexObjectType, this);
                let editorDoc = editorUtils_1.editorUtils.getEditorDocumentFromUri(editorUri);
                await this.compileObject(editorUri, editorDoc, true);
            }
        });
        this.dataExpModel.addConnectionsRefreshedHandler(async () => {
            await this.onConnectionsRefreshed();
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerEditPackageSpecCommand, async (treeNode, selectedNodes) => {
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNamePackageSpecification));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                let node = nodes[index];
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(node, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package, this);
                let connectionNode = this.getConnectionNode(node.connectionURI);
                await editorUtils_1.editorUtils.openEditor(editorUri, connectionNode);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerEditPackageBodyCommand, async (treeNode, selectedNodes) => {
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameOpenPackageBody));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                let node = nodes[index];
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(node, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody, this);
                let connectionNode = this.getConnectionNode(node.connectionURI);
                await editorUtils_1.editorUtils.openEditor(editorUri, connectionNode);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerEditPackageMethodCommand, async (treeNode, selectedNodes) => {
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerOpenMethod));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                let node = nodes[index];
                let parent = treeDataProvider.getParent(node);
                if (parent) {
                    await this.onEditPackageMethod(parent, node);
                }
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerShowDataCommand, async (treeNode, selectedNodes) => {
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerShowData));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                const node = nodes[index];
                let connectionNode = this.getConnectionNode(node.connectionURI);
                let objectProperties = new ObjectNodeProperties(node, connectionNode);
                let parent = treeDataProvider.getParent(node);
                await this.onShowData(objectProperties, scriptExecutor, node, parent);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerRefreshCommand, async (node, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerRefresh));
                return;
            }
            if (node) {
                await this.refreshNode(node);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerConnect, async (connNode, selectedNodes) => {
            let nodes = null;
            if (connNode) {
                nodes = [connNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerConnect));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                await this.onConnectionConnect(nodes[index]);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerDisconnect, async (connNode, selectedNodes) => {
            let nodes = null;
            if (connNode) {
                nodes = [connNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                nodes = selectedNodes;
                if (!helper_1.Utils.IsCommandSupportedbyAllNodes(constants_1.Constants.cmdExplorerDisconnect, nodes)) {
                    vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupportedOnAllNodes, localizedConstants_1.default.cmdNameDataExplorerDisconnect));
                    return;
                }
                if (!helper_1.Utils.IsMultipleCommandSupportedAcrossConnection(constants_1.Constants.cmdExplorerDisconnect, nodes)) {
                    vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupportedAcrossConnectionNodes, localizedConstants_1.default.cmdNameDataExplorerDisconnect));
                    return;
                }
            }
            for (let index = 0; index < nodes.length; index++) {
                await this.onConnectionDisconnect(nodes[index], false);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerNodeSelectedCommand, async (connNode, selectedNodes) => {
            if (connNode &&
                connNode.status !== connectionNode_1.ConnectionStatus.Connected &&
                connNode.status !== connectionNode_1.ConnectionStatus.Connecting) {
                await this.onConnectionConnect(connNode);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerConnectionRename, async (connectionNode, selectedNodes) => {
            try {
                logger_1.FileStreamLogger.Instance.info("Rename Connection handler invoked");
                if (selectedNodes && selectedNodes.length > 0) {
                    vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerRename));
                    return;
                }
                await this.renameConnection(connectionNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerConnectionClone, async (connectionNode, selectedNodes) => {
            try {
                if (selectedNodes && selectedNodes.length > 0) {
                    vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerClone));
                    return;
                }
                logger_1.FileStreamLogger.Instance.info("Clone Connection handler invoked");
                await this.cloneConnection(connectionNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerDescribeObjectCommand, async (treeNode, selectedNodes) => {
            logger_1.FileStreamLogger.Instance.info("Describe object handler invoked");
            let nodes = [treeNode];
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerDescribeObject));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                let node = nodes[index];
                let connectionNode = this.getConnectionNode(node.connectionURI);
                let objectProperties = new ObjectNodeProperties(node, connectionNode);
                await this.onDesribeObject(objectProperties);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerGenerateInsertCommand, async (treeNode, selectedNodes) => {
            logger_1.FileStreamLogger.Instance.info("Generate Insert statement handler invoked");
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerGenerateInsert));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                await this.onGenerateStatement(nodes[index], dataExplorerRequests_1.DataExplorerGenerateStatementType.Insert);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerGenerateSelectCommand, async (treeNode, selectedNodes) => {
            logger_1.FileStreamLogger.Instance.info("Generate Select statement handler invoked");
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerGenerateSelect));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                await this.onGenerateStatement(nodes[index], dataExplorerRequests_1.DataExplorerGenerateStatementType.Select);
            }
        });
        this.codeGenerationUtilities = new oracleCodeGenerationUtils_1.OracleCodeGenerationUtilities(this.vscodeConnector);
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerGenerateCodeCommand, async (...treeNodes) => {
            logger_1.FileStreamLogger.Instance.info("Generate Code handler invoked");
            if (!this.codeGenerationUtilities.checkAllNodesAreFromSameConnection(treeNodes)) {
                helper.AppUtils.ShowErrorAndLog(new Error(localizedConstants_1.default.errorSelectionFromMultipleConnections), this.vscodeConnector);
                return;
            }
            if (!this.codeGenerationUtilities.
                checkAllNodesAreValidCodeGenerationNodes(treeNodes)) {
                helper.AppUtils.ShowErrorAndLog(new Error(localizedConstants_1.default.errorSelectionOfWrongNodes), this.vscodeConnector);
                return;
            }
            let createNewDocument = false;
            let languageId = null;
            let useCurrentSchema = false;
            let editor = this.vscodeConnector.activeTextEditor;
            if (!editor || !editor.document || !oracleCodeGenerationConstants_1.OracleCodeGenerationConstants.s_vCodeGenerationLanguageIds.has(editor.document.languageId)) {
                createNewDocument = true;
            }
            else
                languageId = editor.document.languageId;
            let answers = await this.codeGenerationUtilities.askUserForCodeGenerationOptions(oracleCodeGenerationConstants_1.OracleCodeGenerationContext.DML, createNewDocument);
            if (createNewDocument && answers && answers.codeGenerationLanguage)
                languageId = answers.codeGenerationLanguage;
            if (!languageId)
                return;
            let clipboard = vscode.env.clipboard;
            let cbt = await clipboard.readText();
            let cn = this.codeGenerationUtilities.getConnectionNodeFromTreeNode(treeNodes[0]);
            let { driver, format } = this.codeGenerationUtilities.getDriverAndFormat(languageId);
            let cs = await this.codeGenerationUtilities.getConnectionStringCredentials(cn, driver, format);
            let ss = "";
            let clipboardText = null;
            let currentSchema = cn.connectionProperties.currentSchema ?
                oracleCodeGenerationUtils_1.OracleCodeGenerationUtilities.getStringObjectName(cn.connectionProperties.currentSchema) : cn.connectionProperties.currentSchema;
            let snippet = null;
            if (currentSchema) {
                snippet = "AdiCodegen1";
                switch (languageId) {
                    case oracleCodeGenerationConstants_1.OracleCodeGenerationLanguageIDs.csharp:
                        useCurrentSchema = true;
                        break;
                    default:
                        break;
                }
            }
            else {
                snippet = "AdiCodegen1_1";
            }
            ;
            let cgt = oracleCodeGenerationConstants_1.OracleCodeGenerationStatementType.Select;
            switch (cgt) {
                case oracleCodeGenerationConstants_1.OracleCodeGenerationStatementType.Select_Cartesian_Product:
                    ss = await this.codeGenerationUtilities.getSqlStatement(treeNodes, this.codeGenerationUtilities.getSelectedTablesViews(treeNodes), true, useCurrentSchema);
                    break;
                case oracleCodeGenerationConstants_1.OracleCodeGenerationStatementType.Select:
                    ss = await this.codeGenerationUtilities.getJoinStatement(treeNodes, true, useCurrentSchema);
                    break;
                case oracleCodeGenerationConstants_1.OracleCodeGenerationStatementType.Insert:
                    ss = "<Insert not implemented>";
                    break;
                case oracleCodeGenerationConstants_1.OracleCodeGenerationStatementType.Update:
                    ss = "<Update not implemented>";
                    break;
                case oracleCodeGenerationConstants_1.OracleCodeGenerationStatementType.Delete:
                    ss = "<Delete not implemented>";
                    break;
                case oracleCodeGenerationConstants_1.OracleCodeGenerationStatementType.ExecuteStoredProcedure:
                case oracleCodeGenerationConstants_1.OracleCodeGenerationStatementType.Default:
                    ss = "<not implemented>";
                    break;
                default:
                    ss = "undefined";
                    break;
            }
            switch (languageId) {
                case oracleCodeGenerationConstants_1.OracleCodeGenerationLanguageIDs.java:
                    clipboardText = `
command_text{${ss.replace(oracleCodeGenerationUtils_1.OracleJavaCodeGeneration.re2, "\\$1")}}
connection_string{${cs.connectionString.replace(oracleCodeGenerationUtils_1.OracleJavaCodeGeneration.re1, "\\$1")}}
`;
                    break;
                case oracleCodeGenerationConstants_1.OracleCodeGenerationLanguageIDs.python:
                    let generatorPython = new oracleCodeGenerationUtils_1.OraclePythonCodeGeneration();
                    clipboardText = `
command_text{${ss.replace(oracleCodeGenerationUtils_1.OraclePythonCodeGeneration.re2, "\\$1")}}
` + generatorPython.generateConnectionOpenCode(cs);
                    break;
                case oracleCodeGenerationConstants_1.OracleCodeGenerationLanguageIDs.javascript:
                    let generatorNodeJS = new oracleCodeGenerationUtils_1.OracleNodeJSCodeGeneration();
                    ss = ss.replace(oracleCodeGenerationUtils_1.OracleNodeJSCodeGeneration.re2, "\\$1");
                    clipboardText = `
command_text{${ss}}
` + generatorNodeJS.generateConnectionOpenCode(cs);
                    break;
                case oracleCodeGenerationConstants_1.OracleCodeGenerationLanguageIDs.csharp:
                    clipboardText = `
command_text{${ss.replace(oracleCodeGenerationUtils_1.OracleCSharpCodeGeneration.re2, "\"\"")}}
connection_string{${cs.connectionString.replace(oracleCodeGenerationUtils_1.OracleCSharpCodeGeneration.re1, "\\$1")}}
`;
                    if (currentSchema) {
                        clipboardText += `
current_schema{${currentSchema.replace(oracleCodeGenerationUtils_1.OracleCSharpCodeGeneration.re1, "\\$1")}}
`;
                    }
                    break;
                default:
                    break;
            }
            await clipboard.writeText(clipboardText);
            if (createNewDocument)
                editor = await this.codeGenerationUtilities.openNewDocument(languageId);
            await vscode.commands.executeCommand("editor.action.insertSnippet", { "name": `${snippet}` });
            await clipboard.writeText(cbt);
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerGenerateDeleteCommand, async (treeNode, selectedNodes) => {
            logger_1.FileStreamLogger.Instance.info("Generate Delete statement handler invoked");
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerGenerateDelete));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                await this.onGenerateStatement(nodes[index], dataExplorerRequests_1.DataExplorerGenerateStatementType.Delete);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorergenerateCreateCommand, async (treeNode, selectedNodes) => {
            logger_1.FileStreamLogger.Instance.info("Generate Create statement command invoked");
            let nodes = null;
            if (treeNode) {
                nodes = [treeNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerGenerateCreate));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                let node = nodes[index];
                if (node) {
                    switch (node.ddexObjectType) {
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTable:
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTable:
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTable:
                            node.ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Table;
                            break;
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLView:
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectView:
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalView:
                            node.ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_View;
                            break;
                        case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Synonym:
                            node.ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Synonym;
                            break;
                    }
                    await this.onGenerateStatement(node, dataExplorerRequests_1.DataExplorerGenerateStatementType.Create);
                }
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExploreSetDefaultConnectionCommand, async (connNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerSetDefaultConnection));
                return;
            }
            await this.onSetUnsetDefaultConnection(connNode, connectionNode_1.ConnAssocType.Default, true);
        });
        vscode.commands.registerCommand(constants_1.Constants.dataExplorerUnsetDefaultConnectionCommand, async (connNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerUnsetDefaultConnection));
                return;
            }
            await this.onSetUnsetDefaultConnection(connNode, connectionNode_1.ConnAssocType.NonDefault, true);
        });
        vscode.commands.registerCommand(constants_1.Constants.realTimeSqlMonitoringCommandName, async (connNode, selectedNodes) => {
            let nodes = null;
            if (connNode) {
                nodes = [connNode];
            }
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerRealtimeSqlMonitoring));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                await this.onRealTimeSqlMonitoring(nodes[index]);
            }
        });
        vscode.window.onDidChangeActiveColorTheme(async (theme) => {
            logger_1.FileStreamLogger.Instance.info(`Color Theme Kind changed to ${theme.kind}`);
            setup_1.Setup.CurrentColorThemeKind = theme.kind;
            this.dataExpModel.raiseModelChangedEvent();
        });
    }
    static CreateInstance(vsCodeConnector, connectionCommandsHandler, context, scriptExecutor, filtersManager) {
        try {
            if (DataExplorerManager.instance === undefined) {
                DataExplorerManager.instance = new DataExplorerManager(vsCodeConnector, connectionCommandsHandler, context, scriptExecutor, filtersManager);
            }
            return DataExplorerManager.instance;
        }
        catch (err) {
            helper.logErroAfterValidating(new Error(err));
        }
    }
    static get Instance() {
        return DataExplorerManager.instance;
    }
    async onConfigurationChanged(configEvent) {
        await this.dataExpModel.handleProfileChanged(configEvent);
    }
    async onSetUnsetDefaultConnection(connNode, connAssocType, fromCtxtMenu) {
        try {
            if (connNode.connAssocType !== connAssocType) {
                if (connAssocType === connectionNode_1.ConnAssocType.Default) {
                    let defaultConnNode = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnectionForScope(connNode.connectionProperties.configurationTarget, connNode.connectionProperties.workspaceFolder);
                    if (defaultConnNode) {
                        defaultConnNode.connAssocType = connectionNode_1.ConnAssocType.NonDefault;
                        defaultConnNode.setNodeIdentifier = utilities_1.ExplorerUtilities.getConnectionNodeID(defaultConnNode.nodeLabel, defaultConnNode.connectionId, defaultConnNode.status, defaultConnNode.status, defaultConnNode.getNodeIdentifier, connectionNode_1.ConnAssocType.NonDefault);
                    }
                }
                connNode.connAssocType = connAssocType;
                connNode.setNodeIdentifier = utilities_1.ExplorerUtilities.getConnectionNodeID(connNode.nodeLabel, connNode.connectionId, connNode.status, connNode.status, connNode.getNodeIdentifier, connNode.connAssocType);
                this.dataExpModel.raiseModelChangedEvent();
                this.dataExpTreeView.reveal(connNode, { select: true, focus: true });
                if (connAssocType === connectionNode_1.ConnAssocType.Default) {
                    defaultConnectionManager_1.DefaultConnectionManager.instance.updateDefaultConnection(connNode.connectionProperties.name, connNode.connectionProperties.configurationTarget, connNode.connectionProperties.workspaceFolder, fromCtxtMenu);
                    if (this.vscodeConnector.isActiveOracleFile) {
                        defaultConnectionManager_1.DefaultConnectionManager.instance.associateDefaultConnectionToFile(this.vscodeConnector.activeTextEditor.document, connNode.connectionProperties.uniqueName);
                    }
                }
                else {
                    let defaultConnNode = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnectionForScope(connNode.connectionProperties.configurationTarget, connNode.connectionProperties.workspaceFolder);
                    if (defaultConnNode && defaultConnNode.connectionProperties.name === connNode.connectionProperties.name) {
                        defaultConnectionManager_1.DefaultConnectionManager.instance.updateDefaultConnection("", connNode.connectionProperties.configurationTarget, connNode.connectionProperties.workspaceFolder, fromCtxtMenu);
                    }
                }
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on setting or unsetting default connection");
            helper.logErroAfterValidating(err);
        }
    }
    async onRealTimeSqlMonitoring(connNode) {
        return realTimeSqlMonitorServiceProvider_1.RealTimeSqlMonitorServiceProvider.instance.onRealTimeSqlMonitoring(connNode);
    }
    async refreshNode(node) {
        try {
            if (node) {
                let oenode = node;
                while (oenode && !oenode.canRefresh) {
                    oenode = oenode.parent;
                }
                if (!oenode) {
                    return;
                }
                let treeNode = oenode;
                let isDatabaseObject = oenode["isDatabaseObject"] === true;
                if (isDatabaseObject) {
                    let connectionNode = this.getConnectionNode(treeNode.connectionURI);
                    let objectProperties = new ObjectNodeProperties(oenode, connectionNode);
                    let [response, connOpen] = await utilities_1.ExplorerUtilities.getBasicPropertiesFromDB(objectProperties);
                    if (!connOpen) {
                        let connectionNode = this.getConnectionNode(oenode.connectionURI);
                        if (connectionNode) {
                            this.onConnectionDisconnect(connectionNode, true);
                        }
                        return;
                    }
                    if (response && response.object && response.object.objectExists) {
                        let codeobj = treeNode.databaseObject;
                        if (codeobj && codeobj.isCompiledWithDebug !== undefined) {
                            codeobj.status = (response.object.status === dataExplorerRequests_1.Status.Valid) ? "VALID" : "INVALID";
                            codeobj.isCompiledWithDebug = response.object.compiledWithDebug;
                        }
                        treeNode.reset();
                        treeNode.toolTipMsg = utilities_1.ExplorerUtilities.getNodeToolTip(treeNode);
                        utilities_1.ExplorerUtilities.refreshNode(oenode);
                    }
                    else {
                        let parent = treeNode.parent;
                        if (parent) {
                            parent.removeChild(treeNode);
                            utilities_1.ExplorerUtilities.refreshNode(parent);
                        }
                    }
                }
                else {
                    treeNode.reset();
                    utilities_1.ExplorerUtilities.refreshNode(treeNode);
                }
            }
        }
        catch (error) {
            helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
        }
    }
    async onEditPackageMethod(parent, treeNode) {
        let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(parent, parent.ddexObjectType, this);
        let connectionNode = this.getConnectionNode(parent.connectionURI);
        await editorUtils_1.editorUtils.openEditor(editorUri, connectionNode);
        logger_1.FileStreamLogger.Instance.info("Editor opened for package method...");
        if (!treeNode.children)
            treeNode.getChildren();
        let dbMethodParameters = treeNode.children;
        var documentSymbolList = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(codeNavigationRequests_1.SymbolInformationRequest.type, new codeNavigationRequests_1.SymbolInformationParam(this.vscodeConnector.activeTextEditorUri));
        var foundMethod = false;
        for (var i = 1; i < documentSymbolList.length && !foundMethod; ++i)
            switch (documentSymbolList[i].localObjectType) {
                case intellisenseModels_1.LocalSymbolType.Procedure:
                case intellisenseModels_1.LocalSymbolType.Function:
                    if (treeNode.getNodeIdentifier == documentSymbolList[i].objectName)
                        foundMethod = this.areParamatersEqual(dbMethodParameters, documentSymbolList[i].symbolParams);
                    break;
            }
        if (!foundMethod) {
            var startPos = new vscode_1.Position(0, 0);
            this.vscodeConnector.activeTextEditor.selection = new vscode.Selection(startPos, startPos);
            const methodNotFound = helper.stringFormatterCsharpStyle(localizedConstants_1.default.packageMethodNotFound, treeNode.getNodeIdentifier);
            this.vscodeConnector.showErrorMessage(methodNotFound);
            logger_1.FileStreamLogger.Instance.info(methodNotFound);
        }
        else {
            var newPosition = new vscode_1.Position(documentSymbolList[i - 1].startLine, 0);
            var range = new vscode.Range(newPosition, newPosition);
            this.vscodeConnector.activeTextEditor.revealRange(range, 2);
            var newSelection = new vscode.Selection(newPosition, newPosition);
            this.vscodeConnector.activeTextEditor.selection = newSelection;
            logger_1.FileStreamLogger.Instance.info("Package method " + treeNode.getNodeIdentifier + " found successfully");
        }
    }
    async confirmToSaveBeforeRun(document, compileDebug) {
        let proceed = true;
        let saved = false;
        try {
            if (document) {
                await vscode.window.showTextDocument(document, { preview: false });
                let file = (0, extension_1.getSystemManager)().codeEditorProvider.openfiles.get(document.uri.toString());
                if (document.isDirty && !document.isClosed && document.uri && document.uri.fsPath) {
                    let promptMessage = undefined;
                    let filename = path.parse(document.uri.fsPath).base;
                    let params = editorUtils_1.editorUtils.getQueryParameters(document.uri);
                    if (params) {
                        let [response, connOpen] = await utilities_1.ExplorerUtilities.getObjectBasicPropertiesFromDB(params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, undefined);
                        if (file) {
                            let mtime = new Date(response.object.modifiedDateTime).getTime();
                            if (mtime > file.mtime) {
                                promptMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.modifiedInDatabaseMsg, editorUtils_1.editorUtils.getObjectTypeFromDdexType(params.ddexObjectType), params.objectname);
                            }
                        }
                    }
                    if (!promptMessage) {
                        filename = helper.truncateFileName(filename);
                        promptMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.saveUnsavedChanges, filename);
                    }
                    const question = {
                        type: question_1.QuestionTypes.confirm,
                        name: promptMessage,
                        message: promptMessage
                    };
                    let prompter = new adapter_1.default();
                    let confirmed = await prompter.promptSingle(question);
                    if (confirmed) {
                        file.overwriteOnSave = true;
                        file.compileDebugOnSave = true;
                        proceed = await document.save();
                        file.compileDebugOnSave = false;
                        saved = true;
                        file.overwriteOnSave = false;
                        proceed = proceed && !editorUtils_1.editorUtils.hasErrorsOnSave(document.uri);
                    }
                    else if (confirmed === undefined || confirmed === null) {
                        proceed = false;
                    }
                }
                else {
                    editorUtils_1.editorUtils.refreshEditorContents();
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("Error on saving unsaved changes in editor before Run");
            helper.logErroAfterValidating(error);
        }
        return [proceed, saved];
    }
    async confirmCompiledWithDebug(editorUri) {
        let proceed = false;
        logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Start");
        try {
            let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
            let [response, connOpen] = await utilities_1.ExplorerUtilities.getObjectBasicPropertiesFromDB(params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, undefined);
            if (response.object.status === dataExplorerRequests_1.Status.Valid) {
                if (!response.object.compiledWithDebug) {
                    let promptMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.compileDebug, params.schemaname, params.objectname);
                    const question = { type: question_1.QuestionTypes.confirm, name: promptMessage, message: promptMessage };
                    let prompter = new adapter_1.default();
                    logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Object is not compiled with debug, prompting to compile with debug");
                    let confirmed = await prompter.promptSingle(question);
                    if (confirmed) {
                        logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Confirmed to compile with debug");
                        let editorDoc = editorUtils_1.editorUtils.getEditorDocumentFromUri(editorUri);
                        await this.compileObject(editorUri, editorDoc, true);
                        let [response, connOpen] = await utilities_1.ExplorerUtilities.getObjectBasicPropertiesFromDB(params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, undefined);
                        if (response.object.status === dataExplorerRequests_1.Status.Valid) {
                            proceed = true;
                        }
                        else {
                            logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Object is not valid");
                            this.vscodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                            proceed = false;
                        }
                    }
                    else if (confirmed === undefined || confirmed === null) {
                        logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - cancelled compile with debug prompt");
                        proceed = false;
                    }
                    else {
                        logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Confirmed not compile with debug");
                        proceed = true;
                    }
                }
                else {
                    logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Object is compiled with debug");
                    proceed = true;
                }
            }
            else {
                logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - Object is not valid");
                this.vscodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug- Error on confirming the object is compiled with debug.");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("confirmCompiledWithDebug - End");
        return proceed;
    }
    areParamatersEqual(dbMethodParameters, parsedParameters) {
        let db_param_isNull = dbMethodParameters == null || dbMethodParameters.length == 0;
        let parsed_param_isNull = parsedParameters == null || parsedParameters.length == 0;
        if (db_param_isNull || parsed_param_isNull)
            return parsed_param_isNull && db_param_isNull;
        if (dbMethodParameters.length != parsedParameters.length)
            return false;
        for (var symbol_i = 0; symbol_i < dbMethodParameters.length; ++symbol_i)
            if (parsedParameters[symbol_i].name != dbMethodParameters[symbol_i].databaseObject['name'])
                return false;
            else if (parsedParameters[symbol_i].dbDataType.toUpperCase() != dbMethodParameters[symbol_i].databaseObject['dataTypeName']
                && !parsedParameters[symbol_i].derivedDataType)
                return false;
        return true;
    }
    async onConnectionConnect(connNode, isGotoProvider = false) {
        let connName = connNode.connectionProperties.uniqueName;
        let progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.connectingConnection, connName);
        await vscode.window.withProgress({ location: vscode_1.ProgressLocation.Notification, title: progressTitle }, (progress, token) => {
            var p = new Promise(async (resolve) => {
                try {
                    await this.onConnectionConnectContinue(connNode, isGotoProvider);
                }
                catch (err) {
                    logger_1.FileStreamLogger.Instance.info("Error on connecting connection- " + connName);
                    helper.logErroAfterValidating(err);
                }
                finally {
                    resolve();
                }
            });
            return p;
        });
    }
    async onConnectionConnectContinue(connNode, isGotoProvider = false) {
        try {
            if (connNode && connNode.status != connectionNode_1.ConnectionStatus.Connected) {
                if (connNode.status === connectionNode_1.ConnectionStatus.Connecting) {
                    this.vscodeConnector.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgAlreadyConnecting, connNode.connectionProperties.uniqueName));
                }
                let oldConnStatus = connNode.status;
                await this.connectionCommandsHandler.doDisconnect(connNode.connectionURI, false);
                connNode.children = undefined;
                let connected = await connNode.connectToDatabase();
                if (connected) {
                    connNode.setExpand(vscode_1.TreeItemCollapsibleState.Expanded);
                    connNode.status = connectionNode_1.ConnectionStatus.Connected;
                }
                else {
                    connNode.setExpand(vscode_1.TreeItemCollapsibleState.Collapsed);
                    connNode.children = undefined;
                    connNode.status = connectionNode_1.ConnectionStatus.Errored;
                }
                connNode.setNodeIdentifier = utilities_1.ExplorerUtilities.getConnectionNodeID(connNode.nodeLabel, connNode.connectionId, connNode.status, oldConnStatus, connNode.getNodeIdentifier, connNode.connAssocType);
                this.dataExpModel.raiseModelChangedEvent();
                if (!isGotoProvider)
                    this.dataExpTreeView.reveal(connNode, { select: true, focus: true });
            }
        }
        catch (error) {
            connNode.status = connectionNode_1.ConnectionStatus.Disconnected;
            helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
        }
    }
    selectNode(node) {
        this.dataExpTreeView.reveal(node, { select: true, focus: true });
    }
    async onConnectionDisconnect(connNode, showMessage) {
        if (connNode.status === connectionNode_1.ConnectionStatus.Disconnected) {
            return;
        }
        let connName = connNode.connectionProperties.uniqueName;
        let progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.disconnectingConnection, connName);
        await vscode.window.withProgress({ location: vscode_1.ProgressLocation.Notification, title: progressTitle }, (progress, token) => {
            var p = new Promise(async (resolve) => {
                try {
                    await this.onConnectionDisconnectContinue(connNode, showMessage);
                }
                catch (err) {
                    logger_1.FileStreamLogger.Instance.info("Error on disconnecting connection- " + connName);
                    helper.logErroAfterValidating(err);
                }
                finally {
                    resolve();
                }
            });
            return p;
        });
    }
    async onConnectionDisconnectContinue(connNode, showMessage) {
        try {
            if (connNode) {
                let oldConnStatus = connNode.status;
                await this.connectionCommandsHandler.doDisconnect(connNode.connectionURI, false);
                connNode.setExpand(vscode_1.TreeItemCollapsibleState.Collapsed);
                connNode.children = undefined;
                connNode.status = connectionNode_1.ConnectionStatus.Disconnected;
                connNode.setNodeIdentifier = utilities_1.ExplorerUtilities.getConnectionNodeID(connNode.nodeLabel, connNode.connectionId, connNode.status, oldConnStatus, connNode.getNodeIdentifier, connNode.connAssocType);
                if (!connNode.connectionProperties.passwordSaved) {
                    connNode.connectionProperties.password = undefined;
                    connNode.connectionProperties.proxyPassword = undefined;
                }
                this.dataExpModel.raiseModelChangedEvent();
                await this.dataExpTreeView.reveal(connNode, { select: true, focus: true });
                if (showMessage) {
                    let errorMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.disconnectedConnection, connNode.connectionProperties.uniqueName);
                    helper.AppUtils.ShowErrorAndLog(new Error(errorMsg), this.vscodeConnector);
                }
            }
        }
        catch (error) {
            helper.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
        }
    }
    async renameConnection(connNode) {
        let oldConnName = connNode.connectionProperties.name;
        vscode.window.showInputBox({
            placeHolder: localizedConstants_1.default.bookmarkRename, value: oldConnName,
            validateInput: (newname) => {
                if (newname && newname.trim().length > 0) {
                    return undefined;
                }
                else {
                    return localizedConstants_1.default.connectionNameNotValid;
                }
            }
        })
            .then(async (newConnName) => {
            if (newConnName) {
                newConnName = newConnName.trim();
                if (helper.isNotEmpty(newConnName) && newConnName !== oldConnName) {
                    let progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.renamingConnection, oldConnName, newConnName);
                    vscode.window.withProgress({ location: vscode_1.ProgressLocation.Notification, title: progressTitle }, (progress, token) => {
                        var p = new Promise(async (resolve) => {
                            try {
                                await this.renameConnectionContinue(connNode, oldConnName, newConnName, false);
                            }
                            catch (err) {
                                logger_1.FileStreamLogger.Instance.info("Error on renaming connection- " + oldConnName + " to " + newConnName);
                                helper.logErroAfterValidating(err);
                            }
                            finally {
                                resolve();
                            }
                        });
                        return p;
                    });
                }
            }
        });
    }
    async renameConnectionFromConnectionUI(oldConnName, newConnName, configurationTarget, workspaceFolder, useCredStoreSettings) {
        let profileToReturn = undefined;
        const connectionNodes = this.dataExpModel.rootNodes;
        if (connectionNodes) {
            const oldConnUniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(oldConnName, configurationTarget, workspaceFolder);
            const oldConnNode = this.getConnectionNodeFromConnectionUniqueName(oldConnUniqueName);
            if (oldConnNode) {
                profileToReturn = await this.renameConnectionContinue(oldConnNode, oldConnName, newConnName, useCredStoreSettings);
            }
        }
        return profileToReturn;
    }
    async renameConnectionContinue(connNode, oldConnName, newConnName, fromConnectionUI) {
        let profileToReturn = undefined;
        try {
            const oldConnUniqueName = connNode.connectionProperties.uniqueName;
            const newConnUniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(newConnName, connNode.connectionProperties.configurationTarget, connNode.connectionProperties.workspaceFolder);
            const connectionSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
            if (!connectionSettings.checkProfileNameForUniqueness(newConnUniqueName)) {
                this.vscodeConnector.showErrorMessage(localizedConstants_1.default.profileNameNotUnique);
                return;
            }
            await connectionSettings.PostProcessReadProfileCredsAsync(connNode.connectionProperties);
            let newprofile = Object.assign({}, connNode.connectionProperties);
            let oldprofile = Object.assign({}, connNode.connectionProperties);
            newprofile.name = newConnName;
            newprofile.uniqueName = newConnUniqueName;
            newprofile.configurationTarget = connNode.connectionProperties.configurationTarget;
            newprofile.workspaceFolder = connNode.connectionProperties.workspaceFolder;
            this.renamedConnectionNodeInfo = new ConnectionNodeInfo(oldConnUniqueName, newConnUniqueName, connNode.connectionUniqueId);
            this.connectionToSelect = newConnUniqueName;
            await this.connectionCommandsHandler.connectionLogicMgr.saveVsCodeProfile(newprofile, oldConnUniqueName, fromConnectionUI);
            let message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.connectionRenamed, oldConnName, newConnName);
            if (newprofile.passwordSaved && (newprofile.passwordStore !== oldprofile.passwordStore)) {
                let fromCredStore = constants_1.Constants.credStoreSettingValueSettings;
                switch (oldprofile.passwordStore) {
                    case scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSecretStorage:
                        fromCredStore = constants_1.Constants.credStoreSettingValueSecretStorage;
                        break;
                    default:
                        break;
                }
                let toCredStore = constants_1.Constants.credStoreSettingValueSettings;
                switch (newprofile.passwordStore) {
                    case scriptExecutionModels_1.ConnectionCredStoreType.VSCodeSecretStorage:
                        toCredStore = constants_1.Constants.credStoreSettingValueSecretStorage;
                        break;
                    default:
                        break;
                }
                let credStoreMigratedMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConnProfileCredStoreMigrated, fromCredStore, toCredStore);
                message = `${message} ${credStoreMigratedMessage}`;
            }
            this.vscodeConnector.showInformationMessage(message);
            this.connectionCommandsHandler.connectionLogicMgr.renameRecentlyUsedConnection(oldprofile, newprofile);
            await defaultConnectionManager_1.DefaultConnectionManager.instance.connectionRenamed(oldprofile, newprofile);
            profileToReturn = newprofile;
        }
        catch (err) {
            this.renamedConnectionNodeInfo = undefined;
            this.connectionToSelect = undefined;
            helper.AppUtils.ShowErrorAndLog(err, this.vscodeConnector);
        }
        return profileToReturn;
    }
    getUniqueDefaultName(connNode, oldConnName) {
        let defaultConnName = `${oldConnName}${localizedConstants_1.default.dashCopy}`;
        let defaultConnUniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(defaultConnName, connNode.connectionProperties.configurationTarget, connNode.connectionProperties.workspaceFolder);
        const connectionSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
        let index = 2;
        while (!connectionSettings.checkProfileNameForUniqueness(defaultConnUniqueName)) {
            defaultConnName = `${oldConnName}${localizedConstants_1.default.dashCopy}-${index}`;
            defaultConnUniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(defaultConnName, connNode.connectionProperties.configurationTarget, connNode.connectionProperties.workspaceFolder);
            index++;
        }
        return defaultConnName;
    }
    async cloneConnection(connNode) {
        let oldConnName = connNode.connectionProperties.name;
        let defaultConnName = this.getUniqueDefaultName(connNode, oldConnName);
        this.cloneFlag = true;
        this.prevConnName = "";
        while (this.cloneFlag) {
            let cloneConnName = await vscode.window.showInputBox({
                placeHolder: localizedConstants_1.default.bookmarkClone,
                value: (this.prevConnName == "") ? defaultConnName : this.prevConnName,
                validateInput: (newname) => {
                    if (newname && newname.trim().length > 0 && oldConnName !== newname)
                        return undefined;
                    return localizedConstants_1.default.connectionNameNotValid;
                }
            });
            if (cloneConnName) {
                cloneConnName = cloneConnName.trim();
                if (helper.isNotEmpty(cloneConnName) && cloneConnName !== oldConnName) {
                    let progressTitle = helper.stringFormatterCsharpStyle(localizedConstants_1.default.cloningConnection, oldConnName, cloneConnName);
                    await vscode.window.withProgress({ location: vscode_1.ProgressLocation.Notification, title: progressTitle }, async (progress, token) => {
                        try {
                            await this.cloneConnectionContinue(connNode, oldConnName, cloneConnName);
                        }
                        catch (err) {
                            logger_1.FileStreamLogger.Instance.info("Error on cloning connection- " + oldConnName + " to " + cloneConnName);
                            helper.logErroAfterValidating(err);
                        }
                    });
                }
            }
            else {
                this.cloneFlag = false;
            }
        }
    }
    async cloneConnectionContinue(connNode, oldConnName, cloneConnName) {
        let profileToReturn = undefined;
        try {
            const connectionSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
            let cloneConnUniqueName = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(cloneConnName, connNode.connectionProperties.configurationTarget, connNode.connectionProperties.workspaceFolder);
            if (!connectionSettings.checkProfileNameForUniqueness(cloneConnUniqueName)) {
                this.vscodeConnector.showErrorMessage(localizedConstants_1.default.profileNameNotUnique);
                this.prevConnName = cloneConnName;
                return;
            }
            await connectionSettings.PostProcessReadProfileCredsAsync(connNode.connectionProperties);
            let cloneprofile = Object.assign({}, connNode.connectionProperties);
            cloneprofile.name = cloneConnName;
            cloneprofile.uniqueName = cloneConnUniqueName;
            cloneprofile.configurationTarget = connNode.connectionProperties.configurationTarget;
            cloneprofile.workspaceFolder = connNode.connectionProperties.workspaceFolder;
            await connectionSettings.addConnection(cloneprofile, null);
            this.vscodeConnector.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.connectionCloned, oldConnName, cloneConnName));
            profileToReturn = cloneprofile;
            this.cloneFlag = false;
        }
        catch (err) {
            helper.AppUtils.ShowErrorAndLog(err, this.vscodeConnector);
        }
        return profileToReturn;
    }
    init() {
        try {
            let storageDir = "";
            try {
                const extensionContextExt = this.extensionContext;
                if (extensionContextExt && extensionContextExt.globalStoragePath) {
                    storageDir = extensionContextExt.globalStoragePath;
                    logger_1.FileStreamLogger.Instance.info("GlobalStoragePath is not empty-" + extensionContextExt.globalStoragePath);
                }
                else {
                    storageDir = this.extensionContext.extensionPath;
                    logger_1.FileStreamLogger.Instance.info("GlobalStoragePath is empty, ExtensionPath is-" + this.extensionContext.extensionPath);
                }
                logger_1.FileStreamLogger.Instance.info("Extension storage directory is- " + storageDir);
            }
            catch (err) {
                logger_1.FileStreamLogger.Instance.info("Error on getting storage directory. Setting storage directory to ExtensionPath- " +
                    this.extensionContext.extensionPath);
                storageDir = this.extensionContext.extensionPath;
                helper.logErroAfterValidating(err);
            }
            if (!fs.existsSync(storageDir)) {
                logger_1.FileStreamLogger.Instance.info("Creating  storage directory- " + storageDir);
                fs.mkdirSync(storageDir);
                logger_1.FileStreamLogger.Instance.info("Done creating  storage directory- " + storageDir);
            }
            this.fileStorageRootDirectory = storageDir + "/" + constants_1.Constants.tempDirectory;
            logger_1.FileStreamLogger.Instance.info("File storage root directory is- " + this.fileStorageRootDirectory);
            if (!fs.existsSync(this.fileStorageRootDirectory)) {
                logger_1.FileStreamLogger.Instance.info("Creating  storage root directory- " + this.fileStorageRootDirectory);
                fs.mkdirSync(this.fileStorageRootDirectory);
                logger_1.FileStreamLogger.Instance.info("Done creating  storage root directory- " + this.fileStorageRootDirectory);
            }
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendNotification(dataExplorerRequests_1.DataExplorerIntializedEventStronglyTyped.event, ({
                StorageDirectory: this.fileStorageRootDirectory,
            }));
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
    }
    async onShowData(objectProperties, scriptExecutor, treeNode, parent) {
        await utilities_1.ExplorerUtilities.onShowData(objectProperties, scriptExecutor, treeNode, parent);
    }
    deleteFileStorage() {
        if (this.fileStorageDirectory !== undefined) {
            try {
                logger_1.FileStreamLogger.Instance.info("Deleting storage folder- " + this.fileStorageDirectory);
                this.deleteFolderRecursive(this.fileStorageDirectory);
                logger_1.FileStreamLogger.Instance.info("Done deleting storage folder- " + this.fileStorageDirectory);
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Error on deleting storage folder" + this.fileStorageDirectory);
                logger_1.FileStreamLogger.Instance.error(error.message);
            }
        }
    }
    deleteFolderRecursive(path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file) => {
                const curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.deleteFolderRecursive(curPath);
                }
                else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
    async onSaveToDatabase() {
        try {
            if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document &&
                vscode.window.activeTextEditor.document.uri && !this.vscodeConnector.isActiveDocumentEmpty()) {
                const systemManager = (0, extension_1.getSystemManager)();
                let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(vscode.window.activeTextEditor.document);
                if (explorerFile) {
                    await vscode.window.activeTextEditor.document.save();
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on saving to database");
            helper.logErroAfterValidating(error);
        }
    }
    async onRunCodeObjectFromfile() {
        try {
            const systemManager = (0, extension_1.getSystemManager)();
            if (systemManager.isExtensionInitialized() && systemManager.documentIsOpenAndOracle()) {
                if (this.vscodeConnector.isActiveDocumentEmpty()) {
                    return;
                }
                if (this.vscodeConnector.activeTextEditor && this.vscodeConnector.activeTextEditor.document &&
                    this.vscodeConnector.activeTextEditor.document.uri) {
                    let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(vscode.window.activeTextEditor.document);
                    if (runnableFile) {
                        if (editorUtils_1.editorUtils.verifyConnectedToDatabase(this.vscodeConnector.activeTextEditor.document.uri, this, this.vscodeConnector)) {
                            let [canRunCodeObject, saved] = await this.confirmToSaveBeforeRun(vscode.window.activeTextEditor.document, false);
                            if (canRunCodeObject) {
                                await utilities_1.ExplorerUtilities.runCodeObjectFromFile(this.vscodeConnector.activeTextEditor.document.uri, this.scriptExecutor, this, false, undefined, undefined, undefined);
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on running code object from file");
            helper.logErroAfterValidating(error);
        }
    }
    async onConnectionsRefreshed() {
        let currentConnsUri = this.dataExpModel.rootNodes.map(node => node.connectionURI);
        (0, extension_1.getSystemManager)().codeEditorProvider.onConnectionsRefreshed(currentConnsUri);
    }
    getParentNode(treeNode) {
        let parentNode = this.treeDataProvider.getParent(treeNode);
        return parentNode;
    }
    getConnectionNode(connectionUri) {
        let connectionNode = undefined;
        if (this.dataExpModel.rootNodes !== undefined) {
            connectionNode = this.dataExpModel.rootNodes.
                find((node) => node.connectionURI === connectionUri);
        }
        return connectionNode;
    }
    getConnectionNodeFromConnectionScope(connectionName, configurationTarget, workspaceFolder) {
        let connectionNode = undefined;
        try {
            if (this.dataExpModel.rootNodes !== undefined) {
                let node = this.dataExpModel.rootNodes.
                    find(node => {
                    let connProps = node.connectionProperties;
                    return helper_1.Utils.areConnectionPropertiesIdentical(connProps.name, connProps.configurationTarget, connProps.workspaceFolder, connectionName, configurationTarget, workspaceFolder);
                });
                if (node) {
                    connectionNode = node;
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error in dataExplorerManager.getConnectionNodeFromConnectionScope");
            helper.logErroAfterValidating(error);
        }
        return connectionNode;
    }
    getConnectionNodeFromConnectionUniqueName(connectionUniqueName) {
        let connectionNode = undefined;
        if (this.dataExpModel.rootNodes !== undefined) {
            connectionNode = this.dataExpModel.rootNodes.
                find((node) => node.connectionProperties.uniqueName === connectionUniqueName);
        }
        return connectionNode;
    }
    getConnectionNodeFromConnectionUniqueId(connectionUniqueId) {
        let connectionNode = undefined;
        if (this.dataExpModel.rootNodes !== undefined) {
            connectionNode = this.dataExpModel.rootNodes.
                find((node) => node.connectionUniqueId === connectionUniqueId);
        }
        return connectionNode;
    }
    getConnectionNodeFromConnectionUri(connectionUri) {
        let connectionNode = undefined;
        if (this.dataExpModel.rootNodes !== undefined) {
            connectionNode = this.dataExpModel.rootNodes.
                find((node) => node.connectionURI === connectionUri);
        }
        return connectionNode;
    }
    getConnectionNodes() {
        return this.dataExpModel.rootNodes;
    }
    async onDesribeObject(objectProperties) {
        try {
            let requestParams = new dataExplorerRequests_1.DataExplorerDescribeObjectParams();
            requestParams.connectionUri = objectProperties.connectionUri;
            requestParams.objectType = objectProperties.ddexType;
            requestParams.objectName = objectProperties.objectName;
            requestParams.schemaName = objectProperties.schemaName;
            let response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerDesribeObjectRequest.type, requestParams);
            if (response) {
                if (response.messageType === dataExplorerRequests_1.DataExplorerDescribeObjectMessageType.Data) {
                    let panelUri = `${objectProperties.connectionUri}/${objectProperties.ddexType}/${objectProperties.schemaName}.${objectProperties.objectName}`;
                    let describePanel = this.describePanels[panelUri];
                    if (!describePanel) {
                        describePanel = vscode.window.createWebviewPanel("DescribeResults", `Describe: ${objectProperties.objectName}`, vscode.ViewColumn.Active, { enableScripts: true, retainContextWhenHidden: true });
                        describePanel.onDidDispose(() => {
                            delete this.describePanels[panelUri];
                            resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(panelUri);
                        }, null, null);
                        resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(describePanel, panelUri, null);
                        this.describePanels[panelUri] = describePanel;
                    }
                    describePanel.webview.html = this.getHtmlForWebview(response.message, describePanel);
                    describePanel.reveal(describePanel.viewColumn, false);
                }
                else {
                    this.vscodeConnector.showErrorMessage(response.message);
                }
            }
            logger_1.FileStreamLogger.Instance.info("Opened webview with describe result");
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on opening webview for describe result");
            logger_1.FileStreamLogger.Instance.error(error.message);
        }
    }
    getHtmlForWebview(bodyHtml, panel) {
        const cssPath = vscode.Uri.file(path.join(this.extensionContext.extensionPath, 'out', 'ui', 'css', "app.css"));
        const cssUri = panel.webview.asWebviewUri(cssPath);
        let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">  
        <link rel="stylesheet" type="text/css" href="${cssUri}">
    </head>
    <body>
    <div id="customResultContainer" class="viewBody">
    ${bodyHtml}
    </div>
    </body>
    </html>`;
        return html;
    }
    async onGenerateStatement(treeNode, stmtType) {
        if (treeNode) {
            let connectionNode = this.getConnectionNode(treeNode.connectionURI);
            let objectProperties = new ObjectNodeProperties(treeNode, connectionNode);
            await this.generateStatement(objectProperties, stmtType, connectionNode.connectionProperties);
        }
    }
    async getNewEditor(connectionProps) {
        let editor = await editorUtils_1.editorUtils.getNewEditor();
        if (editor && editor.document) {
            this.connectionCommandsHandler.createConnectionFromConnProps(connectionProps, editor.document.uri.toString(), true);
        }
        return editor;
    }
    async generateStatement(objectProperties, stmtType, connectionProps) {
        let uniqueId = utilities_1.ExplorerUtilities.getObjectUri(objectProperties);
        if (this.generateStmtQueue.has(uniqueId)) {
            return;
        }
        await vscode.window.withProgress({ location: { viewId: constants_1.Constants.dbExplorerViewName } }, () => {
            var p = new Promise(async (resolve) => {
                try {
                    defaultConnectionManager_1.DefaultConnectionManager.instance.associateDefaultConn = false;
                    this.generateStmtQueue.set(uniqueId, null);
                    let requestParams = new dataExplorerRequests_1.DataExplorerGenerateStatementParams();
                    requestParams.connectionUri = objectProperties.connectionUri;
                    requestParams.objectType = objectProperties.ddexType;
                    requestParams.objectName = objectProperties.objectName;
                    requestParams.schemaName = objectProperties.schemaName;
                    requestParams.statementType = stmtType;
                    let response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerGenerateStatementRequest.type, requestParams);
                    if (response) {
                        if (response.messageType === dataExplorerRequests_1.DataExplorerGenerateStatementMessageType.Data) {
                            this.generateStmtQueue.set(uniqueId, response.message);
                            this.genStmtResponseCnt++;
                            if (this.generateStmtQueue.keys().next().value === uniqueId ||
                                this.genStmtResponseCnt === this.generateStmtQueue.size) {
                                let systemManager = (0, extension_1.getSystemManager)();
                                if (!systemManager.lastActiveTextEditor || !systemManager.lastActiveTextEditor.document || systemManager.lastActiveTextEditor.document.isClosed) {
                                    systemManager.lastActiveTextEditor = undefined;
                                }
                                let editor = this.vscodeConnector.activeTextEditor != undefined ? this.vscodeConnector.activeTextEditor :
                                    (systemManager.lastActiveTextEditor) ? systemManager.lastActiveTextEditor : undefined;
                                if (!editor || !editor.document || editor.document.languageId !== constants_1.Constants.oracleLanguageID ||
                                    editorUtils_1.editorUtils.isExplorerFile(editor.document).explorerFile) {
                                    let document = await vscode.workspace.openTextDocument({ language: constants_1.Constants.oracleLanguageID, content: "" });
                                    await vscode.languages.setTextDocumentLanguage(document, constants_1.Constants.oracleLanguageID);
                                    editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.Active, false);
                                    this.connectionCommandsHandler.createConnectionFromConnProps(connectionProps, document.uri.toString(), true);
                                }
                                else if (!this.connectionCommandsHandler.isConnectedToDB(editor.document.uri.toString())) {
                                    this.connectionCommandsHandler.createConnectionFromConnProps(connectionProps, editor.document.uri.toString(), true);
                                }
                                if (editor) {
                                    let selection, pos, statement;
                                    let genStmtReqList = [...this.generateStmtQueue.keys()];
                                    for (let i = 0; i < genStmtReqList.length; ++i) {
                                        statement = this.generateStmtQueue.get(genStmtReqList[i]);
                                        if (statement) {
                                            selection = editor.selection;
                                            pos = new vscode.Position(selection.end.line, selection.end.character);
                                            statement = `${statement}\n`;
                                            if (selection.end.character > 0) {
                                                statement = `\n${statement}`;
                                            }
                                            let success;
                                            try {
                                                success = await editor.edit((editbuilder) => {
                                                    editbuilder.insert(pos, statement);
                                                });
                                            }
                                            catch (error) {
                                                systemManager.lastActiveTextEditor = undefined;
                                                editor = await this.getNewEditor(connectionProps);
                                                if (editor && editor.document) {
                                                    selection = editor.selection;
                                                    pos = new vscode.Position(selection.end.line, selection.end.character);
                                                    success = await editor.edit((editbuilder) => {
                                                        editbuilder.insert(pos, statement);
                                                    });
                                                }
                                            }
                                            if (success) {
                                                vscode.commands.executeCommand(constants_1.Constants.focusCurrentEditor);
                                                this.vscodeConnector.activeTextEditor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
                                            }
                                            if (this.generateStmtQueue.delete(genStmtReqList[i]))
                                                this.genStmtResponseCnt--;
                                        }
                                        else
                                            break;
                                    }
                                }
                            }
                        }
                        else {
                            this.vscodeConnector.showErrorMessage(response.message);
                            if (this.generateStmtQueue.delete(uniqueId))
                                this.genStmtResponseCnt--;
                        }
                    }
                    logger_1.FileStreamLogger.Instance.info("Opened editor with generated statement");
                }
                catch (error) {
                    logger_1.FileStreamLogger.Instance.error("Error on opening editor for generate statement");
                    logger_1.FileStreamLogger.Instance.error(error.message);
                    if (this.generateStmtQueue.delete(uniqueId))
                        this.genStmtResponseCnt--;
                }
                finally {
                    defaultConnectionManager_1.DefaultConnectionManager.instance.associateDefaultConn = true;
                    resolve();
                }
            });
            return p;
        });
    }
    async prepareForCompile(editorUri, editorDoc, isPackageBody = false) {
        return new Promise(async (resolve) => {
            let isReadyForCompile = true;
            try {
                let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
                if (params) {
                    let [response] = await utilities_1.ExplorerUtilities.getObjectBasicPropertiesFromDB(params.connectionUri, params.ddexObjectType, params.objectname, params.schemaname, undefined);
                    if (response && response.object && response.object.objectExists) {
                        if (editorDoc) {
                            let editorProvider = (0, extension_1.getSystemManager)().codeEditorProvider;
                            let openFile = editorProvider.openfiles.get(editorDoc.uri.toString());
                            if (openFile) {
                                await vscode.window.showTextDocument(editorDoc, { preview: false });
                                let mtime = new Date(response.object.modifiedDateTime).getTime();
                                if (mtime > openFile.mtime) {
                                    let errorMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.modifiedInDatabaseMsg, editorUtils_1.editorUtils.getObjectTypeFromDdexType(params.ddexObjectType), params.objectname);
                                    let proceed = await helper.Utils.promptForConfirmation(errorMsg, this.vscodeConnector, true);
                                    if (proceed == helper.ProceedOption.Cancel) {
                                        logger_1.FileStreamLogger.Instance.info("Cancelled compile of file: " + editorDoc.uri.toString());
                                        resolve(false);
                                        return;
                                    }
                                    else if (proceed == helper.ProceedOption.No) {
                                        editorUtils_1.editorUtils.refreshEditorContents();
                                        resolve(true);
                                        return;
                                    }
                                }
                                try {
                                    openFile.overwriteOnSave = true;
                                    await editorProvider.writeFile(editorDoc.uri, Buffer.from(editorDoc.getText()), null);
                                    editorUtils_1.editorUtils.refreshEditorContents();
                                    isReadyForCompile = !editorUtils_1.editorUtils.hasErrorsOnSave(editorDoc.uri);
                                }
                                catch (e) {
                                    isReadyForCompile = false;
                                    logger_1.FileStreamLogger.Instance.error('Failed to save file: ' + e);
                                }
                                finally {
                                    openFile.overwriteOnSave = false;
                                }
                            }
                        }
                    }
                    else if (!isPackageBody) {
                        this.vscodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                        logger_1.FileStreamLogger.Instance.info(localizedConstants_1.default.invalidObjectMessage);
                        isReadyForCompile = false;
                    }
                }
            }
            catch (err) {
                documentConnectionInformation_1.fileLogger.log(err);
                isReadyForCompile = false;
            }
            resolve(isReadyForCompile);
        });
    }
    async onCompileObjectFromFile(debug) {
        try {
            const systemManager = (0, extension_1.getSystemManager)();
            if (systemManager.isExtensionInitialized() && systemManager.documentIsOpenAndOracle()) {
                if (this.vscodeConnector.isActiveDocumentEmpty()) {
                    return;
                }
                if (this.vscodeConnector.activeTextEditor && this.vscodeConnector.activeTextEditor.document &&
                    this.vscodeConnector.activeTextEditor.document.uri) {
                    let activeDoc = this.vscodeConnector.activeTextEditor.document;
                    let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(this.vscodeConnector.activeTextEditor.document);
                    if (explorerFile) {
                        if (editorUtils_1.editorUtils.verifyConnectedToDatabase(activeDoc.uri, this, this.vscodeConnector)) {
                            await this.compileObject(activeDoc.uri, activeDoc, debug);
                        }
                    }
                }
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.error("Error on compiling code object from file");
            helper.logErroAfterValidating(err);
        }
    }
    async compileObject(editorUri, editorDoc, debug) {
        let canCompileCodeObject = await this.prepareForCompile(editorUri, editorDoc);
        if (canCompileCodeObject) {
            let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
            if (params) {
                try {
                    let connectionNode = this.getConnectionNode(params.connectionUri);
                    if (params.ddexObjectType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package) {
                        let dbObjectTye = editorUtils_1.editorUtils.getObjectTypeFromDdexType(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody);
                        var bodyFileUri = editorUtils_1.editorUtils.getEditorUri(constants_1.Constants.oracleScheme, connectionNode, dbObjectTye, params.schemaname, params.objectname, params.connectionUri, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody);
                        var bodyEditorDoc = editorUtils_1.editorUtils.getEditorDocumentFromUri(bodyFileUri);
                        canCompileCodeObject = await this.prepareForCompile(bodyFileUri, bodyEditorDoc, true);
                    }
                    if (canCompileCodeObject) {
                        const requestParams = new dataExplorerRequests_1.CompileCodeObjectRequestParams();
                        requestParams.debug = debug;
                        requestParams.fileUri = editorUri.toString();
                        requestParams.bodyFileUri = bodyFileUri ? bodyFileUri.toString() : null;
                        requestParams.connectionUri = params.connectionUri;
                        requestParams.objectName = params.objectname;
                        requestParams.objectType = params.ddexObjectType;
                        requestParams.schemaName = params.schemaname;
                        let configurationTarget = (connectionNode ? connectionNode.connectionProperties.configurationTarget : vscode.ConfigurationTarget.Global);
                        let workspaceFolder = (connectionNode ? connectionNode.connectionProperties.workspaceFolder : undefined);
                        let compilerSettings = compilerSettingsManager_1.CompilerSettingsManager.getCompierSettings(configurationTarget, workspaceFolder);
                        if (compilerSettings) {
                            const compilerFlags = (requestParams.debug ? compilerSettings.compileDebugConfig : compilerSettings.compileConfig);
                            if (compilerFlags.enableFlags)
                                requestParams.parameters = compilerFlags;
                        }
                        var [connOpen, timeModifiedInDB] = await utilities_1.ExplorerUtilities.compileCodeObject(requestParams);
                        if (!connOpen && connectionNode) {
                            this.onConnectionDisconnect(connectionNode, true);
                        }
                        else if (timeModifiedInDB) {
                            if (editorDoc)
                                editorUtils_1.editorUtils.updateModifiedTime(editorDoc.uri.toString(), timeModifiedInDB);
                            if (bodyEditorDoc)
                                editorUtils_1.editorUtils.updateModifiedTime(bodyEditorDoc.uri.toString(), timeModifiedInDB);
                        }
                        let treeNode = this.getOENodeFromEditorUri(editorUri);
                        if (treeNode) {
                            await this.refreshNode(treeNode);
                        }
                    }
                }
                catch (err) {
                    logger_1.FileStreamLogger.Instance.error("Error on compiling code object");
                    logger_1.FileStreamLogger.Instance.error(err.message);
                }
            }
        }
    }
    getOENodeFromEditorUri(editorUri) {
        let oeNode = null;
        try {
            let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
            if (!params) {
                return oeNode;
            }
            let connNode = null;
            if (this.dataExpModel.rootNodes) {
                connNode = this.dataExpModel.rootNodes.
                    find((node) => node.connectionURI === params.connectionUri);
            }
            if (!connNode) {
                return oeNode;
            }
            let nodePath = [];
            switch (params.ddexObjectType) {
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure:
                    nodePath = [utilities_1.TreeViewConstants.proceduresStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function:
                    nodePath = [utilities_1.TreeViewConstants.functionsStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package:
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody:
                    nodePath = [utilities_1.TreeViewConstants.packagesStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_TableTriggerMain:
                    nodePath = [utilities_1.TreeViewConstants.triggersStr, utilities_1.TreeViewConstants.tableTriggersStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ViewTriggerMain:
                    nodePath = [utilities_1.TreeViewConstants.triggersStr, utilities_1.TreeViewConstants.viewTriggersStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_DatabaseTriggerMain:
                    nodePath = [utilities_1.TreeViewConstants.triggersStr, utilities_1.TreeViewConstants.databaseTriggersStr, params.objectname];
                    break;
                case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_SchemaTriggerMain:
                    nodePath = [utilities_1.TreeViewConstants.triggersStr, utilities_1.TreeViewConstants.schemaTriggersStr, params.objectname];
                    break;
            }
            if (nodePath) {
                if (params.schemaname !== connNode.schemaName) {
                    nodePath.unshift(params.schemaname);
                    nodePath.unshift(utilities_1.TreeViewConstants.usersStr);
                }
                oeNode = this.findNode(connNode, nodePath);
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.error("Error on finding  code object");
            helper.logErroAfterValidating(err);
        }
        return oeNode;
    }
    findNode(connNode, nodePath) {
        let parentNode = connNode;
        for (let i = 0; i < nodePath.length; i++) {
            if (parentNode && parentNode.children) {
                parentNode = parentNode.children.find((node) => node.getNodeIdentifier === nodePath[i]);
            }
            else {
                parentNode = null;
            }
            if (!parentNode) {
                break;
            }
        }
        return parentNode;
    }
    async updateExplorerDefaultConnection() {
        let [defaultConnName, configurationTarget, workspaceFolder] = defaultConnectionManager_1.DefaultConnectionManager.instance.getDefaultConnectionForActiveScope();
        let modelChanged = false;
        this.dataExpModel.rootNodes.forEach((connNode) => {
            if (connNode.connectionProperties.configurationTarget === configurationTarget &&
                ((!connNode.connectionProperties.workspaceFolder && !workspaceFolder) ||
                    (connNode.connectionProperties.workspaceFolder && workspaceFolder &&
                        connNode.connectionProperties.workspaceFolder.name === workspaceFolder.name &&
                        connNode.connectionProperties.workspaceFolder.index === workspaceFolder.index))) {
                if (defaultConnName === connNode.connectionProperties.name) {
                    if (connNode.connAssocType !== connectionNode_1.ConnAssocType.Default ||
                        connNode.currentConnAssocType != connectionNode_1.ConnAssocType.Default) {
                        connNode.connAssocType = connectionNode_1.ConnAssocType.Default;
                        connNode.currentConnAssocType = connectionNode_1.ConnAssocType.Default;
                        modelChanged = true;
                    }
                }
                else if (connNode.connAssocType === connectionNode_1.ConnAssocType.Default ||
                    connNode.currentConnAssocType === connectionNode_1.ConnAssocType.Default) {
                    connNode.connAssocType = connectionNode_1.ConnAssocType.NonDefault;
                    connNode.currentConnAssocType = connectionNode_1.ConnAssocType.NonDefault;
                    modelChanged = true;
                }
            }
            else if (connNode.currentConnAssocType === connectionNode_1.ConnAssocType.Default) {
                connNode.currentConnAssocType = connectionNode_1.ConnAssocType.NonDefault;
                modelChanged = true;
            }
        });
        if (modelChanged) {
            this.dataExpModel.raiseModelChangedEvent();
        }
    }
    getFilterSettings(filtersJson) {
        return this.filtersManager.processCollectionFilterConfigFromSettings(filtersJson);
    }
}
exports.DataExplorerManager = DataExplorerManager;
class ObjectNodeProperties {
    constructor(treeNode, connectionNode, modifiedTimeInDB = undefined, fileModifiedTime = undefined, isDirty = false, objectDdexType = undefined) {
        this.objectName = treeNode.objectName;
        this.schemaName = treeNode.schemaName;
        if (objectDdexType) {
            this.ddexType = objectDdexType;
        }
        else {
            this.ddexType = treeNode.ddexObjectType;
        }
        this.isDirty = isDirty;
        this.fileModifiedTime = fileModifiedTime;
        this.modifiedTimeInDB = modifiedTimeInDB;
        this.connectionUri = treeNode.connectionURI;
        this.dbObject = treeNode.databaseObject;
        if (connectionNode) {
            this.connectionName = connectionNode.connectionProperties.uniqueName;
            this.connectionSchemaName = connectionNode.schemaName;
        }
    }
}
exports.ObjectNodeProperties = ObjectNodeProperties;
class ConnectionNodeInfo {
    constructor(oldConnectionUniqueName, newConnectionUniqueName, connectionUniqueId) {
        this.oldConnectionUniqueName = oldConnectionUniqueName;
        this.newConnectionUniqueName = newConnectionUniqueName;
        this.connectionUniqueId = connectionUniqueId;
    }
}
exports.ConnectionNodeInfo = ConnectionNodeInfo;
