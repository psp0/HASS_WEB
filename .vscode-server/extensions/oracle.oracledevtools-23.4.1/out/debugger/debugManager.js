"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.odtVscodeRequestArguments = exports.DebugAdapterExecutableFactory = exports.debugLogSettings = exports.debugObjectInfo = exports.DebugManager = void 0;
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const vscode = require("vscode");
const dataExplorerRequests_1 = require("../explorer/dataExplorerRequests");
const helper = require("../utilities/helper");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const utilities_1 = require("../explorer/utilities");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const setup_1 = require("../utilities/setup");
const constants_1 = require("../constants/constants");
const extension_1 = require("../extension");
const logger_1 = require("../infrastructure/logger");
const localizedConstants_1 = require("./../constants/localizedConstants");
const debuggerSettingsManager_1 = require("../explorer/debuggerSettingsManager");
const path = require("path");
const helper_1 = require("../utilities/helper");
const fs = require("fs");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const question_1 = require("../prompts/question");
class DebugManager {
    constructor(context, dataExpManager, scriptExecutor, vscodeConnector, varPrompter) {
        this.vscodeConnector = undefined;
        this.currentDebugSession = undefined;
        this.currentLoggingSettings = new debugLogSettings();
        this.dataExpManager = dataExpManager;
        this.scriptExecutor = scriptExecutor;
        this.vscodeConnector = vscodeConnector;
        this.extensionContext = context;
        this.prompter = varPrompter;
    }
    static CreateInstance(context, dataExpManager, scriptExecutor, vscodeConnector, varPrompter) {
        try {
            if (!DebugManager.instance) {
                DebugManager.instance = new DebugManager(context, dataExpManager, scriptExecutor, vscodeConnector, varPrompter);
            }
            return DebugManager.instance;
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
    }
    static get Instance() {
        return DebugManager.instance;
    }
    removeBreakpoints() {
        let breakpoints = vscode.debug.breakpoints;
        if (breakpoints) {
            let bpToRemove = [];
            for (let bp of breakpoints) {
                let sbp = bp;
                if (sbp && sbp.location && sbp.location.uri && sbp.location.uri.scheme === constants_1.Constants.oracleScheme) {
                    bpToRemove.push(bp);
                }
            }
            if (bpToRemove.length > 0) {
                vscode.debug.removeBreakpoints(bpToRemove);
            }
        }
    }
    init() {
        let execFactory = new DebugAdapterExecutableFactory();
        this.extensionContext.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory(constants_1.Constants.plsqlDebuggerType, execFactory));
        vscode.commands.registerCommand("oracleDBObjectExplorer.startExternalApplicationdebugger", async (treeNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNamestartExternalApplicationdebugger));
                return;
            }
            logger_1.FileStreamLogger.Instance.info("Debug command hanlder- startExternalApplicationdebugger");
            await this.startExternalApplicationDebugger(treeNode);
        });
        vscode.commands.registerCommand("oracleDBObjectExplorer.runDebug", async (treeNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameRunDebug));
                return;
            }
            logger_1.FileStreamLogger.Instance.info("Debug command hanlder- runDebug");
            await this.debugFromOENode(treeNode, dataExplorerRequests_1.DebugType.RunDebug);
        });
        vscode.commands.registerCommand("oracleDBObjectExplorer.stepInto", async (treeNode, selectedNodes) => {
            if (selectedNodes && selectedNodes.length > 0) {
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.multiNodeOperationNotSupported, localizedConstants_1.default.cmdNameDataExplorerStepInto));
                return;
            }
            logger_1.FileStreamLogger.Instance.info("Debug command hanlder- stepInto");
            await this.debugFromOENode(treeNode, dataExplorerRequests_1.DebugType.StepInto);
        });
        vscode.commands.registerCommand("oracleDBObjectExplorer.runDebugFromFile", async () => {
            logger_1.FileStreamLogger.Instance.info("Debug command hanlder- runDebugFromFile");
            await this.debugFromEditor(dataExplorerRequests_1.DebugType.RunDebug);
        });
        vscode.commands.registerCommand("oracleDBObjectExplorer.stepIntoFromFile", async () => {
            logger_1.FileStreamLogger.Instance.info("Debug command hanlder- stepIntoFromFile");
            await this.debugFromEditor(dataExplorerRequests_1.DebugType.StepInto);
        });
        vscode.debug.onDidReceiveDebugSessionCustomEvent(async (event) => {
            logger_1.FileStreamLogger.Instance.info("Debug session custom event hanlder");
            await this.processCustomEventsFromDA(event);
        });
        vscode.debug.onDidStartDebugSession(async (session) => {
            logger_1.FileStreamLogger.Instance.info("Debug session onDidStartDebugSession hanlder- Start");
            if (session && session.type === constants_1.Constants.plsqlDebuggerType) {
                try {
                    logger_1.FileStreamLogger.Instance.info("Updating the session info on onDidStartDebugSession");
                    this.currentDebugSession = session;
                    this.currentLoggingSettings = new debugLogSettings();
                    logger_1.FileStreamLogger.Instance.info("Sending request to debug adapter to udpate log settings");
                    let reqArgs = new odtVscodeRequestArguments();
                    reqArgs.type = "logging";
                    reqArgs.loggingEnabled = this.currentLoggingSettings.enable;
                    reqArgs.logLevel = this.currentLoggingSettings.loglevel;
                    await this.currentDebugSession.customRequest("odtvscode", reqArgs);
                    logger_1.FileStreamLogger.Instance.info("Sent request to debug adapter to udpate log settings");
                }
                catch (error) {
                    logger_1.FileStreamLogger.Instance.error("Error on processing onDidStartDebugSession");
                    helper.logErroAfterValidating(error);
                }
            }
            logger_1.FileStreamLogger.Instance.info("Debug session onDidStartDebugSession hanlder- End");
        });
        vscode.debug.onDidTerminateDebugSession(async (session) => {
            logger_1.FileStreamLogger.Instance.info("Debug session onDidTerminateDebugSession hanlder- Start");
            if (session.type === constants_1.Constants.plsqlDebuggerType) {
                try {
                    logger_1.FileStreamLogger.Instance.info("Terminating script execution on termination of debug session");
                    let debugObj = this.getDebugInfo(session);
                    if (debugObj && debugObj.resultsUri) {
                        this.scriptExecutor.cancelAllScriptExecution(debugObj.resultsUri);
                    }
                }
                catch (error) {
                    logger_1.FileStreamLogger.Instance.error("Error on processing onDidTerminateDebugSession");
                    helper.logErroAfterValidating(error);
                }
                logger_1.FileStreamLogger.Instance.info("Setting currentDebuggingObject to undefined");
                this.currentDebugSession = undefined;
            }
            logger_1.FileStreamLogger.Instance.info("Debug session onDidTerminateDebugSession hanlder- End");
        });
    }
    async onConfigurationChanged(configEvent) {
        logger_1.FileStreamLogger.Instance.info("vscode.ConfigurationChangeEvent- Check debug log settings- Start");
        try {
            if (this.currentDebugSession && this.currentLoggingSettings) {
                logger_1.FileStreamLogger.Instance.info("Currently in a debug session, need to check log settings");
                const { enable, loglevel } = (0, logger_1.getLoggingConfig)();
                if (this.currentLoggingSettings.enable !== enable ||
                    this.currentLoggingSettings.loglevel !== loglevel) {
                    logger_1.FileStreamLogger.Instance.info("Log settings have changed, need to update");
                    let reqArgs = new odtVscodeRequestArguments();
                    reqArgs.type = "logging";
                    reqArgs.loggingEnabled = enable;
                    reqArgs.logLevel = loglevel;
                    logger_1.FileStreamLogger.Instance.info("Sending request to debug adapter to udpate log settings");
                    await this.currentDebugSession.customRequest("odtvscode", reqArgs);
                    this.currentLoggingSettings.enable = enable;
                    this.currentLoggingSettings.loglevel = loglevel;
                    logger_1.FileStreamLogger.Instance.info("Sent request to debug adapter to udpate log settings");
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on processing ConfigurationChangeEvent");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("vscode.ConfigurationChangeEvent- Check debug log settings- End");
    }
    async processCustomEventsFromDA(event) {
        logger_1.FileStreamLogger.Instance.info("Debug session- Processing custom event- Start");
        try {
            if (event.event && event.event == 'odtvscode' && event.session) {
                let debugObj = this.getDebugInfo(event.session);
                if (debugObj && (debugObj.debugType === dataExplorerRequests_1.DebugType.StepInto ||
                    debugObj.debugType === dataExplorerRequests_1.DebugType.RunDebug)) {
                    if (event.body.EventType === "ListentingStarted") {
                        logger_1.FileStreamLogger.Instance.info("Debug session- Received ListentingStarted event");
                        let connectionNode = this.dataExpManager.getConnectionNode(debugObj.connectionUri);
                        let debugObjFromEditor = false;
                        let config = event.session.configuration;
                        if (config && config.debugObjFromEditor !== undefined && config.debugObjFromEditor !== null) {
                            debugObjFromEditor = config.debugObjFromEditor;
                        }
                        let [response, connOpen] = await utilities_1.ExplorerUtilities.runCodeObject(debugObj.connectionUri, debugObj.resultsUri, debugObj.ddexObjectType, debugObj.schemaName, debugObj.objectName, debugObj.parentName, debugObj.methodId, connectionNode.connectionProperties.uniqueName, this.scriptExecutor, true, event.body.HostIPAddress, event.body.PortNum, event.session.id, debugObjFromEditor);
                        if (!connOpen) {
                            if (connectionNode) {
                                this.dataExpManager.onConnectionDisconnect(connectionNode, true);
                            }
                        }
                        logger_1.FileStreamLogger.Instance.info("Debug session- Processed ListentingStarted event");
                    }
                    else if (event.body.EventType === "ConfigComplete") {
                        logger_1.FileStreamLogger.Instance.info("Debug session- Received ConfigComplete event");
                        let requestParams = new dataExplorerRequests_1.PlsqlDebugRequestParams();
                        requestParams.connectionUri = debugObj.connectionUri;
                        let response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.
                            sendRequest(dataExplorerRequests_1.PlsqlDebugRequest.type, requestParams);
                        logger_1.FileStreamLogger.Instance.info("Debug session- Processed ConfigComplete event");
                    }
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on processing Debug session custom event");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("Debug session- Processing custom event- End");
    }
    async debugFromOENode(treeNode, debugType) {
        logger_1.FileStreamLogger.Instance.info("Debugging - debugFromOENode - Start");
        try {
            if (treeNode) {
                let ddexObjectType = treeNode.ddexObjectType;
                let treeNodeToRun = treeNode;
                if (treeNode.ddexObjectType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
                    treeNode.ddexObjectType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
                    ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody;
                    treeNodeToRun = this.dataExpManager.getParentNode(treeNode);
                }
                let editorUri = editorUtils_1.editorUtils.getCodeEditorUri(treeNodeToRun, ddexObjectType, this.dataExpManager).toString();
                let editorDoc = editorUtils_1.editorUtils.getEditorDocument(treeNodeToRun, ddexObjectType, this.dataExpManager);
                let connectionNode = this.dataExpManager.getConnectionNode(treeNode.connectionURI);
                let objectProperties = new dataExplorerManager_1.ObjectNodeProperties(treeNode, connectionNode);
                let object = objectProperties.objectName;
                if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
                    objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
                    const parentName = objectProperties.dbObject.parent;
                    object = `${parentName}.${objectProperties.objectName}`;
                }
                if (!this.preProcessDebuggingFromOENode(objectProperties)) {
                    logger_1.FileStreamLogger.Instance.info("Debugging - debugFromOENode - Returning as preProcessDebuggingFromOENode failed");
                    return;
                }
                logger_1.FileStreamLogger.Instance.info("Debugging - debugFromOENode - preProcessDebuggingFromOENode complete");
                let canRunCodeObject = true;
                let saved = false;
                let parsedEditorUri = vscode.Uri.parse(editorUri);
                if (editorDoc) {
                    [canRunCodeObject, saved] = await this.dataExpManager.confirmToSaveBeforeRun(editorDoc, true);
                    if (canRunCodeObject && !saved) {
                        canRunCodeObject = await this.dataExpManager.confirmCompiledWithDebug(parsedEditorUri);
                    }
                }
                else {
                    canRunCodeObject = await this.dataExpManager.confirmCompiledWithDebug(parsedEditorUri);
                }
                if (canRunCodeObject) {
                    logger_1.FileStreamLogger.Instance.info("Debugging - debugFromOENode - preprocessing succeeded, proceeding to start debugging");
                    let connectionNode = this.dataExpManager.getConnectionNode(treeNode.connectionURI);
                    let objectProperties = new dataExplorerManager_1.ObjectNodeProperties(treeNode, connectionNode);
                    let debugObj = this.getDebugObj(objectProperties, undefined);
                    await this.startDebugging(parsedEditorUri.query, debugObj, debugType, connectionNode, false);
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on running code object from OE node for debugging");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("Debugging - debugFromOENode - End");
    }
    preProcessDebuggingFromOENode(objectProperties) {
        let object = objectProperties.objectName;
        if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
            objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
            const parentName = objectProperties.dbObject.parent;
            object = `${parentName}.${objectProperties.objectName}`;
        }
        let ownerUri = utilities_1.ExplorerUtilities.getRunResultsUri(objectProperties.connectionUri, objectProperties.ddexType, objectProperties.schemaName, object);
        return this.preProcessDebugging(ownerUri);
    }
    preProcessDebuggingFromEditor(editorUri) {
        let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
        if (params) {
            let ownerUri = utilities_1.ExplorerUtilities.getRunResultsUri(params.connectionUri, params.ddexObjectType, params.schemaname, params.objectname);
            return this.preProcessDebugging(ownerUri);
        }
        return false;
    }
    preProcessDebugging(ownerUri) {
        if (this.currentDebugSession || (ownerUri && this.scriptExecutor.isRunning(ownerUri))) {
            logger_1.FileStreamLogger.Instance.info("Debugging- preProcessDebugging- cannot start debugging as another script is executing");
            this.vscodeConnector.showInformationMessage(localizedConstants_1.default.scriptIsAlreadyExecutingOrCancelRunningExecution);
            return false;
        }
        return true;
    }
    async debugFromEditor(debugType) {
        logger_1.FileStreamLogger.Instance.info("Debugging - debugFromEditor - Start");
        try {
            const systemManager = (0, extension_1.getSystemManager)();
            if (systemManager.isExtensionInitialized() && systemManager.documentIsOpenAndOracle()) {
                if (this.vscodeConnector.activeTextEditor && this.vscodeConnector.activeTextEditor.document &&
                    this.vscodeConnector.activeTextEditor.document.uri) {
                    let editorDoc = this.vscodeConnector.activeTextEditor.document;
                    let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(editorDoc);
                    if (runnableFile) {
                        if (!this.preProcessDebuggingFromEditor(editorDoc.uri)) {
                            logger_1.FileStreamLogger.Instance.info("Debugging - debugFromEditor - Returning as preProcessDebuggingFromOENode failed");
                            return;
                        }
                        logger_1.FileStreamLogger.Instance.info("Debugging - debugFromEditor - preProcessDebuggingFromOENode complete");
                        if (editorUtils_1.editorUtils.verifyConnectedToDatabase(editorDoc.uri, this.dataExpManager, this.vscodeConnector)) {
                            let [canRunCodeObject, saved] = await this.dataExpManager.confirmToSaveBeforeRun(editorDoc, true);
                            let params = editorUtils_1.editorUtils.getQueryParameters(editorDoc.uri);
                            if (canRunCodeObject && !saved) {
                                canRunCodeObject = await this.dataExpManager.confirmCompiledWithDebug(editorDoc.uri);
                            }
                            if (canRunCodeObject) {
                                if (params) {
                                    logger_1.FileStreamLogger.Instance.info("Debugging - debugFromEditor - preprocessing succeeded, proceeding to start debugging");
                                    let debugObj = this.getDebugObj(undefined, editorDoc.uri);
                                    let connNode = this.dataExpManager.getConnectionNode(params.connectionUri);
                                    await this.startDebugging(editorDoc.uri.query, debugObj, debugType, connNode, true);
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on running code object from file for debugging");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("Debugging - debugFromEditor - End");
    }
    async startDebugging(editorUri, debugObj, debugType, connNode, debugObjFromEditor) {
        logger_1.FileStreamLogger.Instance.info("Starting the debug session.");
        let startedDebugging = false;
        try {
            let configuratonTarget = vscode.ConfigurationTarget.Global;
            let workspaceFolder = undefined;
            if (connNode) {
                configuratonTarget = connNode.connectionProperties.configurationTarget;
                workspaceFolder = connNode.connectionProperties.workspaceFolder;
            }
            let [debugSettings, ipAddresses, hostname] = await debuggerSettingsManager_1.debuggerSettingsManager.getDebugSettingsAndIpAddresses(configuratonTarget, workspaceFolder);
            if (!debugSettings || !debugSettings.ipAddress) {
                this.vscodeConnector.showErrorMessage(localizedConstants_1.default.startDebuggerHostError);
                return;
            }
            let jdwpAddress = debugSettings.ipAddress;
            let jdwpStartPort = debugSettings.startPort;
            let jdwpEndPort = debugSettings.endPort;
            let jdwpHostname = "";
            try {
                if (debugType !== dataExplorerRequests_1.DebugType.ExternalApplication &&
                    ((hostname && jdwpAddress === hostname) || jdwpAddress.toLocaleLowerCase() === constants_1.Constants.localhost)) {
                    let requestParams = new dataExplorerRequests_1.ResolveHostnameRequestParams();
                    requestParams.hostAddress = jdwpAddress.trim();
                    requestParams.connectionUri = connNode.connectionURI;
                    let response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.ResolveHostnameRequest.type, requestParams);
                    if (response && response.messageType == dataExplorerRequests_1.PlsqlValidateSettingsMessageType.Success && response.resolvedIP) {
                        jdwpHostname = jdwpAddress;
                        jdwpAddress = response.resolvedIP;
                    }
                    else {
                        let errMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.hostnameVerifyError, jdwpAddress);
                        this.vscodeConnector.showErrorMessage(errMsg);
                        return;
                    }
                }
                else {
                    if (debugType === dataExplorerRequests_1.DebugType.ExternalApplication &&
                        ((hostname && jdwpAddress === hostname) || jdwpAddress.toLocaleLowerCase() === constants_1.Constants.localhost)) {
                        let promptedIP = await this.promptUserForIPAddressSelection();
                        if (promptedIP) {
                            jdwpAddress = promptedIP;
                        }
                        else {
                            this.vscodeConnector.showInformationMessage(localizedConstants_1.default.selectIPAddress);
                            return;
                        }
                    }
                    if (ipAddresses && ipAddresses.indexOf(jdwpAddress) > -1) {
                        let requestParams = new dataExplorerRequests_1.PlsqlVerifyIPAddressRequestParams();
                        requestParams.ipAddress = jdwpAddress.trim();
                        let verifyResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.
                            sendRequest(dataExplorerRequests_1.PlsqlVerifyIPAddressRequest.type, requestParams);
                        if (!verifyResponse || !verifyResponse.isValid) {
                            let errMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.ipAddressVerifyError, jdwpAddress);
                            this.vscodeConnector.showErrorMessage(errMsg);
                            return;
                        }
                    }
                    else {
                        let errMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.ipAddressVerifyError, jdwpAddress);
                        this.vscodeConnector.showErrorMessage(errMsg);
                        return;
                    }
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.info('Error on verifying IP Address for debugging');
                logger_1.FileStreamLogger.Instance.error(error);
            }
            let config = {
                type: constants_1.Constants.plsqlDebuggerType,
                name: localizedConstants_1.default.odtDebugSession,
                request: constants_1.Constants.plsqlDebuggerLaunchConfigType,
                jdwp_startPort: jdwpStartPort,
                jdwp_endPort: jdwpEndPort,
                jdwp_address: jdwpAddress,
                jdwp_hostname: jdwpHostname,
                stopOnEntry: (debugType === dataExplorerRequests_1.DebugType.StepInto),
                entryScript: editorUri,
                debugObject: debugObj,
                debugObjFromEditor: debugObjFromEditor
            };
            logger_1.FileStreamLogger.Instance.info("Config updated, starting the debug session.");
            startedDebugging = await vscode.debug.startDebugging(undefined, config);
            logger_1.FileStreamLogger.Instance.info("Started the debug session");
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on starting the debug session");
            helper.logErroAfterValidating(error);
        }
        if (!startedDebugging) {
            logger_1.FileStreamLogger.Instance.info("Failed to start debug session.");
        }
    }
    async stopDebugging(ownerUri, debugSessionId, debugConnCreated) {
        logger_1.FileStreamLogger.Instance.info("Stoping the debug session.");
        if (this.currentDebugSession) {
            let debugObj = this.getDebugInfo(this.currentDebugSession);
            if (debugObj && debugObj.resultsUri === ownerUri) {
                try {
                    const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(ownerUri);
                    const clientInfo = clients && clients.length > 0 ? clients[0] : null;
                    let resultsPanel = clientInfo ? clientInfo.panel : null;
                    if (resultsPanel) {
                        logger_1.FileStreamLogger.Instance.info("Making the results window active.");
                        resultsPanel.reveal(resultsPanel.viewColumn, false);
                        logger_1.FileStreamLogger.Instance.info("Results window is made active window.");
                    }
                }
                catch (error) {
                    logger_1.FileStreamLogger.Instance.error("Error on making results window active.");
                    helper.logErroAfterValidating(error);
                }
                if (this.currentDebugSession.id === debugSessionId && !debugConnCreated) {
                    logger_1.FileStreamLogger.Instance.info("Stopping the debug session in progress.");
                    vscode.debug.stopDebugging(this.currentDebugSession);
                    this.currentDebugSession = undefined;
                    logger_1.FileStreamLogger.Instance.info("Stopped the debug session.");
                }
            }
        }
    }
    async startExternalApplicationDebugger(treeNode) {
        logger_1.FileStreamLogger.Instance.info("startExternalApplicationDebugger- Start");
        try {
            if (!this.preProcessDebugging(undefined)) {
                logger_1.FileStreamLogger.Instance.info("Debugging - startExternalApplicationDebugger - Returning as preProcessDebugging failed");
                return;
            }
            let connectionNode = this.dataExpManager.getConnectionNode(treeNode.connectionURI);
            let uriQuery = editorUtils_1.editorUtils.getUriQueryString(connectionNode.connectionProperties.uniqueName, "", "", connectionNode.connectionURI, dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Connection);
            let debugObj = "";
            await this.startDebugging(uriQuery, debugObj, dataExplorerRequests_1.DebugType.ExternalApplication, connectionNode, false);
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on starting External Applicaton Debugger");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("startExternalApplicationDebugger- End");
    }
    async promptUserForIPAddressSelection() {
        let [ipAddresses, hostname] = await debuggerSettingsManager_1.debuggerSettingsManager.getLocalIPAddresses();
        if (ipAddresses && ipAddresses.length === 1) {
            return ipAddresses[0];
        }
        else if (ipAddresses && ipAddresses.length > 1) {
            let ipAddressesSelection = [];
            let previousSelectedIP = this.extensionContext.globalState.get(constants_1.Constants.recentlyUsedExternalDebuggingIP);
            if (previousSelectedIP) {
                for (let ia = 0; ia < ipAddresses.length; ia++) {
                    let ipaddr = ipAddresses[ia];
                    if (ipaddr === previousSelectedIP) {
                        ipAddressesSelection.unshift({ label: ipaddr, ipAddress: ipaddr });
                    }
                    else {
                        ipAddressesSelection.push({ label: ipaddr, ipAddress: ipaddr });
                    }
                }
            }
            else {
                ipAddressesSelection = ipAddresses.map((ipaddr) => {
                    return { label: ipaddr, ipAddress: ipaddr };
                });
            }
            if (ipAddressesSelection && ipAddressesSelection.length > 0) {
                const ipSelected = await this.askUserToSelectFromList({ placeHolder: "Select an IP Address to Start External Application Debugging" }, ipAddressesSelection);
                if (ipSelected && ipSelected.ipAddress) {
                    this.extensionContext.globalState.update(constants_1.Constants.recentlyUsedExternalDebuggingIP, ipSelected.ipAddress);
                    return ipSelected.ipAddress;
                }
            }
        }
        return null;
    }
    askUserToSelectFromList(options, choices) {
        const self = this;
        const question = {
            choices,
            matchOptions: options,
            message: options.placeHolder,
            name: "debuggingipaddressselection",
            type: question_1.QuestionTypes.expand
        };
        return self.prompter.promptSingle(question, true);
    }
    getDebugInfo(session) {
        logger_1.FileStreamLogger.Instance.info("getDebugInfo- Start");
        let debugObj = undefined;
        try {
            if (session && session.type === constants_1.Constants.plsqlDebuggerType && session.configuration &&
                session.configuration.entryScript) {
                debugObj = new debugObjectInfo();
                let uriQuery = session.configuration.entryScript;
                let params = editorUtils_1.editorUtils.getQueryParams(uriQuery);
                if (params) {
                    debugObj.connectionUri = params.connectionUri;
                    let plsqlObj = session.configuration.debugObject;
                    if (plsqlObj) {
                        var regex = new RegExp("object=(?<object>.*)&objectname=(?<objectname>.*)&parentname=(?<parentname>.*)&methodid=(?<methodid>.*)&schemaname=(?<schemaname>.*)&objecttype=(?<objecttype>.*)");
                        let result = regex.exec(plsqlObj);
                        if (result) {
                            const groups = result.groups;
                            if (groups) {
                                if (groups.object) {
                                    debugObj.object = groups.object;
                                }
                                if (groups.objectname) {
                                    debugObj.objectName = groups.objectname;
                                }
                                if (groups.parentname) {
                                    debugObj.parentName = groups.parentname;
                                }
                                if (groups.methodid) {
                                    debugObj.methodId = groups.methodid;
                                }
                                if (groups.schemaname) {
                                    debugObj.schemaName = groups.schemaname;
                                }
                                let ddexType = dataExplorerRequests_1.OracleDDEXObjectTypes[Number(groups.objecttype)];
                                let ddexObjType = dataExplorerRequests_1.OracleDDEXObjectTypes[ddexType];
                                debugObj.ddexObjectType = ddexObjType;
                                if (debugObj.connectionUri && debugObj.ddexObjectType && debugObj.schemaName && debugObj.object) {
                                    debugObj.resultsUri = utilities_1.ExplorerUtilities.getRunResultsUri(debugObj.connectionUri, debugObj.ddexObjectType, debugObj.schemaName, debugObj.object);
                                }
                                if (debugObj.objectName) {
                                    debugObj.debugType = dataExplorerRequests_1.DebugType.StepInto;
                                }
                                else {
                                    debugObj.debugType = dataExplorerRequests_1.DebugType.ExternalApplication;
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error in getDebugInfo - On parsing the debug object info from session");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("getDebugInfo- End");
        return debugObj;
    }
    getDebugObj(objectProperties, editorUri) {
        logger_1.FileStreamLogger.Instance.info("getDebugObj- Start");
        let debugObj = undefined;
        try {
            if (objectProperties) {
                let object = objectProperties.objectName;
                let schemaName = objectProperties.schemaName;
                let objectName = objectProperties.objectName;
                let parentName = "";
                let methodId = "";
                let ddexObjectType = (objectProperties.ddexType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) ?
                    dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod : objectProperties.ddexType;
                if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
                    objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
                    const method = objectProperties.dbObject;
                    parentName = method.parent;
                    methodId = method.id.toString();
                    object = `${parentName}.${objectProperties.objectName}`;
                }
                debugObj = `object=${object}&objectname=${objectName}&parentname=${parentName}&methodid=${methodId}&schemaname=${schemaName}&objecttype=${ddexObjectType}`;
            }
            else {
                let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
                if (params) {
                    let parentName = "";
                    let methodId = "";
                    debugObj = `object=${params.objectname}&objectname=${params.objectname}&parentname=${parentName}&methodid=${methodId}&schemaname=${params.schemaname}&objecttype=${params.ddexObjectType}`;
                }
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error in getDebugObj - On getting debug object info to debug");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("getDebugObj- End");
        return debugObj;
    }
}
exports.DebugManager = DebugManager;
class debugObjectInfo {
}
exports.debugObjectInfo = debugObjectInfo;
class debugLogSettings {
    constructor() {
        this.updateLogSettingsFromConfig();
    }
    updateLogSettingsFromConfig() {
        logger_1.FileStreamLogger.Instance.info("updateLogSettingsFromConfig - Fetching log settings- Start");
        try {
            const { enable, fileName, loglevel } = (0, logger_1.getLoggingConfig)();
            this.enable = enable;
            this.filename = fileName;
            this.loglevel = loglevel;
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("updateLogSettingsFromConfig - Error on fetching log settings");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("updateLogSettingsFromConfig - Fetching log settings- End");
    }
}
exports.debugLogSettings = debugLogSettings;
class DebugAdapterExecutableFactory {
    createDebugAdapterDescriptor(_session, executable) {
        let debugAdapter = undefined;
        logger_1.FileStreamLogger.Instance.info("createDebugAdapterDescriptor - Start");
        try {
            let debuggerdll = path.join(constants_1.Constants.extensionRootPath, "server", setup_1.Setup.plsqlDebuggerProgram);
            logger_1.FileStreamLogger.Instance.info("createDebugAdapterDescriptor: debuggerdll : " + debuggerdll);
            if (fs.existsSync(debuggerdll)) {
                logger_1.FileStreamLogger.Instance.info(debuggerdll + " Exists");
                logger_1.FileStreamLogger.Instance.info("createDebugAdapterDescriptor - Using PL/SQL Debugger Assembly: " + debuggerdll);
                let { serverCommand, serverArgs } = helper_1.Utils.getServerInputArguments(debuggerdll, constants_1.Constants.debugAdapterLogFileName, setup_1.Setup.plsqlDotnetRuntimePath);
                debugAdapter = new vscode.DebugAdapterExecutable(serverCommand, serverArgs, undefined);
            }
            else {
                logger_1.FileStreamLogger.Instance.info("createDebugAdapterDescriptor - Error Not Found " + debuggerdll);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("createDebugAdapterDescriptor - Error on determining what debug adapter executable to use");
            helper.logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("createDebugAdapterDescriptor - End");
        return debugAdapter;
    }
}
exports.DebugAdapterExecutableFactory = DebugAdapterExecutableFactory;
class odtVscodeRequestArguments {
}
exports.odtVscodeRequestArguments = odtVscodeRequestArguments;
