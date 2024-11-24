"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleConnectionProxy = exports.OracleConnectionProxyInfo = void 0;
const oracleLanguageServerClient_1 = require("../../infrastructure/oracleLanguageServerClient");
const HelperNamespace = require("../../utilities/helper");
const OracleConnectionProxyRequestsNamespace = require("./oracleConnectionProxyRequests");
const connectionNode_1 = require("../../explorer/nodes/connectionNode");
const connectionCommandsScenarioManager_1 = require("../../connectionManagement/connectionCommandsScenarioManager");
const oracleConnectionProxyConstants_1 = require("./oracleConnectionProxyConstants");
const process = require("process");
const constants_1 = require("../../constants/constants");
class OracleConnectionProxyInfo {
}
exports.OracleConnectionProxyInfo = OracleConnectionProxyInfo;
class OracleConnectionProxy {
    constructor(n, t) {
        this._isCloudDB = null;
        this._isDBA = null;
        this._isSYS = null;
        this._isExportPriviledged = null;
        this._isImportPriviledged = null;
        this._serverHost = null;
        this._isLocalHost = null;
        this._hasDbmsCloudPackage = null;
        this._hasUtlFileAccess = null;
        this._timezoneVersion = null;
        this._dbVersion = null;
        this._banner = null;
        this._isFreeDb = null;
        this._sysDate = null;
        this._user = null;
        this._connectionInfo = n;
        this._type = t;
        this._client = oracleLanguageServerClient_1.OracleLanguageServerClient.instance;
    }
    get name() {
        return this._connectionInfo.name;
    }
    get Id() {
        return this._connectionInfo.id;
    }
    get connectionInfo() {
        return this._connectionInfo;
    }
    get type() {
        return this._type;
    }
    get isCloudDB() {
        return (async () => {
            try {
                if (this._isCloudDB === null) {
                    let s = await this.ExecuteGetSingleValue(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vIsCloudDBQuery);
                    this._isCloudDB = !this.isNullOrWhitespace(s);
                }
            }
            catch (e) {
                this._isCloudDB = null;
            }
            return this._isCloudDB;
        })();
    }
    get isDBA() {
        return (async () => {
            try {
                if (this._isDBA === null) {
                    let s = await this.ExecuteGetSingleValue(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vDbaPrivilegeQuery);
                    this._isDBA = (s !== null);
                }
            }
            catch (e) {
                this._isDBA = null;
            }
            return this._isDBA;
        })();
    }
    get isSYS() {
        return (async () => {
            try {
                if (this._isSYS === null) {
                    let s = await this.ExecuteGetSingleValue(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vSysPrivilegeQuery);
                    this._isSYS = (s !== null);
                }
            }
            catch (e) {
                this._isSYS = null;
            }
            return this._isSYS;
        })();
    }
    get isExportPriviledged() {
        return (async () => {
            try {
                if (this._isExportPriviledged === null) {
                    let s = await this.ExecuteGetSingleValue(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vIsExportPrivilegedQuery);
                    this._isExportPriviledged = (s !== null);
                }
            }
            catch (e) {
                this._isExportPriviledged = null;
            }
            return this._isExportPriviledged;
        })();
    }
    get isImportPriviledged() {
        return (async () => {
            try {
                if (this._isImportPriviledged === null) {
                    let s = await this.ExecuteGetSingleValue(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vIsImportPrivilegedQuery);
                    this._isImportPriviledged = (s !== null);
                }
            }
            catch (e) {
                this._isImportPriviledged = null;
            }
            return this._isImportPriviledged;
        })();
    }
    get serverHost() {
        return (async () => {
            try {
                if (this._serverHost === null) {
                    let s = await this.ExecuteGetScalar(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vServerHostQuery);
                    this._serverHost = s;
                }
            }
            catch (e) {
                this._serverHost = null;
            }
            return this._serverHost;
        })();
    }
    get isLocalHost() {
        return (async () => {
            try {
                if (this._isLocalHost === null) {
                    let s = await this.serverHost;
                    let hn = process.env['HOST'];
                    this._isLocalHost = s.localeCompare(hn, undefined, { sensitivity: 'accent' }) === 0;
                }
            }
            catch (e) {
                this._isLocalHost = null;
            }
            return this._isLocalHost;
        })();
    }
    get hasDbmsCloudPackage() {
        return (async () => {
            try {
                if (this._hasDbmsCloudPackage === null) {
                    let pars = [
                        {
                            parameterName: "1",
                            direction: "Input",
                            oracleDbType: "Varchar2",
                            value: "PACKAGE"
                        },
                        {
                            parameterName: "2",
                            direction: "Input",
                            oracleDbType: "Varchar2",
                            value: "DBMS_CLOUD"
                        },
                    ];
                    let s = await this.ExecuteGetSingleValue(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vHasObjectQuery, pars);
                    this._hasDbmsCloudPackage = (s === null) ? false : true;
                }
            }
            catch (e) {
                this._hasDbmsCloudPackage = null;
            }
            return this._hasDbmsCloudPackage;
        })();
    }
    get hasUtlFileAccess() {
        return (async () => {
            try {
                if (this._hasUtlFileAccess === null) {
                    await this.ExecuteNonQuery(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vHasUtlFileAccessQuery)
                        .then(() => {
                        this._hasUtlFileAccess = true;
                    }, () => {
                        this._hasUtlFileAccess = false;
                    });
                }
            }
            catch (e) {
                this._hasUtlFileAccess = null;
            }
            return this._hasUtlFileAccess;
        })();
    }
    get timezoneVersion() {
        return (async () => {
            try {
                if (this._timezoneVersion === null) {
                    let s = await this.ExecuteGetSingleValue(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vGetTimezoneVersionQuery);
                    this._timezoneVersion = s;
                }
            }
            catch (e) {
                this._timezoneVersion = null;
            }
            return this._timezoneVersion;
        })();
    }
    get dbVersion() {
        return (async () => {
            try {
                if (this._dbVersion === null) {
                    this._dbVersion = await this.GetServerVersion();
                }
            }
            catch (e) {
                this._dbVersion = null;
            }
            return this._dbVersion;
        })();
    }
    get banner() {
        return (async () => {
            try {
                if (this._banner === null) {
                    this._banner = await this.ExecuteGetSingleValue(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vGetBannerQuery);
                }
            }
            catch (e) {
                this._banner = null;
            }
            return this._banner;
        })();
    }
    get isFreeDb() {
        return (async () => {
            try {
                if (this._isFreeDb === null) {
                    let b = await this.banner;
                    if (b !== null) {
                        this._isFreeDb = b.includes(constants_1.Constants.freeReleaseDbBannerText);
                    }
                }
            }
            catch (e) {
                this._isFreeDb = null;
            }
            return this._isFreeDb;
        })();
    }
    get sysDate() {
        return (async () => {
            try {
                if (this._sysDate === null) {
                    let s = await this.ExecuteGetSingleValue(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vSysDateQuery);
                    this._sysDate = s;
                }
            }
            catch (e) {
                this._sysDate = null;
            }
            return this._sysDate;
        })();
    }
    get user() {
        return (async () => {
            try {
                if (this._user === null) {
                    let s = await this.ExecuteGetScalar(oracleConnectionProxyConstants_1.OracleConnectionProxyConstants.s_vUserQuery);
                    this._user = s;
                }
            }
            catch (e) {
                this._user = null;
            }
            return this._user;
        })();
    }
    isNullOrWhitespace(input) {
        return !input || !input.trim();
    }
    static async CreateConnection(n, t) {
        let c = new OracleConnectionProxy(n, t);
        return c.Create();
    }
    static async CreateConnectionFromConnectionNode(connNode, t = 1) {
        let v = connNode.connectionProperties;
        let ci = {
            name: v.name,
            id: connNode.connectionURI,
            connectionProperties: connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(v),
        };
        return this.CreateConnection(ci, t);
    }
    static async CreateConnectionStringCredentialsFromConnectionNode(connNode, driver, format) {
        let cp = connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.createNameValueConnectionProperties(connNode.connectionProperties);
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "createConnectionStringCredentials";
            params.payLoad = {
                'connectionProperties': cp,
                'driver': driver,
                'format': format
            };
            let response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(response.error);
            }
            else {
                return response.result;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            throw err;
        }
    }
    async Create() {
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "createConnection";
            params.payLoad = {
                'connectionProperties': this._connectionInfo.connectionProperties,
                'id': this._connectionInfo.id
            };
            let response = await this._client.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(response.error);
            }
            else {
                this._connectionInfo.id = response.result;
                return this;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            throw err;
        }
    }
    async Open() {
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "openConnection";
            params.payLoad = {
                'connectionId': this.Id
            };
            let response = await this._client.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(`Connection Open() failed:\n${response.error}`);
            }
            else {
                return true;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            return false;
        }
    }
    async Close() {
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "closeConnection";
            params.payLoad = {
                'connectionId': this.Id
            };
            let response = await this._client.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(`Connection Close() failed:\n${response.error}`);
            }
            else {
                return true;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            return false;
        }
    }
    async Dispose() {
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "disposeConnection";
            params.payLoad = {
                'connectionId': this.Id
            };
            let response = await this._client.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(`Connection Dispose() failed:\n${response.error}`);
            }
            else {
                return true;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            return false;
        }
    }
    async GetConnectionStatus() {
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "getConnectionStatus";
            params.payLoad = {
                'connectionId': this.Id
            };
            let response = await this._client.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(`Connection GetConnectionStatus() failed:\n${response.error}`);
            }
            else {
                return response.result;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            throw err;
        }
    }
    async GetServerVersion() {
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "getServerVersion";
            params.payLoad = {
                'connectionId': this.Id
            };
            let response = await this._client.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(`Connection GetServerVersion() failed:\n${response.error}`);
            }
            else {
                return response.result;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            throw err;
        }
    }
    async ExecuteGetSingleList(query, qParams) {
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "executeGetSingleList";
            params.payLoad = {
                'connectionId': this.Id,
                'query': query,
                'parameters': qParams,
            };
            let response = await this._client.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(`Connection ExecuteGetSingleList() failed:\n${response.error}`);
            }
            else {
                return response.result;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            throw err;
        }
    }
    async ExecuteGetSingleValue(query, qParams) {
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "executeGetSingleValue";
            params.payLoad = {
                'connectionId': this.Id,
                'query': query,
                'parameters': qParams,
            };
            let response = await this._client.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(`Connection ExecuteGetSingleValue() failed:\n${response.error}`);
            }
            else {
                return response.result;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            throw err;
        }
    }
    async ExecuteGetScalar(query, qParams) {
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "executeGetScalar";
            params.payLoad = {
                'connectionId': this.Id,
                'query': query,
                'parameters': qParams,
            };
            let response = await this._client.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(`Connection ExecuteGetSingleValue() failed:\n${response.error}`);
            }
            else {
                return response.result;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            throw err;
        }
    }
    async ExecuteNonQuery(query, qParams) {
        try {
            let params = new OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequestParameters();
            params.command = "executeNonQuery";
            params.payLoad = {
                'connectionId': this.Id,
                'query': query,
                'parameters': qParams,
            };
            let response = await this._client.sendRequest(OracleConnectionProxyRequestsNamespace.OracleConnectionProxyRequest.type, params);
            if (!response.success) {
                throw Error(`Connection ExecuteNonQuery() failed:\n${response.error}`);
            }
            else {
                return response.result;
            }
        }
        catch (err) {
            HelperNamespace.logErroAfterValidating(err);
            throw err;
        }
    }
    async TestConnectionFunctionality() {
        let a;
        a = await this.dbVersion;
        a = await this.banner;
        a = await this.hasDbmsCloudPackage;
        a = await this.hasUtlFileAccess;
        a = await this.isCloudDB;
        a = await this.isDBA;
        a = await this.isExportPriviledged;
        a = await this.isImportPriviledged;
        a = await this.isLocalHost;
        a = await this.isSYS;
        a = await this.serverHost;
        a = await this.sysDate;
        a = await this.timezoneVersion;
        a = await this.user;
        const s_cGetRTSMList_XML = `
 select 
  DBMS_SQLTUNE.REPORT_SQL_MONITOR_LIST(
  type=>'XML',
  report_level=>'ALL',
  active_since_sec => :1
) 
from dual`;
        let pars = [
            {
                parameterName: "1",
                direction: "Input",
                oracleDbType: "Int64",
                value: "360000"
            }
        ];
        let x = await this.ExecuteGetSingleValue(s_cGetRTSMList_XML, pars);
        const s_cGetTables = `
  select  * from all_tables
  `;
        let y = await this.ExecuteGetSingleList(s_cGetTables);
    }
    static async TestConnProxyForConnectionNode(connNode) {
        try {
            let id = connNode.connectionUniqueId;
            let isConnected = false;
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
            if (isConnected === true) {
                let conn = await OracleConnectionProxy.CreateConnectionFromConnectionNode(connNode);
                let result = await conn.Open();
                if (result) {
                    await conn.TestConnectionFunctionality();
                }
            }
            else {
                throw Error(`Not connected to database`);
            }
        }
        catch (err) {
            throw err;
        }
    }
}
exports.OracleConnectionProxy = OracleConnectionProxy;
