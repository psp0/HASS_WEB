"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemManager = exports.activeDocument = void 0;
const childProcess = require("child_process");
const events = require("events");
const vscode_1 = require("vscode");
const vscode = require("vscode");
const connectionCommandsHandler_1 = require("../connectionManagement/connectionCommandsHandler");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const untitiledDocumentProvider_1 = require("../models/untitiledDocumentProvider");
const adapter_1 = require("../prompts/adapter");
const helper_1 = require("../utilities/helper");
const helper = require("../utilities/helper");
const resultsDataServer_1 = require("./../scriptExecution/resultsDataServer");
const scriptExcutionCommandHandler_1 = require("./../scriptExecution/scriptExcutionCommandHandler");
const scriptExecutionEventsHandler_1 = require("./../scriptExecution/scriptExecutionEventsHandler");
const logger_1 = require("./logger");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
const oracleVSCodeConnector_1 = require("./oracleVSCodeConnector");
const statusBarManager_1 = require("./statusBarManager");
const localizedConstants_2 = require("./../constants/localizedConstants");
const setup_1 = require("../utilities/setup");
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const oracleSignatureHelpProvider_1 = require("./oracleSignatureHelpProvider");
const queryHistoryManager_1 = require("../explorer/queryHistoryManager");
const queryBookmarkManager_1 = require("../explorer/queryBookmarkManager");
const testsManager_1 = require("../tests/testsManager");
const userPreferenceManager_1 = require("./userPreferenceManager");
const oracleEditorManager_1 = require("./oracleEditorManager");
const oracleDocumentSymbolProvider_1 = require("./oracleDocumentSymbolProvider");
const ociExplorerManager_1 = require("../explorer/autonomousDatabaseExplorer/ociExplorerManager");
const editorProvider_1 = require("../explorer/editors/editorProvider");
const debugManager_1 = require("../debugger/debugManager");
const compilerSettingsManager_1 = require("../explorer/compilerSettingsManager");
const oracleGotoProviders_1 = require("./oracleGotoProviders");
const debuggerSettingsManager_1 = require("../explorer/debuggerSettingsManager");
const connectionSettingsManager_1 = require("../connectionManagement/connectionSettingsManager");
const connectionModels_1 = require("../models/connectionModels");
const oracleCodeLensProviders_1 = require("./oracleCodeLensProviders");
const oracleFormattingProvider_1 = require("./oracleFormattingProvider");
const oracleCodeFoldingProvider_1 = require("./oracleCodeFoldingProvider");
const formatterSettingsManager_1 = require("../explorer/formatterSettingsManager");
const defaultConnectionManager_1 = require("../connectionManagement/defaultConnectionManager");
const filterSettingsManager_1 = require("../explorer/filterSettingsManager");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const oracleFileDecorationProvider_1 = require("./oracleFileDecorationProvider");
const settings_1 = require("../utilities/settings");
const explainPlanSettingsManager_1 = require("../explorer/explainPlanSettingsManager");
const realTimeSqlMonitorServiceProvider_1 = require("./realTimeSqlMonitorServiceProvider");
const explainPlanUtils_1 = require("../explorer/explainPlanUtils");
const intellisenseConnectionManager_1 = require("../connectionManagement/intellisenseConnectionManager");
const utilities_1 = require("../explorer/utilities");
const oracleHoverProvider_1 = require("./oracleHoverProvider");
const oracleInlineCompletionItemProvider_1 = require("./oracleInlineCompletionItemProvider");
const dbmsCloudAIManager_1 = require("../explorer/dbmsCloudAIManager");
class activeDocument {
}
exports.activeDocument = activeDocument;
class SystemManager {
    constructor(context) {
        this.context = context;
        this.lastActiveTextEditor = undefined;
        this.vscodeConnector = undefined;
        this.fileLogger = undefined;
        this.initialized = false;
        this.scriptExecutionCommandHandler = undefined;
        this.event = new events.EventEmitter();
        this.settings = undefined;
        this.openingFolderFirstTime = true;
        this.vscodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector(context);
        this.untitiledDocumentProvider = new untitiledDocumentProvider_1.default(this.vscodeConnector);
        this.sessionId = process.pid.toString() + "_" + new Date().valueOf().toString();
    }
    deactivate() {
        this.debugManager.removeBreakpoints();
        const self = this;
        self.fileLogger.info("Disposing Result UI Process.");
        resultsDataServer_1.ResultDataServer.dispose();
        self.fileLogger.info("Disposed Result UI Process.");
        self.fileLogger.info("Deactivating System Manager.");
        self.fileLogger.info("Disposing language client.");
        return oracleLanguageServerClient_1.OracleLanguageServerClient.instance.stopClient();
    }
    canExecuteQuery() {
        if (this.vscodeConnector.isActiveOracleFile) {
            return true;
        }
    }
    async init(dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath) {
        const self = this;
        if (!self.initialized) {
            self.fileLogger = logger_1.FileStreamLogger.Instance;
            self.fileLogger.info("Initializing System Manager ");
            self.setLocale();
            setup_1.ConfigManager.initialize(this.context.extensionPath);
            vscode_1.workspace.onDidChangeConfiguration((param) => { this.onConfigurationChanged(param); });
            vscode.window.onDidChangeActiveColorTheme((param) => { this.onThemeChanged(param); });
            self.statusController = new statusBarManager_1.StatusBarManager(self.vscodeConnector);
            utilities_1.ExplorerUtilities.vscodeConnector = self.vscodeConnector;
            try {
                const srvInitResult = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance
                    .init(self.context, self.vscodeConnector, dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath);
                if (srvInitResult) {
                    self.fileLogger.info("Initializing Oracle Developer Tools for VS Code extension features");
                    self.fileLogger.info("Initializing Result Data Server");
                    resultsDataServer_1.ResultDataServer.init();
                    self.fileLogger.info("Initialized Result Data Server");
                    self.fileLogger.info("Registering commands");
                    self.registerCommands();
                    self.fileLogger.info("Registered commands");
                    self.fileLogger.info("Initializing ScriptExecution Events Handler");
                    scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.init(this.statusController, self.vscodeConnector, resultsDataServer_1.ResultDataServer.instanceSingle);
                    self.fileLogger.info("Creating Settings object");
                    self.settings = settings_1.Settings.CreateInstance();
                    self.fileLogger.info("Created Settings object");
                    self.fileLogger.info("Initialized ScriptExecution Events Handler");
                    self.fileLogger.info("Creating ScriptExecution Command Handler");
                    self.scriptExecutionCommandHandler = new scriptExcutionCommandHandler_1.ScriptExecutionCommandHandler(scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance, self.vscodeConnector, resultsDataServer_1.ResultDataServer.instanceSingle, self.statusController);
                    self.fileLogger.info("Created ScriptExecution Command Handler");
                    self.fileLogger.info("Creating Connection Commands Handler");
                    self.connectionController = connectionCommandsHandler_1.default.CreateInstance(self.context, self.statusController, new adapter_1.default(), self.scriptExecutionCommandHandler);
                    self.fileLogger.info("Created Connection Commands Handler");
                    self.fileLogger.info("Creating Compiler Settings Manager");
                    self.compilerSettingsManager = new compilerSettingsManager_1.CompilerSettingsManager(self.scriptExecutionCommandHandler);
                    self.fileLogger.info("Created Compiler Settings Manager");
                    self.fileLogger.info("Creating Formatter Settings Handler");
                    self.formatterSettingsManager = new formatterSettingsManager_1.FormatterSettingsManager(self.scriptExecutionCommandHandler, this.vscodeConnector);
                    self.fileLogger.info("Created Formatter Settings Handler");
                    self.fileLogger.info("Creating Debugger Settings Handler");
                    self.debuggerSettingsManager = new debuggerSettingsManager_1.debuggerSettingsManager();
                    self.fileLogger.info("Created Debugger Settings Handler");
                    self.fileLogger.info("Creating Filter Settings Handler");
                    self.filterSettingsManager = filterSettingsManager_1.FilterSettingsManager.CreateInstance(self.scriptExecutionCommandHandler, self.connectionController, self.vscodeConnector);
                    self.fileLogger.info("Created Filter Settings Handler");
                    self.fileLogger.info("Creating Explain Plan Settings Handler");
                    self.explainPlanSettingsManager = new explainPlanSettingsManager_1.explainPlanSettingsManager(self.scriptExecutionCommandHandler, self.vscodeConnector);
                    self.fileLogger.info("Created Explain Plan Settings Handler");
                    self.fileLogger.info("Creating Oracle Database Explorer Manager");
                    self.dataExpManager = dataExplorerManager_1.DataExplorerManager.CreateInstance(self.vscodeConnector, self.connectionController, self.context, self.scriptExecutionCommandHandler, self.filterSettingsManager);
                    self.fileLogger.info("Created Oracle Database Explorer Manager");
                    self.fileLogger.info("Initializing Oracle Database Explorer Manager");
                    self.dataExpManager.init();
                    self.fileLogger.info("Initialized Oracle Database Explorer Manager");
                    self.fileLogger.info("Creating DBMS Cloud AI Manager");
                    self.dbmsCloudAIManager = dbmsCloudAIManager_1.DbmsCloudAIManager.CreateInstance(self.connectionController, self.vscodeConnector);
                    self.fileLogger.info("Created DBMS Cloud AI Manager");
                    self.fileLogger.info("Creating OCI Cloud Explorer Manager ");
                    self.cloudExplorerManager = ociExplorerManager_1.OCIExplorerManager.CreateInstance(self.vscodeConnector, self.connectionController, self.fileLogger);
                    self.fileLogger.info("Created OCI Cloud Explorer Manager");
                    self.fileLogger.info("Creating Query History Manager ");
                    self.queryHistorManager = queryHistoryManager_1.QueryHistoryManager.CreateInstance(self.connectionController, self.vscodeConnector, self.scriptExecutionCommandHandler, self.fileLogger, new adapter_1.default(), self.untitiledDocumentProvider);
                    self.fileLogger.info("Created Query History Manager");
                    self.fileLogger.info("Get the Global Storage Path from Extension Context");
                    var storagePath = self.context.globalStoragePath;
                    self.fileLogger.info("Creating Query Bookmark Manager");
                    self.queryBookmarkManager = queryBookmarkManager_1.QueryBookmarkManager.CreateInstance(self.connectionController, self.vscodeConnector, self.scriptExecutionCommandHandler, new adapter_1.default(), self.untitiledDocumentProvider, self.fileLogger);
                    self.fileLogger.info("Created Query Bookmark Manager");
                    self.fileLogger.info("Initializing Toolbar Manager");
                    oracleEditorManager_1.default.initialize(this.context, this.vscodeConnector, resultsDataServer_1.ResultDataServer.instanceSingle);
                    self.fileLogger.info("Initialized Toolbar Manager");
                    self.fileLogger.info("Creating Inteliisense Data Manager");
                    this.oracleIntelliSenseDataManager = oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance;
                    self.fileLogger.info("Created Intellisense Data Manager");
                    self.fileLogger.info("Set Status Bar Manager on the Intellisense Data Manager");
                    this.oracleIntelliSenseDataManager.setStatusBarManager(self.statusController);
                    self.fileLogger.info("Creating Oracle Signature Help Provider");
                    this.signatureHelpProvider = new oracleSignatureHelpProvider_1.oracleSignatureHelpProvider(self.vscodeConnector, self.connectionController, self.dataExpManager);
                    self.fileLogger.info("Created Oracle Signature Help Provider");
                    self.fileLogger.info("Registering Oracle Signature Help Provider with VSCode");
                    vscode.languages.registerSignatureHelpProvider(constants_1.Constants.oracleLanguageID, this.signatureHelpProvider, '(', ',');
                    self.fileLogger.info("Registered Oracle Signature Help Provider with VSCode");
                    self.fileLogger.info("Creating Default Connection Manager");
                    self.defaultConnManager = defaultConnectionManager_1.DefaultConnectionManager.CreateInstance(self.dataExpManager, self.vscodeConnector, self.statusController, self.connectionController);
                    self.fileLogger.info("Created Default Connection Manager instance");
                    self.fileLogger.info("Creating Intellisense Connection Manager");
                    self.intellisenseConnectionManager = intellisenseConnectionManager_1.IntellisenseConnectionManager.CreateInstance(this.statusController);
                    self.fileLogger.info("Created Intellisense Connection Manager instance");
                    self.fileLogger.info("Creating Oracle CompletionItem Provider");
                    this.completionitemProvider = new oracleCompletionItemProvider_1.oracleCompletionitemProvider(self.vscodeConnector, self.connectionController, self.dataExpManager, this.signatureHelpProvider);
                    self.fileLogger.info("Created Oracle CompletionItem Provider");
                    self.fileLogger.info("Registering Oracle CompletionItem Provider with VSCode");
                    vscode.languages.registerCompletionItemProvider(constants_1.Constants.oracleLanguageID, this.completionitemProvider, '.', " ");
                    self.fileLogger.info("Registered Oracle CompletionItem Provider with VSCode");
                    self.fileLogger.info("Registering Oracle Inline CompletionItem Provider with VSCode");
                    this.inlineCompletionitemProvider = new oracleInlineCompletionItemProvider_1.oracleInlineCompletionitemProvider();
                    vscode.languages.registerInlineCompletionItemProvider(constants_1.Constants.oracleLanguageID, this.inlineCompletionitemProvider);
                    self.fileLogger.info("Registered Oracle Inline CompletionItem Provider with VSCode");
                    self.fileLogger.info("Creating Oracle Document Symbol Provider");
                    this.documentSymbolProvider = new oracleDocumentSymbolProvider_1.oracleDocumentSymbolProvider();
                    self.fileLogger.info("Created Oracle Document Symbol Provider");
                    self.fileLogger.info("Registering Oracle Document Symbol Provider with VSCode");
                    vscode.languages.registerDocumentSymbolProvider(constants_1.Constants.oracleLanguageID, this.documentSymbolProvider);
                    self.fileLogger.info("Registered Oracle Document Symbol Provider with VSCode");
                    self.fileLogger.info("Creating Oracle Hover Provider");
                    this.hoverProvider = new oracleHoverProvider_1.oracleHoverProvider(self.vscodeConnector, self.connectionController, self.dataExpManager);
                    self.fileLogger.info("Created Oracle Hover Provider");
                    self.fileLogger.info("Registering Oracle Hover Provider with VSCode");
                    vscode.languages.registerHoverProvider(constants_1.Constants.oracleLanguageID, this.hoverProvider);
                    self.fileLogger.info("Registered Oracle Hover Provider with VSCode");
                    self.fileLogger.info("Creating Test Manager");
                    self.testsManager = new testsManager_1.TestsManager();
                    self.fileLogger.info("Created Test Manager");
                    self.fileLogger.info("Initializing Test Manager");
                    self.testsManager.init(new adapter_1.default(), self.vscodeConnector, self.fileLogger, storagePath);
                    self.fileLogger.info("Initialized Test Manager");
                    self.fileLogger.info("Creating User Preference Manager");
                    this.userPreferenceManager = userPreferenceManager_1.UserPreferenceManager.CreateInstance();
                    self.fileLogger.info("Created User Preference Manager");
                    self.fileLogger.info("Initializing User Preference Manager");
                    this.userPreferenceManager.init();
                    self.fileLogger.info("Initialized User Preference Manager");
                    self.fileLogger.info("Creating Code Editor Provider");
                    this.codeEditorProvider = new editorProvider_1.editorProvider(this.vscodeConnector, this.dataExpManager);
                    self.fileLogger.info("Created Code Editor Provider");
                    self.fileLogger.info("Creating Oracle Definition Provider");
                    this.definitionProvider = new oracleGotoProviders_1.oracleDefinitionProvider(this.vscodeConnector, this.connectionController, this.dataExpManager, this.codeEditorProvider);
                    self.fileLogger.info("Created Oracle Definition Provider");
                    self.fileLogger.info("Registering Oracle Definition Provider");
                    vscode.languages.registerDefinitionProvider(constants_1.Constants.oracleLanguageID, this.definitionProvider);
                    self.fileLogger.info("Registered Oracle Definition Provider");
                    self.fileLogger.info("Creating Oracle Implementation Provider");
                    this.implementationProvider = new oracleGotoProviders_1.oracleImplementationProvider(this.vscodeConnector, this.connectionController, this.dataExpManager, this.codeEditorProvider);
                    self.fileLogger.info("Created Oracle Implementation Provider");
                    self.fileLogger.info("Registering Oracle Implementation Provider");
                    vscode.languages.registerImplementationProvider(constants_1.Constants.oracleLanguageID, this.implementationProvider);
                    self.fileLogger.info("Registered Oracle Implementation Provider");
                    self.fileLogger.info("Creating Oracle Type Definition Provider");
                    this.typeDefinitionProvider = new oracleGotoProviders_1.oracleTypeDefinitionProvider(this.vscodeConnector, this.connectionController, this.dataExpManager, this.codeEditorProvider);
                    self.fileLogger.info("Created Oracle Type Definition Provider");
                    self.fileLogger.info("Registering Oracle Type Definition Provider");
                    vscode.languages.registerTypeDefinitionProvider(constants_1.Constants.oracleLanguageID, this.typeDefinitionProvider);
                    self.fileLogger.info("Registering Oracle Type Definition Provider");
                    self.fileLogger.info("Creating Oracle Reference Provider");
                    this.referenceProvider = new oracleGotoProviders_1.oracleReferenceProvider(this.vscodeConnector, this.connectionController, this.dataExpManager, this.codeEditorProvider);
                    self.fileLogger.info("Created Oracle Reference Provider");
                    self.fileLogger.info("Registering Oracle Reference Provider");
                    vscode.languages.registerReferenceProvider(constants_1.Constants.oracleLanguageID, this.referenceProvider);
                    self.fileLogger.info("Registered Oracle Reference Provider");
                    self.fileLogger.info("Creating Oracle CodeLens Provider");
                    this.codelensreferenceProvider = new oracleCodeLensProviders_1.oracleCodeLensReferenceProvider(this.vscodeConnector, this.connectionController, this.dataExpManager, this.codeEditorProvider);
                    self.fileLogger.info("Created Oracle CodeLens Provider");
                    self.fileLogger.info("Registering Oracle CodeLens Provider");
                    vscode.languages.registerCodeLensProvider(constants_1.Constants.oracleLanguageID, this.codelensreferenceProvider);
                    self.fileLogger.info("Registered Oracle CodeLens Provider");
                    self.fileLogger.info("Creating Oracle Document Formatting Provider");
                    this.formattingProvider = new oracleFormattingProvider_1.oracleDocumentFormattingProvider();
                    self.fileLogger.info("Created Oracle Document Formatting Provider");
                    self.fileLogger.info("Registering Oracle Document Formatting Provider");
                    vscode.languages.registerDocumentFormattingEditProvider(constants_1.Constants.oracleLanguageID, this.formattingProvider);
                    self.fileLogger.info("Registered Oracle Document Formatting Provider");
                    self.fileLogger.info("Creating Oracle Document Range Formatting Provider");
                    this.rangeFormattingProvider = new oracleFormattingProvider_1.oracleRangeFormattingProvider();
                    self.fileLogger.info("Created Oracle Document Range Formatting Provider");
                    self.fileLogger.info("Registering Oracle Document Range Formatting Provider");
                    vscode.languages.registerDocumentRangeFormattingEditProvider(constants_1.Constants.oracleLanguageID, this.rangeFormattingProvider);
                    self.fileLogger.info("Registered Oracle Document Range Formatting Provider");
                    self.fileLogger.info("Creating Oracle Type Formatting Provider");
                    this.onTypeFormattingProvider = new oracleFormattingProvider_1.oracleTypeFormattingProvider();
                    self.fileLogger.info("Created Oracle Type Formatting Provider");
                    self.fileLogger.info("Registering Oracle Type Formatting Provider");
                    vscode.languages.registerOnTypeFormattingEditProvider(constants_1.Constants.oracleLanguageID, this.onTypeFormattingProvider, ';', '/');
                    self.fileLogger.info("Registered Oracle Type Formatting Provider");
                    self.fileLogger.info("Creating Oracle Folding Range Provider");
                    this.codeFoldingProvider = new oracleCodeFoldingProvider_1.oracleCodeFoldingProvider();
                    self.fileLogger.info("Created Oracle Folding Range Provider");
                    self.fileLogger.info("Registering Oracle Folding Range Provider");
                    vscode.languages.registerFoldingRangeProvider(constants_1.Constants.oracleLanguageID, this.codeFoldingProvider);
                    self.fileLogger.info("Registered Oracle Folding Range Provider");
                    self.fileLogger.info("Registering Oracle File System Provider");
                    this.context.subscriptions.push(vscode.workspace.registerFileSystemProvider(constants_1.Constants.oracleScheme, this.codeEditorProvider, { isCaseSensitive: true }));
                    self.fileLogger.info("Registered Oracle File System Provider");
                    self.fileLogger.info("Registering File Decoration Provider");
                    this.fileDecorationProvider = new oracleFileDecorationProvider_1.oracleFileDecorationProvider(this.dataExpManager, this.connectionController);
                    this.context.subscriptions.push(vscode.window.registerFileDecorationProvider(this.fileDecorationProvider));
                    self.fileLogger.info("Registered File Decoration Provider");
                    self.fileLogger.info("Set PL/SQL Debugger Progam Name using dotnet runtime major version: " + dotnetRuntimeMajorVersion);
                    setup_1.Setup.setPlsqlDebuggerProgram(dotnetRuntimeMajorVersion, dotnetRuntimePath);
                    self.fileLogger.info("Creating PL/SQL Debugger Manager");
                    self.debugManager = debugManager_1.DebugManager.CreateInstance(self.context, self.dataExpManager, self.scriptExecutionCommandHandler, self.vscodeConnector, new adapter_1.default());
                    self.fileLogger.info("Created PL/SQL Debugger Manager");
                    self.fileLogger.info("Initializing PL/SQL Debugger Manager");
                    self.debugManager.init();
                    self.fileLogger.info("Initialized PL/SQL Debugger Manager");
                    if (self.vscodeConnector.isActiveOracleFile) {
                        self.fileLogger.info("Updating status bar for active file");
                        self.statusController.displayDefaults(self.vscodeConnector.activeTextEditorUri);
                        self.fileLogger.info("Updated status bar for active file");
                        self.fileLogger.info("Associating default connection with active file");
                        self.defaultConnManager.associateDefaultConnectionToFile(self.vscodeConnector.activeTextEditor.document);
                        self.fileLogger.info("Associated default connection with active file");
                    }
                    self.fileLogger.info("Initializing the Real-Time SQL Monitoring Service Provider");
                    self.rtsmService = realTimeSqlMonitorServiceProvider_1.RealTimeSqlMonitorServiceProvider.instance;
                    self.rtsmService.init(self.context, self.scriptExecutionCommandHandler, self.vscodeConnector, self.statusController);
                    self.fileLogger.info("Initialized the Real-Time SQL Monitoring Service Provider");
                    self.initialized = true;
                    self.fileLogger.info("Initialized Oracle Developer Tools for VS Code extension features");
                }
            }
            catch (error) {
                self.fileLogger.error("Error during initialization. Error: " + error);
                throw new Error(error);
            }
        }
    }
    onRebuildIntelliSenseHandler() {
        const self = this;
        self.fileLogger.info("Rebuild Intellisense metadata command received from VS Code");
        if (self.isExtensionInitialized && self.documentIsOpenAndOracle()) {
            const fileUri = self.vscodeConnector.activeTextEditorUri;
            if (fileUri) {
                this.intellisenseConnectionManager.rebuildIntelliSense(fileUri, false);
            }
        }
    }
    isSaveRequired() {
        const self = this;
        self.fileLogger.info("checking if the active text document needs to be saved.");
        const activeDoc = this.vscodeConnector.activeTextEditor.document;
        if (activeDoc && (activeDoc.isDirty || activeDoc.isUntitled)) {
            if (activeDoc.isDirty && !activeDoc.isUntitled) {
                activeDoc.save();
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }
    openDocumentHandler(doc) {
        const self = this;
        if (self.initialized === false) {
            return;
        }
        self.fileLogger.info("Open Document event received from VS Code");
        this.connectionController.textDocumentOpenHandler(doc);
        if (doc && doc.languageId === constants_1.Constants.oracleLanguageID) {
            this.statusController.extensionChanged(helper.convertURIToString(doc.uri), constants_1.Constants.extensionOwner);
        }
        self.previousOpenedDoc = helper.convertURIToString(doc.uri);
        self.documentOpenedTimer = new helper_1.Timer();
        self.documentOpenedTimer.start();
        let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(doc);
        if (explorerFile) {
            this.codeEditorProvider.onEditorOpened(doc, this);
        }
        else {
            this.defaultConnManager.associateDefaultConnectionToFile(doc);
        }
        this.scriptExecutionCommandHandler.resetScriptExecution(doc.uri.toString());
    }
    saveDocumentHandler(doc) {
        const self = this;
        if (self.initialized === false) {
            return;
        }
        self.fileLogger.info("Save Document event received from VS Code");
        self.previousSavedDoc = helper.convertURIToString(doc.uri);
        self.documentSavedTimer = new helper_1.Timer();
        self.documentSavedTimer.start();
    }
    isExtensionInitialized() {
        const self = this;
        if (!this.initialized) {
            self.vscodeConnector.showErrorMessage("extensionUnInitializedError");
        }
        return self.initialized;
    }
    documentIsOpenAndOracle() {
        this.fileLogger.info("Check if a document is associated with Oracle");
        let valToReturn = true;
        if (!this.vscodeConnector.isActiveOracleFile) {
            this.vscodeConnector.showWarningMessage("msgFileAssociationMissing");
            valToReturn = false;
        }
        return valToReturn;
    }
    isExecuteCurrentQueryCommand(selection) {
        let result = false;
        if (selection) {
            if (selection.startLine === selection.endLine &&
                selection.startColumn === selection.endColumn) {
                result = true;
            }
        }
        return result;
    }
    registerCommandHandler(commandName) {
        const self = this;
        self.vscodeConnector.registerCommand(commandName, () => {
            self.event.emit(commandName);
        }, self);
    }
    registerCommands() {
        const self = this;
        self.fileLogger.info("Registering command handlers for various commands");
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdExecuteAll, self.executeAllCommand, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdExecuteSQL, self.executeSQLCommand, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdExplainPlan, self.executeExplainPlan, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmddbmsExplainPlan, self.executeDBExplainPlan, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdExecutionPlan, self.executeExecutionPlan, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmddbmsExecutionPlan, self.executeDBExecutionPlan, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdExplainPlanCtxMenu, self.executeExplainPlan, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmddbmsExplainPlanCtxMenu, self.executeDBExplainPlan, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdExecutionPlanCtxMenu, self.executeExecutionPlan, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmddbmsExecutionPlanCtxMenu, self.executeDBExecutionPlan, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.realTimeSqlMonitoringDetailCommandName, self.executeRTSMDetailCommand, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdtranslatetoSQL, self.executeTranslatetoSQL, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdtranslateToSQLAndExplain, self.executeTranslateToSQLAndExplain, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdexplain, self.executeExplain, self);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdHideinlineSuggestion, self.hideInlineSuggestion, self);
        self.event.on(constants_1.Constants.cmdConnectCommandName, () => {
            self.runAndLogUnhandledError(self.newConnectionHandler());
        });
        self.registerCommandHandler(constants_1.Constants.cmdConnectCommandName);
        self.event.on(constants_1.Constants.cmdDisconnectCommandName, () => {
            self.runAndLogUnhandledError(self.disconnectHandler());
        });
        self.registerCommandHandler(constants_1.Constants.cmdDisconnectCommandName);
        self.registerCommandHandler(constants_1.Constants.cmdManageProfiles);
        self.event.on(constants_1.Constants.cmdEnableDisableOracleLanguageServices, async () => {
            await self.oracleLanguageAssocHandler().
                then(result => {
                if (result != undefined) {
                    this.oracleIntelliSenseDataManager.updateLanguageFeatureForDocument(self.vscodeConnector.activeTextEditorUri, result);
                }
            }).catch(error => {
                self.vscodeConnector.showErrorMessage(localizedConstants_1.default.errorEncountered + error);
            });
        });
        self.registerCommandHandler(constants_1.Constants.cmdEnableDisableOracleLanguageServices);
        self.vscodeConnector.registerCommand(constants_1.Constants.cmdCancelScriptExecution, self.cancelScriptExecutionHandler, self);
        self.event.on(constants_1.Constants.cmdRebuildIntelliSenseMetaData, () => {
            self.onRebuildIntelliSenseHandler();
        });
        self.registerCommandHandler(constants_1.Constants.cmdRebuildIntelliSenseMetaData);
        this.event.on(constants_1.Constants.cmdRunNewQuery, () => {
            self.onRunNewQuery();
        });
        self.registerCommandHandler(constants_1.Constants.cmdRunNewQuery);
        this.event.on(constants_1.Constants.cmdRunGettingStartedGuide, () => {
            self.onGettingStartedGuide();
        });
        self.registerCommandHandler(constants_1.Constants.cmdRunGettingStartedGuide);
        self.vscodeConnector.onDidCloseTextDocument((params) => {
            self.closeDocumentHandler(params);
        });
        self.vscodeConnector.onDidOpenTextDocument((params) => self.openDocumentHandler(params));
        self.vscodeConnector.onDidSaveTextDocument((params) => self.saveDocumentHandler(params));
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerConnectionDelete, async (conNode, selectedNodes) => {
            let nodes = [conNode];
            if (selectedNodes && selectedNodes.length > 0) {
                nodes = selectedNodes;
                if (!helper_1.Utils.IsCommandSupportedbyAllNodes(constants_1.Constants.cmdExplorerConnectionDelete, nodes)) {
                    vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupportedOnAllNodes, localizedConstants_2.default.cmdNameDataExplorerDelete));
                    return;
                }
                if (!helper_1.Utils.IsMultipleCommandSupportedAcrossConnection(constants_1.Constants.cmdExplorerConnectionDelete, nodes)) {
                    vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupportedAcrossConnectionNodes, localizedConstants_2.default.cmdNameDataExplorerDelete));
                    return;
                }
            }
            for (let index = 0; index < nodes.length; index++) {
                await this.connectionController.removeProfileHandler(nodes[index].connectionProperties);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerConnectionModify, async (conNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupported, localizedConstants_2.default.cmdNameDataExplorerModifyConnection));
                return;
            }
            await this.onModifyConnection(conNode);
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerConnectionNew, async (conNode, selectedNodes) => {
            await this.onNewConnection();
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdPaletteClearRecentConnections, async () => {
            await self.connectionController.clearMRUConnectionList();
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdPaletteConnectionDelete, async () => {
            await self.connectionController.removeProfileHandler(undefined);
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdPaletteConnectionModify, async () => {
            await self.connectionController.updateProfileHandler(undefined);
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdPaletteConnectionNew, async () => {
            await this.newConnectionUI(self);
        });
        self.vscodeConnector.onDidChangeActiveTextEditor(async (textEditor) => await self.onActiveTextEditorChanged(textEditor));
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerOpenNewSQLFile, async (conNode, selectedNodes) => {
            let nodes = [conNode];
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupported, localizedConstants_2.default.cmdNameDataExplorerOpenNewSqlFile));
                return;
            }
            for (let index = 0; index < nodes.length; index++) {
                await this.onOpenNewSQLFileFromConnection(nodes[index]);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdExplorerOpenExistingSQLFile, async (conNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupported, localizedConstants_2.default.cmdNameDataExplorerOpenExistingSqlFile));
                return;
            }
            await this.onOpenExistingSQLFileFromConnection(conNode);
        });
        vscode.commands.registerCommand(constants_1.Constants.openCompilerSettingsCommand, async (connNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerCompilerSettings));
                return;
            }
            await self.compilerSettingsManager.openCompilerSettings(connNode);
        });
        vscode.commands.registerCommand(constants_1.Constants.openFormatterSettingsCommand, async (connNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupported, localizedConstants_2.default.cmdNameDataExplorerFormatterSettings));
                return;
            }
            await self.formatterSettingsManager.openFormatterSettings(connNode, false);
        });
        vscode.commands.registerCommand(constants_1.Constants.openFormatterSettingFromToolbarCmd, async () => {
            await self.formatterSettingsManager.openFormatterSettings(undefined, true);
        });
        vscode.commands.registerCommand(constants_1.Constants.openFilterSettingsCommand, async (treeNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupported, localizedConstants_2.default.cmdNameDataExplorerFilters));
                return;
            }
            await self.filterSettingsManager.openFilterSettings(treeNode);
        });
        vscode.commands.registerCommand(constants_1.Constants.openExplainPlanSettingsCmd, async (connNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupported, localizedConstants_2.default.cmdNameDataExplorerExplainPlanSettings));
                return;
            }
            await self.explainPlanSettingsManager.openExplainPlanSettings(connNode);
        });
        vscode.commands.registerCommand(constants_1.Constants.openFilterSettingsAllCommand, async () => {
            await self.filterSettingsManager.openFilterSettings();
        });
        vscode.commands.registerCommand(constants_1.Constants.openConfigureAIProviderCmd, async (connNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupported, localizedConstants_2.default.cmdNameDataExplorerConfigureAIProvider));
                return;
            }
            await self.dbmsCloudAIManager.openConfigureAIProvider(connNode);
        });
        vscode.commands.registerCommand(constants_1.Constants.openManageAIProfilesCmd, async (connNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.multiNodeOperationNotSupported, localizedConstants_2.default.cmdNameDataExplorerConfigureAIProfile));
                return;
            }
            await self.dbmsCloudAIManager.openManageAIProfiles(connNode);
        });
        vscode.commands.registerCommand(constants_1.Constants.cmdGetDatabaseExplorerConnections, async () => {
            return self.getDatabaseExplorerConnections();
        });
        vscode.commands.registerCommand(constants_1.Constants.installXeDatabase, async () => {
            try {
                this.fileLogger.info("Launching XE Database installation page");
                let command;
                let link;
                if (process.platform === constants_1.Constants.windowsProcessPlatform) {
                    link = constants_1.Constants.oracleInstallXEDatabaseWinURL;
                    command = `${constants_1.Constants.windowsOpenCommand} ${constants_1.Constants.oracleInstallXEDatabaseWinURL}`;
                }
                else if (process.platform === constants_1.Constants.linuxProcessPlatform) {
                    link = constants_1.Constants.oracleInstallXEDatabaseLinURL;
                    command = `${constants_1.Constants.linuxOpenCommand} ${constants_1.Constants.oracleInstallXEDatabaseLinURL}`;
                }
                else {
                    link = constants_1.Constants.oracleInstallXEDatabaseMacURL;
                    command = `${constants_1.Constants.macOSOpenCommand} ${constants_1.Constants.oracleInstallXEDatabaseMacURL}`;
                }
                logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_2.default.outwindowConnectionPageDialogue, link));
                await childProcess.exec(command);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.errorLaunchingXEDatabaseInstallationURL, error.message));
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.getHelp, async () => {
            try {
                const startCommand = (process.platform === constants_1.Constants.macOSprocessplatform ? constants_1.Constants.macOSOpenCommand :
                    process.platform === constants_1.Constants.windowsProcessPlatform ? constants_1.Constants.windowsOpenCommand : constants_1.Constants.linuxOpenCommand);
                logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_2.default.openingGetHelpURL, constants_1.Constants.oracleGetHelpURL));
                await childProcess.exec(`${startCommand} ${constants_1.Constants.oracleGetHelpURL}`);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.errorLaunchingGetHelpURL, error.message));
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.getHelpFromEditorToolbarCmd, async () => {
            try {
                const startCommand = (process.platform === constants_1.Constants.macOSprocessplatform ? constants_1.Constants.macOSOpenCommand :
                    process.platform === constants_1.Constants.windowsProcessPlatform ? constants_1.Constants.windowsOpenCommand : constants_1.Constants.linuxOpenCommand);
                logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_2.default.openingGetEditorHelpURL, constants_1.Constants.oracleGetEditorHelpURL));
                await childProcess.exec(`${startCommand} ${constants_1.Constants.oracleGetEditorHelpURL}`);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_2.default.errorLaunchingGetEditorHelpURL, error.message));
            }
        });
    }
    async newConnectionUI(self) {
        try {
            self.connectionController.openCreateProfileUI("", false);
        }
        catch (error) {
            this.vscodeConnector.showErrorMessage(localizedConstants_1.default.errorEncountered + error);
        }
    }
    async onActiveTextEditorChanged(textEditor) {
        if (textEditor) {
            if (textEditor.document && textEditor.document.uri) {
                this.lastActiveTextEditor = textEditor;
                this.fileLogger.info("onActiveTextEditorChanged for Active text editor");
                if (textEditor.document.uri.scheme == constants_1.Constants.oracleScheme &&
                    constants_1.Constants.oracleLanguageID !== textEditor.document.languageId) {
                    this.fileLogger.info("onActiveTextEditorChanged - oracle uri scheme - set language to oraclesql");
                    await vscode.languages.setTextDocumentLanguage(textEditor.document, constants_1.Constants.oracleLanguageID);
                }
                else {
                    if (textEditor.document.uri.scheme == constants_1.Constants.vscodeFileScheme &&
                        constants_1.Constants.oracleLanguageID !== textEditor.document.languageId) {
                        var fileExtnsForAssociation = settings_1.Settings.getEffectiveConfigValueForDoc(constants_1.Constants.fileExtnAssociationsSettingsPropertyName, textEditor.document);
                        if (this.canSetLanguageId(textEditor.document.uri, fileExtnsForAssociation)) {
                            this.fileLogger.info("onActiveTextEditorChanged - file uri scheme - set language to oraclesql");
                            await vscode.languages.setTextDocumentLanguage(textEditor.document, constants_1.Constants.oracleLanguageID);
                        }
                    }
                }
            }
            else {
                this.fileLogger.info("onActiveTextEditorChanged - TextEditor.document  or TextEditor.document.uri is undefined");
            }
        }
        else {
            this.fileLogger.info("onActiveTextEditorChanged - TextEditor is undefined");
        }
        this.statusController.onActiveTextEditorChanged(textEditor);
        if (textEditor) {
            oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(null);
        }
        let doc = undefined;
        if (textEditor) {
            doc = textEditor.document;
        }
        await this.defaultConnManager.associateDefaultConnectionToFile(doc);
    }
    canSetLanguageId(uri, fileExtns) {
        let retval = false;
        let fsPath = uri.fsPath?.toLowerCase();
        let ext = "";
        let index = -1;
        if (fileExtns !== undefined && fileExtns !== null) {
            for (var i = 0; i < fileExtns.length; i++) {
                index = fileExtns[i].indexOf(".");
                this.fileLogger.info(`canSetLanguageId: fileExtns[${i}]: ${fileExtns[i]}, index: ${index}`);
                if (index > 0) {
                    if (fsPath?.endsWith(fileExtns[i].substring(index))) {
                        this.fileLogger.info(`canSetLanguageId: found match, return true`);
                        retval = true;
                        break;
                    }
                }
            }
            if (!retval) {
                this.fileLogger.info(`canSetLanguageId: no match, return false`);
            }
        }
        return retval;
    }
    async newConnectionHandler() {
        const self = this;
        self.fileLogger.info("Create new connection profile/connection for active document");
        let valToReturn = false;
        if (self.isExtensionInitialized() && self.documentIsOpen()) {
            let uri = undefined;
            if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
                uri = vscode.window.activeTextEditor.document.uri;
            }
            valToReturn = await self.connectionController.newConnectionHandler(uri);
        }
        if (valToReturn === undefined) {
            valToReturn = false;
        }
        return valToReturn;
    }
    async disconnectHandler() {
        const self = this;
        self.fileLogger.info("Disconnect command received from VS Code for the currently active text document.");
        let valToReturn = false;
        if (self.isExtensionInitialized() && self.documentIsOpenAndOracle()) {
            valToReturn = await this.connectionController.disocnnectRequestHandler();
        }
        if (valToReturn === undefined) {
            valToReturn = false;
        }
        return valToReturn;
    }
    async oracleLanguageAssocHandler() {
        const self = this;
        self.fileLogger.info("Check if the currently active text document is associated with Oracle extension.");
        let valToReturn = undefined;
        if (self.isExtensionInitialized() && self.documentIsOpenAndOracle()) {
            const uri = self.vscodeConnector.activeTextEditorUri;
            if (uri) {
                valToReturn = await self.connectionController.languageAssociationHandler();
            }
        }
        return valToReturn;
    }
    documentIsOpen() {
        const self = this;
        self.fileLogger.info("Check if a document is open in VS Code");
        let valToReturn = true;
        if (self.vscodeConnector.activeTextEditor === undefined ||
            !(self.vscodeConnector.activeTextEditor.document.uri.scheme === "file" ||
                self.vscodeConnector.activeTextEditor.document.uri.scheme === "untitled")) {
            if (self.vscodeConnector.activeTextEditor.document.uri.scheme !== constants_1.Constants.oracleScheme)
                self.vscodeConnector.showWarningMessage("msgFileAssociationMissing");
            valToReturn = false;
        }
        return valToReturn;
    }
    setLocale() {
        this.fileLogger.info("Setting Locale :" + vscode.env.language);
        localizedConstants_1.default.localize(vscode.env.language);
        this.fileLogger.info("Locale Set and messages localized");
    }
    executeSQLCommand() {
        this.executeQueryCommand(scriptExecutionModels_1.ExecutionMode.Selection);
    }
    executeAllCommand() {
        this.executeQueryCommand(scriptExecutionModels_1.ExecutionMode.File);
    }
    getDisplayMode(explainPlanMode) {
        let displayMode = scriptExecutionModels_1.UIDisplayMode.None;
        switch (explainPlanMode) {
            case scriptExecutionModels_1.ExplainPlanMode.ExplainPlanGrid:
                displayMode = scriptExecutionModels_1.UIDisplayMode.executeExplainPlanSQL;
                break;
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExplainPlanText:
                displayMode = scriptExecutionModels_1.UIDisplayMode.executeDBMSExplainPlanSQL;
                break;
            case scriptExecutionModels_1.ExplainPlanMode.ExecutionPlanGrid:
                displayMode = scriptExecutionModels_1.UIDisplayMode.ExecutionPlanGrid;
                break;
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExecutionPlanText:
                displayMode = scriptExecutionModels_1.UIDisplayMode.DBMSExecutionPlanText;
                break;
            default:
                break;
        }
        return displayMode;
    }
    getActiveDocument() {
        return this.vscodeConnector.activeTextEditor.document;
    }
    executeQueryCommand(mode, explainPlanMode = scriptExecutionModels_1.ExplainPlanMode.None, explainPlanDetail = null) {
        this.fileLogger.info("Query execution command handler invoked");
        if (this.isExtensionInitialized() && this.documentIsOpenAndOracle()) {
            if (this.vscodeConnector.isActiveDocumentEmpty()) {
                return;
            }
            let ownerURI = this.vscodeConnector.activeTextEditorUri;
            this.fileLogger.info("Validated query execution input");
            let activeDoc = this.vscodeConnector.activeTextEditor.document;
            const fileName = activeDoc.fileName;
            const executeQueryRequest = new scriptExecutionModels_1.ScriptExecuteParams();
            executeQueryRequest.ownerUri = ownerURI;
            executeQueryRequest.executionMode = mode;
            executeQueryRequest.explainMode = explainPlanMode;
            executeQueryRequest.explainPlanDetail = explainPlanDetail;
            executeQueryRequest.querySettings = settings_1.Settings.getQueryExecutionSettingsForDoc(activeDoc, explainPlanMode);
            executeQueryRequest.scriptFileName = activeDoc.fileName;
            executeQueryRequest.windowUri = helper_1.Utils.getFileURI(explainPlanMode, ownerURI);
            executeQueryRequest.updateIntellisense = settings_1.Settings.getEffectiveConfigValueForDoc(constants_1.Constants.rebuildIntelliSenseOnDDLexecution, activeDoc);
            let executeCurrentQueryCommand = false;
            if (mode === scriptExecutionModels_1.ExecutionMode.Selection) {
                executeQueryRequest.selection = this.vscodeConnector.getActiveDocumentSelection();
                executeCurrentQueryCommand = this.isExecuteCurrentQueryCommand(executeQueryRequest.selection);
            }
            let displayMode = this.getDisplayMode(explainPlanMode);
            displayMode = displayMode == scriptExecutionModels_1.UIDisplayMode.None ? scriptExecutionModels_1.UIDisplayMode.ExecuteSQLStatement : displayMode;
            if (executeCurrentQueryCommand) {
                this.scriptExecutionCommandHandler.startQueryExecution(executeQueryRequest, fileName, displayMode);
            }
            else {
                let displayMode = this.getDisplayMode(explainPlanMode);
                displayMode = displayMode == scriptExecutionModels_1.UIDisplayMode.None ? scriptExecutionModels_1.UIDisplayMode.ExecuteScript : displayMode;
                this.scriptExecutionCommandHandler.startQueryExecution(executeQueryRequest, fileName, displayMode);
            }
        }
    }
    cancelScriptExecutionHandler() {
        const self = this;
        self.fileLogger.info("Cancel script execution command handler invoked");
        if (self.isExtensionInitialized() && this.documentIsOpenAndOracle()) {
            const scriptPath = this.vscodeConnector.activeTextEditorUri;
            this.scriptExecutionCommandHandler.cancelAllScriptExecution(scriptPath);
        }
    }
    runAndLogUnhandledError(commandHandlerPromise) {
        const self = this;
        return commandHandlerPromise.catch((err) => {
            if (err && err.message) {
                self.vscodeConnector.showErrorMessage(localizedConstants_1.default.errorEncountered + err);
            }
            return undefined;
        });
    }
    closeDocumentHandler(doc) {
        const self = this;
        if (!self.initialized) {
            return;
        }
        this.statusController.onTextEditorClosed(doc);
        self.fileLogger.info("Close Document event received from VS Code");
        if (self.documentSavedTimer) {
            self.documentSavedTimer.end();
        }
        if (self.documentOpenedTimer) {
            self.documentOpenedTimer.end();
        }
        const currentDocUriScheme = doc.uri.scheme;
        const currentDocUri = helper.convertURIToString(doc.uri);
        if (self.previousOpenedDoc &&
            self.documentOpenedTimer.getDuration() <
                constants_1.Constants.definedTimeForRenameDoc) {
            self.connectionController.changeDatabaseConnectionForDoc(currentDocUri, self.previousOpenedDoc);
        }
        else if (self.previousSavedDoc &&
            currentDocUriScheme === constants_1.Constants.untitled &&
            self.documentSavedTimer.getDuration() <
                constants_1.Constants.definedTimeForUntitledSave) {
            self.connectionController.changeDatabaseConnectionForDoc(currentDocUri, self.previousSavedDoc);
        }
        else {
            self.connectionController.textDocumentCloseHandler(doc);
        }
        self.previousOpenedDoc = undefined;
        self.previousSavedDoc = undefined;
        self.documentSavedTimer = undefined;
        self.documentOpenedTimer = undefined;
        let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(doc);
        if (explorerFile) {
            this.codeEditorProvider.onEditorClosed(doc.uri);
        }
        this.oracleIntelliSenseDataManager.clearCacheForDocument(currentDocUri);
    }
    async onRunNewQuery() {
        let valtoRet = false;
        if (this.isExtensionInitialized) {
            try {
                this.untitiledDocumentProvider.createAndOpen().then(async (doc) => {
                    await this.connectionController.newConnectionHandler(doc.uri);
                    valtoRet = true;
                });
            }
            catch (err) {
                this.fileLogger.error("Unhandled error received in a command handler");
                valtoRet = false;
            }
        }
        return Promise.resolve(valtoRet);
    }
    async onGettingStartedGuide() {
        const startCommand = (process.platform === constants_1.Constants.macOSprocessplatform ? constants_1.Constants.macOSOpenCommand :
            process.platform === constants_1.Constants.windowsProcessPlatform ? constants_1.Constants.windowsOpenCommand : constants_1.Constants.linuxOpenCommand);
        childProcess.exec(startCommand + " " + constants_1.Constants.oracleGettingStartedLink);
        return Promise.resolve(true);
    }
    async onModifyConnection(connNode) {
        try {
            if (connNode) {
                await this.connectionController.updateProfileHandler(connNode.connectionProperties);
            }
        }
        catch (error) {
            helper_1.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
        }
    }
    async onNewConnection() {
        try {
            await this.newConnectionUI(this);
        }
        catch (error) {
            helper_1.AppUtils.ShowErrorAndLog(error, this.vscodeConnector);
        }
    }
    async onOpenNewSQLFileFromConnection(connNode) {
        if (connNode && this.isExtensionInitialized) {
            try {
                this.defaultConnManager.associateDefaultConn = false;
                this.untitiledDocumentProvider.createAndOpen().then((doc) => {
                    this.defaultConnManager.associateDefaultConn = true;
                    this.connectionController.createConnectionFromConnProps(connNode.connectionProperties, doc.uri.toString(), true);
                });
            }
            catch (err) {
                this.defaultConnManager.associateDefaultConn = true;
                helper.logErroAfterValidating(err);
            }
        }
    }
    async onOpenExistingSQLFileFromConnection(connNode) {
        if (connNode && this.isExtensionInitialized) {
            try {
                const options = {};
                options.canSelectFiles = true;
                options.canSelectFolders = false;
                options.canSelectMany = false;
                if (this.openingFolderFirstTime && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                    options.defaultUri = vscode.workspace.workspaceFolders[0].uri;
                }
                options.openLabel = localizedConstants_2.default.selectFile;
                vscode.window.showOpenDialog(options).then((uri) => {
                    if (uri && uri.length > 0 && uri[0] && uri[0].fsPath) {
                        logger_1.FileStreamLogger.Instance.info(`Selected file to open- ${uri[0].fsPath}`);
                        this.openingFolderFirstTime = false;
                        this.openFileAndAssocateWithConn(uri[0].fsPath, connNode);
                        logger_1.FileStreamLogger.Instance.info("File opened and connected to database");
                    }
                }, (error) => {
                    helper.logErroAfterValidating(error);
                });
            }
            catch (err) {
                helper.logErroAfterValidating(err);
            }
        }
    }
    async openFileAndAssocateWithConn(filename, connNode) {
        logger_1.FileStreamLogger.Instance.info(`Opening file- ${filename}`);
        defaultConnectionManager_1.DefaultConnectionManager.instance.addToExcludedFilesForDefaultConnection(filename);
        vscode.workspace.openTextDocument(vscode.Uri.file(filename))
            .then(async (document) => {
            vscode.languages.setTextDocumentLanguage(document, constants_1.Constants.oracleLanguageID).then(() => {
                vscode.window.showTextDocument(document, { preview: false }).then((editor) => {
                    try {
                        this.connectionController.createConnectionFromConnProps(connNode.connectionProperties, document.uri.toString(), true);
                        logger_1.FileStreamLogger.Instance.info(`File opened successfully- ${filename}`);
                    }
                    catch (err) {
                        helper.logErroAfterValidating(err);
                    }
                }, (err) => {
                    logger_1.FileStreamLogger.Instance.error(`Failed to open file ${filename}`);
                    helper.logErroAfterValidating(err);
                });
            }, (err) => {
                logger_1.FileStreamLogger.Instance.error(`Failed to open file ${filename}`);
                helper.logErroAfterValidating(err);
            });
        }, (err) => {
            logger_1.FileStreamLogger.Instance.error(`Failed to open file ${filename}`);
            helper.logErroAfterValidating(err);
        });
    }
    async getDatabaseExplorerConnections() {
        const newProfiles = [];
        logger_1.FileStreamLogger.Instance.info("In getDatabaseExplorerConnections");
        try {
            const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
            const profiles = helperSettings.retrieveAllConnections(true);
            if (profiles && profiles.length > 0) {
                logger_1.FileStreamLogger.Instance.info(`Number of odtvscode connection profiles:  ${profiles.length}`);
                var connInfo = null;
                var profile = null;
                for (let i = 0; i < profiles.length; i++) {
                    logger_1.FileStreamLogger.Instance.info(`Processing connection profile:  ${i}`);
                    profile = profiles[i];
                    connInfo = new connectionModels_1.ConnectionInfo();
                    newProfiles.push(connInfo);
                    switch (profile.connectionType) {
                        case scriptExecutionModels_1.ConnectionType.TNS:
                            {
                                connInfo.connectionType = "TNSAlias";
                                break;
                            }
                        case scriptExecutionModels_1.ConnectionType.EZConnect:
                            {
                                connInfo.connectionType = "EZConnect";
                                break;
                            }
                        case scriptExecutionModels_1.ConnectionType.Advanced:
                            {
                                connInfo.connectionType = "EZConnectPlus";
                                break;
                            }
                        case scriptExecutionModels_1.ConnectionType.ODPConnectionString:
                            {
                                connInfo.connectionType = "DotnetConnectionString";
                                break;
                            }
                        default:
                            break;
                    }
                    if (profile.name) {
                        connInfo.connectionName = profile.name;
                    }
                    if (profile.dBAPrivilege) {
                        connInfo.dbaPrivilege = profile.dBAPrivilege;
                    }
                    else {
                        connInfo.dbaPrivilege = "None";
                    }
                    if (profile.dataSource) {
                        connInfo.dataSource = profile.dataSource;
                    }
                    if (profile.tnsAdmin) {
                        connInfo.tnsAdmin = profile.tnsAdmin;
                    }
                    else {
                        connInfo.tnsAdmin = "";
                    }
                    if (profile.walletLocation) {
                        connInfo.walletLocation = profile.walletLocation;
                    }
                    else {
                        connInfo.walletLocation = "";
                    }
                    if (profile.userID) {
                        connInfo.userName = profile.userID;
                        if (profile.userID.length === 1 && profile.userID === "/") {
                            connInfo.authenticationType = "Integrated";
                            connInfo.userName = "";
                            connInfo.passwordRequired = false;
                        }
                        else {
                            connInfo.authenticationType = "Database";
                            connInfo.passwordRequired = true;
                        }
                    }
                    if (profile.proxyUserID) {
                        connInfo.proxyUsername = profile.proxyUserID;
                    }
                    else {
                        connInfo.proxyUsername = "";
                    }
                    if (profile.proxyAuthByPassword) {
                        connInfo.proxyPasswordRequired = true;
                    }
                    else {
                        connInfo.proxyPasswordRequired = false;
                    }
                    if (profile.loginScript) {
                        connInfo.loginScript = profile.loginScript;
                    }
                    else {
                        connInfo.loginScript = "";
                    }
                    logger_1.FileStreamLogger.Instance.info(`Number of new connection profiles:  ${newProfiles.length}`);
                }
            }
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
        var connInfos = JSON.stringify({ "oracledevtools.connections": newProfiles });
        logger_1.FileStreamLogger.Instance.info(`Returning connection profiles as a string of length ${connInfos.length} characters`);
        return connInfos;
    }
    getExplainPlanInfo(explainPlanMode) {
        let explainPlanInfo = new scriptExecutionModels_1.ExplainPlanDetail(explainPlanMode);
        switch (explainPlanMode) {
            case scriptExecutionModels_1.ExplainPlanMode.ExplainPlanGrid:
                explainPlanInfo.explainPlanSettings = explainPlanUtils_1.explainPlanUtils.getExplainPlanSettings(explainPlanUtils_1.ExplainSettingType.ExplainPlan, this.getActiveDocument());
                break;
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExplainPlanText:
                explainPlanInfo.dbmsExplainPlanConfig = explainPlanUtils_1.explainPlanUtils.getExplainPlanSettings(explainPlanUtils_1.ExplainSettingType.DBMSExplainPlan, this.getActiveDocument());
                break;
            case scriptExecutionModels_1.ExplainPlanMode.ExecutionPlanGrid:
                explainPlanInfo.explainPlanSettings = explainPlanUtils_1.explainPlanUtils.getExplainPlanSettings(explainPlanUtils_1.ExplainSettingType.ExecutionPlan, this.getActiveDocument());
                break;
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExecutionPlanText:
                explainPlanInfo.dbmsExplainPlanConfig = explainPlanUtils_1.explainPlanUtils.getExplainPlanSettings(explainPlanUtils_1.ExplainSettingType.DBMSExecutionPlan, this.getActiveDocument());
                break;
        }
        return explainPlanInfo;
    }
    executeExplainPlan() {
        try {
            const self = this;
            self.fileLogger.info("execute Explain Plan command received from VS Code");
            this.executeQueryCommand(scriptExecutionModels_1.ExecutionMode.Selection, scriptExecutionModels_1.ExplainPlanMode.ExplainPlanGrid, this.getExplainPlanInfo(scriptExecutionModels_1.ExplainPlanMode.ExplainPlanGrid));
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on executing executeExplainPlan");
            logger_1.FileStreamLogger.Instance.error(error);
        }
    }
    executeDBExplainPlan() {
        try {
            const self = this;
            self.fileLogger.info("execute dbMSExplain Plan command received from VS Code");
            this.executeQueryCommand(scriptExecutionModels_1.ExecutionMode.Selection, scriptExecutionModels_1.ExplainPlanMode.DBMSExplainPlanText, this.getExplainPlanInfo(scriptExecutionModels_1.ExplainPlanMode.DBMSExplainPlanText));
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on executing executeDBExplainPlan");
            logger_1.FileStreamLogger.Instance.error(error);
        }
    }
    executeDBExecutionPlan() {
        const self = this;
        self.fileLogger.info("execute DbMSExecution Plan command received from VS Code");
        this.executeQueryCommand(scriptExecutionModels_1.ExecutionMode.Selection, scriptExecutionModels_1.ExplainPlanMode.DBMSExecutionPlanText, this.getExplainPlanInfo(scriptExecutionModels_1.ExplainPlanMode.DBMSExecutionPlanText));
    }
    executeExecutionPlan() {
        const self = this;
        self.fileLogger.info("execute DbMSExecution Plan command received from VS Code");
        this.executeQueryCommand(scriptExecutionModels_1.ExecutionMode.Selection, scriptExecutionModels_1.ExplainPlanMode.ExecutionPlanGrid, this.getExplainPlanInfo(scriptExecutionModels_1.ExplainPlanMode.ExecutionPlanGrid));
    }
    executeTranslatetoSQL() {
        const self = this;
        self.fileLogger.info("executeTranslatetoSQL command received from VS Code");
        this.executeGenerateSQLfromNLQueryCommand(scriptExecutionModels_1.Action.ShowSQL);
    }
    executeTranslateToSQLAndExplain() {
        const self = this;
        self.fileLogger.info("executeTranslateToSQLAndExplain command received from VS Code");
        this.executeGenerateSQLfromNLQueryCommand(scriptExecutionModels_1.Action.Narrate);
    }
    executeExplain() {
        const self = this;
        self.fileLogger.info("executeTranslatetoExplain command received from VS Code");
        this.executeGenerateSQLfromNLQueryCommand(scriptExecutionModels_1.Action.Chat);
    }
    async hideInlineSuggestion() {
        await vscode.commands.executeCommand('editor.action.inlineSuggest.hide');
    }
    async executeRTSMDetailCommand() {
        const self = this;
        self.fileLogger.info("execute Real-Time SQL Monitoring command received from VS Code");
        let info = self.connectionController.getSavedConnectionProperties(this.vscodeConnector.activeTextEditorUri);
        let connectionUniqueName = info.connectionAttributes.uniqueName;
        let connNode = self.dataExpManager.getConnectionNodeFromConnectionUniqueName(connectionUniqueName);
        let res = await this.rtsmService.PromptRtsmWarningForConnectionNode(connNode);
        if (!res)
            return;
        this.executeRtsmQueryCommand(scriptExecutionModels_1.ExecutionMode.Selection);
    }
    executeRtsmQueryCommand(mode) {
        let self = this;
        this.fileLogger.info("Query execution command handler invoked");
        if (this.isExtensionInitialized() && this.documentIsOpenAndOracle()) {
            if (this.vscodeConnector.isActiveDocumentEmpty()) {
                return;
            }
            let ownerURI = this.vscodeConnector.activeTextEditorUri;
            this.fileLogger.info("Validated query execution input");
            let activeDoc = this.vscodeConnector.activeTextEditor.document;
            const fileName = activeDoc.fileName;
            const executeQueryRequest = new scriptExecutionModels_1.ScriptExecuteParams();
            executeQueryRequest.ownerUri = ownerURI;
            executeQueryRequest.windowUri = ownerURI + "_RTSM";
            executeQueryRequest.executionMode = mode;
            executeQueryRequest.explainMode = scriptExecutionModels_1.ExplainPlanMode.None;
            executeQueryRequest.querySettings = settings_1.Settings.getQueryExecutionSettingsForDoc(activeDoc);
            executeQueryRequest.scriptFileName = activeDoc.fileName;
            executeQueryRequest.isRtsmRequest = true;
            let executeCurrentQueryCommand = false;
            let info = self.connectionController.getSavedConnectionProperties(this.vscodeConnector.activeTextEditorUri);
            let connectionUniqueName = info.connectionAttributes.uniqueName;
            let connNode = self.dataExpManager.getConnectionNodeFromConnectionUniqueName(connectionUniqueName);
            executeQueryRequest.connectionUri = connNode.connectionURI;
            executeQueryRequest.updateIntellisense = settings_1.Settings.getEffectiveConfigValueForDoc(constants_1.Constants.rebuildIntelliSenseOnDDLexecution, activeDoc);
            if (mode === scriptExecutionModels_1.ExecutionMode.Selection) {
                executeQueryRequest.selection = this.vscodeConnector.getActiveDocumentSelection();
                executeCurrentQueryCommand = this.isExecuteCurrentQueryCommand(executeQueryRequest.selection);
            }
            let displayMode = scriptExecutionModels_1.UIDisplayMode.RealTimeSqlMonitoringDetail;
            this.scriptExecutionCommandHandler.startQueryExecution(executeQueryRequest, fileName, displayMode, localizedConstants_2.default.rtsmDetailedReportUITitle);
        }
    }
    executeGenerateSQLfromNLQueryCommand(generateAction) {
        let self = this;
        this.fileLogger.info("Generate SQL from NL Query execution command handler invoked");
        let mode = scriptExecutionModels_1.ExecutionMode.Selection;
        if (this.isExtensionInitialized() && this.documentIsOpenAndOracle()) {
            if (this.vscodeConnector.isActiveDocumentEmpty()) {
                return;
            }
            let ownerURI = this.vscodeConnector.activeTextEditorUri;
            this.fileLogger.info("Validated query execution input");
            let activeDoc = this.vscodeConnector.activeTextEditor.document;
            const fileName = activeDoc.fileName;
            const executeQueryRequest = new scriptExecutionModels_1.ScriptExecuteParams();
            executeQueryRequest.ownerUri = ownerURI;
            executeQueryRequest.windowUri = ownerURI + "_generateSQLFromNL";
            executeQueryRequest.executionMode = mode;
            executeQueryRequest.explainMode = scriptExecutionModels_1.ExplainPlanMode.None;
            executeQueryRequest.querySettings = settings_1.Settings.getQueryExecutionSettingsForDoc(activeDoc);
            executeQueryRequest.scriptFileName = activeDoc.fileName;
            executeQueryRequest.generateAction = generateAction;
            let executeCurrentQueryCommand = false;
            if (mode === scriptExecutionModels_1.ExecutionMode.Selection) {
                executeQueryRequest.selection = this.vscodeConnector.getActiveDocumentSelection();
                executeCurrentQueryCommand = this.isExecuteCurrentQueryCommand(executeQueryRequest.selection);
            }
            this.scriptExecutionCommandHandler.startGenerateSQLFromNLQueryExecution(executeQueryRequest, fileName, scriptExecutionModels_1.UIDisplayMode.None);
        }
    }
    async onThemeChanged(colorTheme) {
        logger_1.FileStreamLogger.Instance.info("systemManager.onThemeChanged - Start");
        await scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance.handleColorThemeChanged(colorTheme);
        logger_1.FileStreamLogger.Instance.info("systemManager.onThemeChanged - End");
    }
    async onConfigurationChanged(configEvent) {
        try {
            logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Start");
            if (configEvent.affectsConfiguration(constants_1.Constants.extensionConfigSectionName) ||
                configEvent.affectsConfiguration(constants_1.Constants.oldExtensionConfigSectionName)) {
                if (configEvent.affectsConfiguration(constants_1.Constants.oldExtensionConfigSectionName)) {
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Migrating Configuration - Start");
                    await setup_1.Setup.migrateConfigurationSettings(setup_1.ConfigManager.instance.extensionPath);
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Migrating Configuration - End");
                }
                if (configEvent.affectsConfiguration(`${constants_1.Constants.extensionConfigSectionName}.${constants_1.Constants.oldFilesAssociationsSettingsPropertyName}`)) {
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Migrating Files Associations Settings - Start");
                    await setup_1.Setup.migrateFilesAssociationsSetting(setup_1.ConfigManager.instance.extensionPath);
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Migrating Files Associations Settings - End");
                }
                if (configEvent.affectsConfiguration(`${constants_1.Constants.extensionConfigSectionName}.${constants_1.Constants.configFileFolderPropertyName}`) ||
                    configEvent.affectsConfiguration(`${constants_1.Constants.extensionConfigSectionName}.${constants_1.Constants.walletFileFolderPropertyName}`) ||
                    configEvent.affectsConfiguration(`${constants_1.Constants.extensionConfigSectionName}.${constants_1.Constants.bookMarkFileFolderPropertyName}`) ||
                    configEvent.affectsConfiguration(`${constants_1.Constants.extensionConfigSectionName}.${constants_1.Constants.downloadsFolderPropertyName}`)) {
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update default locations for files - Start");
                    await setup_1.Setup.setDefaultLocationsForFiles(setup_1.ConfigManager.instance.extensionPath);
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update default locations for files - End");
                }
                logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update settings - Start");
                await this.settings.onConfigurationChanged(configEvent);
                logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update settings - End");
                if (configEvent.affectsConfiguration(`${constants_1.Constants.extensionConfigSectionName}.${constants_1.Constants.extensionConfigloggingSection}`)) {
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update FileStreamLogger - Start");
                    await logger_1.FileStreamLogger.onConfigurationChanged(configEvent);
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update FileStreamLogger - End");
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update ChannelLogger - Start");
                    await logger_1.ChannelLogger.onConfigurationChanged(configEvent);
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update ChannelLogger - End");
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update Debug Manager - Start");
                    await this.debugManager?.onConfigurationChanged(configEvent);
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update Debug Manager - End");
                }
                if (configEvent.affectsConfiguration(`${constants_1.Constants.extensionConfigSectionName}.${constants_1.Constants.bookMarkFileFolderPropertyName}`)) {
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update QueryBookmark Manager - Start");
                    await this.queryBookmarkManager?.onConfigurationChanged(configEvent);
                    logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update QueryBookmark Manager - End");
                }
                logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update ScriptExecutionEventsHandler - Start");
                await scriptExecutionEventsHandler_1.ScriptExecutionEventsHandler.instance.onConfigurationChanged(configEvent);
                logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update ScriptExecutionEventsHandler - End");
                logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update DataExplorer Manager - Start");
                await this.dataExpManager.onConfigurationChanged(configEvent);
                logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - Update DataExplorer Manager - End");
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on processing ConfigurationChanged event");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        logger_1.FileStreamLogger.Instance.info("systemManager.onConfigurationChanged - End");
    }
}
exports.SystemManager = SystemManager;
