"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleSignatureHelpProvider = exports.oracleSignatureHelpDataProvider = exports.oracleAutoCompletionDataProvider = void 0;
const vscode = require("vscode");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
const helper = require("./../utilities/helper");
const logger = require("./../infrastructure/logger");
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const iLanguageTokenHandler_1 = require("./iLanguageTokenHandler");
const oracleAutoCompletionHelper_1 = require("./oracleAutoCompletionHelper");
const settings_1 = require("../utilities/settings");
const oracleLanguageFeaturesHelper_1 = require("./oracleLanguageFeaturesHelper");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const fileLogger = logger.FileStreamLogger.Instance;
class oracleAutoCompletionDataProvider {
    constructor(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.oracleIntelliSenseDataMgr = null;
        this.languageServerClient = undefined;
        this.processOracleStatement = null;
        this.intelliSenseSettings = intelliSenseSettings;
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.oracleIntelliSenseDataMgr = oracleCompletionItemProvider_1.oracleDocumentIntelliSenseManager.instance;
        this.languageServerClient = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
    }
    getConnecteduserAndDocID(document) {
        var documentId = null;
        var connectedUser = null;
        var fileURI = null;
        var connectedtoDatabase = null;
        let { explorerFile, runnableFile } = editorUtils_1.editorUtils.isExplorerFile(document);
        if (explorerFile) {
            let params = editorUtils_1.editorUtils.getQueryParameters(document.uri);
            if (params) {
                documentId = params.connectionUri;
                connectedUser = params.schemaname;
            }
            connectedtoDatabase = 'Y';
        }
        else {
            documentId = this.vscodeConnector.activeTextEditorUri;
            var documentConnectionInfo = this.connectionCommandHandler.getSavedConnectionProperties(documentId);
            if (documentConnectionInfo != undefined) {
                connectedUser = documentConnectionInfo.connectionSummary.userID;
                connectedtoDatabase = 'Y';
            }
            else {
                connectedtoDatabase = 'N';
            }
        }
        fileURI = this.vscodeConnector.activeTextEditorUri;
        return [documentId, connectedUser, fileURI, connectedtoDatabase];
    }
}
exports.oracleAutoCompletionDataProvider = oracleAutoCompletionDataProvider;
class oracleSignatureHelpDataProvider extends oracleAutoCompletionDataProvider {
    async handleThreePartIdentifierResolution(documentToken) {
        var signatureHelp = null;
        let completionList = documentToken.tokenInfo.completionItems;
        if (completionList != null && completionList.length > 0) {
            signatureHelp = this.GetVSCodeSignatureList(completionList[0], documentToken.tokenInfo.commaCount, documentToken.context);
        }
        return signatureHelp;
    }
    async handleTwoPartIdentifierResolution(documentToken) {
        let signatureHelp = null;
        let completionList = documentToken.tokenInfo.completionItems;
        if (completionList != null && completionList.length > 0) {
            signatureHelp = this.GetVSCodeSignatureList(completionList[0], documentToken.tokenInfo.commaCount, documentToken.context);
        }
        return signatureHelp;
    }
    async handleOnePartIdentifierResolution(documentToken) {
        var signatureHelp = null;
        let completionList = new Array();
        var sqlFunctions = oracleCompletionItemProvider_1.OracleStaticSQLFunction.getStaticSQLFunctionCompletionList(this.intelliSenseSettings.objectNameCase);
        if (sqlFunctions.has(documentToken.tokenInfo.dbFormattedToken1)) {
            completionList.push(sqlFunctions.get(documentToken.tokenInfo.dbFormattedToken1));
        }
        else {
            completionList = documentToken.tokenInfo.completionItems;
        }
        if (completionList.length > 0) {
            signatureHelp = this.GetVSCodeSignatureList(completionList[0], documentToken.tokenInfo.commaCount, documentToken.context);
            let completionItem = completionList[0];
            if ((signatureHelp == null || signatureHelp.signatures.length == 0) && documentToken.tokenInfo.stmtContext === oracleAutoCompletionHelper_1.StatementContext.values_clause) {
                const sigInfo = new vscode.SignatureInformation('');
                let parameterInformationList = new Array();
                let label = '';
                let item = completionItem;
                if (documentToken.aliasInfo && documentToken.aliasInfo.columnAliases && documentToken.aliasInfo.columnAliases.length > 0) {
                    label = this.GetSignatureOfColumn(parameterInformationList, item?.subObjects, documentToken.aliasInfo.columnAliases);
                }
                else {
                    label = this.GetSignatureOfColumn(parameterInformationList, item?.subObjects);
                }
                sigInfo.label = label;
                sigInfo.parameters = parameterInformationList;
                signatureHelp.signatures.push(sigInfo);
                if (signatureHelp != null && signatureHelp.activeParameter != null) {
                    signatureHelp.activeParameter = documentToken.tokenInfo.commaCount;
                }
                signatureHelp.activeSignature = this.getMethodtoSelect(signatureHelp.signatures, documentToken.context.activeSignatureHelp, documentToken.tokenInfo.commaCount);
            }
        }
        return signatureHelp;
    }
    GetSignatureOfColumn(parameterInformationList, subObject, items = null) {
        let label = "";
        let in_kw = 'TYPE';
        let itemLength = items ? items.length : subObject.length;
        for (let i = 0; i < itemLength; i++) {
            let currentCol = "";
            if (!items) {
                let col = subObject[i];
                if (col) {
                    currentCol = col.name;
                    currentCol = `${currentCol} ${oracleLanguageFeaturesHelper_1.CasingHelper.setCase(in_kw, this.intelliSenseSettings.keywordCase)} ${oracleLanguageFeaturesHelper_1.CasingHelper.setCase(col.dataType, this.intelliSenseSettings.objectNameCase)}`;
                }
            }
            else {
                let col = items[i];
                currentCol = col.alias ? col.dbFormatedAlias : col.parsedObject.dbFormatedName;
                let subObj = subObject != null ? subObject.find(i => (oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(i.name) ? oracleLanguageFeaturesHelper_1.CasingHelper.RemoveQuotes(i.name) : i.name.toUpperCase()) == currentCol) : null;
                if (subObj) {
                    currentCol = subObj ?
                        `${subObj.name} ${oracleLanguageFeaturesHelper_1.CasingHelper.setCase(in_kw, this.intelliSenseSettings.keywordCase)} ${oracleLanguageFeaturesHelper_1.CasingHelper.setCase(subObj.dataType, this.intelliSenseSettings.objectNameCase)}`
                        : currentCol;
                }
                else
                    currentCol = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(currentCol, this.intelliSenseSettings.objectNameCase);
            }
            label += currentCol;
            if (i < itemLength - 1)
                label = label.concat(', ');
            parameterInformationList.push(new vscode.ParameterInformation(currentCol));
        }
        ;
        return label;
    }
    getMethodtoSelect(sortedList, activeSignatureHelp, commaCount) {
        var idx = 0;
        var activeSignature = 0;
        if (activeSignatureHelp == null || activeSignatureHelp == undefined) {
            idx = 0;
        }
        else {
            activeSignature = activeSignatureHelp.activeSignature;
            if (activeSignature > sortedList.length - 1) {
                idx = 0;
            }
            else {
                idx = activeSignature;
            }
        }
        var methodtoSelect = idx;
        var found = false;
        for (; idx < sortedList.length; idx++) {
            if (sortedList[idx].parameters.length - 1 >= commaCount) {
                methodtoSelect = idx;
                found = true;
                break;
            }
        }
        if (!found) {
            if (activeSignature > sortedList.length - 1) {
                methodtoSelect = sortedList.length - 1;
            }
        }
        return methodtoSelect;
    }
    GetVSCodeSignatureList(completionItem, commaCount, context) {
        var signatureHelp = new vscode.SignatureHelp();
        let item = completionItem;
        if (item && item.methodArgumentList != null) {
            var sortedList = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.sortListOnParameterCount(item.methodArgumentList);
            if (sortedList != null) {
                if (sortedList.length > 0)
                    for (var idx = 0; idx < sortedList.length; idx++) {
                        var paramObjectList = sortedList[idx][1];
                        const sigInfo = new vscode.SignatureInformation('');
                        let parameterInformationList = new Array();
                        let { label, isFunction } = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getMethodSignatureLabel(paramObjectList, completionItem.name, parameterInformationList, this.intelliSenseSettings.keywordCase);
                        sigInfo.label = label;
                        sigInfo.parameters = parameterInformationList;
                        signatureHelp.signatures.push(sigInfo);
                    }
                else {
                    const sigInfo = new vscode.SignatureInformation('');
                    let parameterInformationList = new Array();
                    let { label, isFunction } = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getMethodSignatureLabel([], completionItem.name, parameterInformationList, this.intelliSenseSettings.keywordCase);
                    sigInfo.label = label;
                    sigInfo.parameters = parameterInformationList;
                    signatureHelp.signatures.push(sigInfo);
                }
                if (signatureHelp != null && signatureHelp.activeParameter != null) {
                    signatureHelp.activeParameter = commaCount;
                }
                signatureHelp.activeSignature = this.getMethodtoSelect(signatureHelp.signatures, context.activeSignatureHelp, commaCount);
                return signatureHelp;
            }
        }
        return signatureHelp;
    }
    async handleLanguageFeatureRequest(document, position, token, context) {
        return new Promise(async (resolve, reject) => {
            let documentToken = new iLanguageTokenHandler_1.DocumentToken();
            try {
                if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                    var docAndUserID = this.getConnecteduserAndDocID(document);
                    documentToken.documentId = docAndUserID[0];
                    documentToken.connectedSchema = docAndUserID[1];
                    documentToken.context = context;
                    var fileURI = docAndUserID[2];
                    fileLogger.info("Signature Provider: handleLanguageFeatureRequest() processing");
                    const executeQueryRequest = new scriptExecutionModels_1.ScriptExecuteParams();
                    executeQueryRequest.ownerUri = this.vscodeConnector.activeTextEditorUri;
                    executeQueryRequest.selection = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getSelection(position);
                    executeQueryRequest.querySettings = settings_1.Settings.getQueryExecutionSettingsForDoc(document);
                    token.onCancellationRequested(async () => {
                        fileLogger.info("Cancellation request for Signature Provider");
                        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(intellisenseRequests_1.IntelliSenseCancelTokenRequest.type, new intellisenseRequests_1.TokenRequestParameter(0, 0, fileURI, intellisenseRequests_1.TokenSource.MethodParameter, null, false, null));
                        reject();
                    });
                    await this.languageServerClient.sendRequest(intellisenseRequests_1.IntelliSenseTokenRequest.type, new intellisenseRequests_1.TokenRequestParameter(position.line, position.character, fileURI, intellisenseRequests_1.TokenSource.MethodParameter, executeQueryRequest, false, this.intelliSenseSettings)).
                        then(async (result) => {
                        fileLogger.info("Signature Provider: handleLanguageFeatureRequest() processed");
                        documentToken.tokenInfo = oracleCompletionItemProvider_1.OracleAutoCompletionUtils.getTokenCountAndTokenInfo(result);
                        documentToken.tokenInfo.stmtContext = result.stmtContext;
                        documentToken.aliasInfo = result.aliasInfo;
                        documentToken.tokenInfo.completionItems = result.completionItems;
                        var results;
                        switch (documentToken.tokenInfo.count) {
                            case 1:
                                {
                                    results = await this.handleOnePartIdentifierResolution(documentToken);
                                    fileLogger.info("Signature Provider: handleOnePartIdentifierResolution() processed");
                                }
                                break;
                            case 2:
                                {
                                    results = await this.handleTwoPartIdentifierResolution(documentToken);
                                }
                                break;
                            case 3:
                                {
                                    results = await this.handleThreePartIdentifierResolution(documentToken);
                                }
                                break;
                            default:
                                if (documentToken.tokenInfo.tokenTerminator == intellisenseRequests_1.TokenTerminator.EndForSignatureProvider) {
                                    results = null;
                                }
                                else if (documentToken.tokenInfo.tokenTerminator == intellisenseRequests_1.TokenTerminator.NewLine && context != null && context != undefined) {
                                    results = context.activeSignatureHelp;
                                }
                                break;
                        }
                        resolve(results);
                    }, error => {
                        helper.logErroAfterValidating(error);
                        resolve(null);
                    });
                }
            }
            catch (error) {
                oracleCompletionItemProvider_1.OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, error);
                resolve(null);
            }
        });
    }
}
exports.oracleSignatureHelpDataProvider = oracleSignatureHelpDataProvider;
class oracleSignatureHelpProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager) {
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        fileLogger.info("Initializing oracleSignatureHelpProvider ");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
    }
    provideSignatureHelp(document, position, token, context) {
        return new Promise(async (resolve, reject) => {
            let intelliSenseSettings = settings_1.Settings.Instance.getIntelliSenseSettingsForDoc(document);
            var signatureHelp = new oracleSignatureHelpDataProvider(intelliSenseSettings, this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager);
            await signatureHelp.handleLanguageFeatureRequest(document, position, token, context).
                then(data => {
                resolve(data);
            }).catch(error => {
                helper.logErroAfterValidating(error);
                resolve(null);
            });
        });
    }
}
exports.oracleSignatureHelpProvider = oracleSignatureHelpProvider;
