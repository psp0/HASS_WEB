"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCIExplorerManager = void 0;
const vscode = require("vscode");
const setup_1 = require("../../utilities/setup");
const helper = require("../../utilities/helper");
const constants_1 = require("../../constants/constants");
const ociExplorerModel_1 = require("./ociExplorerModel");
const ociExplorerTreeDataProvider_1 = require("./ociExplorerTreeDataProvider");
class OCIExplorerManager {
    constructor(connectionCommandsHandler, vsCodeConnector, fileLogger) {
        this.connectionCommandsHandler = connectionCommandsHandler;
        this.vsCodeConnector = vsCodeConnector;
        this.fileLogger = fileLogger;
        this.ociExplorerModel = ociExplorerModel_1.OCIExplorerModel.getInstance();
        this.ociExplorerModel.createOCIExplorerUIHandler();
        const treeDataProvider = new ociExplorerTreeDataProvider_1.OCIExplorerTreeDataProvider(this.ociExplorerModel);
        this.ociExplorerTreeView = vscode.window.createTreeView(constants_1.Constants.cloudExplorerTreeView, { treeDataProvider });
        vscode.commands.registerCommand(constants_1.Constants.ociRefreshAll, async () => {
            try {
                this.fileLogger.info("OCI RefreshAll handler invoked");
                await this.ociExplorerModel.initializeModel(true);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.signupOracleCloud, async () => {
            try {
                this.fileLogger.info("Launching OCI signup for Oracle Cloud URL");
                this.ociExplorerModel.launchOracleCloudSignUpURL();
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.ociUpdateProfile, async (ociNode) => {
            try {
                this.fileLogger.info("OCI compartment handler invoked");
                await this.ociExplorerModel.fetchCompartmentList(ociNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.ociCreateNewDatabase, async (ociNode) => {
            try {
                this.fileLogger.info("OCI create new database handler invoked");
                await this.ociExplorerModel.LaunchCreateNewDatabaseUI(ociNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.ociRefreshNode, async (ociNode) => {
            try {
                this.fileLogger.info("OCI refresh node invoked");
                this.ociExplorerModel.refreshNode(ociNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.adbStartInstance, async (ociNode) => {
            try {
                this.fileLogger.info("OCI start database invoked");
                this.ociExplorerModel.startDatabase(ociNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.adbStopInstance, async (ociNode) => {
            try {
                this.fileLogger.info("OCI stop database invoked");
                this.ociExplorerModel.stopDatabase(ociNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.adbTerminateInstance, async (ociNode) => {
            try {
                this.fileLogger.info("OCI terminate database invoked");
                this.ociExplorerModel.terminateDatabase(ociNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.adbCreateDataConnection, async (ociNode) => {
            try {
                this.fileLogger.info("OCI create data connection invoked");
                this.ociExplorerModel.createDataConnection(ociNode, this.connectionCommandsHandler);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.adbDownloadCredentialsFile, async (ociNode) => {
            try {
                this.fileLogger.info("Autonomous Database download Credentials files invoked");
                this.ociExplorerModel.downloadCredentialsFile(ociNode, this.connectionCommandsHandler);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.adbChangePswd, async (ociNode) => {
            try {
                this.fileLogger.info("adb change password invoked");
                this.ociExplorerModel.changeADBPassword(ociNode);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.adbConnectionStrings, async (ociNode) => {
            try {
                this.fileLogger.info("Autonomous Database get connection strings ");
                this.ociExplorerModel.getADBConnectionstrings(ociNode, this.connectionCommandsHandler);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.adbConfigureWalletlessConnectivityandNetworkAccess, async (ociNode) => {
            try {
                this.fileLogger.info("configure WalletLess Connectivity and  Network Access");
                this.ociExplorerModel.adbConfigureWalletlessConnectivityandNetworkAccess(ociNode, this.connectionCommandsHandler);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.commands.registerCommand(constants_1.Constants.adbConfigureDatabaseAccessControl, async (ociNode) => {
            try {
                this.fileLogger.info("configure dedicated database access control list");
                this.ociExplorerModel.adbConfigureWalletlessConnectivityandNetworkAccess(ociNode, this.connectionCommandsHandler);
            }
            catch (error) {
                helper.AppUtils.ShowErrorAndLog(error, this.vsCodeConnector);
            }
        });
        vscode.window.onDidChangeActiveColorTheme(async (theme) => {
            this.fileLogger.info(`Color Theme Kind changed to ${theme.kind}`);
            setup_1.Setup.CurrentColorThemeKind = theme.kind;
            this.ociExplorerModel.EmitModelChangeEvent(undefined);
        });
    }
    selectNode(node) {
        this.ociExplorerTreeView.reveal(node, { select: true, focus: true }).then(() => node.resetFetchChildren());
    }
    expandNode(node) {
        this.ociExplorerTreeView.reveal(node, { expand: true });
    }
    static CreateInstance(vsCodeConnector, connectionCommandsHandler, fileLogger) {
        try {
            if (!OCIExplorerManager.instance) {
                OCIExplorerManager.instance = new OCIExplorerManager(connectionCommandsHandler, vsCodeConnector, fileLogger);
            }
            return OCIExplorerManager.instance;
        }
        catch (err) {
            helper.logErroAfterValidating(new Error(err));
        }
    }
    static get Instance() {
        return OCIExplorerManager.instance;
    }
}
exports.OCIExplorerManager = OCIExplorerManager;
