"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleConnectionProxyRequest = exports.OracleConnectionProxyResponse = exports.OracleConnectionProxyRequestParameters = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const oracleConnectionProxyConstants_1 = require("./oracleConnectionProxyConstants");
class OracleConnectionProxyRequestParameters {
}
exports.OracleConnectionProxyRequestParameters = OracleConnectionProxyRequestParameters;
class OracleConnectionProxyResponse {
}
exports.OracleConnectionProxyResponse = OracleConnectionProxyResponse;
class OracleConnectionProxyRequest {
}
exports.OracleConnectionProxyRequest = OracleConnectionProxyRequest;
OracleConnectionProxyRequest.type = new vscode_languageclient_1.RequestType(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.OracleConnectionProxyRequest);
