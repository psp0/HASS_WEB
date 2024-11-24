"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnFilterType = exports.DataExplorerExceptionCodes = exports.QueryBookmarkUtil = exports.QueryHistoryUtil = exports.ExplorerStatusManager = exports.TreeViewConstants = exports.ExplorerUtilities = void 0;
const vscode = require("vscode");
const logger_1 = require("../infrastructure/logger");
const oracleLanguageServerClient_1 = require("../infrastructure/oracleLanguageServerClient");
const localizedConstants_1 = require("./../constants/localizedConstants");
const databaseObjects_1 = require("./databaseObjects");
const dataExplorerRequests_1 = require("./dataExplorerRequests");
const connectionNode_1 = require("./nodes/connectionNode");
const functionNode_1 = require("./nodes/functionNode");
const functionProcedureParameterNode_1 = require("./nodes/functionProcedureParameterNode");
const packageBodyNode_1 = require("./nodes/packageBodyNode");
const packageMethodNode_1 = require("./nodes/packageMethodNode");
const packageMethodParameterNode_1 = require("./nodes/packageMethodParameterNode");
const packageNode_1 = require("./nodes/packageNode");
const procedureNode_1 = require("./nodes/procedureNode");
const relationalTableNode_1 = require("./nodes/relationalTableNode");
const sequenceNode_1 = require("./nodes/sequenceNode");
const synonymNode_1 = require("./nodes/synonymNode");
const tableColumnNode_1 = require("./nodes/tableColumnNode");
const tableConstraintNode_1 = require("./nodes/tableConstraintNode");
const tableIndexNode_1 = require("./nodes/tableIndexNode");
const tableTriggerNode_1 = require("./nodes/tableTriggerNode");
const viewNodes_1 = require("./nodes/viewNodes");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const userNode_1 = require("./nodes/userNode");
const queryHistoryRequests_1 = require("./queryHistoryRequests");
const queryBookmarkRequest_1 = require("./queryBookmarkRequest");
const dataExplorerManager_1 = require("./dataExplorerManager");
const constants_1 = require("../constants/constants");
const packageBodyPrivateMethodNode_1 = require("./nodes/packageBodyPrivateMethodNode");
const editorUtils_1 = require("./editors/editorUtils");
const documentConnectionInformation_1 = require("../connectionManagement/documentConnectionInformation");
const helper = require("../utilities/helper");
const setup_1 = require("../utilities/setup");
const compilerSettingsManager_1 = require("./compilerSettingsManager");
const settings_1 = require("../utilities/settings");
class ExplorerUtilities {
    static refreshNode(node) {
        if (ExplorerUtilities.refreshNodeField) {
            ExplorerUtilities.refreshNodeField(node);
        }
    }
    static getConnectionNodeID(nodeName, connectionId, connStatus, oldConnStatus, currentConnNodeId, connAsscoType) {
        let connNodeID = nodeName + connectionId.toString();
        switch (connStatus) {
            case connectionNode_1.ConnectionStatus.Connected:
                connNodeID = connNodeID + connectionNode_1.ConnectionStatus.Connected;
                break;
            case connectionNode_1.ConnectionStatus.Disconnected:
                connNodeID = connNodeID + connectionNode_1.ConnectionStatus.Disconnected;
                break;
            case connectionNode_1.ConnectionStatus.Connecting:
                connNodeID = connNodeID + connectionNode_1.ConnectionStatus.Disconnected;
                break;
            case connectionNode_1.ConnectionStatus.Errored:
                connNodeID = connNodeID + connectionNode_1.ConnectionStatus.Errored;
                break;
        }
        if (connAsscoType === connectionNode_1.ConnAssocType.Default) {
            connNodeID = connNodeID + connectionNode_1.ConnAssocType.Default;
        }
        if (connStatus === oldConnStatus && currentConnNodeId && !currentConnNodeId.endsWith("_")) {
            connNodeID = connNodeID + "_";
        }
        return connNodeID;
    }
    static isProfilesEqual(prof1, prof2) {
        const propsNotToCompareForUpgradedConn = [
            "databaseHostName",
            "databasePortNumber",
            "databaseServiceName",
            "passwordEmptyByUser",
            "filters",
            "enableFiltersForIntellisense"
        ];
        const displayPropsNotToCompare = [
            "addSettingsScopeToConnectionName",
            "addCurrentSchemaToConnectionName",
            "color"
        ];
        let profile1;
        let profile2;
        if (Object.keys(prof1).length >= Object.keys(prof2).length) {
            profile1 = prof1;
            profile2 = prof2;
        }
        else {
            profile1 = prof2;
            profile2 = prof1;
        }
        let result = true;
        let displayPropsDiffer = false;
        let notCompared = 0;
        for (var propertyName in profile1) {
            if (propsNotToCompareForUpgradedConn.indexOf(propertyName) !== -1) {
                if (!(propertyName in profile2)) {
                    notCompared += 1;
                }
                continue;
            }
            let isProcessingPassword = (propertyName == "password" || propertyName == "proxyPassword");
            let passwordMatch = isProcessingPassword ? ExplorerUtilities.isPasswordEqual(profile1[propertyName], profile2[propertyName]) : true;
            let wasSaved = profile1.passwordSaved || profile2.passwordSaved;
            let passwordStoreMatch = profile1.passwordStore && profile2.passwordStore && (profile1.passwordStore == profile2.passwordStore);
            if (isProcessingPassword && wasSaved && passwordStoreMatch && !passwordMatch) {
                result = false;
                break;
            }
            else if (!isProcessingPassword &&
                profile1[propertyName] !== profile2[propertyName]) {
                if (displayPropsNotToCompare.indexOf(propertyName) !== -1) {
                    if (!(propertyName in profile2)) {
                        notCompared += 1;
                    }
                    displayPropsDiffer = true;
                    continue;
                }
                result = false;
                break;
            }
        }
        if (result) {
            if (Object.keys(profile1).length - notCompared !== Object.keys(profile2).length) {
                result = false;
            }
        }
        return [result, displayPropsDiffer];
    }
    static isPasswordEqual(password1, password2) {
        let result = true;
        if (password1 && password2) {
            for (let index = 0; index < password1.length; index++) {
                if (password1[index] !== password2[index]) {
                    result = false;
                    break;
                }
            }
        }
        else {
            if ((!password2 && password1) || (password2 && !password1)) {
                result = false;
            }
        }
        return result;
    }
    static getObjectUri(objectProperties) {
        let objectUri = "";
        if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
            objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
            const parentName = objectProperties.dbObject.parent;
            objectUri = `${objectProperties.connectionUri}/${objectProperties.ddexType}/${objectProperties.schemaName}.${parentName}.${objectProperties.objectName}`;
        }
        else {
            objectUri = `${objectProperties.connectionUri}/${objectProperties.ddexType}/${objectProperties.schemaName}.${objectProperties.objectName}`;
        }
        return objectUri;
    }
    static getUniqueURI(objectProperties) {
        let resultsWindowUri = "";
        let objectUri = this.getObjectUri(objectProperties);
        resultsWindowUri = ExplorerUtilities.objectUriToResultsWindowUriMap[objectUri];
        if (!resultsWindowUri) {
            ++ExplorerUtilities.resultsUriCount;
            resultsWindowUri = `${objectProperties.connectionUri}/${objectProperties.ddexType}/ResultsWindow/${ExplorerUtilities.resultsUriCount}`;
            ExplorerUtilities.objectUriToResultsWindowUriMap[objectUri] = resultsWindowUri;
        }
        return resultsWindowUri;
    }
    static async onShowData(objectProperties, scriptExecuter, treeNode, parent) {
        return new Promise(async (resolve, reject) => {
            let [response, connOpen] = await ExplorerUtilities.getBasicPropertiesFromDB(objectProperties);
            if (!connOpen) {
                let connectionNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(objectProperties.connectionUri);
                if (connectionNode) {
                    dataExplorerManager_1.DataExplorerManager.Instance.onConnectionDisconnect(connectionNode, true);
                }
                resolve();
                return;
            }
            if (!response || !response.object || !response.object.objectExists) {
                if (parent) {
                    parent.removeChild(treeNode);
                    ExplorerUtilities.refreshNode(parent);
                }
                resolve();
                return;
            }
            const showDataParmas = new dataExplorerRequests_1.DataExploreShowObjectDataParams();
            showDataParmas.ownerUri = ExplorerUtilities.getUniqueURI(objectProperties);
            showDataParmas.objectName = objectProperties.objectName;
            showDataParmas.schemaName = objectProperties.schemaName;
            showDataParmas.connectionUri = objectProperties.connectionUri;
            showDataParmas.showDataFetchSize = constants_1.Constants.showDataFetchSize;
            let connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(objectProperties.connectionUri);
            let configurationTarget = vscode.ConfigurationTarget.Global;
            let workspaceFolder = undefined;
            if (connNode) {
                configurationTarget = connNode.connectionProperties.configurationTarget;
                workspaceFolder = connNode.connectionProperties.workspaceFolder;
            }
            showDataParmas.querySettings = settings_1.Settings.getQueryExecutionSettings(configurationTarget, workspaceFolder);
            scriptExecuter.startShowDataExecution(showDataParmas, objectProperties.connectionName);
            resolve();
        });
    }
    static getRunResultsUri(connectionUri, ddexObjectType, schemaname, objectname) {
        let resultsWindowUri = "";
        let objectUri = `${connectionUri}/${ddexObjectType}/${schemaname}.${objectname}`;
        resultsWindowUri = ExplorerUtilities.objectUriToResultsWindowUriMap[objectUri];
        if (!resultsWindowUri) {
            ++ExplorerUtilities.resultsUriCount;
            resultsWindowUri = `${connectionUri}/${ddexObjectType}/ResultsWindow/${ExplorerUtilities.resultsUriCount}`;
            ExplorerUtilities.objectUriToResultsWindowUriMap[objectUri] = resultsWindowUri;
        }
        return resultsWindowUri;
    }
    static async runCodeObjectFromFile(editorUri, scriptExecutor, dataExpManager, debug, debugHostIP, debugPort, debugSessionId) {
        let params = editorUtils_1.editorUtils.getQueryParameters(editorUri);
        if (params) {
            let connNode = dataExpManager.getConnectionNode(params.connectionUri);
            let ownerUri = ExplorerUtilities.getRunResultsUri(params.connectionUri, params.ddexObjectType, params.schemaname, params.objectname);
            let [response, connOpen] = await ExplorerUtilities.runCodeObject(connNode.connectionURI, ownerUri, params.ddexObjectType, params.schemaname, params.objectname, undefined, undefined, connNode.connectionProperties.uniqueName, scriptExecutor, debug, debugHostIP, debugPort, debugSessionId, true);
            if (!connOpen) {
                let connectionNode = dataExpManager.getConnectionNode(params.connectionUri);
                if (connectionNode) {
                    dataExpManager.onConnectionDisconnect(connectionNode, true);
                }
            }
        }
    }
    static async runCodeObjectFromOENode(objectProperties, scriptExecutor, dataExpManager, debug, debugHostIP, debugPort, debugSessionId) {
        let object = objectProperties.objectName;
        if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
            objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
            const parentName = objectProperties.dbObject.parent;
            object = `${parentName}.${objectProperties.objectName}`;
        }
        let ownerUri = ExplorerUtilities.getRunResultsUri(objectProperties.connectionUri, objectProperties.ddexType, objectProperties.schemaName, object);
        let ddexObjectType = (objectProperties.ddexType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) ?
            dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod : objectProperties.ddexType;
        let schemaName = objectProperties.schemaName;
        let objectName = objectProperties.objectName;
        let parentName = undefined;
        let methodId = undefined;
        if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
            objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
            const method = objectProperties.dbObject;
            parentName = method.parent;
            methodId = method.id.toString();
        }
        let connectionName = objectProperties.connectionName;
        let [response, connOpen] = await this.runCodeObject(objectProperties.connectionUri, ownerUri, ddexObjectType, schemaName, objectName, parentName, methodId, connectionName, scriptExecutor, debug, debugHostIP, debugPort, debugSessionId, false);
        if (!connOpen) {
            let connectionNode = dataExpManager.getConnectionNode(objectProperties.connectionUri);
            if (connectionNode) {
                dataExpManager.onConnectionDisconnect(connectionNode, true);
            }
        }
    }
    static async runCodeObject(connectionUri, ownerUri, ddexObjectType, schemaName, objectName, parentName, methodId, connectionName, scriptExecutor, debug, debugHostIP, debugPort, debugSessionId, requestFromFile) {
        return new Promise((resolve, reject) => {
            const basicPropertiesRequest = new dataExplorerRequests_1.DataExplorerFetchBasicObjectPropertiesParams();
            basicPropertiesRequest.ownerUri = ownerUri;
            basicPropertiesRequest.objectType = ddexObjectType;
            basicPropertiesRequest.objectName = objectName;
            basicPropertiesRequest.schemaName = schemaName;
            basicPropertiesRequest.connectionUri = connectionUri;
            basicPropertiesRequest.parentName = parentName;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerFetchBasicObjectPropertiesRequest.type, basicPropertiesRequest).then((response) => {
                if (response.object && response.object.status === dataExplorerRequests_1.Status.Valid) {
                    const requestParams = new dataExplorerRequests_1.RunCodeObjectRequestParams();
                    requestParams.ownerUri = ownerUri;
                    requestParams.objectType = ddexObjectType;
                    requestParams.objectName = objectName;
                    requestParams.schemaName = schemaName;
                    requestParams.connectionUri = connectionUri;
                    requestParams.parentName = parentName;
                    requestParams.methodId = methodId;
                    requestParams.isDebug = debug;
                    requestParams.debugSessionId = debugSessionId;
                    if (debug) {
                        requestParams.debugHostIP = debugHostIP;
                        requestParams.debugPort = debugPort;
                    }
                    scriptExecutor.startCodeExecution(requestParams, connectionName, connectionName, requestFromFile);
                }
                else {
                    logger_1.FileStreamLogger.Instance.info(localizedConstants_1.default.invalidObjectMessage);
                    this.vscodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                }
                resolve([response, true]);
            }, (error) => {
                logger_1.FileStreamLogger.Instance.info(localizedConstants_1.default.invalidObjectMessage);
                let connOpen = true;
                if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                    connOpen = false;
                }
                else {
                    this.vscodeConnector.showErrorMessage(localizedConstants_1.default.invalidObjectMessage);
                }
                resolve([undefined, connOpen]);
            });
        });
    }
    static get vscodeConnector() {
        return ExplorerUtilities.vscodeConnectorField;
    }
    static set vscodeConnector(v) {
        ExplorerUtilities.vscodeConnectorField = v;
    }
    static getNodePath(parentPath, nodeId) {
        return parentPath + "\\" + nodeId;
    }
    static async getCodeObjectSource(ownerUri, objectType, objectName, schemaName, appendSchema) {
        return new Promise((resolve, reject) => {
            let sourceText = "";
            let createdDateTime = "";
            let modifiedDateTime = "";
            const requestParams = new dataExplorerRequests_1.DataExplorerFetchSourceRequestParams();
            requestParams.ownerUri = ownerUri;
            requestParams.objectType = objectType;
            requestParams.objectName = objectName;
            requestParams.schemaName = schemaName;
            requestParams.appendSchema = appendSchema;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerFetchSourceRequestStronglyTyped.type, requestParams).
                then((response) => {
                if (response) {
                    sourceText = response.sourceText;
                    createdDateTime = response.createdDateTime;
                    modifiedDateTime = response.modifiedDateTime;
                }
                resolve([sourceText, createdDateTime, modifiedDateTime, response, true]);
                logger_1.FileStreamLogger.Instance.info("Fetched source text for object");
            }, (error) => {
                logger_1.FileStreamLogger.Instance.error("Error on fetching source text");
                logger_1.FileStreamLogger.Instance.error(error.message);
                let res = new dataExplorerRequests_1.DataExplorerFetchSourceResponse();
                res.messageType = dataExplorerRequests_1.DataExplorerFetchMessageType.Error;
                res.message = error.message;
                let connOpen = true;
                if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                    connOpen = false;
                }
                resolve([undefined, undefined, undefined, res, connOpen]);
            });
        });
    }
    static async saveToDatabase(fileUri, ownerUri, objectType, objectName, schemaName, checkObjectState, modifiedDateTime, compileDebug) {
        return new Promise((resolve, reject) => {
            const requestParams = new dataExplorerRequests_1.DataExplorerSaveToDatabaseRequestParams();
            requestParams.fileUri = fileUri;
            requestParams.ownerUri = ownerUri;
            requestParams.objectType = objectType;
            requestParams.objectName = objectName;
            requestParams.schemaName = schemaName;
            requestParams.checkObjectState = checkObjectState;
            requestParams.modifiedDateTime = modifiedDateTime;
            requestParams.compileDebug = compileDebug;
            const extensionConfig = setup_1.Setup.getExtensionConfigSection();
            let compileSettings = extensionConfig.get(constants_1.Constants.compilerSettingsPropertyName);
            const compileFlags = compilerSettingsManager_1.CompilerSettingsManager.processCompilerFlagsFromSettings(compileSettings, false);
            const compileDebugFlags = compilerSettingsManager_1.CompilerSettingsManager.processCompilerFlagsFromSettings(compileSettings, true);
            if (compileFlags.enableFlags)
                requestParams.compileFlags = compileFlags;
            if (compileDebugFlags.enableFlags)
                requestParams.compileDebugFlags = compileDebugFlags;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerSaveToDatabaseRequestStronglyTyped.type, requestParams).
                then((response) => {
                resolve([response, true]);
                logger_1.FileStreamLogger.Instance.info("Save to Dababase response received");
            }, (error) => {
                logger_1.FileStreamLogger.Instance.error("Error received as Save to Dababase response");
                logger_1.FileStreamLogger.Instance.error(error.message);
                let res = new dataExplorerRequests_1.DataExplorerSaveToDatabaseResponse();
                res.messageType = dataExplorerRequests_1.DataExplorerSaveToDatabaseMessageType.Error;
                res.message = error.message;
                let connOpen = true;
                if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                    connOpen = false;
                }
                resolve([res, connOpen]);
            });
        });
    }
    static async compileCodeObject(args) {
        return new Promise(async (resolve) => {
            documentConnectionInformation_1.fileLogger.info("Compilation is starting for PL/SQL code object");
            let headerMsg = args.debug ? localizedConstants_1.default.compileDebugObjectHeaderMsg : localizedConstants_1.default.compileObjectHeaderMsg;
            const header = helper.stringFormatterCsharpStyle(headerMsg, args.schemaName, args.objectName);
            var outputWindow = logger_1.ChannelLogger.Instance;
            let dataExplorer = dataExplorerManager_1.DataExplorerManager.Instance;
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.CompileCodeObjectRequest.type, args).then(async (response) => {
                outputWindow.info(header + '\n' + response.queryText + '\n' + response.resultDetails + '\n');
                outputWindow.show();
                if (response.messageType != scriptExecutionModels_1.ScriptExecutionMessageType.Message) {
                    let connectionNode = dataExplorer.getConnectionNode(args.connectionUri);
                    if (response.openObject) {
                        let editorUri = vscode.Uri.parse(args.fileUri);
                        await editorUtils_1.editorUtils.openEditor(editorUri, connectionNode);
                    }
                    if (args.objectType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package && response.openObjectBody) {
                        let bodyEditorUri = vscode.Uri.parse(args.bodyFileUri);
                        await editorUtils_1.editorUtils.openEditor(bodyEditorUri, connectionNode);
                    }
                }
                resolve([true, response.modifiedDateTime]);
            }, error => {
                let connOpen = true;
                if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                    connOpen = false;
                }
                let splitIndex = error.message.indexOf(';'), errorMsg, queryText;
                if (splitIndex > -1) {
                    errorMsg = error.message.slice(splitIndex + 1);
                    queryText = error.message.slice(0, splitIndex);
                }
                else
                    errorMsg = error.message;
                const outputMsg = header + '\n' + queryText + '\n' + errorMsg + '\n';
                outputWindow.error(outputMsg);
                outputWindow.show();
                documentConnectionInformation_1.fileLogger.error(error.message);
                resolve([connOpen, null]);
            });
        });
    }
    static unequalCollectionFilters(profile1, profile2) {
        let unequalCollections = [];
        let filterSettings1 = profile1.filters;
        let filterSettings2 = profile2.filters;
        if (filterSettings1 === undefined || filterSettings1 === null) {
            if (filterSettings2 !== undefined && filterSettings2 !== null) {
                filterSettings2.forEach((fs) => {
                    unequalCollections.push(fs.collection);
                });
            }
        }
        else if ((filterSettings2 === undefined || filterSettings2 === null) && (filterSettings1 !== undefined && filterSettings1 !== null)) {
            filterSettings1.forEach((fs) => {
                unequalCollections.push(fs.collection);
            });
        }
        else {
            let collectionFilters1Dict = new Map();
            let collectionFilters2Dict = new Map();
            let filters1Colls = [];
            let filters2Colls = [];
            filterSettings1.forEach((fs) => {
                if (filters1Colls.indexOf(fs.collection) === -1) {
                    filters1Colls.push(fs.collection);
                    collectionFilters1Dict.set(fs.collection, fs);
                }
                else {
                    const fsOrig = collectionFilters1Dict.get(fs.collection);
                    fsOrig.filterProperties.push(...fs.filterProperties);
                    collectionFilters1Dict.set(fs.collection, fsOrig);
                }
            });
            filterSettings2.forEach((fs) => {
                if (filters2Colls.indexOf(fs.collection) === -1) {
                    filters2Colls.push(fs.collection);
                    collectionFilters2Dict.set(fs.collection, fs);
                }
                else {
                    const fsOrig = collectionFilters2Dict.get(fs.collection);
                    fsOrig.filterProperties.push(...fs.filterProperties);
                    collectionFilters2Dict.set(fs.collection, fsOrig);
                }
                if (filters1Colls.indexOf(fs.collection) === -1)
                    unequalCollections.push(fs.collection);
            });
            collectionFilters1Dict.forEach((collFilter1, coll, m) => {
                let collFilter2 = collectionFilters2Dict.get(coll);
                if (collFilter2 === undefined) {
                    unequalCollections.push(coll);
                }
                else {
                    if (collFilter1.collection !== collFilter2.collection || collFilter1.enableFiltersForExplorer !== collFilter2.enableFiltersForExplorer || collFilter1.match !== collFilter2.match) {
                        unequalCollections.push(collFilter1.collection);
                    }
                    else if ((collFilter1.enableFiltersForIntellisense !== collFilter2.enableFiltersForIntellisense) || (collFilter1.overrideConnectionFilter !== collFilter2.overrideConnectionFilter)) {
                        unequalCollections.push(collFilter1.collection);
                    }
                    else {
                        let filters1 = collFilter1.filterProperties;
                        let filters2 = collFilter2.filterProperties;
                        if (filters1 === undefined || filters1 === null) {
                            if (filters2 !== undefined && filters2 !== null)
                                unequalCollections.push(collFilter1.collection);
                        }
                        else if (filters2 === undefined || filters2 === null) {
                            if (filters1 !== undefined && filters1 !== null)
                                unequalCollections.push(collFilter1.collection);
                        }
                        else if (filters1.length !== filters2.length) {
                            unequalCollections.push(collFilter1.collection);
                        }
                        else {
                            for (let ix = 0; ix < filters1.length; ix++) {
                                if (filters1[ix].condition === filters2[ix].condition && filters1[ix].propertyName === filters2[ix].propertyName) {
                                    if (filters1[ix].propertyName === constants_1.Constants.visibleCollections) {
                                        let viz1 = filters1[ix].value;
                                        let viz2 = filters2[ix].value;
                                        if (viz1.length !== viz2.length) {
                                            unequalCollections.push(collFilter1.collection);
                                        }
                                        else {
                                            for (let iv = 0; iv < viz1.length; iv++) {
                                                if (viz1[iv] !== viz2[iv]) {
                                                    unequalCollections.push(collFilter1.collection);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    else if (filters1[ix].propertyName === constants_1.Constants.objectName
                                        || filters1[ix].propertyName === constants_1.Constants.parentObjectName
                                        || filters1[ix].propertyName === constants_1.Constants.parentObjectOwnerName) {
                                        if (filters1[ix].value !== filters2[ix].value
                                            || filters1[ix].caseSensitiveMatch !== filters2[ix].caseSensitiveMatch) {
                                            unequalCollections.push(collFilter1.collection);
                                        }
                                    }
                                    else if ((filters1[ix].propertyName === constants_1.Constants.createdDate || filters1[ix].propertyName === constants_1.Constants.modifiedDate || filters1[ix].propertyName === constants_1.Constants.objectCount) && (filters1[ix].condition === constants_1.Constants.between || filters1[ix].condition === constants_1.Constants.notBetween)) {
                                        if (filters1[ix].lowerLimit !== filters2[ix].lowerLimit
                                            || filters1[ix].upperLimit !== filters2[ix].upperLimit) {
                                            unequalCollections.push(collFilter1.collection);
                                        }
                                    }
                                    else if (filters1[ix].value !== filters2[ix].value) {
                                        unequalCollections.push(collFilter1.collection);
                                    }
                                }
                                else {
                                    unequalCollections.push(collFilter1.collection);
                                }
                            }
                        }
                    }
                }
            });
        }
        return unequalCollections;
    }
    static async refreshFilteredNodes(filteredNodes, connNode) {
        let connNodeRefresh = filteredNodes.indexOf("Connection");
        if (connNode && connNodeRefresh > -1) {
            await dataExplorerManager_1.DataExplorerManager.Instance.refreshNode(connNode);
        }
        else {
            const childNodes = await connNode.getChildren();
            childNodes.forEach(async (chn) => {
                if (filteredNodes.indexOf(chn.getNodeIdentifier) > -1) {
                    if ((chn.getNodeIdentifier === constants_1.Constants.tables || chn.getNodeIdentifier === constants_1.Constants.views
                        || chn.getNodeIdentifier === constants_1.Constants.triggers) && chn.children !== undefined
                        && chn.children.length > 0) {
                        chn.children.forEach((subChildCategoryNode) => {
                            dataExplorerManager_1.DataExplorerManager.Instance.refreshNode(subChildCategoryNode);
                        });
                    }
                    else {
                        dataExplorerManager_1.DataExplorerManager.Instance.refreshNode(chn);
                    }
                }
                else if (chn.getNodeIdentifier === "Other Users") {
                    this.refreshUserFilteredNodes(filteredNodes, chn);
                }
            });
        }
    }
    static async refreshUserFilteredNodes(filteredNodes, userNode) {
        const otherUsers = await userNode.getChildren();
        otherUsers.forEach(async (ou) => {
            const userChildren = await ou.getChildren();
            userChildren.forEach((uc) => {
                if (filteredNodes.indexOf(uc.getNodeIdentifier) > -1) {
                    if ((uc.getNodeIdentifier === constants_1.Constants.tables || uc.getNodeIdentifier === constants_1.Constants.views
                        || uc.getNodeIdentifier === constants_1.Constants.triggers) && uc.children !== undefined
                        && uc.children.length > 0) {
                        uc.children.forEach((subChildCategoryNode) => {
                            dataExplorerManager_1.DataExplorerManager.Instance.refreshNode(subChildCategoryNode);
                        });
                    }
                    else {
                        dataExplorerManager_1.DataExplorerManager.Instance.refreshNode(uc);
                    }
                }
            });
        });
    }
    static getVisibleCollections(parent) {
        let connectionNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(parent.connectionURI);
        let visColl = [];
        connectionNode.filterSettings.forEach((collFilter) => {
            if (collFilter.collectionType === scriptExecutionModels_1.FilterCollectionType.Connection && collFilter.enableFiltersForExplorer) {
                collFilter.filters.forEach((item) => {
                    if (item.property === scriptExecutionModels_1.FilterProperties.VisibleCollections) {
                        visColl = item.value;
                    }
                });
            }
        });
        return visColl;
    }
    static getCollectionLabel(nodeId, nodeLabel = "", connUri, connNode) {
        let label = nodeLabel == "" ? nodeId : nodeLabel;
        let addFiltered = false;
        let subCategoryNodes = [
            TreeViewConstants.relationalTablesStr,
            TreeViewConstants.objectTablesStr,
            TreeViewConstants.xmlTablesStr,
            TreeViewConstants.relationalViewsStr,
            TreeViewConstants.objectViewsStr,
            TreeViewConstants.xmlViewsStr,
            TreeViewConstants.materializedViewsStr,
            TreeViewConstants.tableTriggersStr,
            TreeViewConstants.viewTriggersStr,
            TreeViewConstants.schemaTriggersStr,
            TreeViewConstants.databaseTriggersStr
        ];
        let isSubCategory = subCategoryNodes.indexOf(label) > -1;
        if (!connNode) {
            connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(connUri);
        }
        let collFilters = connNode.filterSettings;
        if (collFilters && !isSubCategory) {
            for (let ic = 0; ic < collFilters.length; ic++) {
                if (collFilters[ic].collectionName === nodeId) {
                    let cf = collFilters[ic];
                    if (cf.filters !== undefined && cf.filters !== null && cf.filters.length > 0 && cf.enableFiltersForExplorer) {
                        addFiltered = true;
                        break;
                    }
                }
            }
        }
        if (addFiltered) {
            if (nodeLabel === "" || nodeLabel === nodeId) {
                label += " (Filtered)";
            }
        }
        else if (nodeLabel.length > nodeId.length) {
            label = nodeId;
        }
        return { label, addFiltered };
    }
    static getFindCollection(ddexType) {
        let findColl;
        switch (ddexType) {
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTable:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTable:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTable:
                findColl = scriptExecutionModels_1.FilterCollectionType.Tables;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalView:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectView:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLView:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedView:
                findColl = scriptExecutionModels_1.FilterCollectionType.Views;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure:
                findColl = scriptExecutionModels_1.FilterCollectionType.Procedures;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function:
                findColl = scriptExecutionModels_1.FilterCollectionType.Functions;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package:
                findColl = scriptExecutionModels_1.FilterCollectionType.Packages;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Sequence:
                findColl = scriptExecutionModels_1.FilterCollectionType.Sequences;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Synonym:
                findColl = scriptExecutionModels_1.FilterCollectionType.Synonyms;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Trigger:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_TableTriggerMain:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ViewTriggerMain:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_SchemaTriggerMain:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_DatabaseTriggerMain:
                findColl = scriptExecutionModels_1.FilterCollectionType.Triggers;
                break;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Schema:
                findColl = scriptExecutionModels_1.FilterCollectionType.OtherUsers;
                break;
            default:
                findColl = null;
                break;
        }
        return findColl;
    }
    static getMatchString(filterMatch) {
        let matchStr = constants_1.Constants.filterMatchSqlOR;
        if (filterMatch === scriptExecutionModels_1.FilterMatch.All) {
            matchStr = constants_1.Constants.filterMatchSqlAND;
        }
        return matchStr;
    }
    static getSettingStrObjectName(item) {
        let settingStr = `(${constants_1.Constants.filterSqlName} `;
        let nameStr = "";
        switch (item.condition) {
            case scriptExecutionModels_1.FilterConditions.Is:
                nameStr = `${constants_1.Constants.filterSqlLike} '${item.value}')`;
                break;
            case scriptExecutionModels_1.FilterConditions.IsNot:
                nameStr = `${constants_1.Constants.filterSqlNot} ${constants_1.Constants.filterSqlLike} '${item.value}')`;
                break;
            case scriptExecutionModels_1.FilterConditions.StartsWith:
                nameStr = `${constants_1.Constants.filterSqlLike} '${item.value}${constants_1.Constants.filterSqlAsterisk}')`;
                break;
            case scriptExecutionModels_1.FilterConditions.EndsWith:
                nameStr = `${constants_1.Constants.filterSqlLike} '${constants_1.Constants.filterSqlAsterisk}${item.value}')`;
                break;
            case scriptExecutionModels_1.FilterConditions.Contains:
                nameStr = `${constants_1.Constants.filterSqlLike} '${constants_1.Constants.filterSqlAsterisk}${item.value}${constants_1.Constants.filterSqlAsterisk}')`;
                break;
            case scriptExecutionModels_1.FilterConditions.DoesNotContain:
                nameStr = `${constants_1.Constants.filterSqlNot} ${constants_1.Constants.filterSqlLike} '${constants_1.Constants.filterSqlAsterisk}${item.value}${constants_1.Constants.filterSqlAsterisk}')`;
                break;
            default:
                break;
        }
        if (nameStr === "") {
            return "";
        }
        settingStr += nameStr;
        return settingStr;
    }
    static getSettingStrDate(item) {
        let restrictionStr = "";
        let datePropertySQLStr = "";
        if (item.property === scriptExecutionModels_1.FilterProperties.CreatedDate) {
            datePropertySQLStr = constants_1.Constants.filterSqlCreatedDate;
        }
        else if (item.property === scriptExecutionModels_1.FilterProperties.ModifiedDate) {
            datePropertySQLStr = constants_1.Constants.filterSqlModifiedDate;
        }
        else {
            return restrictionStr;
        }
        restrictionStr = `(${datePropertySQLStr} `;
        let dateSqlStr = "";
        switch (item.condition) {
            case scriptExecutionModels_1.FilterConditions.EqualTo:
                dateSqlStr = constants_1.Constants.equalTo;
                break;
            case scriptExecutionModels_1.FilterConditions.NotEqualTo:
                dateSqlStr = constants_1.Constants.notEqualTo;
                break;
            case scriptExecutionModels_1.FilterConditions.LessThan:
                dateSqlStr = constants_1.Constants.lessThan;
                break;
            case scriptExecutionModels_1.FilterConditions.GreaterThan:
                dateSqlStr = constants_1.Constants.greaterThan;
                break;
            case scriptExecutionModels_1.FilterConditions.Between:
                dateSqlStr = constants_1.Constants.filterSqlBetween;
                break;
            case scriptExecutionModels_1.FilterConditions.NotBetween:
                dateSqlStr = constants_1.Constants.filterSqlNotBetween;
                break;
            default:
                break;
        }
        if (dateSqlStr === "") {
            return "";
        }
        restrictionStr += dateSqlStr;
        restrictionStr += ` '${item.value}')`;
        return restrictionStr;
    }
    static getSettingStrObjectCount(item) {
        let restrictionStr = `(${constants_1.Constants.filterSqlObjectCount} `;
        let objectCountStr = "";
        switch (item.condition) {
            case scriptExecutionModels_1.FilterConditions.EqualTo:
                objectCountStr = constants_1.Constants.equalTo;
                break;
            case scriptExecutionModels_1.FilterConditions.NotEqualTo:
                objectCountStr = constants_1.Constants.notEqualTo;
                break;
            case scriptExecutionModels_1.FilterConditions.LessThan:
                objectCountStr = constants_1.Constants.lessThan;
                break;
            case scriptExecutionModels_1.FilterConditions.GreaterThan:
                objectCountStr = constants_1.Constants.greaterThan;
                break;
            case scriptExecutionModels_1.FilterConditions.Between:
                objectCountStr = constants_1.Constants.filterSqlBetween;
                break;
            case scriptExecutionModels_1.FilterConditions.NotBetween:
                objectCountStr = constants_1.Constants.filterSqlNotBetween;
                break;
            default:
                break;
        }
        if (objectCountStr === "")
            return "";
        restrictionStr += `${objectCountStr} ${item.value})`;
        return restrictionStr;
    }
    static addFilterRestrictions(parent, ddexType, restrictions, connNode) {
        if (!connNode)
            return null;
        let filterRestrictions = restrictions;
        if (filterRestrictions === null || filterRestrictions === undefined) {
            filterRestrictions = [];
        }
        let filterSettings = connNode.filterSettings;
        if (filterSettings === undefined || filterSettings === null) {
            return filterRestrictions;
        }
        let findCollection = this.getFindCollection(ddexType);
        if (!findCollection) {
            return filterRestrictions;
        }
        let restrictionStr = "";
        let addedRestrictions = 0;
        for (let ic = 0; ic < filterSettings.length; ic++) {
            let collFilter = filterSettings[ic];
            if ((collFilter.collectionType === findCollection || collFilter.collectionType === scriptExecutionModels_1.FilterCollectionType.Connection) && collFilter.enableFiltersForExplorer) {
                let matchSqlStr = this.getMatchString(collFilter.match);
                for (let ix = 0; ix < collFilter.filters.length; ix++) {
                    let item = collFilter.filters[ix];
                    let settingStr = "";
                    if (item.property === undefined || item.property === null || item.property === scriptExecutionModels_1.FilterProperties.VisibleCollections) {
                        continue;
                    }
                    else if (item.property === scriptExecutionModels_1.FilterProperties.ObjectName) {
                        settingStr = this.getSettingStrObjectName(item);
                    }
                    else if (item.property === scriptExecutionModels_1.FilterProperties.CreatedDate || item.property === scriptExecutionModels_1.FilterProperties.ModifiedDate) {
                        settingStr = this.getSettingStrDate(item);
                    }
                    else if (item.property === scriptExecutionModels_1.FilterProperties.ObjectCount) {
                        settingStr = this.getSettingStrObjectCount(item);
                    }
                    else if (item.property === scriptExecutionModels_1.FilterProperties.CompilationMode) {
                        let debugStr = `(${constants_1.Constants.filterSqlDebug} = `;
                        switch (item.value) {
                            case scriptExecutionModels_1.CodeObjectDebug.WithDebug:
                                debugStr += 'true)';
                                break;
                            case scriptExecutionModels_1.CodeObjectDebug.WithoutDebug:
                                debugStr += 'false)';
                                break;
                            default:
                                debugStr = "";
                                break;
                        }
                        settingStr = debugStr;
                    }
                    else if (item.property === scriptExecutionModels_1.FilterProperties.Status) {
                        let statusStr = `(${constants_1.Constants.status} = `;
                        switch (item.value) {
                            case databaseObjects_1.CodeObjectStatus.Valid:
                                statusStr += `'${constants_1.Constants.filtersValid}')`;
                                break;
                            case databaseObjects_1.CodeObjectStatus.Invalid:
                                statusStr += `'${constants_1.Constants.filtersInvalid}')`;
                                break;
                            default:
                                statusStr = "";
                                break;
                        }
                        settingStr = statusStr;
                    }
                    else if (item.property === scriptExecutionModels_1.FilterProperties.TriggerStatus) {
                        let triggerStatusStr = `(${constants_1.Constants.status} = `;
                        switch (item.value) {
                            case scriptExecutionModels_1.TriggerStatus.Enabled:
                                triggerStatusStr += `'${constants_1.Constants.filterSqlEnabled}')`;
                                break;
                            case scriptExecutionModels_1.TriggerStatus.Disabled:
                                triggerStatusStr += `'${constants_1.Constants.filterSqlDisabled}')`;
                                break;
                            default:
                                triggerStatusStr = "";
                                break;
                        }
                        settingStr = triggerStatusStr;
                    }
                    else {
                        continue;
                    }
                    if (settingStr !== "") {
                        addedRestrictions += 1;
                        if (addedRestrictions > 1) {
                            restrictionStr += ` ${matchSqlStr} ${settingStr}`;
                        }
                        else {
                            restrictionStr = settingStr;
                        }
                    }
                }
            }
            if (addedRestrictions > 1 && collFilter.collectionType === scriptExecutionModels_1.FilterCollectionType.Connection) {
                restrictionStr = '(' + restrictionStr + ')';
            }
        }
        if (restrictionStr !== "") {
            filterRestrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_CategoryFilter, restrictionStr));
        }
        return filterRestrictions;
    }
    static async getChildNodes(parent, ddexType, restrictions) {
        return new Promise(async (resolve, reject) => {
            logger_1.FileStreamLogger.Instance.info("Oracle Explorer Connection: Fetching list of objects");
            const requestParams = new dataExplorerRequests_1.DataExplorerGetObjectsRequestParams();
            requestParams.ownerUri = parent.connectionURI;
            requestParams.type = ddexType;
            requestParams.requestID = parent.connectionURI + parent.getNodeIdentifier;
            let connectionNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(parent.connectionURI);
            if (!connectionNode)
                resolve(null);
            requestParams.restrictions = restrictions;
            try {
                var response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerGetObjectsRequestStronglyTyped.type, requestParams);
                if (response.messageType !== dataExplorerRequests_1.DataExplorerGetObjectsMessageType.Error) {
                    logger_1.FileStreamLogger.Instance.info("Oracle Explorer Connection: Received list of objects from server, beginning tree nodes construction");
                    const results = [];
                    var i = 0;
                    const prtPath = ExplorerUtilities.getNodePath(parent.getParentPath, parent.getNodeIdentifier);
                    while (i < response.objects.length && connectionNode.status == connectionNode_1.ConnectionStatus.Connected) {
                        var nodeObj = ExplorerUtilities.GetChildObject(parent.connectionURI, prtPath, ddexType, response.objects[i]);
                        results.push(nodeObj);
                        ++i;
                    }
                    logger_1.FileStreamLogger.Instance.info("End of tree nodes construction");
                    parent.children = results;
                    if (ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod ||
                        ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod) {
                        const paramRequest = new dataExplorerRequests_1.DataExplorerGetMethodParamsRequest();
                        paramRequest.requestID = requestParams.requestID;
                        logger_1.FileStreamLogger.Instance.info("Fetching list of parameters for methods");
                        let paramResponse = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerGetMethodParamsRequestStronglyTyped.type, paramRequest);
                        if (paramResponse.cacheFound) {
                            logger_1.FileStreamLogger.Instance.info("Received list of parameters, updating tree nodes.");
                            i = 0;
                            let index, isPackageMethod = ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod || ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod;
                            let responseObj;
                            while (i < response.objects.length) {
                                responseObj = response.objects[i];
                                index = isPackageMethod ? responseObj['name'] + responseObj['id'] : responseObj['name'];
                                responseObj['params'] = paramResponse.paramDictionary[index];
                                results[i].toolTipMsg = this.getNodeToolTip(results[i], paramResponse.paramDictionary[index]);
                                ++i;
                            }
                            logger_1.FileStreamLogger.Instance.info("End of tree nodes updation");
                        }
                    }
                    resolve(parent.children);
                    logger_1.FileStreamLogger.Instance.info("Returning tree nodes - number of objects: " + results.length);
                }
                else {
                    logger_1.FileStreamLogger.Instance.info("Data Explorer getObjects request returned error");
                    ExplorerUtilities.vscodeConnector.showErrorMessage(response.message);
                    reject(false);
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Could not fetch objects");
                logger_1.FileStreamLogger.Instance.error(error.message);
                if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle &&
                    connectionNode) {
                    dataExplorerManager_1.DataExplorerManager.Instance.onConnectionDisconnect(connectionNode, true);
                    resolve(null);
                }
                else if (!connectionNode) {
                    resolve(null);
                }
                else {
                    reject(error);
                }
            }
            logger_1.FileStreamLogger.Instance.info("Data Explorer getObjects completed");
        });
    }
    static GetChildObject(connectUri, parentPath, type, databaseObject) {
        if (!this.childObjectMapping) {
            this.childObjectMapping = new Map();
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTable, () => {
                return new relationalTableNode_1.RelationalTableNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTable, () => {
                return new relationalTableNode_1.ObjectTableNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTable, () => {
                return new relationalTableNode_1.XMLTableNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLView, () => {
                return new viewNodes_1.XMLViewNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectView, () => {
                return new viewNodes_1.ObjectViewNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalView, () => {
                return new viewNodes_1.RelationalViewNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedView, () => {
                return new viewNodes_1.MaterializedViewNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Sequence, () => {
                return new sequenceNode_1.SequenceNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Synonym, () => {
                return new synonymNode_1.SynonymNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure, () => {
                return new procedureNode_1.ProcedureNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function, () => {
                return new functionNode_1.FunctionNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package, () => {
                return new packageNode_1.PackageNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_StoredProcedureParameter, () => {
                return new functionProcedureParameterNode_1.functionProcedureParameterNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_FunctionParameter, () => {
                return new functionProcedureParameterNode_1.functionProcedureParameterNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod, () => {
                return new packageMethodNode_1.PackageMethodNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod, () => {
                return new packageMethodNode_1.PackageMethodNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody, () => {
                return new packageBodyNode_1.PackageBodyNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyPrivateMethod, () => {
                return new packageBodyPrivateMethodNode_1.PackageBodyPrivateMethodNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageStoredProcedureParameter, () => {
                return new packageMethodParameterNode_1.packageMethodParameterNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableConstraint, () => {
                return new tableConstraintNode_1.TableConstraintNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableIndex, () => {
                return new tableIndexNode_1.TableIndexNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableConstraint, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableIndex, () => {
                return new tableIndexNode_1.TableIndexNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableConstraint, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableIndex, () => {
                return new tableIndexNode_1.TableIndexNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalViewColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalViewTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectViewColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectViewTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLViewColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLViewTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedViewColumn, () => {
                return new tableColumnNode_1.TableColumnNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedViewTrigger, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_TableTriggerMain, () => {
                return new tableTriggerNode_1.TableTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ViewTriggerMain, () => {
                return new tableTriggerNode_1.ViewTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_SchemaTriggerMain, () => {
                return new tableTriggerNode_1.SchemaTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_DatabaseTriggerMain, () => {
                return new tableTriggerNode_1.DatabaseTriggerNode();
            });
            this.childObjectMapping.set(dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Schema, () => {
                return new userNode_1.userNode();
            });
        }
        const resultObject = this.childObjectMapping.get(type)();
        resultObject.connectionURI = connectUri;
        resultObject.parentPath = parentPath;
        resultObject.populate(databaseObject);
        resultObject.ddexObjectType = type;
        return resultObject;
    }
    static getNodeToolTip(node, methodParams = null) {
        let isFunction = false;
        switch (node.ddexObjectType) {
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function: isFunction = true;
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyMethod:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBodyPrivateMethod:
                node.toolTipMsg = this.getToolTipForMethod(methodParams, node.getNodeIdentifier, true, isFunction);
        }
        return node.toolTipMsg;
    }
    static getToolTipForMethod(methodParameters, nodeIdentifier, isDbParams, isFunction = false) {
        if (methodParameters == null || methodParameters == undefined || methodParameters.length == 0)
            return isFunction ? constants_1.Constants.function + ' ' + nodeIdentifier : constants_1.Constants.procedure + ' ' + nodeIdentifier;
        if (!isFunction && methodParameters[0].name == '"ReturnValue"')
            isFunction = true;
        let i = isFunction ? 1 : 0;
        let tool_tip = (isFunction ? constants_1.Constants.function : constants_1.Constants.procedure) + ' ' + nodeIdentifier + ' ';
        if (methodParameters.length > i) {
            tool_tip += '\n(';
            for (; i < methodParameters.length; ++i)
                tool_tip += (methodParameters[i].name) + ' '
                    + (isDbParams ? methodParameters[i].dataType : methodParameters[i].dataType?.displayName) + ',\n';
            tool_tip = tool_tip.slice(0, -2) + ')';
        }
        if (isFunction)
            tool_tip += constants_1.Constants.return + (isDbParams ? methodParameters[0].dataType : methodParameters[0].dataType?.displayName);
        return tool_tip;
    }
    static registerRefreshMethod(treeDataProvider) {
        ExplorerUtilities.refreshNodeField = (node) => {
            treeDataProvider.refresh(node);
        };
    }
    static async getBasicPropertiesFromDB(objectProperties) {
        let parentName = undefined;
        if (objectProperties.ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod) {
            const method = objectProperties.dbObject;
            parentName = method.parent;
        }
        return ExplorerUtilities.getObjectBasicPropertiesFromDB(objectProperties.connectionUri, objectProperties.ddexType, objectProperties.objectName, objectProperties.schemaName, parentName);
    }
    static async getObjectBasicPropertiesFromDB(connectionUri, ddexType, objectName, schemaName, parentName) {
        return new Promise(async (resolve, reject) => {
            const basicPropertiesRequest = new dataExplorerRequests_1.DataExplorerFetchBasicObjectPropertiesParams();
            basicPropertiesRequest.ownerUri = connectionUri;
            basicPropertiesRequest.objectType = ddexType;
            basicPropertiesRequest.objectName = objectName;
            basicPropertiesRequest.schemaName = schemaName;
            basicPropertiesRequest.connectionUri = connectionUri;
            if (ddexType === dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageMethod) {
                basicPropertiesRequest.parentName = parentName;
            }
            await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(dataExplorerRequests_1.DataExplorerFetchBasicObjectPropertiesRequest.type, basicPropertiesRequest).then((response) => {
                resolve([response, true]);
            }, (error) => {
                let connOpen = true;
                if (error.code === DataExplorerExceptionCodes.Error_NotConnectedToOracle) {
                    connOpen = false;
                }
                logger_1.FileStreamLogger.Instance.info(localizedConstants_1.default.invalidObjectMessage);
                resolve([undefined, connOpen]);
            });
        });
    }
}
exports.ExplorerUtilities = ExplorerUtilities;
ExplorerUtilities.resultsUriCount = 0;
ExplorerUtilities.objectUriToResultsWindowUriMap = {};
class TreeViewConstants {
}
exports.TreeViewConstants = TreeViewConstants;
TreeViewConstants.tablesStr = "Tables";
TreeViewConstants.viewsStr = "Views";
TreeViewConstants.proceduresStr = "Procedures";
TreeViewConstants.procedureStr = "Procedure";
TreeViewConstants.functionsStr = "Functions";
TreeViewConstants.packagesStr = "Packages";
TreeViewConstants.packageStr = "Package";
TreeViewConstants.sequencesStr = "Sequences";
TreeViewConstants.sequenceStr = "Sequence";
TreeViewConstants.synonymsStr = "Synonyms";
TreeViewConstants.synonymStr = "Synonym";
TreeViewConstants.functionStr = "Function";
TreeViewConstants.baseUri = "OracleExplorer://";
TreeViewConstants.compilerSettingsUri = TreeViewConstants.baseUri + "CompilerSettings";
TreeViewConstants.formatterSettingsUri = TreeViewConstants.baseUri + "FormatterSettings";
TreeViewConstants.filterSettingsUri = TreeViewConstants.baseUri + "FilterSettings";
TreeViewConstants.explainPlanSettingsUri = TreeViewConstants.baseUri + "ExplainPlanSettings";
TreeViewConstants.configureAIProviderUri = TreeViewConstants.baseUri + "ConfigureAIProvider";
TreeViewConstants.manageAIProfilesUri = TreeViewConstants.baseUri + "ManageAIProfiles";
TreeViewConstants.explorerViewName = "oracleDBObjectExplorer";
TreeViewConstants.relationalTablesStr = "Relational Tables";
TreeViewConstants.relationalTableStr = "Relational Table";
TreeViewConstants.objectTableStr = "Object Table";
TreeViewConstants.xmlTableStr = "XML Table";
TreeViewConstants.objectTablesStr = "Object Tables";
TreeViewConstants.xmlTablesStr = "XML Tables";
TreeViewConstants.relationalViewsStr = "Relational Views";
TreeViewConstants.relationalViewStr = "Relational View";
TreeViewConstants.objectViewsStr = "Object Views";
TreeViewConstants.objectViewStr = "Object View";
TreeViewConstants.xmlViewsStr = "XML Views";
TreeViewConstants.xmlViewStr = "XML View";
TreeViewConstants.materializedViewsStr = "Materialized Views";
TreeViewConstants.materializedViewCaptionStr = "Materialized View";
TreeViewConstants.parameterStr = "Parameter";
TreeViewConstants.packageMethodStr = "PackageMethod";
TreeViewConstants.packageBodyPrivateMethodStr = "PackageBodyPrivateMethod";
TreeViewConstants.packageBodyStr = "PackageBody";
TreeViewConstants.packageBodyCaptionStr = "Package Body";
TreeViewConstants.constraintsStr = "Constraints";
TreeViewConstants.indexesStr = "Indexes";
TreeViewConstants.triggersStr = "Triggers";
TreeViewConstants.columnStr = "Column";
TreeViewConstants.constraintStr = "Constraint";
TreeViewConstants.indexStr = "Index";
TreeViewConstants.triggerStr = "Trigger";
TreeViewConstants.parameterDirectionOUT = "OUT";
TreeViewConstants.connectionStr = "Connection";
TreeViewConstants.tableTriggersStr = "Table Triggers";
TreeViewConstants.viewTriggersStr = "View Triggers";
TreeViewConstants.databaseTriggersStr = "Database Triggers";
TreeViewConstants.schemaTriggersStr = "Schema Triggers";
TreeViewConstants.packageMethodParameterStr = "PackageMethod Parameter";
TreeViewConstants.usersStr = "Other Users";
TreeViewConstants.userStr = "User";
TreeViewConstants.historyGroupStr = "History Group";
TreeViewConstants.historyItemStr = "HistoryItem";
TreeViewConstants.middleBookMarkGroup = "middleBookMarkGroup";
TreeViewConstants.lastBookmarkGroup = "lastBookmarkGroup";
TreeViewConstants.firstBookmarkGroup = "firstBookmarkGroup";
TreeViewConstants.bookmarkGroupOne = "bookmarkGroupOne";
TreeViewConstants.middleBookmarkItem = "middleBookmarkItem";
TreeViewConstants.lastBookmarkItem = "lastBookmarkItem";
TreeViewConstants.firstBookmarkItem = "firstBookmarkItem";
TreeViewConstants.bookmarkItemOne = "bookmarkItemOne";
TreeViewConstants.ociRootNodeItemStr = "ociRootNodeItem";
TreeViewConstants.ociWorkloadItemStr = "ociWorkloadItem";
TreeViewConstants.ociDedicatedDatabaseItemStr = "ociDedicatedDatabaseItem";
TreeViewConstants.ociNonDedicatedDatabaseItemStr = "ociNonDedicatedDatabaseItem";
TreeViewConstants.returnValueCaptionStr = "(Return Value: {0})";
TreeViewConstants.tableStr = "Table";
TreeViewConstants.viewStr = "View";
TreeViewConstants.materializedViewStr = "MaterializedView";
class ExplorerStatusManager {
    static updateStatusBar(connectionNode) {
    }
}
exports.ExplorerStatusManager = ExplorerStatusManager;
ExplorerStatusManager.varConnectionStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
class QueryHistoryUtil {
    static RunHistObject(queryHistNode, scriptExecutor, ownerUri) {
        scriptExecutor.startHistObjectExecution(new queryHistoryRequests_1.RunHistoryObjectParams(queryHistNode.getNodeIdentifier, ownerUri));
    }
}
exports.QueryHistoryUtil = QueryHistoryUtil;
class QueryBookmarkUtil {
    static async BookmarkQuery(params) {
        return new Promise((resolve, reject) => {
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(queryBookmarkRequest_1.QueryBookmarkRequest.type, params).then((response) => {
                resolve(response);
            }, (error) => {
                resolve(undefined);
            });
        });
    }
    static getErrorMessage(error) {
        var msg = "";
        if (error && error.message) {
            msg = error.message;
        }
        return msg;
    }
    static async ConnectFirstSQLInBookmarkQuery(params) {
        logger_1.FileStreamLogger.Instance.info("In ConnectFirstSQLInBookmarkQuery");
        return new Promise((resolve, reject) => {
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(queryBookmarkRequest_1.detectConnectAsStartSQLRequest.type, params).then((response) => {
                resolve(response);
            }, (error) => {
                logger_1.FileStreamLogger.Instance.error(`Error:ConnectFirstSQLInBookmarkQuery() error: ${QueryBookmarkUtil.getErrorMessage(error)}`);
                resolve(undefined);
            });
        });
    }
    static ConstructParams(vscodeConnector) {
        var ownerUri = vscodeConnector.activeTextEditorUri;
        var selection = vscodeConnector.getActiveDocumentSelection();
        return new queryBookmarkRequest_1.BookmarkQueryParams(selection, ownerUri);
    }
    static RunBookmarkItem(bookmarkNode, scriptExecuter, ownerUri, connectFirstSQL) {
        scriptExecuter.startBookmarkObjectExecution(new queryBookmarkRequest_1.RunBookmarkQueryParams(bookmarkNode.query, ownerUri, connectFirstSQL, bookmarkNode.getParentPath, bookmarkNode.getNodeIdentifier));
    }
}
exports.QueryBookmarkUtil = QueryBookmarkUtil;
class DataExplorerExceptionCodes {
}
exports.DataExplorerExceptionCodes = DataExplorerExceptionCodes;
DataExplorerExceptionCodes.Error_NotConnectedToOracle = -1000;
var ConnFilterType;
(function (ConnFilterType) {
    ConnFilterType[ConnFilterType["Filtered"] = 1] = "Filtered";
    ConnFilterType[ConnFilterType["NonFiltered"] = 2] = "NonFiltered";
})(ConnFilterType = exports.ConnFilterType || (exports.ConnFilterType = {}));
