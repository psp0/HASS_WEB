"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeFoldingCancelRequest = exports.CodeFoldingRequest = exports.CodeFoldingResponse = exports.CodeFoldingRequestParams = exports.CodeTokenCancelRequest = exports.CodeTokenRequest = exports.CodeTokenResponse = exports.CodeTokenRequestParam = exports.CodeObjectSymbolsCancelRequest = exports.CodeObjectSymbolsRequest = exports.CodeObjectSymbolsRequestParam = exports.SymbolInformationCancelRequest = exports.SymbolInformationRequest = exports.SymbolInformationResponse = exports.SymbolInformationParam = void 0;
const vscode_jsonrpc_1 = require("vscode-jsonrpc");
const constants_1 = require("../constants/constants");
class SymbolInformationParam {
    constructor(ownerUri) {
        this.ownerUri = ownerUri;
    }
}
exports.SymbolInformationParam = SymbolInformationParam;
class SymbolInformationResponse {
}
exports.SymbolInformationResponse = SymbolInformationResponse;
class SymbolInformationRequest {
}
exports.SymbolInformationRequest = SymbolInformationRequest;
SymbolInformationRequest.type = new vscode_jsonrpc_1.RequestType(constants_1.Constants.symbolInformationRequest);
class SymbolInformationCancelRequest {
}
exports.SymbolInformationCancelRequest = SymbolInformationCancelRequest;
SymbolInformationCancelRequest.type = new vscode_jsonrpc_1.RequestType(constants_1.Constants.symbolInformationCancelRequest);
class CodeObjectSymbolsRequestParam {
}
exports.CodeObjectSymbolsRequestParam = CodeObjectSymbolsRequestParam;
class CodeObjectSymbolsRequest {
}
exports.CodeObjectSymbolsRequest = CodeObjectSymbolsRequest;
CodeObjectSymbolsRequest.type = new vscode_jsonrpc_1.RequestType(constants_1.Constants.codeObjectSymbolInformationRequest);
class CodeObjectSymbolsCancelRequest {
}
exports.CodeObjectSymbolsCancelRequest = CodeObjectSymbolsCancelRequest;
CodeObjectSymbolsCancelRequest.type = new vscode_jsonrpc_1.RequestType(constants_1.Constants.codeObjectSymbolInformationCancelRequest);
class CodeTokenRequestParam {
}
exports.CodeTokenRequestParam = CodeTokenRequestParam;
class CodeTokenResponse {
}
exports.CodeTokenResponse = CodeTokenResponse;
class CodeTokenRequest {
}
exports.CodeTokenRequest = CodeTokenRequest;
CodeTokenRequest.Request = new vscode_jsonrpc_1.RequestType(constants_1.Constants.codeTokenInformationRequest);
class CodeTokenCancelRequest {
}
exports.CodeTokenCancelRequest = CodeTokenCancelRequest;
CodeTokenCancelRequest.Request = new vscode_jsonrpc_1.RequestType(constants_1.Constants.codeTokenInformationCancelRequest);
class CodeFoldingRequestParams {
    constructor(uri) {
        this.documentUri = uri;
    }
}
exports.CodeFoldingRequestParams = CodeFoldingRequestParams;
class CodeFoldingResponse {
}
exports.CodeFoldingResponse = CodeFoldingResponse;
class CodeFoldingRequest {
}
exports.CodeFoldingRequest = CodeFoldingRequest;
CodeFoldingRequest.type = new vscode_jsonrpc_1.RequestType(constants_1.Constants.codeFoldingRequest);
class CodeFoldingCancelRequest {
}
exports.CodeFoldingCancelRequest = CodeFoldingCancelRequest;
CodeFoldingCancelRequest.type = new vscode_jsonrpc_1.RequestType(constants_1.Constants.codeFoldingCancelRequest);
