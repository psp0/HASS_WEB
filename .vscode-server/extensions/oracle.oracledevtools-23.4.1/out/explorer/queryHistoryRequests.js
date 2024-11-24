"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryHistoryRunObjectRequest = exports.RunHistoryObjectParams = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
class RunHistoryObjectParams extends scriptExecutionModels_1.ScriptExecutionMessageBase {
    constructor(sqlQuery, ownerUri) {
        super();
        this.sqlQuery = sqlQuery;
        this.ownerUri = ownerUri;
    }
}
exports.RunHistoryObjectParams = RunHistoryObjectParams;
class QueryHistoryRunObjectRequest {
}
exports.QueryHistoryRunObjectRequest = QueryHistoryRunObjectRequest;
QueryHistoryRunObjectRequest.type = new vscode_languageclient_1.RequestType("queryHistoryManager/runHistoryObject");
