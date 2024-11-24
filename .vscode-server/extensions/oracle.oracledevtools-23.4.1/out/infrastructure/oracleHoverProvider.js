"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverDataProvider = exports.oracleHoverProvider = void 0;
const vscode_1 = require("vscode");
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const logger = require("./../infrastructure/logger");
const helper = require("./../utilities/helper");
const oracleSignatureHelpProvider_1 = require("./oracleSignatureHelpProvider");
const localizedConstants_1 = require("../constants/localizedConstants");
const iLanguageTokenHandler_1 = require("./iLanguageTokenHandler");
const constants_1 = require("../constants/constants");
const oracleLanguageFeaturesHelper_1 = require("./oracleLanguageFeaturesHelper");
const intellisenseModels_1 = require("../models/intellisenseModels");
const settings_1 = require("../utilities/settings");
const oracleAutoCompletionHelper_1 = require("./oracleAutoCompletionHelper");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const fileLogger = logger.FileStreamLogger.Instance;
class oracleHoverProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        fileLogger.info("Initializing oracleHoverProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        fileLogger.info("oracleHoverProvider initialized.");
    }
    provideHover(document, position, token) {
        return new Promise(async (resolve, reject) => {
            let intelliSenseSettings = settings_1.Settings.Instance.getIntelliSenseSettingsForDoc(document);
            var hoverDataProvider = new HoverDataProvider(intelliSenseSettings, this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager);
            await hoverDataProvider.handleLanguageFeatureRequest(document, position, token).
                then(data => {
                resolve(data);
            }).catch(() => {
                reject();
            });
        });
    }
}
exports.oracleHoverProvider = oracleHoverProvider;
class HoverDataProvider extends oracleSignatureHelpProvider_1.oracleAutoCompletionDataProvider {
    constructor(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager) {
        super(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager);
    }
    handleLanguageFeatureRequest(document, position, token) {
        return new Promise(async (resolve, reject) => {
            let documentToken = new iLanguageTokenHandler_1.DocumentToken();
            try {
                if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                    let request = new intellisenseRequests_1.StatementContextRequestParams();
                    request.fileUri = document.uri.toString();
                    request.line = position.line;
                    request.column = position.character;
                    request.providerType = intellisenseRequests_1.IntelliSenseProviderType.Hover;
                    request.intelliSenseSettings = this.intelliSenseSettings;
                    token.onCancellationRequested(async () => {
                        fileLogger.info("Cancellation request for Hover Provider");
                        this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextCancelRequest.type, request);
                        reject();
                    });
                    await this.languageServerClient.sendRequest(intellisenseRequests_1.StatementContextRequest.type, request).then(async (response) => {
                        if (response == null || !response.tokenInfo) {
                            reject();
                            return;
                        }
                        documentToken.aliasInfo = response.tokenInfo.aliasInfo;
                        let docAndUserID = this.getConnecteduserAndDocID(document);
                        documentToken.documentId = docAndUserID[0];
                        documentToken.connectedSchema = docAndUserID[1];
                        let results = null;
                        documentToken.tokenInfo = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getTokenCountAndTokenInfo(response.tokenInfo);
                        documentToken.tokenPosition = new oracleCompletionItemProvider_1.TokenPositionHelper(documentToken.tokenInfo, position, document, response.scopeItems);
                        documentToken.tokenInfo.completionItems = response.tokenInfo.completionItems;
                        if (!response.isIdentifier && !response.tokenInfo.parameterToken) {
                            if (documentToken.tokenInfo.count == 1)
                                results = this.checkStaticSQLFunctions(documentToken.tokenInfo.dbFormattedToken1, documentToken.tokenPosition);
                            if (results !== null)
                                resolve(results);
                            else
                                reject();
                            return;
                        }
                        if (response.scopeItems && response.scopeItems.matchFound && response.scopeItems.matchedObjects.length > 0) {
                            if (response.scopeItems.matchedObjects[0].parsedObjectType === oracleLanguageFeaturesHelper_1.ParsedObjectType.CodeBlockItem)
                                results = this.getHoverForLocalItem(response.scopeItems.matchedObjects, response.scopeItems.parentName);
                            else if (response.scopeItems.hoverDataServer && response.scopeItems.hoverDataServer.length > 0) {
                                results = this.getFinalHover(this.addHoverFromServer(response.scopeItems.hoverDataServer));
                            }
                            else if (!documentToken.connectedSchema)
                                results = this.getHoverForAlias(response.scopeItems, documentToken.connectedSchema, documentToken.documentId);
                        }
                        if (results === null && documentToken.tokenInfo.count == 1) {
                            results = this.checkStaticSQLFunctions(documentToken.tokenInfo.dbFormattedToken1, documentToken.tokenPosition);
                        }
                        if (results !== null) {
                            resolve(results);
                            return;
                        }
                        if (documentToken.connectedSchema != null && documentToken.connectedSchema.length > 0) {
                            switch (documentToken.tokenInfo.count) {
                                case 1:
                                    results = await this.handleOnePartIdentifierResolution(documentToken);
                                    break;
                                case 2:
                                    results = await this.handleTwoPartIdentifierResolution(documentToken);
                                    break;
                                case 3:
                                    results = await this.handleThreePartIdentifierResolution(documentToken);
                                    break;
                            }
                        }
                        if (results == null) {
                            if (response.scopeItems.hoverDataServer && response.scopeItems.hoverDataServer.length > 0 && documentToken.tokenInfo.count === 2 && documentToken.aliasInfo)
                                results = this.getFinalHover(this.addHoverFromServer(response.scopeItems.hoverDataServer));
                            (results == null && !documentToken.connectedSchema);
                            results = await this.processAliasInfoForTwoTokens(documentToken);
                        }
                        if (results !== null)
                            resolve(results);
                    }, error => {
                        helper.logErroAfterValidating(error);
                        reject();
                    });
                }
                reject();
            }
            catch (err) {
                helper.logErroAfterValidating(err);
                reject();
            }
        });
    }
    getFinalHover(value) {
        if (value && value.markedDownString)
            return new vscode_1.Hover(value.markedDownString);
        return null;
    }
    addHoverFromServer(hoverData) {
        let hoverString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(hoverData[0].item1);
        for (let i = 1; i < hoverData.length; i++) {
            hoverString.appendNameValueString(hoverData[i].item1, `${hoverData[i].item2}`);
        }
        return hoverString;
    }
    getHoverForLocalItem(matchedObjects, parentName) {
        let localObject = matchedObjects[0];
        let type = `(${localObject.objectTypeStr})`;
        let hoverString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(type);
        let objectName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(localObject.name, this.intelliSenseSettings.objectNameCase);
        try {
            switch (localObject.objectType) {
                case intellisenseModels_1.LocalSymbolType.Procedure:
                case intellisenseModels_1.LocalSymbolType.Function:
                    let methodParamLists = [], pList;
                    let casing = new intellisenseModels_1.CaseSettings(this.intelliSenseSettings.keywordCase, this.intelliSenseSettings.objectNameCase);
                    matchedObjects.forEach(matchedMethod => {
                        pList = oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getOracleParamListFromMethodParams(matchedMethod.methodParams, casing);
                        if (pList)
                            methodParamLists.push(pList);
                    });
                    if (methodParamLists && methodParamLists.length > 0)
                        hoverString = this.addMethodDetailsWithParams(hoverString, objectName, methodParamLists, null, null);
                    else
                        hoverString.appendNameValueString(localizedConstants_1.default.name, `${objectName}()`);
                    break;
                case intellisenseModels_1.LocalSymbolType.Parameter:
                    objectName += ' ' + (localObject.direction ? oracleLanguageFeaturesHelper_1.CasingHelper.setCase(localObject.direction, this.intelliSenseSettings.keywordCase) : '') + ' ' +
                        (localObject.dataType ? oracleLanguageFeaturesHelper_1.CasingHelper.getObjNameStr(localObject.dataType, this.intelliSenseSettings.keywordCase) : '');
                    hoverString.appendNameValueString(localizedConstants_1.default.name, objectName);
                    if (parentName) {
                        hoverString.appendNameValueString(localizedConstants_1.default.methodStr, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(parentName, this.intelliSenseSettings.objectNameCase));
                    }
                    break;
                case intellisenseModels_1.LocalSymbolType.Variable:
                case intellisenseModels_1.LocalSymbolType.Constant:
                    hoverString.appendNameValueString(localizedConstants_1.default.name, objectName);
                    if (localObject.dataType)
                        hoverString.appendNameValueString(localizedConstants_1.default.dataType, oracleLanguageFeaturesHelper_1.CasingHelper.getObjNameStr(localObject.dataType, this.intelliSenseSettings.keywordCase));
                    if (localObject.direction)
                        hoverString.appendNameValueString(localizedConstants_1.default.direction, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(localObject.direction, this.intelliSenseSettings.keywordCase));
                    break;
                default:
                    hoverString.appendNameValueString(localizedConstants_1.default.name, objectName);
                    break;
            }
        }
        catch (err) {
            fileLogger.error(err);
            return null;
        }
        return this.getFinalHover(hoverString);
    }
    getHoverForAlias(scopeItems, connectedSchema, documentId) {
        if (scopeItems.matchedObjects.length > 0) {
            let item = scopeItems.matchedObjects[0];
            let type, parentNameLabel;
            if (item.objectType === intellisenseModels_1.LocalSymbolType.TableAlias) {
                type = item.isExpression ? localizedConstants_1.default.subqueryAlias : localizedConstants_1.default.tableAlias;
                parentNameLabel = item.isExpression ? localizedConstants_1.default.tableExpression : localizedConstants_1.default.tableName;
                let hoverData = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(`${type}`);
                hoverData.appendNameValueString(localizedConstants_1.default.alias, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.alias, this.intelliSenseSettings.objectNameCase));
                hoverData.appendNameValueString(localizedConstants_1.default.name, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.aliasedSymbol, this.intelliSenseSettings.objectNameCase));
                return this.getFinalHover(hoverData);
            }
            else if (item.objectType === intellisenseModels_1.LocalSymbolType.ColumnAlias) {
                type = localizedConstants_1.default.columnAlias;
                parentNameLabel = item.isExpression ? localizedConstants_1.default.columnExpression : localizedConstants_1.default.columnName;
                let hoverData = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(`${type}`);
                hoverData.appendNameValueString(localizedConstants_1.default.alias, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.alias, this.intelliSenseSettings.objectNameCase));
                hoverData.appendNameValueString(localizedConstants_1.default.name, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.aliasedSymbol, this.intelliSenseSettings.objectNameCase));
                return this.getFinalHover(hoverData);
            }
            else
                return null;
        }
        return null;
    }
    getHoverForStaticObject(item) {
        let hoverData;
        let casing = this.intelliSenseSettings.objectNameCase;
        switch (item.parsedObjectType) {
            case oracleLanguageFeaturesHelper_1.ParsedObjectType.Column:
                let column = item;
                hoverData = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(`(${localizedConstants_1.default.column})`);
                hoverData.appendNameValueString(localizedConstants_1.default.name, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(column.name, casing));
                return this.getFinalHover(hoverData);
            case oracleLanguageFeaturesHelper_1.ParsedObjectType.Table:
                let table = item;
                if (table.name) {
                    hoverData = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(`(${localizedConstants_1.default.table})`);
                    hoverData.appendNameValueString(localizedConstants_1.default.name, oracleLanguageFeaturesHelper_1.CasingHelper.setCase(table.name, casing));
                    return this.getFinalHover(hoverData);
                }
                break;
        }
        return null;
    }
    checkStaticSQLFunctions(token, tokenPostion) {
        let completionList = new Array();
        var sqlFunctions = oracleCompletionItemProvider_1.OracleStaticSQLFunction.getStaticSQLFunctionCompletionList(this.intelliSenseSettings.objectNameCase);
        if (sqlFunctions.has(token)) {
            let item = sqlFunctions.get(token);
            item.name = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.name, this.intelliSenseSettings.keywordCase);
            item.objectType = intellisenseRequests_1.SchemaObjectType.StaticSQLFunction;
            completionList.push(item);
        }
        if (completionList.length > 0) {
            return this.getHoverData(completionList[0], tokenPostion, null);
        }
        return null;
    }
    async handleOnePartIdentifierResolution(documentToken) {
        let completionList = documentToken.tokenInfo.completionItems;
        if (completionList && completionList.length > 0)
            return this.getHoverData(completionList[0], documentToken.tokenPosition, documentToken.connectedSchema);
        return null;
    }
    async handleTwoPartIdentifierResolution(documentToken) {
        if (documentToken.tokenPosition.scopeItems.hoverDataServer && documentToken.tokenPosition.scopeItems.hoverDataServer.length > 0) {
            let res = this.getFinalHover(this.addHoverFromServer(documentToken.tokenPosition.scopeItems.hoverDataServer));
            if (res)
                return res;
        }
        let completionList = documentToken.tokenInfo.completionItems;
        if (completionList != null && completionList.length > 0) {
            return this.getHoverData(completionList[0], documentToken.tokenPosition, documentToken.connectedSchema);
        }
        return null;
    }
    async processAliasInfoForTwoTokens(documentToken) {
        if (documentToken.aliasInfo) {
            let aliasedTable = oracleAutoCompletionHelper_1.ProcessOracleStatement.getMatchedAliasObject(documentToken.tokenInfo.dbFormattedToken2, documentToken.aliasInfo.tableAliases);
            if (aliasedTable) {
                if (aliasedTable.dbFormatedName) {
                    documentToken.tokenInfo.dbFormattedToken2 = aliasedTable.dbFormatedName;
                    if (aliasedTable.dbFormatedSchema)
                        documentToken.connectedSchema = aliasedTable.dbFormatedSchema;
                }
                else {
                    documentToken.tokenPosition.scopeItems.tables = documentToken.tokenPosition.scopeItems.tables ?
                        documentToken.tokenPosition.scopeItems.tables.concat(oracleAutoCompletionHelper_1.ProcessOracleStatement.getTableListFromTableExpressionDetail(aliasedTable.tableReferenceExpressionDetail))
                        : oracleAutoCompletionHelper_1.ProcessOracleStatement.getTableListFromTableExpressionDetail(aliasedTable.tableReferenceExpressionDetail);
                    let aliasedItem = oracleAutoCompletionHelper_1.ProcessOracleStatement.getMatchedAliasObject(documentToken.tokenInfo.dbFormattedToken1, aliasedTable.tableReferenceExpressionDetail);
                    if (aliasedItem) {
                        let parsedAlias = new oracleLanguageFeaturesHelper_1.ParsedAlias();
                        parsedAlias.populate(aliasedItem, documentToken.tokenInfo.dbFormattedToken1);
                        documentToken.tokenPosition.scopeItems.matchedObjects = [parsedAlias];
                    }
                    if (documentToken.connectedSchema) {
                        documentToken.tokenInfo.token2 = documentToken.tokenInfo.dbFormattedToken2 = null;
                        return await this.handleOnePartIdentifierResolution(documentToken);
                    }
                }
            }
        }
        return null;
    }
    async handleThreePartIdentifierResolution(documentToken) {
        let completionList = documentToken.tokenInfo.completionItems;
        if (completionList != null && completionList.length > 0) {
            return this.getHoverData(completionList[0], documentToken.tokenPosition, null);
        }
        return null;
    }
    getHoverData(item, tokenPosition, connectedSchema) {
        if (!oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.validateMatchedItem(item.objectType, tokenPosition.scopeItems.matchedObjects[0]))
            return this.getHoverForStaticObject(tokenPosition.scopeItems.matchedObjects[0]);
        if (tokenPosition.tokenInfo.parameterToken)
            return this.getHoverForFormalParameter(item, tokenPosition.tokenInfo.paramList, tokenPosition.tokenInfo.parameterToken, connectedSchema);
        else
            return this.populateHoverData(item, tokenPosition, connectedSchema);
    }
    populateHoverData(item, tokenPosition, connectedSchema) {
        let dataType;
        if (item.detail == undefined)
            item.detail = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.GetSchemaObjectTypeDisplayName(item.objectType);
        dataType = `(${item.detail}) `;
        let hoverData = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(dataType);
        let objectType = item.objectType;
        if (item.objectType == intellisenseRequests_1.SchemaObjectType.Synonym || item.objectType == intellisenseRequests_1.SchemaObjectType.PublicSynonym) {
            let obj = item;
            if (obj.methodArgumentList)
                objectType = intellisenseRequests_1.SchemaObjectType.Function;
            else if (obj.subObjects && obj.subObjects.length > 0) {
                if (obj.subObjects[0].objectType === intellisenseRequests_1.SchemaObjectType.TableColumn) {
                    objectType = intellisenseRequests_1.SchemaObjectType.Table;
                }
                else
                    objectType = intellisenseRequests_1.SchemaObjectType.Package;
            }
        }
        switch (objectType) {
            case intellisenseRequests_1.SchemaObjectType.Schema:
                {
                    let displayName = item.quoteNeeded ? `"${item.name}"` : oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.name, this.intelliSenseSettings.objectNameCase);
                    hoverData.appendNameValueString(localizedConstants_1.default.name, displayName);
                }
                break;
            case intellisenseRequests_1.SchemaObjectType.View:
            case intellisenseRequests_1.SchemaObjectType.Table:
                hoverData.appendNameValueString(localizedConstants_1.default.name, item.name);
                hoverData = this.addTableDetails(hoverData, item, connectedSchema);
                break;
            case intellisenseRequests_1.SchemaObjectType.StoredProcedure:
            case intellisenseRequests_1.SchemaObjectType.Function:
                hoverData = this.addMethodDetails(hoverData, item, tokenPosition.tokenInfo.paramList, connectedSchema);
                break;
            case intellisenseRequests_1.SchemaObjectType.PackageMethod:
            case intellisenseRequests_1.SchemaObjectType.StaticSQLFunction:
                hoverData = this.addMethodDetails(hoverData, item, tokenPosition.tokenInfo.paramList, connectedSchema);
                break;
            case intellisenseRequests_1.SchemaObjectType.TableColumn:
                hoverData.appendNameValueString(localizedConstants_1.default.name, item.name);
                hoverData = this.addColumnDetails(hoverData, item, tokenPosition.scopeItems ? tokenPosition.scopeItems.tables : null, connectedSchema);
                break;
            default:
                hoverData.appendNameValueString(localizedConstants_1.default.name, item.name);
                if (item.objectType == intellisenseRequests_1.SchemaObjectType.ObjectAttribute && item.parentName > 0)
                    hoverData.appendNameValueString(localizedConstants_1.default.sequenceName, item.parentName);
                if (item.owner && item.owner !== connectedSchema)
                    hoverData.appendNameValueString(localizedConstants_1.default.schema, item.owner);
                break;
        }
        return this.getFinalHover(hoverData);
    }
    addMethodDetails(hoverData, item, tokenParamList, connectedSchema) {
        let matchedParamList = this.getMatchedParametersLists(item, tokenParamList);
        if (matchedParamList && matchedParamList.length > 0) {
            return this.addMethodDetailsWithParams(hoverData, item.name, matchedParamList, item.parentName, item.owner, connectedSchema);
        }
        hoverData.appendNameValueString(localizedConstants_1.default.name, `${item.name}()`);
        if (item.parentName)
            hoverData.appendNameValueString(localizedConstants_1.default.packageName, item.parentName);
        if (item.owner && item.owner !== connectedSchema)
            hoverData.appendNameValueString(localizedConstants_1.default.schema, item.owner);
        return hoverData;
    }
    addMethodDetailsWithParams(hoverData, methodName, matchedParamList, parentName, owner, connectedSchema = null) {
        let signature = `${methodName}`;
        if (matchedParamList.length === 1 && matchedParamList[0].parameters) {
            let prefix = (matchedParamList[0].isFunction ?
                matchedParamList[0].parameters.length === 1 : matchedParamList[0].parameters.length === 0) ? ``
                : constants_1.Constants.newLineTab;
            signature += prefix + this.getMethodSignature(matchedParamList[0].parameters, matchedParamList[0].isFunction, this.intelliSenseSettings.keywordCase);
            hoverData.appendNameValueString(localizedConstants_1.default.name, signature);
        }
        else {
            signature += constants_1.Constants.newLineTab +
                `${this.getMethodSignature(matchedParamList[0].parameters, matchedParamList[0].isFunction, this.intelliSenseSettings.keywordCase)}\r\n`;
            for (let i = 1; i < matchedParamList.length; ++i) {
                signature += `\t | ${this.getMethodSignature(matchedParamList[i].parameters, matchedParamList[i].isFunction, this.intelliSenseSettings.keywordCase)}\r\n`;
            }
            hoverData.appendNameValueString(localizedConstants_1.default.name, signature.trimEnd());
        }
        if (parentName)
            hoverData.appendNameValueString(localizedConstants_1.default.packageName, parentName);
        if (owner && oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(owner) !== connectedSchema)
            hoverData.appendNameValueString(localizedConstants_1.default.schema, owner);
        return hoverData;
    }
    getMatchedParametersLists(item, tokenParams) {
        let matchedList = [], unmatchedList = [];
        if (item.methodArgumentList) {
            let sortedList = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.sortListOnParameterCount(item.methodArgumentList);
            if (sortedList.length > 0) {
                let paramList;
                for (let idx = 0; idx < sortedList.length; idx++) {
                    paramList = sortedList[idx][1];
                    let isFunction = paramList && paramList.length > 0 &&
                        (paramList[0].direction?.toUpperCase() === 'RETURN');
                    if (oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.validateParsedParams(tokenParams, paramList, isFunction)) {
                        matchedList.push(new intellisenseModels_1.OracleParameterList(isFunction, paramList));
                    }
                    else
                        unmatchedList.push(new intellisenseModels_1.OracleParameterList(isFunction, paramList));
                }
                if (matchedList.length == 0)
                    matchedList = unmatchedList;
            }
        }
        return matchedList;
    }
    getHoverForFormalParameter(item, tokenParams, parameterToken, connectedSchema) {
        let paramsOfMatchedMethods = this.getMatchedParametersLists(item, tokenParams);
        if (paramsOfMatchedMethods && paramsOfMatchedMethods.length > 0) {
            let matchedParams = new Map(), i;
            paramsOfMatchedMethods.forEach(paramList => {
                for (i = paramList.isFunction ? 1 : 0; i < paramList.parameters.length; ++i) {
                    if (oracleLanguageFeaturesHelper_1.oracleLanguageFeaturesHelper.getDBName(paramList.parameters[i].name) === parameterToken)
                        matchedParams.set(this.getParameterString(paramList.parameters[i]), null);
                }
            });
            if (matchedParams.size > 0) {
                let hoverString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString(localizedConstants_1.default.parameter);
                let iterator = matchedParams.keys();
                let objectName = iterator.next().value;
                if (matchedParams.size > 1)
                    for (i = 1; i < matchedParams.size; ++i) {
                        objectName +=
                            `\n    | ${iterator.next().value}`;
                    }
                hoverString.appendNameValueString(localizedConstants_1.default.name, objectName);
                if (item.name)
                    hoverString.appendNameValueString(localizedConstants_1.default.methodStr, item.name);
                if (item.parentName && item.objectType === intellisenseRequests_1.SchemaObjectType.PackageMethod)
                    hoverString.appendNameValueString(localizedConstants_1.default.packageName, item.parentName);
                if (item.owner)
                    hoverString.appendNameValueString(localizedConstants_1.default.schema, item.owner);
                return this.getFinalHover(hoverString);
            }
        }
        return null;
    }
    getMethodSignature(params, isFunction, keywordCasing) {
        let signature = `(`;
        let pId = isFunction ? 1 : 0;
        if (pId < params.length)
            signature += params[pId].optional === constants_1.Constants.optionalParamTrue ?
                `[${this.getParameterString(params[pId])}]` :
                this.getParameterString(params[pId]);
        for (++pId; pId < params.length; ++pId) {
            signature += params[pId].optional === constants_1.Constants.optionalParamTrue ?
                ` [,${constants_1.Constants.newLineTab}${this.getParameterString(params[pId])}]` :
                `,${constants_1.Constants.newLineTab}${this.getParameterString(params[pId])}`;
        }
        signature += `) `;
        if (isFunction)
            signature += `${oracleLanguageFeaturesHelper_1.CasingHelper.setCase('RETURNS', keywordCasing)} ${params[0].dataType}`;
        return signature;
    }
    getParameterString(param) {
        let paramStr = param.name;
        if (param.direction)
            paramStr += ` ${param.direction}`;
        if (param.dataType)
            paramStr += ` ${param.dataType}`;
        return paramStr.trim();
    }
    addColumnDetails(hoverString, columnItem, tablesInScope, connectedSchema) {
        if (columnItem.columnData && columnItem.columnData.tables) {
            if (tablesInScope && tablesInScope && tablesInScope.length > 0) {
                let tName, sName, tabData, dType;
                for (let i = 0; i < tablesInScope.length; ++i) {
                    if (columnItem.columnData.tables[tablesInScope[i].dbFormatedName]) {
                        tabData = columnItem.columnData.tables[tablesInScope[i].dbFormatedName];
                        if (tablesInScope[i].dbFormatedSchema) {
                            if (tablesInScope[i].dbFormatedSchema !== tabData.owner)
                                return hoverString;
                        }
                        sName = tabData['schema'];
                        dType = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(tabData.dataType, this.intelliSenseSettings.keywordCase) +
                            (tabData.nullable ?
                                " " + oracleLanguageFeaturesHelper_1.CasingHelper.setCase(tabData.nullable, this.intelliSenseSettings.keywordCase) : '');
                        hoverString.appendNameValueString(localizedConstants_1.default.dataType, dType);
                        tName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(tablesInScope[i].name, this.intelliSenseSettings.objectNameCase);
                        hoverString.appendNameValueString(localizedConstants_1.default.table_view, tName);
                        if (sName && sName !== connectedSchema) {
                            sName = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(sName, this.intelliSenseSettings.objectNameCase);
                            hoverString.appendNameValueString(localizedConstants_1.default.schema, sName);
                        }
                        return hoverString;
                    }
                }
                ;
            }
            else {
                return hoverString;
            }
        }
        else {
            if (columnItem.dataType) {
                let dType = columnItem.dataType + (columnItem.nullable ? ' ' + columnItem.nullable : '');
                hoverString.appendNameValueString(localizedConstants_1.default.dataType, dType);
            }
            if (columnItem.parentName)
                hoverString.appendNameValueString(localizedConstants_1.default.table_view, columnItem.parentName);
            if (columnItem.owner && columnItem.owner !== connectedSchema)
                hoverString.appendNameValueString(localizedConstants_1.default.schema, columnItem.owner);
            return hoverString;
        }
        return null;
    }
    addTableDetails(hoverString, tableItem, connectedSchema) {
        if (tableItem.owner && tableItem.owner !== connectedSchema)
            hoverString.appendNameValueString(localizedConstants_1.default.schema, tableItem.owner);
        if (tableItem.subObjects != null && tableItem.subObjects.length > 0) {
            let columnData = '';
            tableItem.subObjects.forEach((column) => {
                columnData += constants_1.Constants.newLineTab + column.name + ' ' + (column.dataType != null && column.dataType != undefined ? column.dataType : '')
                    + (column.nullable ? ' ' + column.nullable : '');
            });
            hoverString.appendNameValueString(localizedConstants_1.default.columns, columnData);
        }
        return hoverString;
    }
}
exports.HoverDataProvider = HoverDataProvider;
