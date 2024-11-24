"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleCodeFoldingProvider = void 0;
const documentConnectionInformation_1 = require("../connectionManagement/documentConnectionInformation");
const codeNavigationRequests_1 = require("../models/codeNavigationRequests");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
class oracleCodeFoldingProvider {
    provideFoldingRanges(document, context, token) {
        return new Promise(async (resolve, reject) => {
            let requestParams = new codeNavigationRequests_1.CodeFoldingRequestParams(document.uri.toString());
            documentConnectionInformation_1.fileLogger.info("Sending code folding request");
            token.onCancellationRequested(async () => {
                documentConnectionInformation_1.fileLogger.info("Cancellation request for Code Folding");
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(codeNavigationRequests_1.CodeFoldingCancelRequest.type, requestParams);
                reject();
            });
            await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(codeNavigationRequests_1.CodeFoldingRequest.type, requestParams)
                .then((result) => {
                if (result && result.foldingRanges && result.foldingRanges.length > 0) {
                    resolve(result.foldingRanges);
                }
                else {
                    resolve([]);
                }
            }, error => {
                documentConnectionInformation_1.fileLogger.error(error);
                reject();
            });
        });
    }
}
exports.oracleCodeFoldingProvider = oracleCodeFoldingProvider;
