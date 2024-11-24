"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleError = exports.SaveQueryResultResponse = exports.SaveType = exports.SaveExplainPlanRequestResponse = exports.RTSMRequestParameters = exports.SaveExplainPlanRequestParams = exports.SaveQueryResultRequestParams = exports.LogMessage = exports.ODTConfigurationChangedEvent = exports.LogSource = exports.LogLevel = exports.SqlQueryTpe = exports.ScriptExecutionCancelledEventParams = exports.LocalizedResourceRequest = exports.ScriptExecutionResetEventParams = exports.ScriptExecutionDisposeEventParams = exports.ScriptExecutionDataBatchResponse = exports.ScriptExecutionDataBatchRequest = exports.MessageBase = exports.Routes = exports.NestedScriptExecutionFinishedEventParams = exports.NestedScriptExecutionStartedEventParams = exports.LoginScriptExecutionFinishedEventParams = exports.LoginScriptExecutionStartedEventParams = exports.ScriptExecutionFinishedEvent = exports.ScriptExecutionStartedEvent = exports.QueryData = exports.ReceiverReadyEvent = exports.ThemeChangedEvent = exports.GenerateSQLfromNLErrorEventParams = exports.GenerateSQLFromNLEventParams = exports.ScriptExecutionDataFetchedEvent = exports.ScriptExecutionDataEvent = exports.ScriptExecutionBatchedMessageEventParams = exports.ScriptExecutionMessageType = exports.ScriptExecutionMessageEvent = exports.Action = exports.ExplainPlanMode = exports.ExecutionMode = exports.ScriptExecuteResult = exports.ExplainPlanDetail = exports.ScriptExecuteParams = exports.EchoRequest = exports.ColumnInfo = exports.ColumnDataType = exports.CancelScriptExecutionResult = exports.CancelScriptExecutionParams = exports.ScriptExecutionMessageBase = exports.MessageName = exports.OracleEventNames = void 0;
exports.ExecutionStatus = exports.ResourceIdentifier = exports.ScriptExecutionClearEventParams = exports.TestCommandResponse = exports.ValidationRequestResponse = exports.ValidationRequestParams = exports.ConnectionCredStoreType = exports.ConnectionType = exports.ConnectionAuthenticationType = exports.ToolbarOptions = exports.UpdateToolbarEvent = exports.UpdateStatusBarEvent = exports.ResultsWindowProperties = exports.ConnectionProperties = exports.CompilerProperties = exports.BookmarkProperties = exports.UserPreferences = exports.GetUserPreferencesResponse = exports.GetUserPreferencesRequest = exports.GetSchemasResponse = exports.GetSchemasRequest = exports.SaveProfileResponse = exports.SaveProfileType = exports.SaveProfileRequest = exports.GetConfigFileLocationsResponse = exports.GetAllProfileNamesResponse = exports.GetAllProfileNamesRequest = exports.BrowseResponse = exports.BrowseRequest = exports.GetTNSNamesResponse = exports.GetTNSNamesRequest = exports.GetConfigFileLocationsRequest = exports.GetProfileResponse = exports.GetProfileRequest = exports.OutputTarget = exports.QueryType = exports.UIDisplayMode = exports.DataSourceType = exports.Direction = exports.InputVariable = exports.OperationName = exports.UserInputParams = exports.DataFormat = exports.SaveExplainPlanStatus = exports.SaveQueryResultMessageType = exports.ConsumeUserInputResponseMessageType = exports.ConsumeUserInputResponse = exports.SaveQueryResultCancelResponse = exports.SaveQueryResultCancelRequestParams = exports.SaveQueryResultFinishedEventParams = void 0;
exports.FilterMatch = exports.FilterConditions = exports.TriggerStatus = exports.CodeObjectStatus = exports.CodeObjectDebug = exports.FilterProperties = exports.FilterCollectionType = exports.CollectionFilterJson = exports.CollectionFilterInfo = exports.FilterItemJson = exports.FilterItem = exports.SaveFilterSettingsResponse = exports.SaveFilterSettingsRequest = exports.GetFilterSettingsResponse = exports.GetFilterSettingsRequest = exports.ConnectionConfigurationSettings = exports.GetConnectionConfigSettingsResponse = exports.GetConnectionConfigSettingsRequest = exports.BrowseItem = exports.RtsmSettings = exports.QuerySettings = exports.RecentConnection = exports.WorkspaceFolderProfiles = exports.ConfigurationScope = exports.ImportFormatSettingsResponse = exports.ImportFormatSettingsRequest = exports.ExportFormatSettingsResponse = exports.ExportFormatSettingsRequest = exports.ConnectionHelpResponse = exports.ConnectionHelpRequest = exports.FormatPreviewTextResponse = exports.FormatPreviewTextRequest = exports.GetFormatterSettingsResponse = exports.GetFormatterSettingsRequest = exports.SaveFormatterSettingsResponse = exports.SaveFormatterSettingsRequest = exports.DebugSettings = exports.SaveDebuggerSettingsResponse = exports.SaveDebuggerSettingsRequest = exports.GetDebuggerSettingsResponse = exports.GetDebuggerSettingsRequest = exports.CompileConfig = exports.SaveCompilerSettingsResponse = exports.SaveCompilerSettingsRequest = exports.CompilerSettings = exports.GetCompilerSettingsResponse = exports.GetCompilerSettingsRequest = exports.ScriptExecutionAcknowledgeMessageRequestParams = exports.ScriptExecutionAcknowledgeMessageResponse = exports.ToolbarEvent = void 0;
exports.OverflowDataResponse = exports.OverflowDataRequestParams = exports.SortColumn = exports.SortAndFilterResponse = exports.SortAndFilterRequestParams = exports.RerunQueryResponse = exports.RerunQueryRequestParams = exports.ConfigAIGetAIProfilesRequest = exports.ConfigAIGetConnectionsInfoResponse = exports.ConfigAIGetConnectionsInfoRequest = exports.GetConnectedUserResponse = exports.GetConnectedUserRequest = exports.GetAIProfilesResponse = exports.GetAIProfilesRequest = exports.GetTablesViewsResponse = exports.GetTablesViewsRequest = exports.LLMConfigGetCredentialsResponse = exports.LLMConfigGetCredentialsRequest = exports.LLMConfigGetSchemasResponse = exports.LLMConfigGetSchemasRequest = exports.SaveLLMAccessConfigResponse = exports.SaveLLMAccessConfigRequest = exports.ObjectListItem = exports.SaveAiProfileResponse = exports.SaveAiProfileRequest = exports.SaveCredentialResponse = exports.SaveCredentialRequest = exports.SelectAIResponseBase = exports.SelectAIRequestBase = exports.TestConnectionResponse = exports.TestConnectionRequest = exports.clearPageEvent = exports.GetExplainPlanSettingsResponse = exports.GetExplainPlanSettingsRequest = exports.SaveExplainPlanSettingsResponse = exports.SaveExplainPlanSettingsRequest = exports.FilterNumberValue = exports.FilterTriggerStatusValue = exports.FilterStatusValue = exports.FilterDebugValue = exports.FilterStringArrayValue = exports.FilterStringValue = exports.FilterValue = exports.Filter = exports.ConfirmChangeScopeResponse = exports.ConfirmChangeScopeRequestParams = exports.ConnChangePromptResponse = exports.ConnChangePromptRequest = void 0;
class OracleEventNames {
}
exports.OracleEventNames = OracleEventNames;
OracleEventNames.scriptExecutionStarted = "script/executionStarted";
OracleEventNames.scriptExecutionFinished = "script/executionFinished";
OracleEventNames.loginScriptExecutionStarted = "loginScript/executionStarted";
OracleEventNames.loginScriptExecutionFinished = "loginScript/executionFinished";
OracleEventNames.nestedScriptExecutionStarted = "nestedScript/executionStarted";
OracleEventNames.nestedScriptExecutionFinished = "nestedScript/executionFinished";
OracleEventNames.scriptExecutionMessage = "script/executionMessage";
OracleEventNames.scriptExecutionData = "script/executionData";
OracleEventNames.scriptExecutionDataFetched = "script/executionDataFetched";
OracleEventNames.scriptExecutionDispose = "script/executionDispose";
OracleEventNames.scriptExecutionClear = "script/executionClear";
OracleEventNames.scriptExecutionCancelled = "script/executionCancelled";
OracleEventNames.saveQueryResultFinishedEvent = "script/saveQueryResultFinished";
OracleEventNames.scriptSaveQueryResultCancelRequest = "script/saveQueryResultCancel";
OracleEventNames.scriptUserInputRequired = "script/userinputRequired";
OracleEventNames.scriptCodeObjectOutput = "script/codeObjectOutput";
OracleEventNames.scriptExecutionReset = "script/executionReset";
OracleEventNames.scriptExecutionBatchedMessage = "script/executionBatchedMessage";
OracleEventNames.generateSQLFromNLScriptExecutionDataEvent = "generateSQLFromNLScript/scriptExecutionData";
OracleEventNames.generateSQLFromNLErrorEvent = "generateSQLFromNLScript/SQLError";
class MessageName {
}
exports.MessageName = MessageName;
MessageName.themeChanged = "ThemeChanged";
MessageName.receiverReady = "ReceiverReady";
MessageName.getLocaleResources = "GetLocaleResources";
MessageName.getDataBatch = "GetDataBatch";
MessageName.saveCSVData = "SaveCSVData";
MessageName.cancelQuery = "CancelQuery";
MessageName.logData = "LogData";
MessageName.odtConfigChanged = "ODTConfigChanged";
MessageName.saveAllRequest = "SaveAllRequestMessage";
MessageName.saveAllResponse = "SaveAllResponseMessage";
MessageName.saveExplainPlanRequest = "SaveExplainPlanRequest";
MessageName.saveExplainPlanRequestResponse = "SaveExplainPlanRequestResponse";
MessageName.consumeUserInputRequest = "script/consumeUserInputRequest";
MessageName.getConfigCSVOptionsRequest = "resultSet/getConfigCSVOptionsRequest";
MessageName.getConfigCSVOptionsResponse = "resultSet/getConfigCSVOptionsResponse";
MessageName.saveProfileRequest = "connection/saveProfileRequest";
MessageName.saveProfileResponse = "connection/saveProfileResponse";
MessageName.getConfigFileLocationsResponse = "connection/getConfigFileLocationsResponse";
MessageName.getConfigFileLocationsRequest = "connection/getConfigFileLocationsRequest";
MessageName.getProfileResponse = "connection/getProfileResponse";
MessageName.getProfileRequest = "connection/getProfileRequest";
MessageName.getTNSNamesRequest = "connection/getTNSNamesRequest";
MessageName.getTNSNamesResponse = "connection/getTNSNamesResponse";
MessageName.getAllProfileNamesRequest = "connection/getAllProfileNamesRequest";
MessageName.getAllProfileNamesResponse = "connection/getAllProfileNamesResponse";
MessageName.connectionHelpRequest = "connection/helpRequest";
MessageName.connectionHelpResponse = "connection/helpResponse";
MessageName.browseRequest = "util/browseRequest";
MessageName.browseReponse = "util/browseReponse";
MessageName.updateStatusBarEvent = "util/updateStatusBarEvent";
MessageName.updateToolbarEvent = "util/updateToolbarEvent";
MessageName.getSchemasRequest = "connection/getSchemasRequest";
MessageName.getSchemasResponse = "connection/getSchemasResponse";
MessageName.clearRequest = "script/clearRequest";
MessageName.validationRequest = "script/validationRequest";
MessageName.validationResponse = "script/validationResponse";
MessageName.testCommandResponse = "testCommandresponse";
MessageName.getUserPreferencesRequest = "connection/getUserPreferencesRequest";
MessageName.toolbarClearClicked = "toolbar/clearClicked";
MessageName.toolbarCancelClicked = "toolbar/cancelClicked";
MessageName.toolbarUpdateEvent = "toolbar/updateToolbar";
MessageName.toolbarEvent = "toolbarEvent";
MessageName.clearPageEvent = "clearPageEvent";
MessageName.acknowledgeMessageRequest = "script/acknowledgeMessageRequest";
MessageName.acknowledgeMessageResponse = "script/acknowledgeMessageResponse";
MessageName.ociCompartmentRequestMessage = "oci/compartmentRequestMessage";
MessageName.ociCompartmentResponseMessage = "oci/compartmentResponseMessage";
MessageName.ociRegionResponseMessage = "oci/regionResponseMessage";
MessageName.ociRegionRequestMessage = "oci/regionRequestMessage";
MessageName.ociUpdateRegionRequestMessage = "oci/updateRegionRequestMessage";
MessageName.ociUpdateCompartmentAndRegionMessage = "oci/updateOCICompartmentAndRegionMessage";
MessageName.ociUpdateCompartmentAndRegionResponse = "oci/updateOCICompartmentAndRegionResponse";
MessageName.ociUpdateOCITreeExplorerMessage = "oci/updateOCITreeExplorerMessage";
MessageName.ociUpdateAdminstratorPswd = "oci/UpdateAdminstratorPswdMessage";
MessageName.adbChangePswdResponse = "oci/adbChangePswdResponse";
MessageName.adbDownloadWalletFileRequestMessage = "oci/downloadWalletFileRequestMessage";
MessageName.adbDownloadWalletFileResponseMessage = "oci/downloadWalletFileResponseMessage";
MessageName.adbReplaceWalletFileRequestMessage = "oci/replaceWalletFileRequestMessage";
MessageName.initializeCreateNewAutonomousDBPageRequestMessage = "oci/initializeCreateNewAutonomousDBPageRequestMessage";
MessageName.initializeCreateNewAutonomousDBPageResponseMessage = "oci/initializeCreateNewAutonomousDBPageResponseMessage";
MessageName.autonomousContainerDBRequestMessage = "oci/autonomousContainerDBRequestMessage";
MessageName.autonomousContainerDBResponseMessage = "oci/autonomousContainerDBResponseMessage";
MessageName.createNewAutonomousDBResponseMessage = "oci/createNewAutonomousDBResponseMessage";
MessageName.ociCreateNewADWDBRequestMessage = "oci/createNewADWDBRequestMessage";
MessageName.ociCreateNewADWDBResponseMessage = "oci/createNewADWDBResponseMessage";
MessageName.ociCreateNewJSONDBRequestMessage = "oci/createNewJSONDBRequestMessage";
MessageName.ociCreateNewJSONDBResponseMessage = "oci/createNewJSONDBResponseMessage";
MessageName.ociCreateNewATPDBRequestMessage = "oci/createNewATPDBRequestMessage";
MessageName.ociCreateNewATPDBResponseMessage = "oci/createNewATPDBResponseMessage";
MessageName.updateAutonomousDBNameRequestMessage = "oci/updateAutonomousDBNameRequestMessage";
MessageName.ociLaunchChangeadminPswdDialogRequestMessage = "oci/launchChangeadminPasswordDialogRequestMessage";
MessageName.ociLaunchChangeadminPswdDialogResponseMessage = "oci/launchChangeadminPasswordDialogResponseMessage";
MessageName.adbDownloadWalletFilePathRequestMessage = "oci/downloadWalletFilePathRequestMessage";
MessageName.adbDownloadWalletFilePathResponseMessage = "oci/downloadWalletFilePathResponseMessage";
MessageName.usedADBNamesUpdatedMessage = "oci/usedADBNamesUpdatedMessage";
MessageName.getCompilerSettingsRequest = "getCompilerSettingsRequest";
MessageName.getCompilerSettingsResponse = "getCompilerSettingsResponse";
MessageName.saveCompilerSettingsRequest = "saveCompilerSettingsRequest";
MessageName.saveCompilerSettingsResponse = "saveCompilerSettingsResponse";
MessageName.getDebuggerSettingsRequest = "getDebuggerSettingsRequest";
MessageName.getDebuggerSettingsResponse = "getDebuggerSettingsResponse";
MessageName.saveDebuggerSettingsRequest = "saveDebuggerSettingsRequest";
MessageName.saveDebuggerSettingsResponse = "saveDebuggerSettingsResponse";
MessageName.getFormatterSettingsRequest = "getFormatterSettingsRequest";
MessageName.getFormatterSettingsResponse = "getFormatterSettingsResponse";
MessageName.saveFormatterSettingsRequest = "saveFormatterSettingsRequest";
MessageName.saveFormatterSettingsResponse = "saveFormatterSettingsResponse";
MessageName.formatPreviewTextRequest = "formatPreviewTextRequest";
MessageName.formatPreviewTextResponse = "formatPreviewtTextResponse";
MessageName.importFormatSettingsRequest = "importFormatSettingsRequest";
MessageName.exportFormatSettingsRequest = "exportFormatSettingsRequest";
MessageName.importFormatSettingsResponse = "importFormatSettingsResponse";
MessageName.exportFormatSettingsResponse = "exportFormatSettingsResponse";
MessageName.saveExplainPlanSettingsRequest = "saveExplainPlanSettingsRequest";
MessageName.saveExplainPlanSettingsResponse = "saveExplainPlanSettingsResponse";
MessageName.getExplainPlanSettingsRequest = "getExplainPlanSettingsRequest";
MessageName.getExplainPlanSettingsResponse = "getExplainPlanSettingsResponse";
MessageName.ociGetConnectionstringsResponseMessage = "oci/GetConnectionstringsResponseMessage";
MessageName.ociGetConnectionstringsRequestMessage = "oci/GetConnectionstringsRequestMessage";
MessageName.ociGetPublicIPAddressRequesttMessage = "oci/GetPublicIPAddressRequesttMessage";
MessageName.ociGetPublicIPAddressResponseMessage = "oci/GetPublicIPAddressResponseMessage";
MessageName.ociUpdateNetworkAccessTypeRequetMessage = "oci/ociUpdateNetworkAccessTypeRequestMessage";
MessageName.ociUpdateNetworkAccessTypeResponseMessage = "oci/ociUpdateNetworkAccessTypeResponseMessage";
MessageName.initializeNetworkAccessTypeRequestMessage = "oci/initializeNetworkAccessTypeRequestMessage";
MessageName.initializeNetworkAccessTypeResponseMessage = "oci/initializeNetworkAccessTypeResponseMessage";
MessageName.ociVCNListRequestMessage = "oci/VCNListRequestMessage";
MessageName.ociVCNListResponseMessage = "oci/VCNListResponseMessage";
MessageName.ociEditMutualAuthenticationRequestMessage = "oci/EditMutualAuthenticationRequestMessage";
MessageName.ociEditMutualAuthenticationResponseMessage = "oci/EditMutualAuthenticationResponseMessage";
MessageName.initializeMutualAuthenticationTypeRequestMessage = "oci/initializeMutualAuthenticationTypeRequestMessage";
MessageName.initializeMutualAuthenticationTypeResponseMessage = "oci/initializeMutualAuthenticationTypeResponseMessage";
MessageName.getConnectionConfigSettingsRequest = "connection/GetConfigurationRequest";
MessageName.getConnectionConfigSettingsResponse = "connection/GetConfigurationResponse";
MessageName.getFilterSettingsRequest = "getFilterSettingsRequest";
MessageName.getFilterSettingsResponse = "getFilterSettingsResponse";
MessageName.saveFilterSettingsRequest = "saveFilterSettingsRequest";
MessageName.saveFilterSettingsResponse = "saveFilterSettingsResponse";
MessageName.filterConnChangePromptRequest = "fitlerConnChangePromptRequest";
MessageName.filterConnChangePromptResponse = "filterConnChangePromptResponse";
MessageName.confirmChangeScopeRequest = "confirmChangeScopeRequest";
MessageName.confirmChangeScopeResponse = "confirmChangeScopeResponse";
MessageName.saveCredentialRequest = "saveCredentialRequest";
MessageName.saveCredentialResponse = "saveCredentialResponse";
MessageName.saveAiProfileRequest = "saveAiProfileRequest";
MessageName.saveAiProfileResponse = "saveAiProfileResponse";
MessageName.saveLLMAccessConfigRequest = "saveLLMAccessConfigRequest";
MessageName.saveLLMAccessConfigResponse = "saveLLMAccessConfigResponse";
MessageName.llmConfigGetSchemasRequest = "llmConfigGetSchemasRequest";
MessageName.llmConfigGetSchemasResponse = "llmConfigGetSchemasResponse";
MessageName.llmConfigGetCredentialsRequest = "llmConfigGetCredentialsRequest";
MessageName.llmConfigGetCredentialsResponse = "llmConfigGetCredentialsResponse";
MessageName.getTablesViewsRequest = "getTablesViewsRequest";
MessageName.getTablesViewsResponse = "getTablesViewsResponse";
MessageName.getAIProfilesRequest = "getAIProfilesRequest";
MessageName.getAIProfilesResponse = "getAIProfilesResponse";
MessageName.getConnectedUserRequest = "getConnectedUserRequest";
MessageName.getConnectedUserResponse = "getConnectedUserResponse";
MessageName.configAIGetConnectionsInfoRequest = "configAIGetConnectionsInfoRequest";
MessageName.configAIGetConnectionsInfoResponse = "configAIGetConnectionsInfoResponse";
MessageName.configAIGetAIProfilesRequest = "configAIGetAIProfilesRequest";
MessageName.rtsmActionRequest = "rtsm/ActionRequest";
MessageName.testConnectionRequest = "connection/testConnectionRequest";
MessageName.testConnectionResponse = "connection/testConnectionResponse";
MessageName.rerunQueryRequest = "RerunQueryRequest";
MessageName.sortAndFilterRequest = "SortAndFilterRequest";
MessageName.sortAndFilterResponse = "SortAndFilterResponse";
MessageName.overflowDataRequest = "GetOverflowDataRequest";
MessageName.overflowDataResponse = "GetOverflowDataResponse";
class ScriptExecutionMessageBase {
    constructor() {
        this.executionId = null;
        this.messageId = null;
        this.windowUri = null;
        this.requestId = null;
    }
    static displayString(item) {
        try {
            return item.displayString();
        }
        catch (_) {
            return ScriptExecutionMessageBase.displayStringInternal(item);
        }
    }
    static displayStringInternal(item) {
        let s = `Uri = ${item.ownerUri};`;
        if (item.executionId)
            s += `ExecutionId = ${item.executionId};`;
        if (item.windowUri)
            s += `WindowUri = ${item.windowUri};`;
        if (item.messageId)
            s += `MessageId = ${item.messageId};`;
        return s;
    }
    displayString() {
        let s = `Uri = ${this.ownerUri};`;
        if (this.executionId)
            s += `ExecutionId = ${this.executionId};`;
        if (this.windowUri)
            s += `WindowUri = ${this.windowUri};`;
        if (this.messageId)
            s += `MessageId = ${this.messageId};`;
        return s;
    }
}
exports.ScriptExecutionMessageBase = ScriptExecutionMessageBase;
class CancelScriptExecutionParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.CancelScriptExecutionParams = CancelScriptExecutionParams;
class CancelScriptExecutionResult {
}
exports.CancelScriptExecutionResult = CancelScriptExecutionResult;
var ColumnDataType;
(function (ColumnDataType) {
    ColumnDataType[ColumnDataType["Empty"] = 0] = "Empty";
    ColumnDataType[ColumnDataType["String"] = 1] = "String";
    ColumnDataType[ColumnDataType["Date"] = 2] = "Date";
    ColumnDataType[ColumnDataType["Object"] = 3] = "Object";
    ColumnDataType[ColumnDataType["Number"] = 4] = "Number";
})(ColumnDataType = exports.ColumnDataType || (exports.ColumnDataType = {}));
class ColumnInfo {
    constructor(ordinal, name, dataType) {
        this.ordinal = ordinal;
        this.name = name;
        this.dataType = dataType;
        this.templateField = "cellTemplate";
        this.headerTemplateField = "headerTemplate";
        this.columnNameInternalField = `${this.name}:${this.ordinal}`;
        this.headerText = name;
    }
    get readOnly() {
        if (this.className && this.className.search("oj-read-only") > -1) {
            return true;
        }
        else {
            return false;
        }
    }
    set readOnly(v) {
        if (v) {
            this.className = "oj-read-only";
        }
        else {
            this.className = "";
        }
    }
    get className() {
        return this.classNameField;
    }
    set className(v) {
        this.classNameField = v;
    }
    get columnNameInternal() {
        return this.columnNameInternalField;
    }
    set columnNameInternal(v) {
        this.columnNameInternalField = v;
    }
    get headerText() {
        return this.headerTextField;
    }
    set headerText(val) {
        this.headerTextField = val;
    }
    get template() {
        return this.templateField;
    }
    set template(v) {
        this.templateField = v;
    }
    get headerTemplate() {
        return this.headerTemplateField;
    }
    set headerTemplate(v) {
        this.headerTemplateField = v;
    }
    get field() {
        return this.columnNameInternalField;
    }
}
exports.ColumnInfo = ColumnInfo;
ColumnInfo.selectedColumnName = "select";
ColumnInfo.rowNumColumnName = "RowNum";
class EchoRequest {
}
exports.EchoRequest = EchoRequest;
class ScriptExecuteParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
        this.isRtsmRequest = false;
        this.generateAction = Action.None;
        this.explainMode = ExplainPlanMode.None;
        this.scriptFileName = null;
    }
    displayString() {
        return `Uri = ${this.ownerUri};ExecutionId= ${this.executionId};ExecutionMode = ${this.executionMode};`;
    }
}
exports.ScriptExecuteParams = ScriptExecuteParams;
class ExplainPlanDetail {
    constructor(explainMode) {
        this.explainMode = explainMode;
    }
}
exports.ExplainPlanDetail = ExplainPlanDetail;
class ScriptExecuteResult {
}
exports.ScriptExecuteResult = ScriptExecuteResult;
var ExecutionMode;
(function (ExecutionMode) {
    ExecutionMode[ExecutionMode["None"] = 0] = "None";
    ExecutionMode[ExecutionMode["File"] = 1] = "File";
    ExecutionMode[ExecutionMode["Selection"] = 2] = "Selection";
})(ExecutionMode = exports.ExecutionMode || (exports.ExecutionMode = {}));
var ExplainPlanMode;
(function (ExplainPlanMode) {
    ExplainPlanMode[ExplainPlanMode["None"] = 0] = "None";
    ExplainPlanMode[ExplainPlanMode["ExplainPlanGrid"] = 1] = "ExplainPlanGrid";
    ExplainPlanMode[ExplainPlanMode["DBMSExplainPlanText"] = 2] = "DBMSExplainPlanText";
    ExplainPlanMode[ExplainPlanMode["ExecutionPlanGrid"] = 3] = "ExecutionPlanGrid";
    ExplainPlanMode[ExplainPlanMode["DBMSExecutionPlanText"] = 4] = "DBMSExecutionPlanText";
})(ExplainPlanMode = exports.ExplainPlanMode || (exports.ExplainPlanMode = {}));
var Action;
(function (Action) {
    Action[Action["None"] = 0] = "None";
    Action[Action["ShowSQL"] = 1] = "ShowSQL";
    Action[Action["Narrate"] = 2] = "Narrate";
    Action[Action["Chat"] = 3] = "Chat";
})(Action = exports.Action || (exports.Action = {}));
class ScriptExecutionMessageEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    displayString() {
        return `Uri = ${this.ownerUri};QueryId = ${this.queryId};MessageType= ${this.messageType};MessageId=${this.messageId};`;
    }
}
exports.ScriptExecutionMessageEvent = ScriptExecutionMessageEvent;
var ScriptExecutionMessageType;
(function (ScriptExecutionMessageType) {
    ScriptExecutionMessageType[ScriptExecutionMessageType["Message"] = 0] = "Message";
    ScriptExecutionMessageType[ScriptExecutionMessageType["Error"] = 1] = "Error";
    ScriptExecutionMessageType[ScriptExecutionMessageType["Warning"] = 2] = "Warning";
    ScriptExecutionMessageType[ScriptExecutionMessageType["Cancel"] = 3] = "Cancel";
})(ScriptExecutionMessageType = exports.ScriptExecutionMessageType || (exports.ScriptExecutionMessageType = {}));
class ScriptExecutionBatchedMessageEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    displayString() {
        const count = this.messageList ? this.messageList.length : "";
        return `Uri = ${this.ownerUri};QueryId = ${this.executionId};MessageType=BatchOf${count};MessageId=${this.messageId};`;
    }
}
exports.ScriptExecutionBatchedMessageEventParams = ScriptExecutionBatchedMessageEventParams;
class ScriptExecutionDataEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
        this.columnsToDisplayinGrid = new Array();
    }
    displayString() {
        return `Uri = ${this.ownerUri};QueryId = ${this.queryId};QueryResultId = ${this.queryResultId};`;
    }
}
exports.ScriptExecutionDataEvent = ScriptExecutionDataEvent;
class ScriptExecutionDataFetchedEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    displayString() {
        return `QueryId = ${this.queryId}; QueryResultId = ${this.queryResultId}`;
    }
}
exports.ScriptExecutionDataFetchedEvent = ScriptExecutionDataFetchedEvent;
class GenerateSQLFromNLEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    displayString() {
        return `QueryId = ${this.queryId}; QueryResultId = ${this.queryResultId}`;
    }
}
exports.GenerateSQLFromNLEventParams = GenerateSQLFromNLEventParams;
class GenerateSQLfromNLErrorEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GenerateSQLfromNLErrorEventParams = GenerateSQLfromNLErrorEventParams;
class ThemeChangedEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    displayString() {
        return `Uri = ${this.ownerUri};ThemeName = ${this.themeName};`;
    }
}
exports.ThemeChangedEvent = ThemeChangedEvent;
class ReceiverReadyEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ReceiverReadyEvent = ReceiverReadyEvent;
class QueryData {
    static displayString(self) {
        return `QueryId= ${self.queryId};HasMoreRows= ${self.hasMoreRows};BatchId = ${self.batchId};`;
    }
}
exports.QueryData = QueryData;
class ScriptExecutionStartedEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
        this.generateAction = Action.None;
    }
}
exports.ScriptExecutionStartedEvent = ScriptExecutionStartedEvent;
class ScriptExecutionFinishedEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
        this.generateAction = Action.None;
    }
    displayString() {
        return `Uri = ${this.ownerUri};ExecutionSummary = ${this.executionSummary};`;
    }
}
exports.ScriptExecutionFinishedEvent = ScriptExecutionFinishedEvent;
class LoginScriptExecutionStartedEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.LoginScriptExecutionStartedEventParams = LoginScriptExecutionStartedEventParams;
class LoginScriptExecutionFinishedEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.LoginScriptExecutionFinishedEventParams = LoginScriptExecutionFinishedEventParams;
class NestedScriptExecutionStartedEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.NestedScriptExecutionStartedEventParams = NestedScriptExecutionStartedEventParams;
class NestedScriptExecutionFinishedEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.NestedScriptExecutionFinishedEventParams = NestedScriptExecutionFinishedEventParams;
class Routes {
}
exports.Routes = Routes;
Routes.root = "/";
class MessageBase {
}
exports.MessageBase = MessageBase;
class ScriptExecutionDataBatchRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    displayString() {
        return `Uri = ${this.ownerUri};QueryId = ${this.queryId};QueryResultId = ${this.queryResultId};
      BatchId = ${this.batchId};ExecutionId = ${this.executionId};`;
    }
}
exports.ScriptExecutionDataBatchRequest = ScriptExecutionDataBatchRequest;
class ScriptExecutionDataBatchResponse {
}
exports.ScriptExecutionDataBatchResponse = ScriptExecutionDataBatchResponse;
class ScriptExecutionDisposeEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ScriptExecutionDisposeEventParams = ScriptExecutionDisposeEventParams;
class ScriptExecutionResetEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ScriptExecutionResetEventParams = ScriptExecutionResetEventParams;
class LocalizedResourceRequest {
}
exports.LocalizedResourceRequest = LocalizedResourceRequest;
class ScriptExecutionCancelledEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ScriptExecutionCancelledEventParams = ScriptExecutionCancelledEventParams;
var SqlQueryTpe;
(function (SqlQueryTpe) {
    SqlQueryTpe[SqlQueryTpe["None"] = 1] = "None";
    SqlQueryTpe[SqlQueryTpe["SqlQuery"] = 2] = "SqlQuery";
    SqlQueryTpe[SqlQueryTpe["Describe"] = 3] = "Describe";
})(SqlQueryTpe = exports.SqlQueryTpe || (exports.SqlQueryTpe = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["None"] = 0] = "None";
    LogLevel[LogLevel["Trace"] = 1] = "Trace";
    LogLevel[LogLevel["Information"] = 2] = "Information";
    LogLevel[LogLevel["Warning"] = 3] = "Warning";
    LogLevel[LogLevel["Error"] = 4] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var LogSource;
(function (LogSource) {
    LogSource[LogSource["None"] = 0] = "None";
    LogSource[LogSource["Extension"] = 1] = "Extension";
    LogSource[LogSource["ResultWindow"] = 2] = "ResultWindow";
})(LogSource = exports.LogSource || (exports.LogSource = {}));
class ODTConfigurationChangedEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    displayString() {
        return `Uri = ${this.ownerUri};Configuration Changed ! ${this.logLevel}  ${this.loggingEnabled};`;
    }
}
exports.ODTConfigurationChangedEvent = ODTConfigurationChangedEvent;
class LogMessage {
    constructor() {
        this.source = LogSource.ResultWindow;
    }
}
exports.LogMessage = LogMessage;
class SaveQueryResultRequestParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveQueryResultRequestParams = SaveQueryResultRequestParams;
class SaveExplainPlanRequestParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveExplainPlanRequestParams = SaveExplainPlanRequestParams;
class RTSMRequestParameters {
}
exports.RTSMRequestParameters = RTSMRequestParameters;
class SaveExplainPlanRequestResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
        this.status = SaveExplainPlanStatus.Success;
    }
}
exports.SaveExplainPlanRequestResponse = SaveExplainPlanRequestResponse;
var SaveType;
(function (SaveType) {
    SaveType[SaveType["None"] = 0] = "None";
    SaveType[SaveType["All"] = 1] = "All";
    SaveType[SaveType["Range"] = 2] = "Range";
    SaveType[SaveType["Indexes"] = 3] = "Indexes";
})(SaveType = exports.SaveType || (exports.SaveType = {}));
class SaveQueryResultResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveQueryResultResponse = SaveQueryResultResponse;
class OracleError {
}
exports.OracleError = OracleError;
class SaveQueryResultFinishedEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
        this.saveDataToFile = true;
    }
}
exports.SaveQueryResultFinishedEventParams = SaveQueryResultFinishedEventParams;
class SaveQueryResultCancelRequestParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveQueryResultCancelRequestParams = SaveQueryResultCancelRequestParams;
class SaveQueryResultCancelResponse {
}
exports.SaveQueryResultCancelResponse = SaveQueryResultCancelResponse;
class ConsumeUserInputResponse {
}
exports.ConsumeUserInputResponse = ConsumeUserInputResponse;
var ConsumeUserInputResponseMessageType;
(function (ConsumeUserInputResponseMessageType) {
    ConsumeUserInputResponseMessageType[ConsumeUserInputResponseMessageType["Success"] = 1] = "Success";
    ConsumeUserInputResponseMessageType[ConsumeUserInputResponseMessageType["Error"] = 0] = "Error";
})(ConsumeUserInputResponseMessageType = exports.ConsumeUserInputResponseMessageType || (exports.ConsumeUserInputResponseMessageType = {}));
var SaveQueryResultMessageType;
(function (SaveQueryResultMessageType) {
    SaveQueryResultMessageType[SaveQueryResultMessageType["Message"] = 0] = "Message";
    SaveQueryResultMessageType[SaveQueryResultMessageType["Error"] = 1] = "Error";
    SaveQueryResultMessageType[SaveQueryResultMessageType["UserCancel"] = 2] = "UserCancel";
})(SaveQueryResultMessageType = exports.SaveQueryResultMessageType || (exports.SaveQueryResultMessageType = {}));
var SaveExplainPlanStatus;
(function (SaveExplainPlanStatus) {
    SaveExplainPlanStatus[SaveExplainPlanStatus["Success"] = 0] = "Success";
    SaveExplainPlanStatus[SaveExplainPlanStatus["Error"] = 1] = "Error";
    SaveExplainPlanStatus[SaveExplainPlanStatus["UserCancel"] = 2] = "UserCancel";
})(SaveExplainPlanStatus = exports.SaveExplainPlanStatus || (exports.SaveExplainPlanStatus = {}));
var DataFormat;
(function (DataFormat) {
    DataFormat[DataFormat["None"] = 0] = "None";
    DataFormat[DataFormat["CSV"] = 1] = "CSV";
    DataFormat[DataFormat["JSON"] = 2] = "JSON";
    DataFormat[DataFormat["HTML"] = 3] = "HTML";
    DataFormat[DataFormat["TEXT"] = 4] = "TEXT";
})(DataFormat = exports.DataFormat || (exports.DataFormat = {}));
class UserInputParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.UserInputParams = UserInputParams;
var OperationName;
(function (OperationName) {
    OperationName[OperationName["None"] = 0] = "None";
    OperationName[OperationName["RunCodeObject"] = 1] = "RunCodeObject";
    OperationName[OperationName["BindVariableInput"] = 2] = "BindVariableInput";
    OperationName[OperationName["SubstituionVariableInput"] = 3] = "SubstituionVariableInput";
    OperationName[OperationName["Password"] = 4] = "Password";
    OperationName[OperationName["UserName"] = 5] = "UserName";
    OperationName[OperationName["UnsupportedCommandPrompt"] = 6] = "UnsupportedCommandPrompt";
    OperationName[OperationName["PromptConnectionReconnect"] = 7] = "PromptConnectionReconnect";
})(OperationName = exports.OperationName || (exports.OperationName = {}));
class InputVariable {
}
exports.InputVariable = InputVariable;
class Direction {
}
exports.Direction = Direction;
Direction.None = "NONE";
Direction.IN = "IN";
Direction.OUT = "OUT";
Direction.IN_OUT = "IN/OUT";
Direction.RETURN_VALUE = "RETURN VALUE";
var DataSourceType;
(function (DataSourceType) {
    DataSourceType[DataSourceType["None"] = 0] = "None";
    DataSourceType[DataSourceType["Message"] = 1] = "Message";
    DataSourceType[DataSourceType["QueryResult"] = 2] = "QueryResult";
    DataSourceType[DataSourceType["CodeObjectOutput"] = 3] = "CodeObjectOutput";
    DataSourceType[DataSourceType["ExplainPlanQueryResult"] = 4] = "ExplainPlanQueryResult";
})(DataSourceType = exports.DataSourceType || (exports.DataSourceType = {}));
var UIDisplayMode;
(function (UIDisplayMode) {
    UIDisplayMode[UIDisplayMode["None"] = 0] = "None";
    UIDisplayMode[UIDisplayMode["ExecuteScript"] = 1] = "ExecuteScript";
    UIDisplayMode[UIDisplayMode["ShowData"] = 2] = "ShowData";
    UIDisplayMode[UIDisplayMode["RunCodeObject"] = 3] = "RunCodeObject";
    UIDisplayMode[UIDisplayMode["ExecuteSQLStatement"] = 4] = "ExecuteSQLStatement";
    UIDisplayMode[UIDisplayMode["ConnectionManagement"] = 5] = "ConnectionManagement";
    UIDisplayMode[UIDisplayMode["OCICompartment"] = 6] = "OCICompartment";
    UIDisplayMode[UIDisplayMode["AutonomousDatabaseConnectionManagement"] = 7] = "AutonomousDatabaseConnectionManagement";
    UIDisplayMode[UIDisplayMode["DownloadCredentialsFile"] = 8] = "DownloadCredentialsFile";
    UIDisplayMode[UIDisplayMode["CreateAutonomousDatabase"] = 9] = "CreateAutonomousDatabase";
    UIDisplayMode[UIDisplayMode["OCIRegion"] = 10] = "OCIRegion";
    UIDisplayMode[UIDisplayMode["ChangeADBPassword"] = 11] = "ChangeADBPassword";
    UIDisplayMode[UIDisplayMode["CompilerSettings"] = 12] = "CompilerSettings";
    UIDisplayMode[UIDisplayMode["getADBConnectionStrings"] = 13] = "getADBConnectionStrings";
    UIDisplayMode[UIDisplayMode["updateNetworkAccessUI"] = 14] = "updateNetworkAccessUI";
    UIDisplayMode[UIDisplayMode["formatterSettings"] = 15] = "formatterSettings";
    UIDisplayMode[UIDisplayMode["editMutualAuthentication"] = 16] = "editMutualAuthentication";
    UIDisplayMode[UIDisplayMode["configureWalletlessConnectivityAndNetworkAccess"] = 17] = "configureWalletlessConnectivityAndNetworkAccess";
    UIDisplayMode[UIDisplayMode["executeExplainPlanSQL"] = 18] = "executeExplainPlanSQL";
    UIDisplayMode[UIDisplayMode["FilterSettings"] = 19] = "FilterSettings";
    UIDisplayMode[UIDisplayMode["executeDBMSExplainPlanSQL"] = 20] = "executeDBMSExplainPlanSQL";
    UIDisplayMode[UIDisplayMode["executeDBMSExecutionPlanSQL"] = 21] = "executeDBMSExecutionPlanSQL";
    UIDisplayMode[UIDisplayMode["explainPlanSettings"] = 22] = "explainPlanSettings";
    UIDisplayMode[UIDisplayMode["ExecutionPlan"] = 23] = "ExecutionPlan";
    UIDisplayMode[UIDisplayMode["ExecutionPlanGrid"] = 24] = "ExecutionPlanGrid";
    UIDisplayMode[UIDisplayMode["DBMSExecutionPlan"] = 25] = "DBMSExecutionPlan";
    UIDisplayMode[UIDisplayMode["DBMSExecutionPlanText"] = 26] = "DBMSExecutionPlanText";
    UIDisplayMode[UIDisplayMode["ConfigureAIProvider"] = 27] = "ConfigureAIProvider";
    UIDisplayMode[UIDisplayMode["ManageAIProfiles"] = 28] = "ManageAIProfiles";
    UIDisplayMode[UIDisplayMode["DBMigrationWizard"] = 130] = "DBMigrationWizard";
    UIDisplayMode[UIDisplayMode["RealTimeSqlMonitoringMaster"] = 140] = "RealTimeSqlMonitoringMaster";
    UIDisplayMode[UIDisplayMode["RealTimeSqlMonitoringDetail"] = 150] = "RealTimeSqlMonitoringDetail";
})(UIDisplayMode = exports.UIDisplayMode || (exports.UIDisplayMode = {}));
var QueryType;
(function (QueryType) {
    QueryType[QueryType["Select"] = 0] = "Select";
    QueryType[QueryType["Insert"] = 1] = "Insert";
    QueryType[QueryType["Update"] = 2] = "Update";
    QueryType[QueryType["Delete"] = 3] = "Delete";
    QueryType[QueryType["At"] = 4] = "At";
    QueryType[QueryType["PlsqlBlock"] = 5] = "PlsqlBlock";
    QueryType[QueryType["AnonymousPlSqlBlock"] = 6] = "AnonymousPlSqlBlock";
    QueryType[QueryType["Comment"] = 7] = "Comment";
    QueryType[QueryType["Desc"] = 8] = "Desc";
    QueryType[QueryType["Other"] = 9] = "Other";
    QueryType[QueryType["RunCodeObject"] = 10] = "RunCodeObject";
    QueryType[QueryType["ShowData"] = 11] = "ShowData";
    QueryType[QueryType["None"] = 100000] = "None";
})(QueryType = exports.QueryType || (exports.QueryType = {}));
var OutputTarget;
(function (OutputTarget) {
    OutputTarget[OutputTarget["None"] = 0] = "None";
    OutputTarget[OutputTarget["FullScreen"] = 1] = "FullScreen";
    OutputTarget[OutputTarget["OutputPane"] = 2] = "OutputPane";
})(OutputTarget = exports.OutputTarget || (exports.OutputTarget = {}));
class GetProfileRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetProfileRequest = GetProfileRequest;
class GetProfileResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new GetProfileResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
}
exports.GetProfileResponse = GetProfileResponse;
class GetConfigFileLocationsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetConfigFileLocationsRequest = GetConfigFileLocationsRequest;
class GetTNSNamesRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetTNSNamesRequest = GetTNSNamesRequest;
class GetTNSNamesResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new GetTNSNamesResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
}
exports.GetTNSNamesResponse = GetTNSNamesResponse;
class BrowseRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.BrowseRequest = BrowseRequest;
class BrowseResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new BrowseResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        response.browseItem = message.browseItem;
        return response;
    }
}
exports.BrowseResponse = BrowseResponse;
class GetAllProfileNamesRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetAllProfileNamesRequest = GetAllProfileNamesRequest;
class GetAllProfileNamesResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new GetAllProfileNamesResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
}
exports.GetAllProfileNamesResponse = GetAllProfileNamesResponse;
class GetConfigFileLocationsResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new GetConfigFileLocationsResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
}
exports.GetConfigFileLocationsResponse = GetConfigFileLocationsResponse;
class SaveProfileRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveProfileRequest = SaveProfileRequest;
var SaveProfileType;
(function (SaveProfileType) {
    SaveProfileType[SaveProfileType["create"] = 1] = "create";
    SaveProfileType[SaveProfileType["rename"] = 2] = "rename";
    SaveProfileType[SaveProfileType["update"] = 3] = "update";
    SaveProfileType[SaveProfileType["renameAndUpdate"] = 4] = "renameAndUpdate";
    SaveProfileType[SaveProfileType["setDefConnection"] = 5] = "setDefConnection";
    SaveProfileType[SaveProfileType["displayProperties"] = 6] = "displayProperties";
})(SaveProfileType = exports.SaveProfileType || (exports.SaveProfileType = {}));
class SaveProfileResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new SaveProfileResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
}
exports.SaveProfileResponse = SaveProfileResponse;
class GetSchemasRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetSchemasRequest = GetSchemasRequest;
class GetSchemasResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new GetSchemasResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
}
exports.GetSchemasResponse = GetSchemasResponse;
class GetUserPreferencesRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetUserPreferencesRequest = GetUserPreferencesRequest;
class GetUserPreferencesResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new GetUserPreferencesResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
}
exports.GetUserPreferencesResponse = GetUserPreferencesResponse;
class UserPreferences {
    constructor(connectionProperties, resultsWindowProperties, bookmarkProperties, compilerProperties) {
        this.connectionProperties = connectionProperties;
        this.resultsWindowProperties = resultsWindowProperties;
        this.bookmarkProperties = bookmarkProperties;
        this.compilerProperties = compilerProperties;
        if (!this.connectionProperties) {
            this.connectionProperties = new ConnectionProperties();
        }
        if (!this.resultsWindowProperties) {
            this.resultsWindowProperties = new ResultsWindowProperties();
        }
        if (!this.bookmarkProperties) {
            this.bookmarkProperties = new BookmarkProperties();
        }
        if (!this.compilerProperties)
            this.compilerProperties = new CompilerProperties();
    }
}
exports.UserPreferences = UserPreferences;
class BookmarkProperties {
    constructor() {
        this.lastFolder = undefined;
    }
}
exports.BookmarkProperties = BookmarkProperties;
class CompilerProperties {
    constructor(lastConfiguration) {
        this.lastConfiguration = lastConfiguration;
    }
}
exports.CompilerProperties = CompilerProperties;
class ConnectionProperties {
    constructor(connectionType, tnsAdminLocation, tnsAlias, useWalletFile, useConnCredsFromWalletFile, walletFileLocation, databaseHostName, databasePortNumber, databaseServiceName, advancedConnectionString, odpnetConnectionString, loginScript) {
        this.connectionType = connectionType;
        this.tnsAdminLocation = tnsAdminLocation;
        this.tnsAlias = tnsAlias;
        this.useWalletFile = useWalletFile;
        this.useConnCredsFromWalletFile = useConnCredsFromWalletFile;
        this.walletFileLocation = walletFileLocation;
        this.databaseHostName = databaseHostName;
        this.databasePortNumber = databasePortNumber;
        this.databaseServiceName = databaseServiceName;
        this.advancedConnectionString = advancedConnectionString;
        this.odpnetConnectionString = odpnetConnectionString;
        this.loginScript = loginScript;
    }
}
exports.ConnectionProperties = ConnectionProperties;
class ResultsWindowProperties {
    constructor(saveFormat) {
        this.saveFormat = saveFormat;
    }
}
exports.ResultsWindowProperties = ResultsWindowProperties;
class UpdateStatusBarEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.UpdateStatusBarEvent = UpdateStatusBarEvent;
class UpdateToolbarEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.UpdateToolbarEvent = UpdateToolbarEvent;
class ToolbarOptions {
}
exports.ToolbarOptions = ToolbarOptions;
var ConnectionAuthenticationType;
(function (ConnectionAuthenticationType) {
    ConnectionAuthenticationType[ConnectionAuthenticationType["Admin"] = 1] = "Admin";
    ConnectionAuthenticationType[ConnectionAuthenticationType["NonAdmin"] = 2] = "NonAdmin";
})(ConnectionAuthenticationType = exports.ConnectionAuthenticationType || (exports.ConnectionAuthenticationType = {}));
var ConnectionType;
(function (ConnectionType) {
    ConnectionType[ConnectionType["TNS"] = 1] = "TNS";
    ConnectionType[ConnectionType["EZConnect"] = 2] = "EZConnect";
    ConnectionType[ConnectionType["Advanced"] = 3] = "Advanced";
    ConnectionType[ConnectionType["ODPConnectionString"] = 4] = "ODPConnectionString";
    ConnectionType[ConnectionType["LDAPDirectoryServer"] = 5] = "LDAPDirectoryServer";
})(ConnectionType = exports.ConnectionType || (exports.ConnectionType = {}));
var ConnectionCredStoreType;
(function (ConnectionCredStoreType) {
    ConnectionCredStoreType["VSCodeSecretStorage"] = "Secret Storage";
    ConnectionCredStoreType["VSCodeSettings"] = "Settings";
})(ConnectionCredStoreType = exports.ConnectionCredStoreType || (exports.ConnectionCredStoreType = {}));
class ValidationRequestParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    static createResponse(message) {
        const newObject = new ValidationRequestResponse();
        newObject.ownerUri = message.ownerUri;
        newObject.executionId = message.executionId;
        newObject.variable = message.variable;
        return newObject;
    }
}
exports.ValidationRequestParams = ValidationRequestParams;
class ValidationRequestResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ValidationRequestResponse = ValidationRequestResponse;
class TestCommandResponse {
    constructor(command, html) {
        this.command = command;
        this.html = html;
    }
}
exports.TestCommandResponse = TestCommandResponse;
class ScriptExecutionClearEventParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
        this.previousExecutionList = [];
    }
}
exports.ScriptExecutionClearEventParams = ScriptExecutionClearEventParams;
class ResourceIdentifier {
}
exports.ResourceIdentifier = ResourceIdentifier;
var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus[ExecutionStatus["NotStarted"] = 0] = "NotStarted";
    ExecutionStatus[ExecutionStatus["Started"] = 1] = "Started";
    ExecutionStatus[ExecutionStatus["Finished"] = 2] = "Finished";
})(ExecutionStatus = exports.ExecutionStatus || (exports.ExecutionStatus = {}));
class ToolbarEvent extends ScriptExecutionMessageBase {
    constructor() {
        super();
        this.currentUIMode = UIDisplayMode.None;
    }
}
exports.ToolbarEvent = ToolbarEvent;
class ScriptExecutionAcknowledgeMessageResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ScriptExecutionAcknowledgeMessageResponse = ScriptExecutionAcknowledgeMessageResponse;
class ScriptExecutionAcknowledgeMessageRequestParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ScriptExecutionAcknowledgeMessageRequestParams = ScriptExecutionAcknowledgeMessageRequestParams;
class GetCompilerSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetCompilerSettingsRequest = GetCompilerSettingsRequest;
class GetCompilerSettingsResponse {
}
exports.GetCompilerSettingsResponse = GetCompilerSettingsResponse;
class CompilerSettings {
}
exports.CompilerSettings = CompilerSettings;
class SaveCompilerSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveCompilerSettingsRequest = SaveCompilerSettingsRequest;
class SaveCompilerSettingsResponse {
}
exports.SaveCompilerSettingsResponse = SaveCompilerSettingsResponse;
var CompileConfig;
(function (CompileConfig) {
    CompileConfig[CompileConfig["Compile"] = 0] = "Compile";
    CompileConfig[CompileConfig["CompileDebug"] = 1] = "CompileDebug";
    CompileConfig[CompileConfig["AllConfigurations"] = 2] = "AllConfigurations";
})(CompileConfig = exports.CompileConfig || (exports.CompileConfig = {}));
class GetDebuggerSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetDebuggerSettingsRequest = GetDebuggerSettingsRequest;
class GetDebuggerSettingsResponse {
}
exports.GetDebuggerSettingsResponse = GetDebuggerSettingsResponse;
class SaveDebuggerSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveDebuggerSettingsRequest = SaveDebuggerSettingsRequest;
class SaveDebuggerSettingsResponse {
}
exports.SaveDebuggerSettingsResponse = SaveDebuggerSettingsResponse;
class DebugSettings {
}
exports.DebugSettings = DebugSettings;
class SaveFormatterSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveFormatterSettingsRequest = SaveFormatterSettingsRequest;
class SaveFormatterSettingsResponse {
}
exports.SaveFormatterSettingsResponse = SaveFormatterSettingsResponse;
class GetFormatterSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetFormatterSettingsRequest = GetFormatterSettingsRequest;
class GetFormatterSettingsResponse {
}
exports.GetFormatterSettingsResponse = GetFormatterSettingsResponse;
class FormatPreviewTextRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.FormatPreviewTextRequest = FormatPreviewTextRequest;
class FormatPreviewTextResponse {
    constructor(text) {
        this.formattedText = text;
    }
}
exports.FormatPreviewTextResponse = FormatPreviewTextResponse;
class ConnectionHelpRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ConnectionHelpRequest = ConnectionHelpRequest;
class ConnectionHelpResponse {
}
exports.ConnectionHelpResponse = ConnectionHelpResponse;
class ExportFormatSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ExportFormatSettingsRequest = ExportFormatSettingsRequest;
class ExportFormatSettingsResponse {
}
exports.ExportFormatSettingsResponse = ExportFormatSettingsResponse;
class ImportFormatSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ImportFormatSettingsRequest = ImportFormatSettingsRequest;
class ImportFormatSettingsResponse {
}
exports.ImportFormatSettingsResponse = ImportFormatSettingsResponse;
class ConfigurationScope {
    constructor(configTarget, folder, settingsFile) {
        this.configurationTarget = configTarget;
        this.workspaceFolder = folder;
        this.settingsFile = settingsFile;
    }
}
exports.ConfigurationScope = ConfigurationScope;
class WorkspaceFolderProfiles {
}
exports.WorkspaceFolderProfiles = WorkspaceFolderProfiles;
class RecentConnection {
    constructor(name, configurationTarget, workspaceFolder) {
        this.name = name;
        this.configurationTarget = configurationTarget;
        this.workspaceFolder = workspaceFolder;
    }
}
exports.RecentConnection = RecentConnection;
class QuerySettings {
    constructor(autoCommit = true, clearResultsWindow = false, echo = true, csvDelimiter = ",", csvTextQualifier = "None", maxRows = 500, generateSQLTimeout = 30, pageSize = 10, showWarning = true, openResultsWindow = "Use Workbench > Editor: Open Positioning", rowNumber = true, cellTextLength = 20, tooltipTextLength = 50, overflowTextLength = 2000, saveFileTextLength = 2000) {
        this.autoCommit = autoCommit;
        this.clearResultsWindow = clearResultsWindow;
        this.echo = echo;
        this.csvDelimiter = csvDelimiter;
        this.csvTextQualifier = csvTextQualifier;
        this.maxRows = maxRows;
        this.generateSQLTimeout = generateSQLTimeout;
        this.pageSize = pageSize;
        this.showWarning = showWarning;
        this.openResultsWindow = openResultsWindow;
        this.rowNumber = rowNumber;
        this.cellTextLength = cellTextLength;
        this.tooltipTextLength = tooltipTextLength;
        this.overflowTextLength = overflowTextLength;
        this.saveFileTextLength = saveFileTextLength;
    }
}
exports.QuerySettings = QuerySettings;
class RtsmSettings {
    constructor(showLicenseDialog = true) {
        this.showLicenseDialog = showLicenseDialog;
    }
}
exports.RtsmSettings = RtsmSettings;
var BrowseItem;
(function (BrowseItem) {
    BrowseItem[BrowseItem["TnsLocation"] = 1] = "TnsLocation";
    BrowseItem[BrowseItem["WalletLocation"] = 2] = "WalletLocation";
    BrowseItem[BrowseItem["AdbCredential"] = 3] = "AdbCredential";
    BrowseItem[BrowseItem["OciCredential"] = 4] = "OciCredential";
    BrowseItem[BrowseItem["LoginScript"] = 5] = "LoginScript";
})(BrowseItem = exports.BrowseItem || (exports.BrowseItem = {}));
class GetConnectionConfigSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetConnectionConfigSettingsRequest = GetConnectionConfigSettingsRequest;
class GetConnectionConfigSettingsResponse {
}
exports.GetConnectionConfigSettingsResponse = GetConnectionConfigSettingsResponse;
class ConnectionConfigurationSettings {
}
exports.ConnectionConfigurationSettings = ConnectionConfigurationSettings;
class GetFilterSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetFilterSettingsRequest = GetFilterSettingsRequest;
class GetFilterSettingsResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetFilterSettingsResponse = GetFilterSettingsResponse;
class SaveFilterSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveFilterSettingsRequest = SaveFilterSettingsRequest;
class SaveFilterSettingsResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveFilterSettingsResponse = SaveFilterSettingsResponse;
class FilterItem {
    constructor(property, condition, value, caseSensitiveMatch, lowerLimit, upperLimit) {
        this.property = property;
        this.condition = condition;
        this.value = value;
        this.caseSensitiveMatch = caseSensitiveMatch;
        this.lowerLimit = lowerLimit;
        this.upperLimit = upperLimit;
    }
}
exports.FilterItem = FilterItem;
class FilterItemJson {
}
exports.FilterItemJson = FilterItemJson;
class CollectionFilterInfo {
}
exports.CollectionFilterInfo = CollectionFilterInfo;
class CollectionFilterJson {
}
exports.CollectionFilterJson = CollectionFilterJson;
var FilterCollectionType;
(function (FilterCollectionType) {
    FilterCollectionType[FilterCollectionType["Connection"] = 0] = "Connection";
    FilterCollectionType[FilterCollectionType["PLSQLObjects"] = 1] = "PLSQLObjects";
    FilterCollectionType[FilterCollectionType["Tables"] = 2] = "Tables";
    FilterCollectionType[FilterCollectionType["RelationalTables"] = 3] = "RelationalTables";
    FilterCollectionType[FilterCollectionType["ObjectTables"] = 4] = "ObjectTables";
    FilterCollectionType[FilterCollectionType["XMLTables"] = 5] = "XMLTables";
    FilterCollectionType[FilterCollectionType["Views"] = 6] = "Views";
    FilterCollectionType[FilterCollectionType["RelationalViews"] = 7] = "RelationalViews";
    FilterCollectionType[FilterCollectionType["ObjectViews"] = 8] = "ObjectViews";
    FilterCollectionType[FilterCollectionType["XMLViews"] = 9] = "XMLViews";
    FilterCollectionType[FilterCollectionType["MaterializedViews"] = 10] = "MaterializedViews";
    FilterCollectionType[FilterCollectionType["Procedures"] = 11] = "Procedures";
    FilterCollectionType[FilterCollectionType["Functions"] = 12] = "Functions";
    FilterCollectionType[FilterCollectionType["Packages"] = 13] = "Packages";
    FilterCollectionType[FilterCollectionType["Sequences"] = 14] = "Sequences";
    FilterCollectionType[FilterCollectionType["Synonyms"] = 15] = "Synonyms";
    FilterCollectionType[FilterCollectionType["Triggers"] = 16] = "Triggers";
    FilterCollectionType[FilterCollectionType["TableTriggers"] = 17] = "TableTriggers";
    FilterCollectionType[FilterCollectionType["ViewTriggers"] = 18] = "ViewTriggers";
    FilterCollectionType[FilterCollectionType["SchemaTriggers"] = 19] = "SchemaTriggers";
    FilterCollectionType[FilterCollectionType["DatabaseTriggers"] = 20] = "DatabaseTriggers";
    FilterCollectionType[FilterCollectionType["OtherUsers"] = 21] = "OtherUsers";
})(FilterCollectionType = exports.FilterCollectionType || (exports.FilterCollectionType = {}));
var FilterProperties;
(function (FilterProperties) {
    FilterProperties[FilterProperties["VisibleCollections"] = 0] = "VisibleCollections";
    FilterProperties[FilterProperties["ObjectName"] = 1] = "ObjectName";
    FilterProperties[FilterProperties["CompilationMode"] = 2] = "CompilationMode";
    FilterProperties[FilterProperties["Status"] = 3] = "Status";
    FilterProperties[FilterProperties["TriggerStatus"] = 4] = "TriggerStatus";
    FilterProperties[FilterProperties["CreatedDate"] = 5] = "CreatedDate";
    FilterProperties[FilterProperties["ModifiedDate"] = 6] = "ModifiedDate";
    FilterProperties[FilterProperties["ObjectCount"] = 7] = "ObjectCount";
    FilterProperties[FilterProperties["ParentObjectName"] = 8] = "ParentObjectName";
    FilterProperties[FilterProperties["ParentObjectOwnerName"] = 9] = "ParentObjectOwnerName";
})(FilterProperties = exports.FilterProperties || (exports.FilterProperties = {}));
var CodeObjectDebug;
(function (CodeObjectDebug) {
    CodeObjectDebug[CodeObjectDebug["WithoutDebug"] = 0] = "WithoutDebug";
    CodeObjectDebug[CodeObjectDebug["WithDebug"] = 1] = "WithDebug";
})(CodeObjectDebug = exports.CodeObjectDebug || (exports.CodeObjectDebug = {}));
var CodeObjectStatus;
(function (CodeObjectStatus) {
    CodeObjectStatus[CodeObjectStatus["Valid"] = 0] = "Valid";
    CodeObjectStatus[CodeObjectStatus["Invalid"] = 1] = "Invalid";
})(CodeObjectStatus = exports.CodeObjectStatus || (exports.CodeObjectStatus = {}));
var TriggerStatus;
(function (TriggerStatus) {
    TriggerStatus[TriggerStatus["Enabled"] = 0] = "Enabled";
    TriggerStatus[TriggerStatus["Disabled"] = 1] = "Disabled";
})(TriggerStatus = exports.TriggerStatus || (exports.TriggerStatus = {}));
var FilterConditions;
(function (FilterConditions) {
    FilterConditions[FilterConditions["Is"] = 0] = "Is";
    FilterConditions[FilterConditions["IsNot"] = 1] = "IsNot";
    FilterConditions[FilterConditions["StartsWith"] = 2] = "StartsWith";
    FilterConditions[FilterConditions["EndsWith"] = 3] = "EndsWith";
    FilterConditions[FilterConditions["Contains"] = 4] = "Contains";
    FilterConditions[FilterConditions["DoesNotContain"] = 5] = "DoesNotContain";
    FilterConditions[FilterConditions["EqualTo"] = 6] = "EqualTo";
    FilterConditions[FilterConditions["NotEqualTo"] = 7] = "NotEqualTo";
    FilterConditions[FilterConditions["LessThan"] = 8] = "LessThan";
    FilterConditions[FilterConditions["GreaterThan"] = 9] = "GreaterThan";
    FilterConditions[FilterConditions["LessThanOrEqualTo"] = 10] = "LessThanOrEqualTo";
    FilterConditions[FilterConditions["GreaterThanOrEqualTo"] = 11] = "GreaterThanOrEqualTo";
    FilterConditions[FilterConditions["Between"] = 12] = "Between";
    FilterConditions[FilterConditions["NotBetween"] = 13] = "NotBetween";
})(FilterConditions = exports.FilterConditions || (exports.FilterConditions = {}));
var FilterMatch;
(function (FilterMatch) {
    FilterMatch[FilterMatch["Any"] = 0] = "Any";
    FilterMatch[FilterMatch["All"] = 1] = "All";
})(FilterMatch = exports.FilterMatch || (exports.FilterMatch = {}));
class ConnChangePromptRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ConnChangePromptRequest = ConnChangePromptRequest;
class ConnChangePromptResponse {
}
exports.ConnChangePromptResponse = ConnChangePromptResponse;
class ConfirmChangeScopeRequestParams extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ConfirmChangeScopeRequestParams = ConfirmChangeScopeRequestParams;
class ConfirmChangeScopeResponse {
}
exports.ConfirmChangeScopeResponse = ConfirmChangeScopeResponse;
class Filter {
}
exports.Filter = Filter;
class FilterValue {
}
exports.FilterValue = FilterValue;
class FilterStringValue {
}
exports.FilterStringValue = FilterStringValue;
class FilterStringArrayValue {
}
exports.FilterStringArrayValue = FilterStringArrayValue;
class FilterDebugValue {
}
exports.FilterDebugValue = FilterDebugValue;
class FilterStatusValue {
}
exports.FilterStatusValue = FilterStatusValue;
class FilterTriggerStatusValue {
}
exports.FilterTriggerStatusValue = FilterTriggerStatusValue;
class FilterNumberValue {
}
exports.FilterNumberValue = FilterNumberValue;
class SaveExplainPlanSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.SaveExplainPlanSettingsRequest = SaveExplainPlanSettingsRequest;
class SaveExplainPlanSettingsResponse {
}
exports.SaveExplainPlanSettingsResponse = SaveExplainPlanSettingsResponse;
class GetExplainPlanSettingsRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.GetExplainPlanSettingsRequest = GetExplainPlanSettingsRequest;
class GetExplainPlanSettingsResponse {
}
exports.GetExplainPlanSettingsResponse = GetExplainPlanSettingsResponse;
class clearPageEvent {
    constructor() {
        this.currentUIMode = UIDisplayMode.None;
        this.displayMode = UIDisplayMode.None;
        this.connectionUniqueId = -1;
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.clearPageEvent = clearPageEvent;
class TestConnectionRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.TestConnectionRequest = TestConnectionRequest;
class TestConnectionResponse extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new TestConnectionResponse();
        response.executionId = message.executionId;
        response.ownerUri = message.ownerUri;
        response.requestId = message.requestId;
        response.windowUri = message.windowUri;
        return response;
    }
}
exports.TestConnectionResponse = TestConnectionResponse;
class SelectAIRequestBase extends ScriptExecutionMessageBase {
    constructor() { super(); }
    static displayString(self) {
        if (self.connectionUniqueId !== undefined && self.connectionUniqueId !== null) {
            return `Connection Id = ${self.connectionUniqueId.toString()}; `;
        }
        else
            return "Connection Id = undefined";
    }
}
exports.SelectAIRequestBase = SelectAIRequestBase;
class SelectAIResponseBase {
    constructor() { }
    static displayString(self) {
        if (self.connectionUniqueId !== undefined && self.connectionUniqueId !== null) {
            return `Connection Id = ${self.connectionUniqueId.toString()}; `;
        }
        else
            return "Connection Id = undefined";
    }
}
exports.SelectAIResponseBase = SelectAIResponseBase;
class SaveCredentialRequest extends SelectAIRequestBase {
    constructor() {
        super();
    }
}
exports.SaveCredentialRequest = SaveCredentialRequest;
class SaveCredentialResponse extends SelectAIResponseBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new SaveCredentialResponse();
        response.connectionUniqueId = message.connectionUniqueId;
        response.connectionUniqueName = message.connectionUniqueName;
        response.connectionName = message.connectionName;
        return response;
    }
}
exports.SaveCredentialResponse = SaveCredentialResponse;
class SaveAiProfileRequest extends SelectAIRequestBase {
    constructor() {
        super();
    }
}
exports.SaveAiProfileRequest = SaveAiProfileRequest;
class SaveAiProfileResponse extends SelectAIResponseBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new SaveAiProfileResponse();
        response.connectionUniqueId = message.connectionUniqueId;
        response.connectionUniqueName = message.connectionUniqueName;
        response.connectionName = message.connectionName;
        return response;
    }
}
exports.SaveAiProfileResponse = SaveAiProfileResponse;
class ObjectListItem {
}
exports.ObjectListItem = ObjectListItem;
class SaveLLMAccessConfigRequest extends SelectAIRequestBase {
    constructor() {
        super();
    }
}
exports.SaveLLMAccessConfigRequest = SaveLLMAccessConfigRequest;
class SaveLLMAccessConfigResponse extends SelectAIResponseBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new SaveLLMAccessConfigResponse();
        response.connectionUniqueId = message.connectionUniqueId;
        response.connectionName = message.connectionName;
        return response;
    }
}
exports.SaveLLMAccessConfigResponse = SaveLLMAccessConfigResponse;
class LLMConfigGetSchemasRequest extends SelectAIRequestBase {
    constructor() {
        super();
    }
}
exports.LLMConfigGetSchemasRequest = LLMConfigGetSchemasRequest;
class LLMConfigGetSchemasResponse extends SelectAIResponseBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new LLMConfigGetSchemasResponse();
        response.connectionUniqueId = message.connectionUniqueId;
        if (message.connectionUniqueName)
            response.connectionUniqueName = message.connectionUniqueName;
        response.connectionName = message.connectionName;
        return response;
    }
}
exports.LLMConfigGetSchemasResponse = LLMConfigGetSchemasResponse;
class LLMConfigGetCredentialsRequest extends SelectAIRequestBase {
    constructor() {
        super();
    }
}
exports.LLMConfigGetCredentialsRequest = LLMConfigGetCredentialsRequest;
class LLMConfigGetCredentialsResponse extends SelectAIResponseBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new LLMConfigGetCredentialsResponse();
        response.connectionUniqueId = message.connectionUniqueId;
        response.connectionUniqueName = message.connectionUniqueName;
        response.connectionName = message.connectionName;
        response.sourceTab = message.sourceTab;
        return response;
    }
}
exports.LLMConfigGetCredentialsResponse = LLMConfigGetCredentialsResponse;
class GetTablesViewsRequest extends SelectAIRequestBase {
    constructor() {
        super();
    }
}
exports.GetTablesViewsRequest = GetTablesViewsRequest;
class GetTablesViewsResponse extends SelectAIResponseBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new GetTablesViewsResponse();
        response.connectionUniqueId = message.connectionUniqueId;
        response.connectionUniqueName = message.connectionUniqueName;
        response.connectionName = message.connectionName;
        return response;
    }
}
exports.GetTablesViewsResponse = GetTablesViewsResponse;
class GetAIProfilesRequest extends SelectAIRequestBase {
    constructor() {
        super();
    }
    static displayString(self) {
        return `Uri = ${self.ownerUri} ExecutionId=${self.executionId} windowUri=${self.windowUri}`;
    }
}
exports.GetAIProfilesRequest = GetAIProfilesRequest;
class GetAIProfilesResponse extends SelectAIResponseBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new GetAIProfilesResponse();
        response.connectionUniqueId = message.connectionUniqueId;
        response.connectionUniqueName = message.connectionUniqueName;
        response.connectionName = message.connectionName;
        return response;
    }
}
exports.GetAIProfilesResponse = GetAIProfilesResponse;
class GetConnectedUserRequest extends SelectAIRequestBase {
    constructor() {
        super();
    }
}
exports.GetConnectedUserRequest = GetConnectedUserRequest;
class GetConnectedUserResponse extends SelectAIResponseBase {
    constructor() {
        super();
    }
    static create(message) {
        const response = new GetConnectedUserResponse();
        response.connectionUniqueId = message.connectionUniqueId;
        response.connectionUniqueName = message.connectionUniqueName;
        response.connectionName = message.connectionName;
        return response;
    }
}
exports.GetConnectedUserResponse = GetConnectedUserResponse;
class ConfigAIGetConnectionsInfoRequest extends ScriptExecutionMessageBase {
    constructor() {
        super();
    }
}
exports.ConfigAIGetConnectionsInfoRequest = ConfigAIGetConnectionsInfoRequest;
class ConfigAIGetConnectionsInfoResponse {
}
exports.ConfigAIGetConnectionsInfoResponse = ConfigAIGetConnectionsInfoResponse;
class ConfigAIGetAIProfilesRequest extends SelectAIRequestBase {
    constructor() {
        super();
    }
}
exports.ConfigAIGetAIProfilesRequest = ConfigAIGetAIProfilesRequest;
class RerunQueryRequestParams extends ScriptExecuteParams {
    constructor() {
        super();
    }
}
exports.RerunQueryRequestParams = RerunQueryRequestParams;
class RerunQueryResponse {
}
exports.RerunQueryResponse = RerunQueryResponse;
class SortAndFilterRequestParams extends ScriptExecutionMessageBase {
}
exports.SortAndFilterRequestParams = SortAndFilterRequestParams;
class SortAndFilterResponse {
}
exports.SortAndFilterResponse = SortAndFilterResponse;
class SortColumn {
}
exports.SortColumn = SortColumn;
class OverflowDataRequestParams extends ScriptExecutionMessageBase {
}
exports.OverflowDataRequestParams = OverflowDataRequestParams;
class OverflowDataResponse {
}
exports.OverflowDataResponse = OverflowDataResponse;
