"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleLanguageServerClient = exports.LanguageServerConnectionErrorHandler = void 0;
const path = require("path");
const vscode_languageclient_1 = require("vscode-languageclient");
const node_1 = require("vscode-languageclient/node");
const helper = require("../utilities/helper");
const helper_1 = require("../utilities/helper");
const constants_1 = require("./../constants/constants");
const localizedConstants_1 = require("./../constants/localizedConstants");
const logger_1 = require("./logger");
const oracleVSCodeConnector_1 = require("./oracleVSCodeConnector");
const connectionRequest_1 = require("../models/connectionRequest");
class LanguageServerConnectionErrorHandler {
    constructor(vscodeConnector) {
        this.vscodeConnector = vscodeConnector;
        if (!this.vscodeConnector) {
            this.vscodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector();
        }
    }
    showOnErrorPrompt(error) {
        const self = this;
        if (error) {
            self.vscodeConnector.showErrorMessage(error.message);
        }
        else {
            self.vscodeConnector.showErrorMessage("disconnectedFromLanguageServer");
        }
    }
    error(error, message, count) {
        const self = this;
        self.showOnErrorPrompt(error);
        return { action: vscode_languageclient_1.ErrorAction.Shutdown, message: "", handled: true };
    }
    closed() {
        const self = this;
        self.showOnErrorPrompt(undefined);
        return { action: vscode_languageclient_1.CloseAction.DoNotRestart, message: "", handled: true };
    }
}
exports.LanguageServerConnectionErrorHandler = LanguageServerConnectionErrorHandler;
class OracleLanguageServerClient {
    constructor() {
        this.varLanguageClient = undefined;
        this.context = undefined;
        this.logger = logger_1.FileStreamLogger.Instance;
        this.vscodeConnector = undefined;
    }
    get languageClient() {
        const self = this;
        return self.varLanguageClient;
    }
    static get instance() {
        if (OracleLanguageServerClient.varInstance === undefined) {
            const tempClient = new OracleLanguageServerClient();
            OracleLanguageServerClient.varInstance = tempClient;
        }
        return OracleLanguageServerClient.varInstance;
    }
    stopClient() {
        if (!OracleLanguageServerClient.disposed) {
            OracleLanguageServerClient.instance.varLanguageClient.sendNotification(connectionRequest_1.ExitNotificationTyped.type, new connectionRequest_1.ExitNotificationParameters());
            OracleLanguageServerClient.disposed = true;
        }
        return OracleLanguageServerClient.instance.languageClient.stop();
    }
    async init(context, varVSCodeintegrator, dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath) {
        var retVal = false;
        const self = this;
        try {
            self.context = context;
            self.vscodeConnector = varVSCodeintegrator;
            self.varLanguageClient = await self.initializeServerAndClient(context, dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath);
            if (self.varLanguageClient) {
                logger_1.FileStreamLogger.Instance.info("Starting Oracle Language client and server");
                await self.varLanguageClient.start();
                logger_1.FileStreamLogger.Instance.info("Started Oracle Language client and server");
                logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgServerReady, constants_1.Constants.dotnetRuntime, dotnetRuntimeFullVersion));
                retVal = true;
            }
            else {
                retVal = false;
                logger_1.FileStreamLogger.Instance.error("Failed to initialize Oracle Language client and server");
                return Promise.reject(false);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Failed in initialize or start Oracle Language client and server");
            logger_1.FileStreamLogger.Instance.error(`Error: ${error}`);
            return Promise.reject(error);
        }
        return retVal;
    }
    sendRequest(type, params) {
        const self = this;
        if (self.languageClient !== undefined) {
            return self.languageClient.sendRequest(type, params);
        }
    }
    sendNotification(type, params) {
        const self = this;
        if (self.languageClient !== undefined) {
            self.languageClient.sendNotification(type, params);
        }
    }
    sendProgress(type, token, value) {
        const self = this;
        if (self.languageClient !== undefined) {
            self.languageClient.sendProgress(type, token, value);
        }
    }
    onNotification(type, handler) {
        const self = this;
        if (self.languageClient !== undefined) {
            const disposable = self.languageClient.onNotification(type, handler);
            this.context.subscriptions.push(disposable);
        }
    }
    onRequest(type, handler) {
        const self = this;
        if (self.languageClient !== undefined) {
            const disposable = self.languageClient.onRequest(type, handler);
            this.context.subscriptions.push(disposable);
        }
    }
    onProgress(type, token, handler) {
        const self = this;
        if (self.languageClient !== undefined) {
            return self.languageClient.onProgress(type, token, handler);
        }
    }
    async initializeServerAndClient(context, dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath) {
        const self = this;
        logger_1.FileStreamLogger.Instance.info("Initializing Oracle Language client and server");
        logger_1.FileStreamLogger.Instance.info("dotnetRuntimeMajorVersion: " + dotnetRuntimeMajorVersion);
        logger_1.FileStreamLogger.Instance.info("dotnetRuntimePath: " + dotnetRuntimePath);
        let serverdll = "";
        switch (dotnetRuntimeMajorVersion) {
            case 6:
                serverdll = path.join(path.dirname(__dirname), "server", constants_1.Constants.server60DllName);
                break;
            case 8:
                serverdll = path.join(path.dirname(__dirname), "server", constants_1.Constants.server80DllName);
                break;
            default:
                break;
        }
        logger_1.FileStreamLogger.Instance.info("Using Language Server: " + serverdll);
        const serveroptions = self.prepareServerInputArguments(serverdll, dotnetRuntimePath);
        const clientInstance = self.prepareLanguageClientComponentArgument(serveroptions, dotnetRuntimeFullVersion);
        logger_1.FileStreamLogger.Instance.info("Initialized Oracle Language client and server");
        return clientInstance;
    }
    prepareServerInputArguments(servicePath, dotnetRuntimePath) {
        logger_1.FileStreamLogger.Instance.info("Preparing Server Input Arguments using .NET runtime path: " + dotnetRuntimePath);
        let { serverCommand, serverArgs } = helper_1.Utils.getServerInputArguments(servicePath, constants_1.Constants.serverLogFileName, dotnetRuntimePath);
        let serverTransport = node_1.TransportKind.stdio;
        const serverOptions = {
            command: serverCommand,
            args: serverArgs,
            transport: serverTransport
        };
        return serverOptions;
    }
    prepareLanguageClientComponentArgument(serverOptions, dotnetRuntimeFullVersion) {
        const self = this;
        const clientOptions = {
            documentSelector: [
                { language: constants_1.Constants.oracleLanguageID, scheme: "file" },
                { language: constants_1.Constants.oracleLanguageID, scheme: "untitled" },
                { language: constants_1.Constants.oracleLanguageID, scheme: constants_1.Constants.oracleScheme }
            ],
            synchronize: {
                configurationSection: constants_1.Constants.extensionConfigSectionName,
            },
            errorHandler: new LanguageServerConnectionErrorHandler(self.vscodeConnector),
            outputChannel: logger_1.ChannelLogger.Instance.channelLogger,
            outputChannelName: constants_1.Constants.outputChannelName,
            revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Info
        };
        const client = new node_1.LanguageClient(constants_1.Constants.oracleLanguageServerName, serverOptions, clientOptions);
        return client;
    }
}
exports.OracleLanguageServerClient = OracleLanguageServerClient;
OracleLanguageServerClient.varInstance = undefined;
OracleLanguageServerClient.disposed = false;
