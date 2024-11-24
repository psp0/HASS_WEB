"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleCodeLensDataProvider = exports.oracleCodeLensReferenceProvider = void 0;
const localizedConstants_1 = require("../constants/localizedConstants");
const vscode_1 = require("vscode");
const oracleGotoProviders_1 = require("./oracleGotoProviders");
const documentConnectionInformation_1 = require("../connectionManagement/documentConnectionInformation");
const codeNavigationRequests_1 = require("../models/codeNavigationRequests");
const oracleSignatureHelpProvider_1 = require("./oracleSignatureHelpProvider");
const editorUtils_1 = require("../explorer/editors/editorUtils");
const oracleCompletionItemProvider_1 = require("./oracleCompletionItemProvider");
const iLanguageTokenHandler_1 = require("./iLanguageTokenHandler");
const settings_1 = require("../utilities/settings");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
class ReferenceLens extends vscode_1.CodeLens {
    constructor(doc, location, range) {
        super(range);
        this.document = doc;
        this.location = location;
    }
}
class LensToken {
    constructor(range, item) {
        this.range = range;
        this.item = item;
    }
}
class oracleCodeLensReferenceProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        this._onDidChangeCodeLenses = new vscode_1.EventEmitter();
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        this.codeEditorProvider = undefined;
        this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
        documentConnectionInformation_1.fileLogger.info("Codelens: Initializing oracleCodelensProvider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.codeEditorProvider = codeEditorProvider;
        documentConnectionInformation_1.fileLogger.info("Codelens: oracleCodelensProvider initialized.");
    }
    async provideCodeLenses(document, token) {
        let intelliSenseSettings = settings_1.Settings.Instance.getIntelliSenseSettingsForDoc(document);
        var codeLensDataProvider = new oracleCodeLensDataProvider(intelliSenseSettings, this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
        return new Promise(async (resolve, reject) => {
            let codeLens = [];
            let values = editorUtils_1.editorUtils.isExplorerFile(document);
            if (!values.explorerFile) {
                documentConnectionInformation_1.fileLogger.info(localizedConstants_1.default.notExplorerFile);
                resolve(null);
                return;
            }
            try {
                documentConnectionInformation_1.fileLogger.info("Codelens: Sending codelens reference request");
                await codeLensDataProvider.handleTokenRequest(document, token).then(async (response) => {
                    if (response != null && response.length > 0) {
                        Promise.all(response.map(async (symbol) => {
                            try {
                                if (symbol.item.objectType === intellisenseRequests_1.SchemaObjectType.Trigger) {
                                    let lens = new ReferenceLens(document, [], symbol.range);
                                    codeLens.push(lens);
                                }
                                else {
                                    let location = await codeLensDataProvider.handleLocationRequest(document, symbol, token);
                                    let lens = new ReferenceLens(document, location, symbol.range);
                                    codeLens.push(lens);
                                }
                            }
                            catch (e) {
                                documentConnectionInformation_1.fileLogger.error(e);
                            }
                        })).then(() => {
                            documentConnectionInformation_1.fileLogger.info("Codelens: resolving lens");
                            resolve(codeLens);
                        }).catch((e) => {
                            documentConnectionInformation_1.fileLogger.error(e);
                            reject(e);
                            return;
                        });
                    }
                    else {
                        documentConnectionInformation_1.fileLogger.error(localizedConstants_1.default.locationNotFound);
                        reject(localizedConstants_1.default.locationNotFound);
                        return;
                    }
                });
            }
            catch (e) {
                documentConnectionInformation_1.fileLogger.error(e);
                reject(e);
                return;
            }
        });
    }
    resolveCodeLens(codeLens, token) {
        return new Promise(async (resolve, reject) => {
            try {
                let lens = codeLens;
                let length = (lens.location && lens.location.length) ? lens.location.length : 0;
                let title = '';
                if (length > oracleCompletionItemProvider_1.OracleAutoCompletionUtils.MaximumItemstoDisplay) {
                    title = `${oracleCompletionItemProvider_1.OracleAutoCompletionUtils.MaximumItemstoDisplay}+ References`;
                    lens.location = lens.location.slice(0, oracleCompletionItemProvider_1.OracleAutoCompletionUtils.MaximumItemstoDisplay);
                }
                else if (length <= 1)
                    title = `${length} Reference`;
                else
                    title = `${length} References`;
                lens.command = {
                    title: title,
                    tooltip: "References",
                    command: length > 0 ? "editor.action.showReferences" : "",
                    arguments: [lens.document.uri, lens.range.start, lens.location]
                };
                resolve(lens);
            }
            catch (e) {
                documentConnectionInformation_1.fileLogger.error(e);
                reject(e);
                return;
            }
        });
    }
}
exports.oracleCodeLensReferenceProvider = oracleCodeLensReferenceProvider;
class oracleCodeLensDataProvider extends oracleSignatureHelpProvider_1.oracleAutoCompletionDataProvider {
    constructor(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager, codeEditorProvider) {
        super(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager);
        this.codeEditorProvider = undefined;
        this.codeEditorProvider = codeEditorProvider;
    }
    async handleTokenRequest(document, token) {
        return new Promise(async (resolve, reject) => {
            let request = new codeNavigationRequests_1.CodeTokenRequestParam();
            let params = editorUtils_1.editorUtils.getQueryParameters(document.uri);
            if (params) {
                request.ownerUri = Boolean(document.uri.query) ? params.connectionUri : document.uri.toString();
                request.fileUri = document.uri.toString();
                let isRequestExecuted = false;
                try {
                    token.onCancellationRequested(async () => {
                        if (!isRequestExecuted) {
                            documentConnectionInformation_1.fileLogger.info("Cancellation request for Codelens Provider");
                            this.languageServerClient.sendRequest(codeNavigationRequests_1.CodeTokenCancelRequest.Request, request);
                            reject();
                        }
                    });
                    await this.languageServerClient.sendRequest(codeNavigationRequests_1.CodeTokenRequest.Request, request).then((response) => {
                        isRequestExecuted = true;
                        let tokenList = [];
                        if (response != null && response.length > 0) {
                            response.forEach((item) => {
                                if (item) {
                                    let start = new vscode_1.Position(item.line, item.begin);
                                    let end = new vscode_1.Position(item.line, item.end);
                                    let completionItem = new oracleCompletionItemProvider_1.OracleCompletionItem();
                                    completionItem.name = params.objectname;
                                    completionItem.objectType = item.objectType;
                                    completionItem.owner = params.schemaname;
                                    tokenList.push(new LensToken(new vscode_1.Range(start, end), completionItem));
                                }
                            });
                            resolve(tokenList);
                        }
                        else {
                            reject('Not a valid script');
                            return;
                        }
                    });
                }
                catch (e) {
                    documentConnectionInformation_1.fileLogger.error(e);
                    reject('Not a valid object');
                    return;
                }
            }
            else
                reject();
        });
    }
    async handleLocationRequest(document, symbol, token) {
        return new Promise(async (resolve, reject) => {
            let locationProvider = new oracleGotoProviders_1.LocationProvider(this.intelliSenseSettings, this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager, this.codeEditorProvider);
            let locationList = [];
            try {
                if (locationProvider.isValidObjectForReference(symbol.item)) {
                    let docAndUserID = this.getConnecteduserAndDocID(document);
                    let documentToken = new iLanguageTokenHandler_1.DocumentToken();
                    documentToken.tokenPosition = new oracleCompletionItemProvider_1.TokenPositionHelper(null, symbol.range.start, document);
                    documentToken.documentId = docAndUserID[0];
                    documentToken.connectedSchema = docAndUserID[1];
                    locationList = await locationProvider.getReferenceDetails(documentToken, document.uri, symbol.item, token);
                    resolve(locationList);
                }
            }
            catch (e) {
                documentConnectionInformation_1.fileLogger.error(e);
                reject(e);
                return;
            }
        });
    }
}
exports.oracleCodeLensDataProvider = oracleCodeLensDataProvider;
