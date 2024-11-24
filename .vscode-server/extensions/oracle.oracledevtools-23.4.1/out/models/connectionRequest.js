"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetConnectedUserResponse = exports.GetConnectedUserRequestParameters = exports.GetConnectedUserRequest = exports.AIProfileUpdatedEventStronglyTyped = exports.AIProfileUpdatedEventParameters = exports.TestConnectionResponse = exports.TestConnectionRequestParameters = exports.TestConnectionRequest = exports.intellisenseDisassociatedEventParams = exports.intellisenseDisassociatedEvent = exports.AssociateIntelliSenseResponse = exports.AssociateIntelliSenseRequestParameters = exports.AssociateIntelliSenseRequest = exports.UpdateConnectionFiltersResponse = exports.UpdateConnectionFiltersRequestParameters = exports.UpdateConnectionFiltersRequest = exports.ExitNotificationParameters = exports.ExitNotificationTyped = exports.LoginScriptCompleteEventParams = exports.LoginScriptCompleteEventStronglyTyped = exports.dbConnectDisconnectEventParams = exports.dbConnectDisconnectEventStronglyTyped = exports.GetSchemasRequestResponse = exports.GetSchemasRequestParameters = exports.GetSchemasRequest = exports.GetDataSourcesRequestResponse = exports.GetDataSourcesRequestParameters = exports.GetDataSourcesRequest = exports.DisconnectRequestParameters = exports.DisconnectRequestStronglyTyped = exports.CancelConnectRequestStronglyTyped = exports.CancelConnectRequestParameters = exports.TnsUpdatedEventStronglyTyped = exports.ConnectCompleteEventStronglyTyped = exports.ConnectionBriefInfo = exports.TnsUpdatedEventParameters = exports.ConnectionCompleteRequestParameters = exports.ConnectionPropertiesRepresentation = exports.ConnectionSource = exports.ConnectRequestParameters = exports.ConnectRequestStronglyTyped = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
const constants_1 = require("../constants/constants");
class ConnectRequestStronglyTyped {
}
exports.ConnectRequestStronglyTyped = ConnectRequestStronglyTyped;
ConnectRequestStronglyTyped.type = new vscode_languageclient_1.RequestType(constants_1.Constants.connectToDatabaseRequestName);
class ConnectRequestParameters {
}
exports.ConnectRequestParameters = ConnectRequestParameters;
var ConnectionSource;
(function (ConnectionSource) {
    ConnectionSource[ConnectionSource["Editor"] = 1] = "Editor";
    ConnectionSource[ConnectionSource["Explorer"] = 2] = "Explorer";
    ConnectionSource[ConnectionSource["Bookmarks"] = 3] = "Bookmarks";
    ConnectionSource[ConnectionSource["QueryHistory"] = 4] = "QueryHistory";
    ConnectionSource[ConnectionSource["ConnectionDialog"] = 5] = "ConnectionDialog";
})(ConnectionSource = exports.ConnectionSource || (exports.ConnectionSource = {}));
class ConnectionPropertiesRepresentation {
    constructor() {
        this.attributes = {};
    }
}
exports.ConnectionPropertiesRepresentation = ConnectionPropertiesRepresentation;
class ConnectionCompleteRequestParameters {
}
exports.ConnectionCompleteRequestParameters = ConnectionCompleteRequestParameters;
class TnsUpdatedEventParameters {
}
exports.TnsUpdatedEventParameters = TnsUpdatedEventParameters;
class ConnectionBriefInfo {
}
exports.ConnectionBriefInfo = ConnectionBriefInfo;
class ConnectCompleteEventStronglyTyped {
}
exports.ConnectCompleteEventStronglyTyped = ConnectCompleteEventStronglyTyped;
ConnectCompleteEventStronglyTyped.type = new vscode_languageclient_1.NotificationType(constants_1.Constants.connectToDatabaseComplete);
class TnsUpdatedEventStronglyTyped {
}
exports.TnsUpdatedEventStronglyTyped = TnsUpdatedEventStronglyTyped;
TnsUpdatedEventStronglyTyped.type = new vscode_languageclient_1.NotificationType(constants_1.Constants.tnsUpdatedEventName);
class CancelConnectRequestParameters {
}
exports.CancelConnectRequestParameters = CancelConnectRequestParameters;
class CancelConnectRequestStronglyTyped {
}
exports.CancelConnectRequestStronglyTyped = CancelConnectRequestStronglyTyped;
CancelConnectRequestStronglyTyped.type = new vscode_languageclient_1.RequestType(constants_1.Constants.cancelConnectToDatabase);
class DisconnectRequestStronglyTyped {
}
exports.DisconnectRequestStronglyTyped = DisconnectRequestStronglyTyped;
DisconnectRequestStronglyTyped.type = new vscode_languageclient_1.RequestType(constants_1.Constants.disconnectFromDatabase);
class DisconnectRequestParameters {
}
exports.DisconnectRequestParameters = DisconnectRequestParameters;
class GetDataSourcesRequest {
}
exports.GetDataSourcesRequest = GetDataSourcesRequest;
GetDataSourcesRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.getDataSourcesRequest);
class GetDataSourcesRequestParameters {
}
exports.GetDataSourcesRequestParameters = GetDataSourcesRequestParameters;
class GetDataSourcesRequestResponse {
}
exports.GetDataSourcesRequestResponse = GetDataSourcesRequestResponse;
class GetSchemasRequest {
}
exports.GetSchemasRequest = GetSchemasRequest;
GetSchemasRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.getSchemasRequest);
class GetSchemasRequestParameters {
}
exports.GetSchemasRequestParameters = GetSchemasRequestParameters;
class GetSchemasRequestResponse {
}
exports.GetSchemasRequestResponse = GetSchemasRequestResponse;
class dbConnectDisconnectEventStronglyTyped {
}
exports.dbConnectDisconnectEventStronglyTyped = dbConnectDisconnectEventStronglyTyped;
dbConnectDisconnectEventStronglyTyped.type = new vscode_languageclient_1.NotificationType(constants_1.Constants.dbConnectDisconnectEvent);
class dbConnectDisconnectEventParams {
}
exports.dbConnectDisconnectEventParams = dbConnectDisconnectEventParams;
class LoginScriptCompleteEventStronglyTyped {
}
exports.LoginScriptCompleteEventStronglyTyped = LoginScriptCompleteEventStronglyTyped;
LoginScriptCompleteEventStronglyTyped.type = new vscode_languageclient_1.NotificationType(constants_1.Constants.loginScriptCompleteEvent);
class LoginScriptCompleteEventParams {
}
exports.LoginScriptCompleteEventParams = LoginScriptCompleteEventParams;
class ExitNotificationTyped {
}
exports.ExitNotificationTyped = ExitNotificationTyped;
ExitNotificationTyped.type = new vscode_languageclient_1.NotificationType("exit");
class ExitNotificationParameters {
}
exports.ExitNotificationParameters = ExitNotificationParameters;
class UpdateConnectionFiltersRequest {
}
exports.UpdateConnectionFiltersRequest = UpdateConnectionFiltersRequest;
UpdateConnectionFiltersRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.updateConnectionFiltersRequest);
class UpdateConnectionFiltersRequestParameters {
}
exports.UpdateConnectionFiltersRequestParameters = UpdateConnectionFiltersRequestParameters;
class UpdateConnectionFiltersResponse {
}
exports.UpdateConnectionFiltersResponse = UpdateConnectionFiltersResponse;
class AssociateIntelliSenseRequest {
}
exports.AssociateIntelliSenseRequest = AssociateIntelliSenseRequest;
AssociateIntelliSenseRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.associateIntelliSenseRequest);
class AssociateIntelliSenseRequestParameters {
}
exports.AssociateIntelliSenseRequestParameters = AssociateIntelliSenseRequestParameters;
class AssociateIntelliSenseResponse {
}
exports.AssociateIntelliSenseResponse = AssociateIntelliSenseResponse;
class intellisenseDisassociatedEvent {
}
exports.intellisenseDisassociatedEvent = intellisenseDisassociatedEvent;
intellisenseDisassociatedEvent.type = new vscode_languageclient_1.NotificationType(constants_1.Constants.intelliSenseDisassociatedEvent);
class intellisenseDisassociatedEventParams {
}
exports.intellisenseDisassociatedEventParams = intellisenseDisassociatedEventParams;
class TestConnectionRequest {
}
exports.TestConnectionRequest = TestConnectionRequest;
TestConnectionRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.testConnectionRequest);
class TestConnectionRequestParameters {
}
exports.TestConnectionRequestParameters = TestConnectionRequestParameters;
class TestConnectionResponse {
}
exports.TestConnectionResponse = TestConnectionResponse;
class AIProfileUpdatedEventParameters {
}
exports.AIProfileUpdatedEventParameters = AIProfileUpdatedEventParameters;
class AIProfileUpdatedEventStronglyTyped {
}
exports.AIProfileUpdatedEventStronglyTyped = AIProfileUpdatedEventStronglyTyped;
AIProfileUpdatedEventStronglyTyped.type = new vscode_languageclient_1.NotificationType(constants_1.Constants.aiProfileUpdatedEvent);
class GetConnectedUserRequest {
}
exports.GetConnectedUserRequest = GetConnectedUserRequest;
GetConnectedUserRequest.type = new vscode_languageclient_1.RequestType(constants_1.Constants.getConnectedUserRequest);
class GetConnectedUserRequestParameters {
}
exports.GetConnectedUserRequestParameters = GetConnectedUserRequestParameters;
class GetConnectedUserResponse {
}
exports.GetConnectedUserResponse = GetConnectedUserResponse;
