"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppUtils = exports.ProceedOption = exports.Utils = exports.Operation = exports.extractDataSource = exports.IsWindowsOS = exports.logErroAfterValidating = exports.getBriefConnectionInformationForDisplay = exports.getDisplayConnectionInformation = exports.getPicklistDetails = exports.getConnectionDescForSelections = exports.getTooltipForConnection = exports.setConnectionPropertiesDefault = exports.Timer = exports.convertURIToString = exports.sleep = exports.truncateString = exports.convertToOracleCase = exports.truncateFileName = exports.stringFormatterCsharpStyle = exports.isNotEmpty = exports.connectionsAreSame = exports.isEmpty = exports.convertDataSourceEnum = exports.getProfileTaskEnumFromString = exports.convertProfileTaskEnum = exports.convertAuthEnum = void 0;
const vscode_1 = require("vscode");
const vscode = require("vscode");
const connectionCommandsScenarioManager_1 = require("../connectionManagement/connectionCommandsScenarioManager");
const constants_1 = require("../constants/constants");
const logger_1 = require("../infrastructure/logger");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const connectionModels_1 = require("./../models/connectionModels");
const os = require("os");
const fs = require("fs");
const path = require("path");
const question_1 = require("../prompts/question");
const adapter_1 = require("../prompts/adapter");
const localizedConstants_1 = require("../constants/localizedConstants");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const fileLogger = logger_1.FileStreamLogger.Instance;
function convertAuthEnum(value) {
    return scriptExecutionModels_1.ConnectionAuthenticationType[value];
}
exports.convertAuthEnum = convertAuthEnum;
function convertProfileTaskEnum(value) {
    return connectionCommandsScenarioManager_1.ManageProfileTask[value];
}
exports.convertProfileTaskEnum = convertProfileTaskEnum;
function getProfileTaskEnumFromString(value) {
    return connectionCommandsScenarioManager_1.ManageProfileTask[value];
}
exports.getProfileTaskEnumFromString = getProfileTaskEnumFromString;
function convertDataSourceEnum(value) {
    return connectionModels_1.ProviderDataSourceType[value];
}
exports.convertDataSourceEnum = convertDataSourceEnum;
function isEmpty(value) {
    return (!value || "" === value || value.length === 0);
}
exports.isEmpty = isEmpty;
function connectionsAreSame(conn, expectedConn) {
    fileLogger.info("check if two connections are same");
    return (conn.connectionString || expectedConn.connectionString) ?
        conn.connectionString === expectedConn.connectionString :
        expectedConn.userID === conn.userID
            && expectedConn.dataSource === conn.dataSource
            && expectedConn.authenticationType === conn.authenticationType;
}
exports.connectionsAreSame = connectionsAreSame;
function isNotEmpty(str) {
    return (str && "" !== str);
}
exports.isNotEmpty = isNotEmpty;
function stringFormatterCsharpStyle(str, ...args) {
    let replacedStr = str;
    if (args.length > 0) {
        replacedStr = str.replace(/\{\s*([^}\s]+)\s*\}/g, (m, p1) => {
            if (typeof args[p1] !== "undefined") {
                return args[p1];
            }
            else {
                return m;
            }
        });
    }
    return replacedStr;
}
exports.stringFormatterCsharpStyle = stringFormatterCsharpStyle;
function truncateFileName(fileName) {
    let truncatedFileName = fileName;
    if (truncatedFileName.length > 40) {
        truncatedFileName = truncatedFileName.substring(0, 36) + " ...";
    }
    return truncatedFileName;
}
exports.truncateFileName = truncateFileName;
function convertToOracleCase(stringToConvert) {
    let encloseInQuotes = false;
    if (((typeof stringToConvert !== "undefined") &&
        (typeof stringToConvert.valueOf() === "string")) &&
        (stringToConvert.length > 0)) {
        if (stringToConvert.length > 2) {
            if (stringToConvert.startsWith('"') && stringToConvert.endsWith('"')) {
                encloseInQuotes = true;
            }
        }
        if (!encloseInQuotes) {
            return stringToConvert.toUpperCase();
        }
    }
    return stringToConvert;
}
exports.convertToOracleCase = convertToOracleCase;
function truncateString(stringToTruncate, numChars) {
    let retStr = "";
    if (stringToTruncate.length > numChars) {
        if (numChars > 3) {
            retStr = stringToTruncate.substring(0, numChars - 3) + "...";
        }
        else {
            retStr = stringToTruncate.substring(0, numChars);
        }
    }
    else {
        return retStr = stringToTruncate;
    }
    return retStr;
}
exports.truncateString = truncateString;
async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}
exports.sleep = sleep;
function convertURIToString(uriToConvert) {
    return uriToConvert.toString();
}
exports.convertURIToString = convertURIToString;
class Timer {
    constructor() {
        this.start();
    }
    getDuration() {
        if (!this.varStartTime) {
            return -1;
        }
        else if (!this.varEndTime) {
            const endTime = process.hrtime(this.varStartTime);
            return endTime[0] * 1000 + endTime[1] / 1000000;
        }
        else {
            return this.varEndTime[0] * 1000 + this.varEndTime[1] / 1000000;
        }
    }
    start() {
        this.varStartTime = process.hrtime();
    }
    end() {
        if (!this.varEndTime) {
            this.varEndTime = process.hrtime(this.varStartTime);
        }
    }
}
exports.Timer = Timer;
function setConnectionPropertiesDefault(connProp) {
    if (!connProp.dataSource) {
        connProp.dataSource = "";
    }
    if (!connProp.userID) {
        connProp.userID = "";
    }
    if (!connProp.password) {
        connProp.password = undefined;
    }
    if (!connProp.proxyPassword) {
        connProp.proxyPassword = undefined;
    }
    return connProp;
}
exports.setConnectionPropertiesDefault = setConnectionPropertiesDefault;
function getTooltipForConnection(connProp) {
    return getDisplayConnectionInformation(connProp);
}
exports.getTooltipForConnection = getTooltipForConnection;
function getConnectionDescForSelections(profileName, connProp) {
    const displayText = `[${getDisplayConnectionInformation(connProp)}]`;
    return displayText;
}
exports.getConnectionDescForSelections = getConnectionDescForSelections;
function getPicklistDetails(connCreds) {
    return undefined;
}
exports.getPicklistDetails = getPicklistDetails;
function getDisplayConnectionInformation(connProp) {
    let displayText;
    if (connProp.connectionString) {
        displayText = connProp.connectionString;
    }
    else {
        displayText = getBriefConnectionInformationForDisplay(connProp.userID, connProp.dataSource);
        if (displayText && connProp.dBAPrivilege) {
            displayText = displayText + ";" + " ";
            displayText = appendToDisplayString(displayText, "DBA Privilege", connProp.dBAPrivilege) + ";";
        }
    }
    return displayText;
}
exports.getDisplayConnectionInformation = getDisplayConnectionInformation;
function getBriefConnectionInformationForDisplay(userid, datasrc) {
    let displayText;
    if (userid) {
        displayText = `User Id = ${userid}`;
    }
    if (displayText && datasrc) {
        displayText = displayText + ";" + " ";
        displayText = appendToDisplayString(displayText, "Data Source", datasrc);
    }
    return displayText;
}
exports.getBriefConnectionInformationForDisplay = getBriefConnectionInformationForDisplay;
function appendToDisplayString(displayText, label, value) {
    if (isNotEmpty(value)) {
        displayText += `${label} = ${value}`;
    }
    return displayText;
}
function logErroAfterValidating(err) {
    if (err && err.message) {
        logger_1.FileStreamLogger.Instance.error(err.message);
    }
}
exports.logErroAfterValidating = logErroAfterValidating;
function IsWindowsOS() {
    return (process.platform === "win32");
}
exports.IsWindowsOS = IsWindowsOS;
function extractDataSource(datasrc, connectionString) {
    if (!datasrc) {
        datasrc = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.extractKeyConnString(connectionString, constants_1.Constants.dataSrcKeyRegex);
    }
    if (datasrc) {
        const splitArr = datasrc.split("/");
        if (splitArr.length > 1) {
            datasrc = splitArr[splitArr.length - 1];
        }
    }
    return datasrc;
}
exports.extractDataSource = extractDataSource;
var Operation;
(function (Operation) {
    Operation[Operation["Insert"] = 0] = "Insert";
    Operation[Operation["Delete"] = 1] = "Delete";
    Operation[Operation["DeleteAll"] = 2] = "DeleteAll";
    Operation[Operation["Rename"] = 3] = "Rename";
    Operation[Operation["MoveUP"] = 4] = "MoveUP";
    Operation[Operation["MoveDown"] = 5] = "MoveDown";
})(Operation = exports.Operation || (exports.Operation = {}));
class Utils {
    static CreateIdBasedOnURI(uri, executionId) {
        return uri;
    }
    static CreateIdByURIandExecutionId(uri, executionId) {
        let uriCreated = uri;
        if (executionId) {
            uriCreated = `${uri}/${executionId}`;
        }
        return uriCreated;
    }
    static getExtension(format) {
        if (Utils.formatExtensionMapping.size === 0) {
            Utils.formatExtensionMapping.set(scriptExecutionModels_1.DataFormat.CSV, ["csv"]);
            Utils.formatExtensionMapping.set(scriptExecutionModels_1.DataFormat.JSON, ["json"]);
        }
        return Utils.formatExtensionMapping.get(format);
    }
    static toCodePointArray(str) {
        let result = null;
        if (str != null && str != undefined) {
            result = [];
            for (let index = 0; index < str.length; index++) {
                result.push(str.codePointAt(index));
            }
        }
        return result;
    }
    static getExtensionDirectory() {
        let extnDirToReturn;
        try {
            logger_1.FileStreamLogger.Instance.info(`Creating extension Directory`);
            let homeDir = os.homedir();
            logger_1.FileStreamLogger.Instance.info(`homeDir is- ${homeDir}`);
            if (homeDir) {
                let extensionDir = path.join(homeDir, constants_1.Constants.oracle, constants_1.Constants.extensionDirectory);
                logger_1.FileStreamLogger.Instance.info(`extensionDir is- ${extensionDir}`);
                if (!fs.existsSync(extensionDir)) {
                    logger_1.FileStreamLogger.Instance.info(`Creating Extension Directory`);
                    fs.mkdirSync(extensionDir, { recursive: true });
                    logger_1.FileStreamLogger.Instance.info(`Extension Directory created`);
                }
                extnDirToReturn = extensionDir;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on creating Extension Directory");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        return extnDirToReturn;
    }
    static getWorkingDirectory() {
        let workDirToReturn;
        try {
            logger_1.FileStreamLogger.Instance.info(`Creating default Working Directory`);
            let extensionDir = Utils.getExtensionDirectory();
            logger_1.FileStreamLogger.Instance.info(`extensionDir is- ${extensionDir}`);
            if (extensionDir) {
                let workingDir = path.join(extensionDir, constants_1.Constants.sql);
                logger_1.FileStreamLogger.Instance.info(`workingDir is- ${workingDir}`);
                if (!fs.existsSync(workingDir)) {
                    logger_1.FileStreamLogger.Instance.info(`Creating Working Directory`);
                    fs.mkdirSync(workingDir, { recursive: true });
                    logger_1.FileStreamLogger.Instance.info(`Working Directory created`);
                }
                workDirToReturn = workingDir;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on creating Working Directory");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        return workDirToReturn;
    }
    static createSqlFile(workingDir) {
        logger_1.FileStreamLogger.Instance.info(`Creating sql file at- ${workingDir}`);
        let newSqlFileCreated;
        try {
            if (workingDir) {
                if (!fs.existsSync(workingDir)) {
                    fs.mkdirSync(workingDir, { recursive: true });
                }
                let newSqlFileName = constants_1.Constants.newSQLFileFormat + constants_1.Constants.sqlFileExtension;
                let newSqlFileWithPath = path.join(workingDir, newSqlFileName);
                let index = 1;
                while (fs.existsSync(newSqlFileWithPath)) {
                    newSqlFileName = constants_1.Constants.newSQLFileFormat + "_" + index++ + constants_1.Constants.sqlFileExtension;
                    newSqlFileWithPath = path.join(workingDir, newSqlFileName);
                }
                logger_1.FileStreamLogger.Instance.info(`Creating New SQL File with path- ${newSqlFileWithPath}`);
                fs.writeFileSync(newSqlFileWithPath, "");
                logger_1.FileStreamLogger.Instance.info(`Created New SQL File with path- ${newSqlFileWithPath}`);
                newSqlFileCreated = newSqlFileWithPath;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on creating SQL file");
            logger_1.FileStreamLogger.Instance.error(error);
        }
        return newSqlFileCreated;
    }
    static async promptForConfirmation(confirmMessage, vsCodeconnector, cancelOption = false, ignoreFocusOut = false) {
        let proceed = cancelOption ? ProceedOption.Cancel : false;
        const question = {
            type: cancelOption ? question_1.QuestionTypes.confirmWithCancel : question_1.QuestionTypes.confirm,
            name: confirmMessage,
            message: confirmMessage
        };
        try {
            let prompter = new adapter_1.default();
            const val = await prompter.promptSingle(question, ignoreFocusOut);
            if (val !== undefined) {
                proceed = val;
            }
        }
        catch (err) {
            AppUtils.ShowErrorAndLog(err, vsCodeconnector);
        }
        return proceed;
    }
    static async promptForConfirmationWithNoShowAgain(confirmMessage, confirmMessage2, dontshowagainmsg, vsCodeconnector) {
        let varProceed = await this.promptForConfirmation(confirmMessage, vsCodeconnector, false, true);
        if (varProceed && confirmMessage2) {
            varProceed = await this.promptForConfirmation(confirmMessage2, vsCodeconnector, false, true);
        }
        let varShowPrompt = await this.promptForConfirmation(dontshowagainmsg, vsCodeconnector, false, true);
        return { proceed: varProceed, showPrompt: varShowPrompt };
    }
    static getServerInputArguments(servicePath, logFilename, dotnetRuntimePath) {
        logger_1.FileStreamLogger.Instance.info("getServerInputArguments - Start");
        let serverArgs = [];
        let serverCommand = servicePath;
        try {
            logger_1.FileStreamLogger.Instance.info("getServerInputArguments - dotnetRuntimePath: " + dotnetRuntimePath);
            logger_1.FileStreamLogger.Instance.info("getServerInputArguments - servicePath: " + servicePath);
            if (servicePath.endsWith(".dll")) {
                serverArgs = [servicePath];
                serverCommand = dotnetRuntimePath;
            }
            const config = vscode_1.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
            if (config) {
                const loggingSettings = config[constants_1.Constants.extensionConfigloggingSection];
                if (loggingSettings) {
                    serverArgs.push("-enableLogging");
                    if (loggingSettings[constants_1.Constants.enableLogging]) {
                        serverArgs.push(true);
                    }
                    else {
                        serverArgs.push(false);
                    }
                    serverArgs.push("-loglevel");
                    serverArgs.push(loggingSettings[constants_1.Constants.logLevel]);
                    const logFileName = path.join(logger_1.FileStreamLogger.extensionPath, `./${logFilename}.log`);
                    serverArgs.push("-LogFile");
                    serverArgs.push(logFileName);
                }
                const locale = vscode.env.language;
                serverArgs.push("-locale");
                serverArgs.push(locale);
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.info("getServerInputArguments - Error on determining server arguments to use");
            logErroAfterValidating(error);
        }
        logger_1.FileStreamLogger.Instance.info("getServerInputArguments - End");
        return { serverCommand, serverArgs };
    }
    static getConnectionUri(baseUri, uniqueName) {
        return baseUri + uniqueName;
    }
    static getConnectionLabel(connProps, schemaName = undefined, addFiltered = false) {
        let connLabel = connProps.name;
        let schemaExt = "";
        let scopeExt = "";
        if (connProps.addCurrentSchemaToConnectionName) {
            if (schemaName) {
                schemaExt = schemaName;
            }
            else if (connProps.currentSchema) {
                schemaExt = connProps.currentSchema;
            }
        }
        if (connProps.addSettingsScopeToConnectionName) {
            switch (connProps.configurationTarget) {
                case vscode.ConfigurationTarget.Global:
                    break;
                case vscode.ConfigurationTarget.Workspace:
                    scopeExt = constants_1.Constants.workspace;
                    break;
                case vscode.ConfigurationTarget.WorkspaceFolder:
                    if (connProps.workspaceFolder && connProps.workspaceFolder.name) {
                        scopeExt = connProps.workspaceFolder.name;
                    }
                    break;
            }
        }
        let connLabelExt = "";
        if (schemaExt && scopeExt) {
            connLabelExt = `${schemaExt} : ${scopeExt}`;
        }
        else if (schemaExt) {
            connLabelExt = schemaExt;
        }
        else if (scopeExt) {
            connLabelExt = scopeExt;
        }
        if (connLabelExt) {
            connLabel = `${connLabel} (${connLabelExt})`;
        }
        if (addFiltered && this.isConnectionCategoryFiltered(connProps))
            connLabel += constants_1.Constants.filtered;
        return connLabel;
    }
    static isConnectionCategoryFiltered(connProps) {
        let collFilters = connProps.filters;
        if (collFilters !== undefined && collFilters !== null) {
            for (let icf = 0; icf < collFilters.length; icf++) {
                let cf = collFilters[icf];
                if (cf !== null && cf !== undefined) {
                    let enabled = (cf.enableFiltersForExplorer === undefined || cf.enableFiltersForExplorer === true);
                    if (enabled && cf.filterProperties !== null && cf.filterProperties !== undefined &&
                        cf.filterProperties.length > 0)
                        return true;
                }
            }
        }
        return false;
    }
    static getConnectionTooltip(connProps, schemaName) {
        let connNamePart = `${localizedConstants_1.default.connectionName} : ${connProps.name}`;
        let currentSchema = (schemaName ? schemaName : connProps.currentSchema);
        let currentSchemaPart = (currentSchema ? `${localizedConstants_1.default.currentSchema} : ${currentSchema}` : "");
        let settingsScope = "";
        switch (connProps.configurationTarget) {
            case vscode.ConfigurationTarget.Global:
                settingsScope = localizedConstants_1.default.user;
                break;
            case vscode.ConfigurationTarget.Workspace:
                settingsScope = localizedConstants_1.default.Workspace;
                break;
            case vscode.ConfigurationTarget.WorkspaceFolder:
                if (connProps.workspaceFolder && connProps.workspaceFolder.name) {
                    settingsScope = connProps.workspaceFolder.name;
                }
                break;
        }
        let connTooltip = connNamePart;
        if (currentSchemaPart) {
            connTooltip = connTooltip + constants_1.Constants.newline + currentSchemaPart;
        }
        if (settingsScope) {
            let settingsScopePart = `${localizedConstants_1.default.settingsScope} : ${settingsScope}`;
            connTooltip = connTooltip + constants_1.Constants.newline + settingsScopePart;
        }
        let settingsFile = Utils.getSettingsFileLocation(connProps.configurationTarget, connProps.workspaceFolder);
        if (settingsFile) {
            let settingsFilePart = `${localizedConstants_1.default.settingsFile} : ${settingsFile}`;
            connTooltip = connTooltip + constants_1.Constants.newline + settingsFilePart;
        }
        let folderPath = undefined;
        if (connProps.configurationTarget === vscode.ConfigurationTarget.WorkspaceFolder && connProps.workspaceFolder &&
            vscode.workspace && vscode.workspace.workspaceFolders) {
            let folder = vscode.workspace.workspaceFolders.find(folder => folder.name === connProps.workspaceFolder.name &&
                folder.index === connProps.workspaceFolder.index);
            if (folder && folder.uri && folder.uri.fsPath) {
                folderPath = folder.uri.fsPath;
            }
        }
        if (folderPath) {
            let folderPathPart = `${localizedConstants_1.default.folderPath} : ${folderPath}`;
            connTooltip = connTooltip + constants_1.Constants.newline + folderPathPart;
        }
        return connTooltip;
    }
    static getSettingsFileLocation(configurationTarget, workspaceFolder) {
        let settingsFile = undefined;
        try {
            switch (configurationTarget) {
                case vscode.ConfigurationTarget.Global:
                    if (Utils.userDataDirectory) {
                        settingsFile = path.join(Utils.userDataDirectory, "settings.json");
                    }
                    else {
                        settingsFile = "User";
                    }
                    break;
                case vscode.ConfigurationTarget.Workspace:
                    if (vscode.workspace && vscode.workspace.workspaceFile && vscode.workspace.workspaceFile.fsPath) {
                        settingsFile = vscode.workspace.workspaceFile.fsPath;
                    }
                    else if (vscode.workspace && vscode.workspace.workspaceFolders &&
                        vscode.workspace.workspaceFolders.length === 1 && vscode.workspace.workspaceFolders[0].name === vscode.workspace.name) {
                        let folder = vscode.workspace.workspaceFolders[0];
                        if (folder) {
                            settingsFile = path.join(folder.uri.fsPath, ".vscode/settings.json");
                        }
                    }
                    break;
                case vscode.ConfigurationTarget.WorkspaceFolder:
                    if (workspaceFolder && vscode.workspace && vscode.workspace.workspaceFolders) {
                        let folder = vscode.workspace.workspaceFolders.find(folder => folder.name === workspaceFolder.name &&
                            folder.index === workspaceFolder.index);
                        if (folder) {
                            settingsFile = path.join(folder.uri.fsPath, ".vscode/settings.json");
                        }
                    }
                    break;
            }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Error on getting Settings file location");
            logErroAfterValidating(error);
        }
        return settingsFile;
    }
    static ProcessingExplainPlanOrExecutionPlanMessage(explainPlanMode) {
        let processingExplainPlanMessage = false;
        switch (explainPlanMode) {
            case scriptExecutionModels_1.ExplainPlanMode.ExplainPlanGrid:
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExplainPlanText:
            case scriptExecutionModels_1.ExplainPlanMode.ExecutionPlanGrid:
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExecutionPlanText:
                processingExplainPlanMessage = true;
                break;
            default:
                break;
        }
        return processingExplainPlanMessage;
    }
    static ProcessingExecutionPlanMessage(explainPlanMode) {
        let processingExecutionMessage = false;
        switch (explainPlanMode) {
            case scriptExecutionModels_1.ExplainPlanMode.ExecutionPlanGrid:
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExecutionPlanText:
                processingExecutionMessage = true;
                break;
            default:
                break;
        }
        return processingExecutionMessage;
    }
    static getFileURI(explainPlanMode, fileURI) {
        let uri = fileURI;
        let prefix;
        switch (explainPlanMode) {
            case scriptExecutionModels_1.ExplainPlanMode.ExplainPlanGrid:
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExplainPlanText:
                prefix = Utils.explainPlanURIPrefix;
                if (!fileURI.startsWith(prefix)) {
                    uri = `${prefix}${fileURI}`;
                }
                break;
            case scriptExecutionModels_1.ExplainPlanMode.ExecutionPlanGrid:
            case scriptExecutionModels_1.ExplainPlanMode.DBMSExecutionPlanText:
                prefix = Utils.executionPlanURIPrefix;
                if (!fileURI.startsWith(prefix)) {
                    uri = `${prefix}${fileURI}`;
                }
                break;
            default:
                break;
        }
        return uri;
    }
    static getScriptFileURI(fileURI) {
        let scriptURI = fileURI;
        if (fileURI.startsWith(Utils.explainPlanURIPrefix))
            scriptURI = fileURI.substring(Utils.explainPlanURIPrefix.length);
        else if (fileURI.startsWith(Utils.executionPlanURIPrefix))
            scriptURI = fileURI.substring(Utils.executionPlanURIPrefix.length);
        return scriptURI;
    }
    static getExplainPlanWindowTitle(fileURI) {
        let prefix = localizedConstants_1.default.explainPlanWindowPrefix;
        let uri = fileURI;
        uri = `${prefix}: ${fileURI}`;
        return uri;
    }
    static areConnectionPropertiesIdentical(conn1Name, conn1ConfigurationTarget, conn1WorkspaceFolder, conn2Name, conn2ConfigurationTarget, conn2WorkspaceFolder) {
        return conn1Name === conn2Name && conn1ConfigurationTarget === conn2ConfigurationTarget &&
            ((!conn1WorkspaceFolder && !conn2WorkspaceFolder) ||
                (conn1WorkspaceFolder && conn2WorkspaceFolder &&
                    conn1WorkspaceFolder.name === conn2WorkspaceFolder.name &&
                    conn1WorkspaceFolder.index === conn2WorkspaceFolder.index));
    }
    static explainPlanORExecutionPlanDisplayMode(displayMode) {
        let explainPlanOrExecutionPlanMode = false;
        switch (displayMode) {
            case scriptExecutionModels_1.UIDisplayMode.executeExplainPlanSQL:
            case scriptExecutionModels_1.UIDisplayMode.executeDBMSExplainPlanSQL:
            case scriptExecutionModels_1.UIDisplayMode.ExecutionPlanGrid:
            case scriptExecutionModels_1.UIDisplayMode.DBMSExecutionPlanText:
                explainPlanOrExecutionPlanMode = true;
                break;
            default:
                break;
        }
        return explainPlanOrExecutionPlanMode;
    }
    static openWebviewPanel(args, viewType, messageTobeLogged, vscodeConnector, viewColumn = vscode.ViewColumn.Active) {
        args.executionId = "1";
        const clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri);
        const clientInfo = clients && clients.length > 0 ? clients[0] : null;
        let existingPanel = clientInfo ? clientInfo.panel : null;
        let panel = existingPanel;
        if (!panel) {
            panel = vscode.window.createWebviewPanel(viewType, args.windowTitle, viewColumn, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            panel.webview.html = scriptExcutionCommandHandler_1.ScriptExecutionCommandHandler.generateHtml(vscodeConnector, args, panel);
            panel.onDidDispose(() => {
                resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
            }, undefined, vscodeConnector.ExtensionContext.subscriptions);
            panel.onDidChangeViewState((e) => {
                if (e && e.webviewPanel) {
                    if (e.webviewPanel.active && e.webviewPanel.visible) {
                        fileLogger.info(messageTobeLogged);
                    }
                }
            });
            resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, args.windowUri, args.executionId);
            let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri, args.executionId);
            if (clients) {
                clients.forEach(client => {
                    client.ready = true;
                    resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
                });
            }
        }
        else {
            panel.title = args.windowTitle;
            const clearParams = new scriptExecutionModels_1.clearPageEvent();
            clearParams.ownerUri = args.windowUri;
            clearParams.executionId = args.executionId;
            clearParams.windowUri = args.windowUri;
            clearParams.profileName = args.profileName;
            clearParams.workspaceFolderName = args.workspaceFolderName;
            clearParams.workspaceFolderUri = args.workspaceFolderUri;
            clearParams.workspaceFolderIndex = args.workspaceFolderIndex;
            clearParams.configurationTarget = args.configurationTarget;
            clearParams.isCreate = args.isCreate;
            clearParams.uri = args.uri;
            clearParams.documentUri = args.documentUri;
            clearParams.walletLocation = args.walletLocation;
            clearParams.isDedicatedDb = args.isDedicatedDb;
            clearParams.displayMode = args.uiMode;
            clearParams.tlsAuthenticationType = args.tlsAuthType;
            clearParams.adbDatabaseID = args.adbDatabaseID;
            clearParams.workloadType = args.adbWorkLoadType;
            clearParams.connectionUniqueId = args.connectionUniqueId;
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(args.windowUri, args.executionId, scriptExecutionModels_1.MessageName.clearPageEvent, clearParams);
        }
        panel.reveal(panel.viewColumn, false);
    }
    static getConnectionUIArguments(uri, associateFile, databaseInfo, executionID, lastConnectionType = scriptExecutionModels_1.ConnectionType.EZConnect) {
        let args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
        var windowURI = constants_1.Constants.connectionWindowUri;
        var windowTitle = localizedConstants_1.default.connectionUITitle;
        if (databaseInfo != null) {
            args.adbDatabaseID = databaseInfo.databaseID;
            args.adbDisplayName = databaseInfo.dbDisplayName;
            args.adbName = databaseInfo.dbName;
            args.isDedicatedDb = databaseInfo.dedicatedDb;
            args.uiMode = databaseInfo.displayMode;
            args.profileName = databaseInfo.profileName;
            switch (databaseInfo.displayMode) {
                case scriptExecutionModels_1.UIDisplayMode.DownloadCredentialsFile:
                    windowURI = constants_1.Constants.adbDownloadCredentialsWindowUri;
                    windowTitle = localizedConstants_1.default.downloadCredentialsTitle;
                    break;
                case scriptExecutionModels_1.UIDisplayMode.AutonomousDatabaseConnectionManagement:
                    windowURI = constants_1.Constants.adbconnectionWindowUri;
                    break;
                case scriptExecutionModels_1.UIDisplayMode.getADBConnectionStrings:
                    windowURI = constants_1.Constants.adbconnectionWindowUri;
                    break;
                default:
                    break;
            }
            windowTitle = `${windowTitle} : ${databaseInfo.dbDisplayName}`;
            const config = vscode.workspace.getConfiguration(constants_1.Constants.extensionConfigSectionName);
            if (config) {
                args.walletLocation = config.inspect(constants_1.Constants.walletFileFolderPropertyName) ? config.get(constants_1.Constants.walletFileFolderPropertyName) : undefined;
                if ((databaseInfo.displayMode == scriptExecutionModels_1.UIDisplayMode.AutonomousDatabaseConnectionManagement || scriptExecutionModels_1.UIDisplayMode.DownloadCredentialsFile)
                    && args.walletLocation && databaseInfo.dbName) {
                    args.walletLocation = path.join(args.walletLocation, databaseInfo.dbName);
                }
                args.tlsAuthType = databaseInfo.tlsAuthenticationType;
            }
        }
        else {
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.ConnectionManagement;
            args.profileName = "newConnection";
        }
        args.uri = uri;
        args.executionId = executionID;
        args.windowUri = windowURI;
        args.isCreate = true;
        args.windowTitle = windowTitle;
        if (associateFile) {
            args.documentUri = uri;
        }
        args.connectionType = lastConnectionType;
        return args;
    }
    static isSingleFolderWorkspace() {
        let singleFolderWorkspace = vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length === 1 &&
            vscode.workspace.workspaceFolders[0].name === vscode.workspace.name;
        logger_1.FileStreamLogger.Instance.info("isSingleFolderWorkspace: " + singleFolderWorkspace);
        return singleFolderWorkspace;
    }
    static getExecutionStartedStatusBarMessage(action) {
        let message = localizedConstants_1.default.executingMessage;
        switch (action) {
            case scriptExecutionModels_1.Action.ShowSQL:
            case scriptExecutionModels_1.Action.Narrate:
                message = localizedConstants_1.default.translatingMessage;
                break;
            case scriptExecutionModels_1.Action.Chat:
                message = localizedConstants_1.default.explainingMessage;
                break;
        }
        return message;
    }
    static getExecutionFinishedStatusBarMessage(action) {
        let message = localizedConstants_1.default.executionFinishedMessage;
        switch (action) {
            case scriptExecutionModels_1.Action.ShowSQL:
            case scriptExecutionModels_1.Action.Narrate:
                message = localizedConstants_1.default.translatedMessage;
                break;
            case scriptExecutionModels_1.Action.Chat:
                message = localizedConstants_1.default.explainedMessage;
                break;
        }
        return message;
    }
    static IsCommandSupportedbyAllNodes(commandID, selectedNodes) {
        let commandSupportedbyAllNodes = true;
        for (let index = 0; index < selectedNodes.length; index++) {
            const element = selectedNodes[index];
            if (element && !element.IsCommandSupported(commandID, element.getContextValue)) {
                commandSupportedbyAllNodes = false;
                break;
            }
        }
        return commandSupportedbyAllNodes;
    }
    static IsMultipleCommandSupportedAcrossConnection(commandID, selectedNodes) {
        let commandSupportedAcrossConnectionNodes = true;
        let nodesAcrossConnection = false;
        let firstNode = selectedNodes[0];
        let firstNodeconnectionStr = firstNode.connectionURI;
        if (firstNodeconnectionStr) {
            for (let index = 0; index < selectedNodes.length; index++) {
                const element = selectedNodes[index];
                if (firstNodeconnectionStr != element.connectionURI) {
                    if (!element.IsMultiCommandSupportedAcrossConnection(commandID, element.getContextValue)) {
                        commandSupportedAcrossConnectionNodes = false;
                        break;
                    }
                    break;
                }
            }
        }
        return commandSupportedAcrossConnectionNodes;
    }
}
exports.Utils = Utils;
Utils.formatExtensionMapping = new Map();
Utils.userDataDirectory = undefined;
Utils.explainPlanURIPrefix = "explainPlan:";
Utils.executionPlanURIPrefix = "executionPlan:";
var ProceedOption;
(function (ProceedOption) {
    ProceedOption[ProceedOption["Yes"] = 0] = "Yes";
    ProceedOption[ProceedOption["No"] = 1] = "No";
    ProceedOption[ProceedOption["Ok"] = 2] = "Ok";
    ProceedOption[ProceedOption["Cancel"] = 3] = "Cancel";
})(ProceedOption = exports.ProceedOption || (exports.ProceedOption = {}));
class AppUtils {
    static ShowErrorAndLog(error, vsCodeconnector) {
        if (error && error.message) {
            vsCodeconnector.showErrorMessage(error.message);
        }
        logErroAfterValidating(error);
    }
}
exports.AppUtils = AppUtils;
