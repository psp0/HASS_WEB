"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAIProfilesRequest = exports.GetAIProfilesResponse = exports.GetAIProfilesRequestParameters = exports.GetLLMConfigObjectListRequest = exports.GetLLMConfigObjectListResponse = exports.GetLLMConfigObjectListRequestParameters = exports.GetLLMConfigCredentialsRequest = exports.GetLLMConfigCredentialsResponse = exports.GetLLMConfigCredentialsRequestParameters = exports.GetLLMConfigSchemasRequest = exports.GetLLMConfigSchemasResponse = exports.GetLLMConfigSchemasRequestParameters = exports.ConfigLLMAccessRequest = exports.ConfigLLMAccessResponse = exports.ConfigLLMAccessRequestParams = exports.CreateAIProfileRequest = exports.CreateAIProfileResponse = exports.CreateAIProfileRequestParams = exports.CreateCredentialRequest = exports.CreateCredentialResponse = exports.CreateCredentialRequestParams = exports.LLMConfigMessageType = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("../constants/constants");
var LLMConfigMessageType;
(function (LLMConfigMessageType) {
    LLMConfigMessageType[LLMConfigMessageType["Success"] = 0] = "Success";
    LLMConfigMessageType[LLMConfigMessageType["Error"] = 1] = "Error";
})(LLMConfigMessageType = exports.LLMConfigMessageType || (exports.LLMConfigMessageType = {}));
class CreateCredentialRequestParams {
}
exports.CreateCredentialRequestParams = CreateCredentialRequestParams;
class CreateCredentialResponse {
}
exports.CreateCredentialResponse = CreateCredentialResponse;
class CreateCredentialRequest {
}
exports.CreateCredentialRequest = CreateCredentialRequest;
CreateCredentialRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dbmsCloudAICreateCredentialRequest);
class CreateAIProfileRequestParams {
}
exports.CreateAIProfileRequestParams = CreateAIProfileRequestParams;
class CreateAIProfileResponse {
}
exports.CreateAIProfileResponse = CreateAIProfileResponse;
class CreateAIProfileRequest {
}
exports.CreateAIProfileRequest = CreateAIProfileRequest;
CreateAIProfileRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dbmsCloudAICreateAIProfileRequest);
class ConfigLLMAccessRequestParams {
}
exports.ConfigLLMAccessRequestParams = ConfigLLMAccessRequestParams;
class ConfigLLMAccessResponse {
}
exports.ConfigLLMAccessResponse = ConfigLLMAccessResponse;
class ConfigLLMAccessRequest {
}
exports.ConfigLLMAccessRequest = ConfigLLMAccessRequest;
ConfigLLMAccessRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dbmsCloudAIConfigLLMAccessRequest);
class GetLLMConfigSchemasRequestParameters {
}
exports.GetLLMConfigSchemasRequestParameters = GetLLMConfigSchemasRequestParameters;
class GetLLMConfigSchemasResponse {
}
exports.GetLLMConfigSchemasResponse = GetLLMConfigSchemasResponse;
class GetLLMConfigSchemasRequest {
}
exports.GetLLMConfigSchemasRequest = GetLLMConfigSchemasRequest;
GetLLMConfigSchemasRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dbmsCloudAIGetLLMConfigUsersRequest);
class GetLLMConfigCredentialsRequestParameters {
}
exports.GetLLMConfigCredentialsRequestParameters = GetLLMConfigCredentialsRequestParameters;
class GetLLMConfigCredentialsResponse {
}
exports.GetLLMConfigCredentialsResponse = GetLLMConfigCredentialsResponse;
class GetLLMConfigCredentialsRequest {
}
exports.GetLLMConfigCredentialsRequest = GetLLMConfigCredentialsRequest;
GetLLMConfigCredentialsRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dbmsCloudAIGetLLMConfigCredentialsRequest);
class GetLLMConfigObjectListRequestParameters {
}
exports.GetLLMConfigObjectListRequestParameters = GetLLMConfigObjectListRequestParameters;
class GetLLMConfigObjectListResponse {
}
exports.GetLLMConfigObjectListResponse = GetLLMConfigObjectListResponse;
class GetLLMConfigObjectListRequest {
}
exports.GetLLMConfigObjectListRequest = GetLLMConfigObjectListRequest;
GetLLMConfigObjectListRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dbmsCloudAIGetObjectListRequest);
class GetAIProfilesRequestParameters {
}
exports.GetAIProfilesRequestParameters = GetAIProfilesRequestParameters;
class GetAIProfilesResponse {
}
exports.GetAIProfilesResponse = GetAIProfilesResponse;
class GetAIProfilesRequest {
}
exports.GetAIProfilesRequest = GetAIProfilesRequest;
GetAIProfilesRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.dbmsCloudAIGetAIProfilesRequest);
