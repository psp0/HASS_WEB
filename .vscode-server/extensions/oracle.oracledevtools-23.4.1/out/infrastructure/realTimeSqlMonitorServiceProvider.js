"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeSqlMonitorServiceProvider = void 0;
const logger = require("./../infrastructure/logger");
const helper = require("./../utilities/helper");
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const localizedConstants_1 = require("./../constants/localizedConstants");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const connectionNode_1 = require("../explorer/nodes/connectionNode");
const oracleEditorManager_1 = require("./oracleEditorManager");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const rtsmQueries_1 = require("../models/realTimeSqlMonitoring/rtsmQueries");
const OracleConnectionProxyNamespace = require("./oracleConnectionProxyService/oracleConnectionProxy");
const settings_1 = require("../utilities/settings");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const adapter_1 = require("../prompts/adapter");
const fileLogger = logger.FileStreamLogger.Instance;
var RtsmPanelType;
(function (RtsmPanelType) {
    RtsmPanelType[RtsmPanelType["MASTER"] = 0] = "MASTER";
    RtsmPanelType[RtsmPanelType["DETAIL"] = 1] = "DETAIL";
    RtsmPanelType[RtsmPanelType["STATEMENT_DETAIL"] = 2] = "STATEMENT_DETAIL";
})(RtsmPanelType || (RtsmPanelType = {}));
class RtsmPanel extends vscode.Disposable {
    constructor(type) {
        super(() => { });
        this.webViewPanel = null;
        this.creationArgs = null;
        this._connNode = null;
        this.connRenamedSubscription = null;
        this.connDeletedSubscription = null;
        this.connectionDeleted = false;
        this._connProxy = null;
        this._panelId = ++RtsmPanel._rtsmPanelSequence;
        this._panelType = type;
    }
    get connNode() {
        return this._connNode;
    }
    ;
    set connNode(cn) {
        if (this._connNode !== cn) {
            if (this.connRenamedSubscription)
                this.connRenamedSubscription.dispose();
            if (this.connDeletedSubscription)
                this.connDeletedSubscription.dispose();
            this._connNode = cn;
            if (this._connNode) {
                switch (this._panelType) {
                    case RtsmPanelType.MASTER:
                        this.connRenamedSubscription = this._connNode.connectionNodeLabelObservable.subscribe(this.ConnectionRenamedMasterPanel, this);
                        this.connDeletedSubscription = this._connNode.connectionNodeDeletedObservable.subscribe(this.ConnectionDeletedMasterPanel, this);
                        break;
                    case RtsmPanelType.DETAIL:
                        this.connRenamedSubscription = this._connNode.connectionNodeLabelObservable.subscribe(this.ConnectionRenamedDetailPanel, this);
                        this.connDeletedSubscription = this._connNode.connectionNodeDeletedObservable.subscribe(this.ConnectionDeletedDetailPanel, this);
                        break;
                    case RtsmPanelType.STATEMENT_DETAIL:
                        this.connRenamedSubscription = this._connNode.connectionNodeLabelObservable.subscribe(this.ConnectionRenamedDetailPanel, this);
                        this.connDeletedSubscription = this._connNode.connectionNodeDeletedObservable.subscribe(this.ConnectionDeletedDetailPanel, this);
                        break;
                }
            }
        }
    }
    ;
    get Id() { return this._panelId; }
    get Type() { return this._panelType; }
    get Connection() {
        return (async () => {
            if (this._connNode && !this._connProxy) {
                this._connProxy = await OracleConnectionProxyNamespace.OracleConnectionProxy.CreateConnectionFromConnectionNode(this._connNode);
            }
            return this._connProxy;
        })();
    }
    ConnectionRenamedMasterPanel(newValue) {
        if (this.webViewPanel) {
            this.webViewPanel.title = `${localizedConstants_1.default.rtsmMasterUITitle} for ${newValue}`;
        }
    }
    ConnectionRenamedDetailPanel(newValue) {
        if (this.webViewPanel) {
            let s = this.webViewPanel.title;
            let pos = s.indexOf(":");
            s = s.slice(pos, s.length);
            this.webViewPanel.title = `${localizedConstants_1.default.rtsmDetailUITitle} ${newValue}${s}`;
        }
    }
    ConnectionDeletedMasterPanel(newValue) {
        this.connectionDeleted = true;
        if (this.webViewPanel) {
            this.webViewPanel.title = `${localizedConstants_1.default.rtsmMasterUITitle} for ${localizedConstants_1.default.rtsmUITitleDeleted}-${this.connNode.nodeLabel}`;
        }
    }
    ConnectionDeletedDetailPanel(newValue) {
        this.connectionDeleted = true;
        if (this.webViewPanel) {
            let s = this.webViewPanel.title;
            let pos = s.indexOf(":");
            s = s.slice(pos, s.length);
            this.webViewPanel.title = `${localizedConstants_1.default.rtsmDetailUITitle} ${localizedConstants_1.default.rtsmUITitleDeleted}-${this.connNode.nodeLabel}${s}`;
        }
    }
    async ConnectToDatabase() {
        let isConnected = false;
        if (this.connNode) {
            switch (this.connNode.status) {
                case connectionNode_1.ConnectionStatus.Disconnected:
                case connectionNode_1.ConnectionStatus.Connecting:
                case connectionNode_1.ConnectionStatus.Errored:
                    isConnected = await this.connNode.connectToDatabase();
                    dataExplorerManager_1.DataExplorerManager.Instance.dataExpModel.raiseModelChangedEvent();
                    break;
                case connectionNode_1.ConnectionStatus.Connected:
                    isConnected = true;
                    break;
            }
            ;
        }
        return isConnected;
    }
    dispose() {
        if (this.webViewPanel) {
            this.webViewPanel = null;
        }
        if (this._connProxy) {
            this._connProxy.Dispose();
            this._connProxy = null;
        }
        if (this.connNode) {
            this.connNode = null;
        }
    }
}
RtsmPanel._rtsmPanelSequence = 0;
class RtsmMasterTableSettings {
}
class RealTimeSqlMonitorServiceProvider {
    constructor() {
        this.disposed = false;
        this.rtsmPanels = new Map();
        this.tableSettings = {
            active_since_sec: "86400",
            top_n_rankby: "LAST_ACTIVE_TIME",
            refresh_interval: "0"
        };
    }
    static get instance() {
        if (!RealTimeSqlMonitorServiceProvider.varInstance) {
            RealTimeSqlMonitorServiceProvider.varInstance = new RealTimeSqlMonitorServiceProvider();
        }
        return RealTimeSqlMonitorServiceProvider.varInstance;
    }
    init(context, sech, vscodeCon, sbm) {
        fileLogger.info("Initializing RealTimeSqlMonitorServiceProvider.");
        this.scriptExecutionCommandHandler = sech;
        this.vscodeConnector = vscodeCon;
        this.statusbarManager = sbm;
        this.prompter = new adapter_1.default();
        fileLogger.info("RealTimeSqlMonitorServiceProvider initialized.");
    }
    RegisterRtsmDetailPanel(panel, args) {
        let connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueId(args.rtsmId);
        let v = new RtsmPanel(RtsmPanelType.STATEMENT_DETAIL);
        v.webViewPanel = panel;
        v.creationArgs = args;
        v.connNode = connNode;
        args.rtsmId = v.Id;
        this.rtsmPanels.set(v.Id, v);
    }
    UnregisterRtsmDetailPanel(args) {
        if (this.rtsmPanels.has(args.rtsmId)) {
            let p = this.rtsmPanels.get(args.rtsmId);
            let v = p.webViewPanel;
            p.dispose();
            this.rtsmPanels.delete(args.rtsmId);
            return v;
        }
        return null;
    }
    FindMasterRtsmMasterPanelForConnUniqueId(connUniqueId) {
        for (let s of this.rtsmPanels.values()) {
            if (s.connNode) {
                if (s.Type === RtsmPanelType.MASTER && s.connNode.connectionUniqueId === connUniqueId)
                    return s;
            }
        }
        return null;
    }
    async PromptRtsmWarning() {
        let configurationTarget = vscode.ConfigurationTarget.Global;
        let workspaceFolder = undefined;
        let rtsmSettings = settings_1.Settings.getRealTimeSqlMonitoringSettings(configurationTarget, workspaceFolder);
        if (!rtsmSettings.showLicenseDialog)
            return true;
        const dontShow = localizedConstants_1.default.rtsmSqlExecutionLicenseDontShowMessage;
        const ch = [
            {
                label: dontShow,
                value: false
            },
            {
                name: localizedConstants_1.default.messageOk,
                value: false
            },
            {
                name: localizedConstants_1.default.messageCancel,
                value: false
            }
        ];
        const questions = [];
        questions.push({
            type: "confirmWithCheckBox",
            name: localizedConstants_1.default.rtsmSqlExecutionLicenseTitle,
            message: localizedConstants_1.default.rtsmSqlExecutionLicenseMessage,
            shouldPrompt: () => true,
            choices: ch,
            onAnswered: (value) => {
                if (value != undefined && value != null && value.length > 0) {
                    value = null;
                }
            }
        });
        await this.prompter.prompt(questions, true);
        if (ch[0].value === true) {
            let configurationTarget = vscode.ConfigurationTarget.Global;
            let workspaceFolder = undefined;
            settings_1.Settings.updateConfigValue(constants_1.Constants.rtsmShowLicenseDialog, false, configurationTarget, workspaceFolder);
        }
        return ch[1].value === true;
    }
    async PromptRtsmWarningForConnectionNode(connNode) {
        let configurationTarget = vscode.ConfigurationTarget.Global;
        let workspaceFolder = undefined;
        let rtsmSettings = settings_1.Settings.getRealTimeSqlMonitoringSettings(configurationTarget, workspaceFolder);
        if (!rtsmSettings.showLicenseDialog)
            return true;
        if (connNode.connBanner === null) {
            let isConnected = await this.ConnectToDatabase(connNode);
            if (isConnected === true) {
                let conn = await OracleConnectionProxyNamespace.OracleConnectionProxy.CreateConnectionFromConnectionNode(connNode);
                let result = await conn.Open();
                if (result)
                    connNode.connBanner = await conn.banner;
            }
        }
        let cb = connNode.connBanner;
        if (cb && cb.includes(constants_1.Constants.freeReleaseDbBannerText))
            return true;
        const dontShow = localizedConstants_1.default.rtsmSqlExecutionLicenseDontShowMessage;
        const ch = [
            {
                label: dontShow,
                value: false
            },
            {
                name: localizedConstants_1.default.messageOk,
                value: false
            },
            {
                name: localizedConstants_1.default.messageCancel,
                value: false
            }
        ];
        const questions = [];
        questions.push({
            type: "confirmWithCheckBox",
            name: localizedConstants_1.default.rtsmSqlExecutionLicenseTitle,
            message: localizedConstants_1.default.rtsmSqlExecutionLicenseMessage,
            shouldPrompt: () => true,
            choices: ch,
            onAnswered: (value) => {
                if (value != undefined && value != null && value.length > 0) {
                    value = null;
                }
            }
        });
        await this.prompter.prompt(questions, true);
        if (ch[0].value === true) {
            let configurationTarget = vscode.ConfigurationTarget.Global;
            let workspaceFolder = undefined;
            settings_1.Settings.updateConfigValue(constants_1.Constants.rtsmShowLicenseDialog, false, configurationTarget, workspaceFolder);
        }
        return ch[1].value === true;
    }
    async handleRtsmRequestMessage(message) {
        try {
            switch (message.command) {
                case "detail_report":
                    return this.onRealTimeSqlMonitoringDetail(message);
                case "statement_detail_report":
                    return this.onRealTimeSqlMonitoringStatementDetailReport(message);
                case "refresh_master_table":
                    return this.onRefreshRealTimeSqlMonitoring(message);
                case "save_report":
                    return this.onSaveRealTimeSqlMonitoringReport(message);
                case "retrieve_statement_info":
                    return this.onRetrieveStatementInfo(message);
                case "get_task_completion_status":
                    return this.onGetTaskCompletionStatus(message);
                case "disable_show_license_dialog":
                    return this.onDisableShowLicenseDialog();
                case "update_master_table_parameters":
                    return this.onUpdateMasterTableParameters(message);
                default:
                    break;
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(error);
            fileLogger.info("Error on Real-Time SQL Monitoring");
            fileLogger.error(error);
            helper.logErroAfterValidating(error);
        }
    }
    async onUpdateMasterTableParameters(message) {
        let t = this.tableSettings;
        t.active_since_sec = message.active_since_sec;
        t.refresh_interval = message.refresh_interval;
        t.top_n_rankby = message.top_n_rankby;
    }
    onDisableShowLicenseDialog() {
        let configurationTarget = vscode.ConfigurationTarget.Global;
        let workspaceFolder = undefined;
        settings_1.Settings.updateConfigValue(constants_1.Constants.rtsmShowLicenseDialog, false, configurationTarget, workspaceFolder);
    }
    async onRealTimeSqlMonitoring(connNode) {
        try {
            let res = await this.PromptRtsmWarning();
            if (!res)
                return;
            let r = this.FindMasterRtsmMasterPanelForConnUniqueId(connNode.connectionUniqueId);
            if (!r) {
                r = await this.OpenRtsmMasterPanel("", connNode, JSON.stringify(this.tableSettings));
            }
            if (r) {
                r.webViewPanel.reveal(r.webViewPanel.viewColumn, false);
            }
        }
        catch (err) {
            fileLogger.info("Error on Real Time SQL Monitoring");
            helper.logErroAfterValidating(err);
        }
    }
    async ConnectToDatabase(connNode) {
        let isConnected = false;
        if (connNode) {
            switch (connNode.status) {
                case connectionNode_1.ConnectionStatus.Disconnected:
                case connectionNode_1.ConnectionStatus.Connecting:
                case connectionNode_1.ConnectionStatus.Errored:
                    isConnected = await connNode.connectToDatabase();
                    break;
                case connectionNode_1.ConnectionStatus.Connected:
                    isConnected = true;
                    break;
            }
            ;
        }
        return isConnected;
    }
    async onRefreshRealTimeSqlMonitoring(message) {
        let id = message.rtsmId;
        if (!this.rtsmPanels.has(id))
            return;
        let r = this.rtsmPanels.get(id);
        try {
            let connected = await r.ConnectToDatabase();
            if (connected) {
                let conn = await r.Connection;
                let result = await conn.Open();
                if (result) {
                    let a = message.active_since_sec ? message.active_since_sec : "3600";
                    let b = message.top_n_rankby ? message.top_n_rankby : "LAST_ACTIVE_TIME";
                    let pars = [
                        {
                            parameterName: "1",
                            direction: "Input",
                            oracleDbType: "Int64",
                            value: a
                        },
                        {
                            parameterName: "2",
                            direction: "Input",
                            oracleDbType: "Varchar2",
                            value: b
                        }
                    ];
                    let x = await conn.ExecuteGetSingleValue(rtsmQueries_1.RTSMQueries.s_cGetRTSMList_XML, pars);
                    r.webViewPanel.webview.postMessage({ command: "refresh_master_table", data: x });
                }
            }
            else {
                let s = `Not connected to database`;
                vscode.window.showErrorMessage(s);
                throw Error(s);
            }
        }
        catch (err) {
            fileLogger.info("Error on Real-Time SQL Monitoring");
            helper.logErroAfterValidating(err);
            r.webViewPanel.webview.postMessage({ command: "execution_error", data: err.message ? err.message : err });
            throw err;
        }
    }
    async onRetrieveStatementInfo(message) {
        let id = message.rtsmId;
        if (!this.rtsmPanels.has(id))
            return;
        let r = this.rtsmPanels.get(id);
        try {
            let connected = await r.ConnectToDatabase();
            if (connected) {
                let conn = await r.Connection;
                let result = await conn.Open();
                if (result) {
                    let pars = [
                        {
                            parameterName: "1",
                            direction: "Input",
                            oracleDbType: "Varchar2",
                            value: `%${message.rtsmExecutionId}%`
                        }
                    ];
                    let s = await conn.ExecuteGetSingleList(rtsmQueries_1.RTSMQueries.s_GetStatementInfo, pars);
                    r.webViewPanel.webview.postMessage({ command: "retrieve_statement_info", data: s });
                }
            }
            else {
                let s = `Not connected to database`;
                vscode.window.showErrorMessage(s);
                throw Error(s);
            }
        }
        catch (err) {
            fileLogger.info("Error on Real-Time SQL Monitoring");
            helper.logErroAfterValidating(err);
            r.webViewPanel.webview.postMessage({ command: "execution_error", data: err.message ? err.message : err });
            throw err;
        }
    }
    async onGetTaskCompletionStatus(message) {
        let id = message.rtsmId;
        if (!this.rtsmPanels.has(id))
            return;
        let r = this.rtsmPanels.get(id);
        try {
            let connected = await r.ConnectToDatabase();
            if (connected) {
                let conn = await r.Connection;
                let result = await conn.Open();
                if (result) {
                    let s = await this.getTaskCompletionStatus(conn, message);
                    r.webViewPanel.webview.postMessage({ command: "get_task_completion_status", data: s });
                }
            }
            else {
                let s = `Not connected to database`;
                vscode.window.showErrorMessage(s);
                throw Error(s);
            }
        }
        catch (err) {
            fileLogger.info("Error on Real-Time SQL Monitoring");
            helper.logErroAfterValidating(err);
            r.webViewPanel.webview.postMessage({ command: "execution_error", data: err.message ? err.message : err });
            throw err;
        }
    }
    async onSaveRealTimeSqlMonitoringReport(message) {
        if (message.sqlId === null) {
            vscode.window.showWarningMessage(localizedConstants_1.default.rtsmSaveWarningMessage);
            return;
        }
        let id = message.rtsmId;
        if (!this.rtsmPanels.has(id))
            return;
        let r = this.rtsmPanels.get(id);
        try {
            let connected = await r.ConnectToDatabase();
            if (connected) {
                let conn = await r.Connection;
                let result = await conn.Open();
                if (result) {
                    let pars = [
                        {
                            parameterName: "sql_id",
                            direction: "Input",
                            oracleDbType: "Varchar2",
                            value: message.sqlId
                        },
                        {
                            parameterName: "sql_exec_id",
                            direction: "Input",
                            oracleDbType: "Decimal",
                            value: message.sqlExecId
                        },
                        {
                            parameterName: "sql_exec_start",
                            direction: "Input",
                            oracleDbType: "Date",
                            value: message.sqlExecStart
                        },
                        {
                            parameterName: "type",
                            direction: "Input",
                            oracleDbType: "Varchar2",
                            value: message.saveReportType
                        },
                    ];
                    let s = await conn.ExecuteGetSingleValue(rtsmQueries_1.RTSMQueries.s_cGetRTSMReport_Id_ExecId_Start, pars);
                    const options = {};
                    options.filters = {};
                    let fileFormats;
                    switch (message.saveReportType) {
                        case "TEXT":
                            fileFormats = ["txt"];
                            break;
                        case "XML":
                            fileFormats = ["xml"];
                            break;
                        case "HTML":
                        case "ACTIVE":
                            fileFormats = ["html"];
                            break;
                        default:
                            fileFormats = ["*"];
                            break;
                    }
                    options.filters[message.saveReportType] = fileFormats;
                    let response = await vscode.window.showSaveDialog(options);
                    if (response) {
                        await vscode.workspace.fs.writeFile(response, new TextEncoder().encode(s));
                    }
                    else {
                        throw "Failed to save report";
                    }
                }
            }
            else {
                let s = `Not connected to database`;
                vscode.window.showErrorMessage(s);
                throw Error(s);
            }
        }
        catch (err) {
            fileLogger.info("Error on Real-Time SQL Monitoring");
            helper.logErroAfterValidating(err);
            r.webViewPanel.webview.postMessage({ command: "execution_error", data: err.message ? err.message : err });
            throw err;
        }
    }
    async onRealTimeSqlMonitoringDetail(message) {
        let id = message.rtsmId;
        if (!this.rtsmPanels.has(id))
            return;
        let r = this.rtsmPanels.get(id);
        try {
            let panel = await this.OpenRTSMPanel(r, message);
            await this.refreshPanelDetailedInformation(panel, message);
        }
        catch (err) {
            fileLogger.info("Error on Real-Time SQL Monitoring");
            helper.logErroAfterValidating(err);
            r.webViewPanel.webview.postMessage({ command: "execution_error", data: err.message ? err.message : err });
            throw err;
        }
    }
    async onRealTimeSqlMonitoringStatementDetailReport(message) {
        let id = message.rtsmId;
        if (!this.rtsmPanels.has(id))
            return;
        let r = this.rtsmPanels.get(id);
        try {
            let connected = await r.ConnectToDatabase();
            if (connected) {
                let conn = await r.Connection;
                let result = await conn.Open();
                if (result) {
                    let pars = [
                        {
                            parameterName: "sql_id",
                            direction: "Input",
                            oracleDbType: "Varchar2",
                            value: message.sqlId
                        },
                        {
                            parameterName: "sql_exec_id",
                            direction: "Input",
                            oracleDbType: "Decimal",
                            value: message.sqlExecId
                        },
                        {
                            parameterName: "sql_exec_start",
                            direction: "Input",
                            oracleDbType: "Date",
                            value: message.sqlExecStart
                        },
                        {
                            parameterName: "type",
                            direction: "Input",
                            oracleDbType: "Varchar2",
                            value: "ACTIVE"
                        },
                    ];
                    let s = await conn.ExecuteGetSingleValue(rtsmQueries_1.RTSMQueries.s_cGetRTSMReport_Id_ExecId_Start, pars);
                    let s1;
                    let pos;
                    s1 = "</head>";
                    pos = s.indexOf(s1) + s1.length;
                    s = [s.slice(0, pos), "<style>iframe{overflow: scroll; overflow-clip-margin: unset; width: 100vw; height:100vh;}</style>", s.slice(pos)].join(' ');
                    r.webViewPanel.title = `${localizedConstants_1.default.rtsmDetailUITitle} ${r.connNode.nodeLabel}:${message.sqlId}:${message.sqlExecId}`;
                    r.webViewPanel.webview.postMessage({ command: "statement_detail_report", data: s });
                }
            }
            else {
                let s = `Not connected to database`;
                vscode.window.showErrorMessage(s);
                throw Error(s);
            }
        }
        catch (err) {
            fileLogger.info("Error on Real-Time SQL Monitoring");
            helper.logErroAfterValidating(err);
            r.webViewPanel.webview.postMessage({ command: "execution_error", data: err.message ? err.message : err });
            throw err;
        }
    }
    async getTaskCompletionStatus(conn, message) {
        let pars = [
            {
                parameterName: "sql_id",
                direction: "Input",
                oracleDbType: "Varchar2",
                value: message.sqlId
            },
            {
                parameterName: "sql_exec_id",
                direction: "Input",
                oracleDbType: "Decimal",
                value: message.sqlExecId
            },
            {
                parameterName: "sql_exec_start",
                direction: "Input",
                oracleDbType: "Date",
                value: message.sqlExecStart
            }
        ];
        let status = await conn.ExecuteGetSingleValue(rtsmQueries_1.RTSMQueries.s_cGetRTSMTaskStatus, pars);
        return status;
    }
    async refreshPanelDetailedInformation(panel, message, refreshTimerId = null) {
        let connected = await panel.ConnectToDatabase();
        if (connected) {
            let conn = await panel.Connection;
            let result = await conn.Open();
            if (result) {
                let status = await this.getTaskCompletionStatus(conn, message);
                if (status === 'EXECUTING' || status === 'QUEUED') {
                    if (refreshTimerId === null) {
                        refreshTimerId = setInterval(async () => {
                            this.refreshPanelDetailedInformation(panel, message, refreshTimerId);
                        }, 60000);
                    }
                }
                else {
                    if (refreshTimerId !== null) {
                        clearInterval(refreshTimerId);
                    }
                }
                await this.getPanelDetailedInformation(panel, conn, message);
            }
        }
    }
    async getPanelDetailedInformation(panel, conn, message) {
        try {
            let pars = [
                {
                    parameterName: "sql_id",
                    direction: "Input",
                    oracleDbType: "Varchar2",
                    value: message.sqlId
                },
                {
                    parameterName: "sql_exec_id",
                    direction: "Input",
                    oracleDbType: "Decimal",
                    value: message.sqlExecId
                },
                {
                    parameterName: "sql_exec_start",
                    direction: "Input",
                    oracleDbType: "Date",
                    value: message.sqlExecStart
                },
                {
                    parameterName: "type",
                    direction: "Input",
                    oracleDbType: "Varchar2",
                    value: "ACTIVE"
                },
            ];
            let s = await conn.ExecuteGetSingleValue(rtsmQueries_1.RTSMQueries.s_cGetRTSMReport_Id_ExecId_Start, pars);
            let s1 = "</head>";
            let pos = s.indexOf(s1) + s1.length;
            s = [s.slice(0, pos), "<style>iframe{overflow: scroll; overflow-clip-margin: unset; width: 100vw; height:100vh;}</style>", s.slice(pos)].join(' ');
            panel.webViewPanel.webview.html = s;
        }
        catch (err) {
            let s1 = `<style> div {white-space: pre-line;; color: var(--vscode-editorWarning-foreground);}</style><div>${err.message ? err.message : err.toString()}</div>`;
            panel.webViewPanel.webview.html = s1;
        }
    }
    async OpenRtsmMasterPanel1(uri, connNode, sData) {
        const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
        args.uri = uri;
        args.executionId = (++this.scriptExecutionCommandHandler.scriptExecutionCount).toString();
        args.windowUri = `${constants_1.Constants.rtsmMasterWindowUri}_${connNode.connectionURI}`;
        args.uiMode = scriptExecutionModels_1.UIDisplayMode.RealTimeSqlMonitoringMaster;
        args.windowTitle = `${localizedConstants_1.default.rtsmMasterUITitle} for ${connNode.nodeLabel}`;
        args.configurationTarget = vscode.ConfigurationTarget.Global;
        args.modelParameters = sData;
        if (connNode) {
            args.rtsmId = connNode.connectionUniqueId;
            args.configurationTarget = connNode.connectionProperties.configurationTarget;
            args.workspaceFolderUri = connNode.connectionProperties.workspaceFolder?.name;
        }
        let p = await this.openRtsmMasterPanel(args);
        let v = new RtsmPanel(RtsmPanelType.MASTER);
        v.webViewPanel = p;
        v.creationArgs = args;
        this.rtsmPanels.set(args.rtsmId, v);
        return p;
    }
    async OpenRtsmMasterPanel(uri, connNode, sData) {
        let v = new RtsmPanel(RtsmPanelType.MASTER);
        const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
        args.uri = uri;
        args.executionId = (++this.scriptExecutionCommandHandler.scriptExecutionCount).toString();
        args.windowUri = `${constants_1.Constants.rtsmMasterWindowUri}_${connNode.connectionURI}`;
        args.uiMode = scriptExecutionModels_1.UIDisplayMode.RealTimeSqlMonitoringMaster;
        args.windowTitle = `${localizedConstants_1.default.rtsmMasterUITitle} for ${connNode.nodeLabel}`;
        args.configurationTarget = vscode.ConfigurationTarget.Global;
        args.modelParameters = sData;
        args.configurationTarget = connNode.connectionProperties.configurationTarget;
        args.workspaceFolderUri = connNode.connectionProperties.workspaceFolder?.name;
        args.rtsmId = v.Id;
        let panel = vscode.window.createWebviewPanel("Real Time SQL Monitoring", args.windowTitle, vscode.ViewColumn.Active, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        panel.title = args.windowTitle;
        panel.webview.html = scriptExcutionCommandHandler_1.ScriptExecutionCommandHandler.generateHtml(this.vscodeConnector, args, panel);
        panel.onDidDispose(() => {
            resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
            if (this.rtsmPanels.has(args.rtsmId)) {
                let p = this.rtsmPanels.get(args.rtsmId);
                p.dispose();
                this.rtsmPanels.delete(args.rtsmId);
            }
        }, undefined, this.vscodeConnector.ExtensionContext.subscriptions);
        panel.onDidChangeViewState((e) => {
            if (e && e.webviewPanel) {
                if (e.webviewPanel.active && e.webviewPanel.visible) {
                    fileLogger.info("Real Time SQL Monitoring Master Table page is active and visible");
                    this.statusbarManager.onActiveTextEditorChanged(undefined);
                    oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(null);
                }
            }
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, args.windowUri, args.executionId);
        let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri, args.executionId);
        clients.forEach(client => {
            resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
        });
        v.webViewPanel = panel;
        v.creationArgs = args;
        v.connNode = connNode;
        this.rtsmPanels.set(v.Id, v);
        return v;
    }
    async OpenRTSMPanel(masterPanel, message) {
        const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
        let connNode = masterPanel.connNode;
        args.uri = "";
        args.executionId = (++this.scriptExecutionCommandHandler.scriptExecutionCount).toString();
        args.windowUri = constants_1.Constants.rtsmDetailWindowUri;
        args.uiMode = scriptExecutionModels_1.UIDisplayMode.None;
        args.windowTitle = `${localizedConstants_1.default.rtsmDetailUITitle} ${connNode.nodeLabel}:${message.sqlId}:${message.sqlExecId}`;
        args.configurationTarget = vscode.ConfigurationTarget.Global;
        args.isCreate = true;
        if (connNode) {
            args.configurationTarget = connNode.connectionProperties.configurationTarget;
            args.workspaceFolderUri = connNode.connectionProperties.workspaceFolder?.name;
        }
        let v = new RtsmPanel(RtsmPanelType.DETAIL);
        v.webViewPanel = await this.openRTSMPanel(args);
        v.creationArgs = args;
        v.connNode = connNode;
        args.rtsmId = v.Id;
        this.rtsmPanels.set(v.Id, v);
        return v;
    }
    async openRtsmMasterPanel(args) {
        let panel = vscode.window.createWebviewPanel("Real-Time SQL Monitoring", args.windowTitle, vscode.ViewColumn.Active, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        panel.title = args.windowTitle;
        panel.webview.html = scriptExcutionCommandHandler_1.ScriptExecutionCommandHandler.generateHtml(this.vscodeConnector, args, panel);
        panel.onDidDispose(() => {
            resultsDataServer_1.ResultDataServer.instanceSingle.unRegisterClient(args.windowUri);
            this.rtsmPanels.delete(args.rtsmId);
        }, undefined, this.vscodeConnector.ExtensionContext.subscriptions);
        panel.onDidChangeViewState((e) => {
            if (e && e.webviewPanel) {
                if (e.webviewPanel.active && e.webviewPanel.visible) {
                    fileLogger.info("Real-Time SQL Monitoring Master Table page is active and visible");
                    this.statusbarManager.onActiveTextEditorChanged(undefined);
                    oracleEditorManager_1.default.instance.handleExecutionStatusChangeInResultUI(null);
                }
            }
        });
        panel.reveal(panel.viewColumn, false);
        resultsDataServer_1.ResultDataServer.instanceSingle.registerResultUI(panel, args.windowUri, args.executionId);
        let clients = resultsDataServer_1.ResultDataServer.instanceSingle.getClientInfo(args.windowUri, args.executionId);
        clients.forEach(client => {
            resultsDataServer_1.ResultDataServer.instanceSingle.AssociateJavaScriptEventWithWindow(panel, client);
        });
        return panel;
    }
    async openRTSMPanel(args) {
        let panel = vscode.window.createWebviewPanel("RTSM Panel", args.windowTitle, vscode.ViewColumn.Active, {
            enableScripts: true,
            enableForms: true,
            enableCommandUris: true,
            retainContextWhenHidden: true,
        });
        panel.webview.html =
            `<div class="oj-flex oj-sm-align-items-start oj-sm-flex-direction-column">
        <oj-bind-text value="Retrieving detailed active report"></oj-bind-text>
        <oj-progress-circle style="margin: 10px; align-self: center;color: blue;" size="md" value="-1"></oj-progress-circle>
      </div>`;
        panel.reveal();
        return panel;
    }
}
exports.RealTimeSqlMonitorServiceProvider = RealTimeSqlMonitorServiceProvider;
_a = RealTimeSqlMonitorServiceProvider;
RealTimeSqlMonitorServiceProvider.dispose = async () => {
    if (RealTimeSqlMonitorServiceProvider.varInstance && !RealTimeSqlMonitorServiceProvider.varInstance.disposed) {
        RealTimeSqlMonitorServiceProvider.varInstance.disposed = true;
        RealTimeSqlMonitorServiceProvider.varInstance = null;
    }
};
