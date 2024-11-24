"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultConnectionManager = void 0;
const vscode = require("vscode");
const helper = require("../utilities/helper");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const constants_1 = require("../constants/constants");
const setup_1 = require("../utilities/setup");
const logger_1 = require("../infrastructure/logger");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const vscode_1 = require("vscode");
const connectionSettingsHelper_1 = require("./connectionSettingsHelper");
const localizedConstants_1 = require("../constants/localizedConstants");
const helper_1 = require("../utilities/helper");
class DefaultConnectionManager {
    constructor(dataExpManager, vscodeConnector, statusController, connectionCommandHandler) {
        this.excludedFilesForDefaultConnection = [];
        this.userDisconnectedFiles = [];
        this.defaultConnectedFiles = [];
        this.vscodeConnector = undefined;
        this.associateDefaultConn = true;
        this.dataExpManager = dataExpManager;
        this.vscodeConnector = vscodeConnector;
        this.statusController = statusController;
        this.connectionCommandHandler = connectionCommandHandler;
    }
    static CreateInstance(dataExpManager, vscodeConnector, statusController, connectionCommandHandler) {
        try {
            if (!DefaultConnectionManager.varInstance) {
                DefaultConnectionManager.varInstance = new DefaultConnectionManager(dataExpManager, vscodeConnector, statusController, connectionCommandHandler);
            }
            return DefaultConnectionManager.instance;
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
    }
    static get instance() {
        return DefaultConnectionManager.varInstance;
    }
    addToUserDisconnectedFiles(fileUri) {
        this.userDisconnectedFiles.push(fileUri);
    }
    removeFromUserDisconnectedFiles(fileUri) {
        const index = this.userDisconnectedFiles.indexOf(fileUri);
        if (index > -1) {
            this.userDisconnectedFiles.splice(index, 1);
        }
    }
    addToExcludedFilesForDefaultConnection(fileUri) {
        this.excludedFilesForDefaultConnection.push(fileUri);
    }
    removeFromExcludedFilesForDefaultConnection(fileUri) {
        const index = this.excludedFilesForDefaultConnection.indexOf(fileUri);
        if (index > -1) {
            this.excludedFilesForDefaultConnection.splice(index, 1);
        }
    }
    removeFromDefaultConnectedFiles(fileUri) {
        const index = this.defaultConnectedFiles.indexOf(fileUri);
        if (index > -1) {
            this.defaultConnectedFiles.splice(index, 1);
        }
    }
    async associateDefaultConnectionToFile(document, uniqueConnName = undefined) {
        logger_1.FileStreamLogger.Instance.info("Associate default connection to file - Start");
        try {
            this.dataExpManager.updateExplorerDefaultConnection();
            if (document && document.uri && document.languageId === constants_1.Constants.oracleLanguageID &&
                this.vscodeConnector.isActiveOracleFile) {
                let fileUri = document.uri.toString();
                let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(document);
                if (this.associateDefaultConn
                    && !explorerFile
                    && !this.connectionCommandHandler.isConnectedToDB(fileUri)
                    && this.excludedFilesForDefaultConnection.indexOf(fileUri) < 0
                    && this.userDisconnectedFiles.indexOf(fileUri) < 0
                    && this.defaultConnectedFiles.indexOf(fileUri) < 0) {
                    let defaultConn = uniqueConnName;
                    if (!defaultConn) {
                        let [defaultConnName, configurationTarget, workspaceFolder] = DefaultConnectionManager.instance.getDefaultConnectionForActiveScope();
                        defaultConn = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(defaultConnName, configurationTarget, workspaceFolder);
                    }
                    if (defaultConn) {
                        let defaultConnNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueName(defaultConn);
                        if (defaultConnNode) {
                            logger_1.FileStreamLogger.Instance.info("Creating default connection for file.");
                            this.defaultConnectedFiles.push(fileUri);
                            this.connectionCommandHandler.createConnectionFromConnProps(defaultConnNode.connectionProperties, fileUri, true);
                        }
                    }
                }
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on associating default connection to file");
            helper.logErroAfterValidating(err);
        }
        logger_1.FileStreamLogger.Instance.info("Associate default connection to file - End");
    }
    async connectionDeleted(connProps) {
        logger_1.FileStreamLogger.Instance.info("Update default connection on delete of Connection - Start.");
        try {
            let [defaultConnName, configurationTarget, workspaceFolder] = DefaultConnectionManager.instance.getDefaultConnectionForActiveScope();
            let defaultConn = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(defaultConnName, configurationTarget, workspaceFolder);
            if (defaultConn && defaultConn === connProps.uniqueName) {
                this.updateDefaultConnection("", connProps.configurationTarget, connProps.workspaceFolder, false);
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on updating default connection settings when connection is deleted");
            helper.logErroAfterValidating(err);
        }
        logger_1.FileStreamLogger.Instance.info("Update default connection on delete of Connection - End.");
    }
    async connectionRenamed(oldConn, newConn) {
        logger_1.FileStreamLogger.Instance.info("Update default connection on rename of Connection - Start.");
        try {
            let [defaultConnName, configurationTarget, workspaceFolder] = DefaultConnectionManager.instance.getDefaultConnectionForActiveScope();
            let defaultConn = connectionSettingsHelper_1.ConnectionSettingsHelper.getUniqueConnectionName(defaultConnName, configurationTarget, workspaceFolder);
            if (defaultConn && oldConn.uniqueName === defaultConn) {
                this.updateDefaultConnection(newConn.name, newConn.configurationTarget, newConn.workspaceFolder, false);
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on updating default connection settings when connection is renamed");
            helper.logErroAfterValidating(err);
        }
        logger_1.FileStreamLogger.Instance.info("Update default connection on rename of Connection - End.");
    }
    getDefaultConnectionForActiveScope() {
        logger_1.FileStreamLogger.Instance.info("Get default connection for active scope - Start.");
        let defaultConn = "";
        let configurationTarget;
        let workspaceFolder;
        let defaultConnNode = undefined;
        try {
            let uri = undefined;
            let config = undefined;
            if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document
                && vscode.window.activeTextEditor.document.uri
                && vscode.window.activeTextEditor.document.languageId === constants_1.Constants.oracleLanguageID
                && this.vscodeConnector.isActiveOracleFile) {
                uri = vscode.window.activeTextEditor.document.uri;
            }
            if (uri) {
                logger_1.FileStreamLogger.Instance.info("Getting default connection specifying ConfigurationScope.");
                config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName, uri);
            }
            else {
                logger_1.FileStreamLogger.Instance.info("Getting default connection without specifying ConfigurationScope.");
                config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
            }
            let defConnConfigurationEntries = config.inspect(constants_1.Constants.defaultConnectionSettingsPropertyName);
            if (!helper_1.Utils.isSingleFolderWorkspace() && (defConnConfigurationEntries.workspaceFolderValue ||
                defConnConfigurationEntries.workspaceFolderValue === constants_1.Constants.emptyString)) {
                defaultConn = defConnConfigurationEntries.workspaceFolderValue;
                configurationTarget = vscode_1.ConfigurationTarget.WorkspaceFolder;
                if (uri) {
                    workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
                }
            }
            else if (defConnConfigurationEntries.workspaceValue ||
                defConnConfigurationEntries.workspaceValue === constants_1.Constants.emptyString) {
                defaultConn = defConnConfigurationEntries.workspaceValue;
                configurationTarget = vscode_1.ConfigurationTarget.Workspace;
            }
            else if (defConnConfigurationEntries.globalValue ||
                defConnConfigurationEntries.globalValue === constants_1.Constants.emptyString) {
                defaultConn = defConnConfigurationEntries.globalValue;
                configurationTarget = vscode_1.ConfigurationTarget.Global;
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on getting default connection settings for active scope");
            helper.logErroAfterValidating(err);
        }
        logger_1.FileStreamLogger.Instance.info("Get default connection for active scope - End.");
        return [defaultConn, configurationTarget, workspaceFolder];
    }
    getDefaultConnectionForScope(configurationTarget, workspadeFolder) {
        logger_1.FileStreamLogger.Instance.info("Get default connection for scope- Start.");
        let defaultConn = "";
        let defaultConnNode = undefined;
        try {
            let extnConfig = undefined;
            let defConnConfigurationEntries;
            switch (configurationTarget) {
                case vscode_1.ConfigurationTarget.Global:
                    extnConfig = setup_1.Setup.getExtensionConfigSection();
                    defConnConfigurationEntries = extnConfig.inspect(constants_1.Constants.defaultConnectionSettingsPropertyName);
                    defaultConn = defConnConfigurationEntries.globalValue;
                    break;
                case vscode_1.ConfigurationTarget.Workspace:
                    extnConfig = setup_1.Setup.getExtensionConfigSection();
                    defConnConfigurationEntries = extnConfig.inspect(constants_1.Constants.defaultConnectionSettingsPropertyName);
                    defaultConn = defConnConfigurationEntries.workspaceValue;
                    break;
                case vscode_1.ConfigurationTarget.WorkspaceFolder:
                    extnConfig = setup_1.Setup.getExtensionConfigSection(workspadeFolder);
                    defConnConfigurationEntries = extnConfig.inspect(constants_1.Constants.defaultConnectionSettingsPropertyName);
                    defaultConn = defConnConfigurationEntries.workspaceFolderValue;
                    break;
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on getting default connection settings for specific scope.");
            helper.logErroAfterValidating(err);
        }
        if (defaultConn) {
            defaultConnNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionScope(defaultConn, configurationTarget, workspadeFolder);
        }
        logger_1.FileStreamLogger.Instance.info("Get default connection for scope- End.");
        return defaultConnNode;
    }
    updateDefaultConnection(defaultConn, configurationTarget, workspaceFolder, fromCtxtMenu) {
        try {
            let config = setup_1.Setup.getExtensionConfigSection(workspaceFolder);
            if (config) {
                config.update(constants_1.Constants.defaultConnectionSettingsPropertyName, defaultConn, configurationTarget);
                if (fromCtxtMenu) {
                    let cnfgTgt = constants_1.Constants.user;
                    switch (configurationTarget) {
                        case vscode_1.ConfigurationTarget.Global:
                            cnfgTgt = constants_1.Constants.user;
                            break;
                        case vscode_1.ConfigurationTarget.Workspace:
                            cnfgTgt = constants_1.Constants.workspace;
                            break;
                        case vscode_1.ConfigurationTarget.WorkspaceFolder:
                            cnfgTgt = workspaceFolder.name;
                            break;
                    }
                    let defConnUpdatedMsg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.defaultConnectionUpdated, cnfgTgt);
                    this.vscodeConnector.showInformationMessage(defConnUpdatedMsg);
                }
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.info("Error on updating default connection settings");
            helper.AppUtils.ShowErrorAndLog(err, this.vscodeConnector);
        }
        logger_1.FileStreamLogger.Instance.info("Updating default connection settings- End");
    }
}
exports.DefaultConnectionManager = DefaultConnectionManager;
