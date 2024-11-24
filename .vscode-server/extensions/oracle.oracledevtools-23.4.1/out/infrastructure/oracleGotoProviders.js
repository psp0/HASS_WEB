"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleReferenceProvider = exports.TypeLocationProvider = exports.LocationProvider = exports.oracleTypeDefinitionProvider = exports.oracleImplementationProvider = exports.oracleDefinitionProvider = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const oracleSignatureHelpProvider_1 = require("./oracleSignatureHelpProvider");
const helper = require("./../utilities/helper");
const logger = require("./../infrastructure/logger");
const iLanguageTokenHandler_1 = require("./iLanguageTokenHandler");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const constants_1 = require("../constants/constants");
const dataExplorerRequests_1 = require("../explorer/dataExplorerRequests");
const connectionNode_1 = require("../explorer/nodes/connectionNode");
const localizedConstants_1 = require("../constants/localizedConstants");
const codeNavigationRequests_1 = require("../models/codeNavigationRequests");
const oracleLanguageFeaturesHelper_1 = require("./oracleLanguageFeaturesHelper");
const intellisenseModels_1 = require("../models/intellisenseModels");
const settings_1 = require("../utilities/settings");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const fileLogger = logger.FileStreamLogger.Instance;
class oracleDefinitionProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.codeEditorProvider = undefined;
        fileLogger.info("Initializing oracleDefinitionProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.codeEditorProvider = codeEditorProvider;
        fileLogger.info("oracleDefinitionProvider initialized.");
    }
    provideDefinition(document, position, token) {
        return new Promise(async (resolve, reject) => {
            let intelliSenseSettings = settings_1.Settings.Instance.getIntelliSenseSettingsForDoc(document);
            let locationProvider = new LocationProvider(intelliSenseSettings, this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
            await locationProvider.handleLanguageFeatureRequest(document, position, token, intellisenseRequests_1.IntelliSenseProviderType.Definition).
                then(data => {
                if (data)
                    resolve(data);
                else
                    reject();
            }).catch(error => {
                helper.logErroAfterValidating(error);
                reject();
            });
        });
    }
}
exports.oracleDefinitionProvider = oracleDefinitionProvider;
class oracleImplementationProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.codeEditorProvider = undefined;
        fileLogger.info("Initializing oracleImplementationProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.codeEditorProvider = codeEditorProvider;
        fileLogger.info("oracleImplementationProvider initialized.");
    }
    provideImplementation(document, position, token) {
        return new Promise(async (resolve, reject) => {
            let intelliSenseSettings = settings_1.Settings.Instance.getIntelliSenseSettingsForDoc(document);
            let locationProvider = new LocationProvider(intelliSenseSettings, this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
            await locationProvider.handleLanguageFeatureRequest(document, position, token, intellisenseRequests_1.IntelliSenseProviderType.Implementation).
                then(data => {
                if (data)
                    resolve(data);
                else
                    reject();
            }).catch(error => {
                fileLogger.error(error);
                reject();
            });
        });
    }
}
exports.oracleImplementationProvider = oracleImplementationProvider;
class oracleTypeDefinitionProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.codeEditorProvider = undefined;
        fileLogger.info("Initializing oracleTypeDefinitionProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.codeEditorProvider = codeEditorProvider;
        fileLogger.info("oracleTypeDefinitionProvider initialized.");
    }
    provideTypeDefinition(document, position, token) {
        return new Promise(async (resolve, reject) => {
            let intelliSenseSettings = settings_1.Settings.Instance.getIntelliSenseSettingsForDoc(document);
            let locationProvider = new TypeLocationProvider(intelliSenseSettings, this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
            await locationProvider.handleLanguageFeatureRequest(document, position, token, intellisenseRequests_1.IntelliSenseProviderType.TypeDefinition).
                then(data => {
                if (data)
                    resolve(data);
                else
                    reject();
            }).catch(error => {
                fileLogger.error(error);
                reject();
            });
        });
    }
}
exports.oracleTypeDefinitionProvider = oracleTypeDefinitionProvider;
class LocationProvider extends oracleSignatureHelpProvider_1.oracleAutoCompletionDataProvider {
    constructor(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        super(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager);
        this.codeEditorProvider = codeEditorProvider;
    }
    async handleLanguageFeatureRequest(document, position, token, context) {
        return new Promise(async (resolve, reject) => {
            let documentToken = new iLanguageTokenHandler_1.DocumentToken();
            try {
                let isRequestExecuted = false;
                this.locationContext = context;
                documentToken.tokenPosition = new oracleCompletionItemProvider_1.TokenPositionHelper(null, position, document);
                documentToken.cancellationToken = token;
                if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                    let docAndUserID = this.getConnecteduserAndDocID(document);
                    documentToken.documentId = docAndUserID[0];
                    documentToken.connectedSchema = docAndUserID[1];
                    let request = new intellisenseRequests_1.StatementContextRequestParams();
                    request.fileUri = document.uri.toString();
                    request.line = position.line;
                    let currentSelection = vscode.window.activeTextEditor.selection;
                    if (!currentSelection.start.isEqual(currentSelection.end) &&
                        currentSelection.end.isEqual(position))
                        request.column = position.character - 1;
                    else
                        request.column = position.character;
                    request.providerType = this.locationContext;
                    request.intelliSenseSettings = this.intelliSenseSettings;
                    token.onCancellationRequested(async () => {
                        if (!isRequestExecuted) {
                            fileLogger.info("Cancellation request for Goto Location Provider");
                            this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextCancelRequest.type, request);
                            reject();
                        }
                    });
                    fileLogger.info("Sending StatementContextRequest");
                    await this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextRequest.type, request).then(async (response) => {
                        isRequestExecuted = true;
                        if (response == null || !response.isIdentifier) {
                            reject("Token is not an identifier");
                            return;
                        }
                        let location = null;
                        fileLogger.info("Received StatementContextResponse for token");
                        if (response.scopeItems && response.scopeItems.matchFound && response.scopeItems.matchedObjects.length > 0) {
                            if (response.scopeItems.matchedObjects[0].parsedObjectType === oracleLanguageFeaturesHelper_1.ParsedObjectType.CodeBlockItem) {
                                let selection, range;
                                let locations = [];
                                response.scopeItems.matchedObjects.forEach(item => {
                                    selection = item.range;
                                    if (selection.endLine >= document.lineCount)
                                        selection.endLine = document.lineCount - 1;
                                    range = new vscode_1.Range(new vscode_1.Position(selection.startLine, selection.startColumn), new vscode_1.Position(selection.endLine, document.lineAt(selection.endLine).range.end.character));
                                    if (range.contains(position))
                                        locations.push(new vscode_1.Location(document.uri, new vscode_1.Position(selection.startLine, selection.startColumn)));
                                    else
                                        locations.push(new vscode_1.Location(document.uri, range));
                                });
                                if (locations.length > 0)
                                    resolve(locations);
                                else
                                    reject();
                                return;
                            }
                            else {
                                if (response.scopeItems.matchedObjects[0].isExpression) {
                                    reject();
                                    return;
                                }
                                else {
                                }
                            }
                        }
                        if (documentToken.connectedSchema != null && documentToken.connectedSchema.length > 0) {
                            documentToken.tokenInfo = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getTokenCountAndTokenInfo(response.tokenInfo);
                            documentToken.tokenPosition.tokenInfo = documentToken.tokenInfo;
                            documentToken.tokenPosition.scopeItems = response.scopeItems;
                            documentToken.tokenInfo.completionItems = response.tokenInfo.completionItems;
                            switch (documentToken.tokenInfo.count) {
                                case 1:
                                    location = await this.handleOnePartIdentifierResolution(documentToken);
                                    break;
                                case 2:
                                    location = await this.handleTwoPartIdentifierResolution(documentToken);
                                    break;
                                case 3:
                                    location = await this.handleThreePartIdentifierResolution(documentToken);
                                    break;
                            }
                        }
                        if (location !== null) {
                            resolve(location);
                            return;
                        }
                    }, error => {
                        helper.logErroAfterValidating(error);
                        reject(error);
                    });
                }
                reject("Location not found");
            }
            catch (err) {
                oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, err);
                reject(err);
            }
        });
    }
    async handleOnePartIdentifierResolution(documentToken) {
        let completionList = new Array();
        completionList = documentToken.tokenInfo.completionItems;
        if (completionList != null && completionList.length > 0) {
            return await this.getObjectLocation(completionList[0], documentToken);
        }
        if (documentToken.tokenPosition.scopeItems && documentToken.tokenPosition.scopeItems.parentName) {
            if (documentToken.tokenPosition.scopeItems.schemaName) {
                return await this.handleThreePartIdentifierResolution(documentToken);
            }
            else {
                return await this.handleTwoPartIdentifierResolution(documentToken);
            }
        }
        return null;
    }
    async handleTwoPartIdentifierResolution(documentToken) {
        let completionList = null;
        completionList = documentToken.tokenInfo.completionItems;
        if (completionList != null && completionList.length > 0) {
            return await this.getObjectLocation(completionList[0], documentToken);
        }
        return null;
    }
    async handleThreePartIdentifierResolution(documentToken) {
        let completionList = null;
        completionList = documentToken.tokenInfo.completionItems;
        if (completionList != null && completionList.length > 0) {
            return await this.getObjectLocation(completionList[0], documentToken);
        }
        return null;
    }
    async getObjectLocation(item, documentToken) {
        return new Promise(async (resolve, reject) => {
            fileLogger.info("Getting object location");
            try {
                let docConnectionInfo = this.connectionCommandHandler.getSavedConnectionProperties(documentToken.documentId);
                let connectionUniqueName = docConnectionInfo.connectionAttributes.uniqueName;
                let connectionNode = this.dataExplorerManager.getConnectionNodeFromConnectionUniqueName(connectionUniqueName);
                let location = null, getSource = true, saveFile = true;
                let objectUri = null;
                if (docConnectionInfo) {
                    let ddexObjectType;
                    switch (item.objectType) {
                        case intellisenseRequests_1.SchemaObjectType.Table:
                            ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Table;
                            saveFile = false;
                            break;
                        case intellisenseRequests_1.SchemaObjectType.MaterializedView:
                            ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedView;
                            saveFile = false;
                            break;
                        case intellisenseRequests_1.SchemaObjectType.View:
                            ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_View;
                            saveFile = false;
                            break;
                        case intellisenseRequests_1.SchemaObjectType.Function:
                            ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Function;
                            break;
                        case intellisenseRequests_1.SchemaObjectType.StoredProcedure:
                            ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Procedure;
                            break;
                        case intellisenseRequests_1.SchemaObjectType.Package:
                            ddexObjectType = (this.locationContext === intellisenseRequests_1.IntelliSenseProviderType.Definition
                                || this.locationContext === intellisenseRequests_1.IntelliSenseProviderType.References) ?
                                dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package :
                                dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody;
                            break;
                        case intellisenseRequests_1.SchemaObjectType.PackageBody:
                            ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody;
                            break;
                        case intellisenseRequests_1.SchemaObjectType.PackageMember:
                            ddexObjectType = (this.locationContext === intellisenseRequests_1.IntelliSenseProviderType.Definition) ?
                                dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package :
                                dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody;
                            let pkgName = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(item.parentName);
                            objectUri = await this.getSourceUri(connectionNode, pkgName, item.owner, ddexObjectType);
                            if (objectUri) {
                                location = await this.getLocationForPackageMember(item, connectionNode, objectUri, documentToken.tokenPosition.tokenInfo.paramList, ddexObjectType, documentToken.tokenPosition.document.uri.toString(), documentToken.cancellationToken);
                            }
                            if (location == null && ddexObjectType == dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_PackageBody) {
                                ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Package;
                                objectUri = await this.getSourceUri(connectionNode, pkgName, item.owner, ddexObjectType);
                                if (objectUri)
                                    location = await this.getLocationForPackageMember(item, connectionNode, objectUri, documentToken.tokenPosition.tokenInfo.paramList, ddexObjectType, documentToken.tokenPosition.document.uri.toString(), documentToken.cancellationToken);
                            }
                            getSource = false;
                            break;
                        case intellisenseRequests_1.SchemaObjectType.Synonym:
                            ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Synonym;
                            saveFile = false;
                            break;
                        case intellisenseRequests_1.SchemaObjectType.Trigger:
                            ddexObjectType = dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Trigger;
                            saveFile = false;
                            break;
                        default:
                            reject("Not a valid/supported object");
                            return;
                    }
                    if (getSource) {
                        objectUri = await this.getSourceUri(connectionNode, item.name, item.owner, ddexObjectType);
                        if (objectUri)
                            location = new vscode_1.Location(objectUri, new vscode_1.Position(0, 0));
                    }
                    if (location == null && objectUri)
                        location = new vscode_1.Location(objectUri, new vscode_1.Position(0, 0));
                    if (location !== null) {
                        resolve(location);
                        return;
                    }
                }
            }
            catch (error) {
                reject(error);
            }
            reject('Location not found');
        });
    }
    async getSourceUri(connectionNode, objectName, owner, ddexObjectType) {
        let objectUri = null;
        fileLogger.info("LocationProvider.getSourceUri - Getting object uri");
        try {
            if (connectionNode && connectionNode.status !== connectionNode_1.ConnectionStatus.Connected &&
                connectionNode.status !== connectionNode_1.ConnectionStatus.Connecting) {
                fileLogger.info("LocationProvider.getSourceUri - Wait for connection to open");
                await this.dataExplorerManager.onConnectionConnect(connectionNode, true);
            }
            if (connectionNode && connectionNode.status !== connectionNode_1.ConnectionStatus.Connected) {
                fileLogger.info("LocationProvider.getSourceUri - Connection not open");
                return null;
            }
            let dbObjectTye = editorUtils_1.editorUtils.getObjectTypeFromDdexType(ddexObjectType);
            objectUri = editorUtils_1.editorUtils.getEditorUri(constants_1.Constants.oracleScheme, connectionNode, dbObjectTye, owner, objectName, connectionNode.connectionURI, ddexObjectType);
            return objectUri;
        }
        catch (err) {
            fileLogger.info("LocationProvider.getSourceUri - Error");
            fileLogger.error(err);
        }
        return null;
    }
    async getLocationForPackageMember(item, connectionNode, objectUri, tokenParams, objectType, fileUri, token) {
        let requestParams = new codeNavigationRequests_1.CodeObjectSymbolsRequestParam();
        requestParams.connectedSchema = connectionNode.schemaName;
        requestParams.objectName = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(item.parentName);
        requestParams.objectSchema = item.owner;
        requestParams.objectType = objectType;
        requestParams.ownerUri = connectionNode.connectionURI;
        requestParams.fileUri = fileUri;
        let locationList = [];
        let isRequestExecuted = false;
        try {
            token?.onCancellationRequested(async () => {
                if (!isRequestExecuted) {
                    fileLogger.info("Cancellation request for Code object Symbol Provider");
                    this.languageServerClient.sendRequest(codeNavigationRequests_1.CodeObjectSymbolsCancelRequest.type, requestParams);
                }
            });
            let symbolList = await this.languageServerClient.sendRequest(codeNavigationRequests_1.CodeObjectSymbolsRequest.type, requestParams);
            isRequestExecuted = true;
            if (symbolList && symbolList.length > 1) {
                let foundMember = false;
                for (let i = 1; i < symbolList.length; ++i) {
                    switch (symbolList[i].localObjectType) {
                        case intellisenseModels_1.LocalSymbolType.Type:
                        case intellisenseModels_1.LocalSymbolType.Subtype:
                        case intellisenseModels_1.LocalSymbolType.Cursor:
                        case intellisenseModels_1.LocalSymbolType.Constant:
                        case intellisenseModels_1.LocalSymbolType.Variable:
                            if (symbolList[i].objectName === item.name)
                                foundMember = true;
                            break;
                        case intellisenseModels_1.LocalSymbolType.Function:
                            if (tokenParams && tokenParams.length > 0 && tokenParams[0] === constants_1.Constants.methodParamReturnStr) {
                                let paramsOnly = [];
                                for (let i = 1; i < tokenParams.length; ++i)
                                    paramsOnly.push(tokenParams[i]);
                                tokenParams = paramsOnly;
                            }
                        case intellisenseModels_1.LocalSymbolType.Procedure:
                            if (symbolList[i].objectName === item.name &&
                                oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.validateParsedParams(tokenParams, symbolList[i].symbolParams, symbolList[i].localObjectType === intellisenseModels_1.LocalSymbolType.Function, true)) {
                                locationList.push(new vscode_1.Location(objectUri, new vscode_1.Range(new vscode_1.Position(symbolList[i].startLine, 0), new vscode_1.Position(symbolList[i].endLine + 1, 0))));
                            }
                            break;
                    }
                    if (foundMember) {
                        locationList.push(new vscode_1.Location(objectUri, new vscode_1.Range(new vscode_1.Position(symbolList[i].startLine, 0), new vscode_1.Position(symbolList[i].endLine + 1, 0))));
                        break;
                    }
                }
            }
        }
        catch (err) {
            fileLogger.error(err);
        }
        return locationList.length > 0 ? locationList : null;
    }
    async handleReferenceRequest(document, position, token, context) {
        let isRequestExecuted = false;
        return new Promise(async (resolve, reject) => {
            let documentToken = new iLanguageTokenHandler_1.DocumentToken();
            try {
                this.locationContext = context;
                documentToken.tokenPosition = new oracleCompletionItemProvider_1.TokenPositionHelper(null, position, document);
                documentToken.cancellationToken = token;
                if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                    let docAndUserID = this.getConnecteduserAndDocID(document);
                    documentToken.documentId = docAndUserID[0];
                    documentToken.connectedSchema = docAndUserID[1];
                    let request = new intellisenseRequests_1.StatementContextRequestParams();
                    request.fileUri = document.uri.toString();
                    request.line = position.line;
                    let currentSelection = vscode.window.activeTextEditor.selection;
                    if (!currentSelection.start.isEqual(currentSelection.end) &&
                        currentSelection.end.isEqual(position))
                        request.column = position.character - 1;
                    else
                        request.column = position.character;
                    request.providerType = this.locationContext;
                    request.intelliSenseSettings = this.intelliSenseSettings;
                    token.onCancellationRequested(async () => {
                        if (!isRequestExecuted) {
                            fileLogger.info("Cancellation request for Goto Reference Provider");
                            this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextCancelRequest.type, request);
                            reject();
                        }
                    });
                    fileLogger.info("Sending StatementContextRequest");
                    let locationList = [];
                    let completionList = null;
                    await this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextRequest.type, request).then(async (response) => {
                        isRequestExecuted = true;
                        if (response == null) {
                            reject();
                            return;
                        }
                        if (documentToken.connectedSchema != null && documentToken.connectedSchema.length > 0) {
                            documentToken.tokenInfo = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getTokenCountAndTokenInfo(response.tokenInfo);
                            documentToken.tokenPosition.tokenInfo = documentToken.tokenInfo;
                            documentToken.tokenPosition.scopeItems = response.scopeItems;
                            documentToken.tokenInfo.completionItems = response.tokenInfo.completionItems;
                            completionList = documentToken.tokenInfo.completionItems;
                            if (completionList !== null && completionList.length > 0) {
                                if (this.isValidObjectForReference(completionList[0])) {
                                    fileLogger.info("Sending List of References");
                                    locationList = await this.getReferenceDetails(documentToken, document.uri, completionList[0], token);
                                    if (locationList && locationList.length > oracleCompletionItemProvider_1.OracleAutoCompletionUtils.MaximumItemstoDisplay)
                                        locationList = locationList.slice(0, oracleCompletionItemProvider_1.OracleAutoCompletionUtils.MaximumItemstoDisplay);
                                    resolve(locationList);
                                }
                                else if (completionList[0].objectType == intellisenseRequests_1.SchemaObjectType.PackageMethod) {
                                    fileLogger.info("Getting object location");
                                    await this.getObjectLocation(completionList[0], documentToken).then((response) => {
                                        resolve(response);
                                    }).catch((e) => {
                                        oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, e);
                                        reject(e);
                                        return;
                                    });
                                }
                                else {
                                    oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, localizedConstants_1.default.invalidObjectMessage);
                                    reject(localizedConstants_1.default.invalidObjectMessage);
                                    return;
                                }
                            }
                            else {
                                oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, localizedConstants_1.default.objectNotFound);
                                reject(localizedConstants_1.default.objectNotFound);
                                return;
                            }
                        }
                        else {
                            fileLogger.error(localizedConstants_1.default.notConnectedToDatabase);
                            reject(localizedConstants_1.default.notConnectedToDatabase);
                            return;
                        }
                    });
                }
                else {
                    fileLogger.error(localizedConstants_1.default.locationNotFound);
                    reject(localizedConstants_1.default.locationNotFound);
                    return;
                }
            }
            catch (err) {
                oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, err);
                reject(err);
            }
        });
    }
    async getAllLocations(referenceList, documentToken) {
        return new Promise(async (resolve, reject) => {
            let locationList = [];
            await Promise.all(referenceList.map(async (item) => {
                var newItem = new oracleCompletionItemProvider_1.OracleCompletionItem();
                newItem.objectType = item.objectType;
                newItem.name = item.objectName;
                newItem.owner = item.ownerName;
                fileLogger.info("Getting object location");
                try {
                    let loc = await this.getObjectLocation(newItem, documentToken);
                    if (loc instanceof vscode_1.Location == true)
                        locationList.push(loc);
                    else
                        locationList.push(...loc);
                }
                catch (e) {
                    oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, e);
                }
            })).then(() => {
                resolve(locationList);
            }).catch((e) => {
                oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, e);
                reject(e);
            });
        });
    }
    async getReferenceDetails(document, uri, objectDetails, token) {
        return new Promise(async (resolve, reject) => {
            let request = new intellisenseRequests_1.DependencyReferenceRequestParams();
            let params = editorUtils_1.editorUtils.getQueryParameters(uri);
            request.ownerUri = Boolean(uri.query) ? params.connectionUri : uri.toString();
            request.dependencyType = intellisenseRequests_1.Dependencies.ReferencedBy;
            request.objectName = objectDetails.name;
            request.objectType = objectDetails.objectType == intellisenseRequests_1.SchemaObjectType.PublicSynonym ? intellisenseRequests_1.SchemaObjectType.Synonym : objectDetails.objectType;
            request.ownerName = objectDetails.owner;
            request.fileUri = uri.toString();
            let locationList = [];
            document.cancellationToken = token;
            let isRequestExecuted = false;
            token.onCancellationRequested(async () => {
                if (!isRequestExecuted) {
                    fileLogger.info("Cancellation request for Goto Reference Provider");
                    this.languageServerClient.sendRequest(intellisenseRequests_1.DependencyReferenceCancelRequest.Request, request);
                    reject();
                }
            });
            try {
                let referenceList = await this.languageServerClient.sendRequest(intellisenseRequests_1.DependencyReferenceRequest.Request, request);
                isRequestExecuted = true;
                if (referenceList != null && referenceList.length > 0) {
                    let docConnectionInfo = this.connectionCommandHandler.getSavedConnectionProperties(document.documentId);
                    let connectionUniqueName = docConnectionInfo.connectionAttributes.uniqueName;
                    let connectionNode = this.dataExplorerManager.getConnectionNodeFromConnectionUniqueName(connectionUniqueName);
                    if (connectionNode && connectionNode.status !== connectionNode_1.ConnectionStatus.Connected &&
                        connectionNode.status !== connectionNode_1.ConnectionStatus.Connecting) {
                        await this.dataExplorerManager.onConnectionConnect(connectionNode, true).then(async () => {
                            locationList = await this.getAllLocations(referenceList, document);
                            resolve(locationList);
                        }).catch((e) => {
                            reject(e);
                            return;
                        });
                    }
                    else {
                        locationList = await this.getAllLocations(referenceList, document);
                        resolve(locationList);
                    }
                }
                else {
                    resolve(locationList);
                    return;
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    isValidObjectForReference(objectDetails) {
        switch (objectDetails.objectType) {
            case intellisenseRequests_1.SchemaObjectType.Table:
            case intellisenseRequests_1.SchemaObjectType.View:
            case intellisenseRequests_1.SchemaObjectType.Trigger:
            case intellisenseRequests_1.SchemaObjectType.Function:
            case intellisenseRequests_1.SchemaObjectType.StoredProcedure:
            case intellisenseRequests_1.SchemaObjectType.Package:
            case intellisenseRequests_1.SchemaObjectType.PackageBody:
            case intellisenseRequests_1.SchemaObjectType.Synonym:
            case intellisenseRequests_1.SchemaObjectType.PublicSynonym: return true;
            default: return false;
        }
    }
}
exports.LocationProvider = LocationProvider;
class TypeLocationProvider extends LocationProvider {
    constructor(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        super(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider);
    }
    async handleLanguageFeatureRequest(document, position, token, context) {
        return new Promise(async (resolve, reject) => {
            let documentToken = new iLanguageTokenHandler_1.DocumentToken();
            try {
                this.locationContext = context;
                documentToken.tokenPosition = new oracleCompletionItemProvider_1.TokenPositionHelper(null, position, document);
                documentToken.cancellationToken = token;
                let isRequestExecuted = false;
                if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                    let docAndUserID = this.getConnecteduserAndDocID(document);
                    documentToken.documentId = docAndUserID[0];
                    documentToken.connectedSchema = docAndUserID[1];
                    let request = new intellisenseRequests_1.StatementContextRequestParams();
                    request.fileUri = document.uri.toString();
                    request.line = position.line;
                    request.column = position.character;
                    request.providerType = this.locationContext;
                    request.intelliSenseSettings = this.intelliSenseSettings;
                    token.onCancellationRequested(async () => {
                        if (!isRequestExecuted) {
                            fileLogger.info("Cancellation request for Goto Type Location Provider");
                            this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextCancelRequest.type, request);
                            reject();
                        }
                    });
                    fileLogger.info("Sending StatementContextRequest");
                    await this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextRequest.type, request).then(async (response) => {
                        isRequestExecuted = true;
                        if (response == null || !response.isIdentifier) {
                            reject("Token is not an identifier");
                            return;
                        }
                        fileLogger.info("Received StatementContextResponse for token");
                        this.matchedLocations = [];
                        if (response.scopeItems && response.scopeItems.matchFound && response.scopeItems.matchedObjects
                            && response.scopeItems.matchedObjects[0].parsedObjectType === oracleLanguageFeaturesHelper_1.ParsedObjectType.CodeBlockItem) {
                            let selection, range;
                            response.scopeItems.matchedObjects.forEach(item => {
                                selection = item.range;
                                if (selection.endLine >= document.lineCount)
                                    selection.endLine = document.lineCount - 1;
                                range = new vscode_1.Range(new vscode_1.Position(selection.startLine, selection.startColumn), new vscode_1.Position(selection.endLine, document.lineAt(selection.endLine).range.end.character));
                                if (range.contains(position))
                                    this.matchedLocations.push(new vscode_1.Location(document.uri, new vscode_1.Position(selection.startLine, selection.startColumn)));
                                else
                                    this.matchedLocations.push(new vscode_1.Location(document.uri, range));
                            });
                        }
                        let location = null;
                        if (documentToken.connectedSchema != null && documentToken.connectedSchema.length > 0) {
                            documentToken.tokenInfo = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getTokenCountAndTokenInfo(response.tokenInfo);
                            documentToken.tokenPosition.tokenInfo = documentToken.tokenInfo;
                            documentToken.tokenPosition.scopeItems = response.scopeItems;
                            documentToken.tokenInfo.completionItems = response.tokenInfo.completionItems;
                            let completionList = documentToken.tokenInfo.completionItems;
                            if (completionList != null && completionList.length > 0 && completionList[0].objectType === intellisenseRequests_1.SchemaObjectType.PackageMember) {
                                for (let i = 0; i < completionList.length; ++i) {
                                    if (completionList[i].objectType === intellisenseRequests_1.SchemaObjectType.PackageMember) {
                                        location = await this.getObjectLocation(completionList[i], documentToken);
                                        if (location) {
                                            if (typeof location === typeof vscode_1.Location)
                                                this.matchedLocations.push(location);
                                            else
                                                this.matchedLocations.push(...location);
                                        }
                                    }
                                }
                            }
                        }
                        if (this.matchedLocations.length > 0) {
                            if (this.matchedLocations.length === 1)
                                resolve(this.matchedLocations[0]);
                            else
                                resolve(this.matchedLocations);
                            return;
                        }
                    }, error => {
                        helper.logErroAfterValidating(error);
                        reject(error);
                    });
                }
                reject(localizedConstants_1.default.locationNotFound);
            }
            catch (err) {
                oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, err);
                reject(err);
            }
        });
    }
}
exports.TypeLocationProvider = TypeLocationProvider;
class oracleReferenceProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.codeEditorProvider = undefined;
        fileLogger.info("Initializing oracleReferenceProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.codeEditorProvider = codeEditorProvider;
        fileLogger.info("oracleReferenceProvider initialized.");
    }
    async provideReferences(document, position, context, token) {
        return new Promise(async (resolve, reject) => {
            let intelliSenseSettings = settings_1.Settings.Instance.getIntelliSenseSettingsForDoc(document);
            let locationProvider = new LocationProvider(intelliSenseSettings, this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
            try {
                fileLogger.info("Sending reference request");
                var objectList = await locationProvider.handleReferenceRequest(document, position, token, intellisenseRequests_1.IntelliSenseProviderType.References);
                resolve(objectList);
            }
            catch (e) {
                fileLogger.error(e);
                reject(e);
                return;
            }
        });
    }
}
exports.oracleReferenceProvider = oracleReferenceProvider;
