"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleCSharpCodeGeneration = exports.OracleJavaCodeGeneration = exports.OracleNodeJSCodeGeneration = exports.OraclePythonCodeGeneration = exports.OracleLanguageCodeGeneration = exports.OracleCodeGenerationUtilities = exports.OracleTableViewConstraint = exports.OracleTableViewConstraintColumn = void 0;
const vscode = require("vscode");
const connectionNode_1 = require("../../explorer/nodes/connectionNode");
const adapter_1 = require("../../prompts/adapter");
const question_1 = require("../../prompts/question");
const helper = require("../../utilities/helper");
const oracleConnectionProxy_1 = require("../oracleConnectionProxyService/oracleConnectionProxy");
const oracleCodeGenerationConstants_1 = require("./oracleCodeGenerationConstants");
const oracleCodeGenerationConstants_2 = require("./oracleCodeGenerationConstants");
const dataExplorerRequests_1 = require("../../explorer/dataExplorerRequests");
const formattingModels_1 = require("../../models/formattingModels");
const setup_1 = require("../../utilities/setup");
const formatterSettingsManager_1 = require("../../explorer/formatterSettingsManager");
const oracleLanguageServerClient_1 = require("../oracleLanguageServerClient");
const constants_1 = require("../../constants/constants");
const localizedConstants_1 = require("../../constants/localizedConstants");
class OracleTableViewConstraintColumn {
}
exports.OracleTableViewConstraintColumn = OracleTableViewConstraintColumn;
class OracleTableViewConstraint {
}
exports.OracleTableViewConstraint = OracleTableViewConstraint;
class OracleCodeGenerationUtilities {
    constructor(connector) {
        this.vscodeConnector = undefined;
        this.sqlFormattingRequestParams = undefined;
        this.vscodeConnector = connector;
        let formatConfig = new formattingModels_1.FormatOptions();
        const editorConfig = vscode.workspace.getConfiguration("editor");
        formatConfig.tabSize = editorConfig.get("tabSize");
        formatConfig.insertSpaces = editorConfig.get("insertSpaces");
        const config = setup_1.Setup.getExtensionConfigSection();
        formatConfig.keywordCasing = formatterSettingsManager_1.FormatterSettingsManager.getConfigValues(config.get(constants_1.Constants.intellisenseKeywordCasingPropertyName));
        formatConfig.identifierCasing = formatterSettingsManager_1.FormatterSettingsManager.getConfigValues(config.get(constants_1.Constants.intellisenseObjectNameCasingPropertyName));
        this.sqlFormattingRequestParams = new formattingModels_1.FormatTextRequestParam("", formatConfig, formattingModels_1.FormatType.FormatString);
        this.sqlFormattingRequestParams.selection = {
            startLine: 0,
            startColumn: 0,
            endLine: 0,
            endColumn: 0
        };
    }
    async formatSqlText(ss) {
        this.sqlFormattingRequestParams.text = ss;
        let response = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextRequest.type, this.sqlFormattingRequestParams);
        if (response.formattedText) {
            ss = `\n${response.formattedText}\n`;
        }
        return ss;
    }
    async askUserForCodeGenerationOptions(context, askForLanguage) {
        try {
            const questions = [];
            if (askForLanguage) {
                questions.push({
                    type: question_1.QuestionTypes.expand,
                    choices: oracleCodeGenerationConstants_1.OracleCodeGenerationConstants.s_vCodeGenerationLanguages,
                    placeHolder: localizedConstants_1.default.targetLanguagePlaceholder,
                    name: "codeGenerationLanguage",
                    message: localizedConstants_1.default.targetLanguageMessage,
                    shouldPrompt: () => true,
                    onAnswered: (value) => {
                    }
                });
            }
            ;
            if (questions.length === 0)
                return null;
            let prompter = new adapter_1.default();
            return prompter.prompt(questions, true);
        }
        catch (err) {
            helper.AppUtils.ShowErrorAndLog(err, this.vscodeConnector);
        }
    }
    async getConnectionStringCredentials(connNode, driver, format) {
        return await oracleConnectionProxy_1.OracleConnectionProxy.CreateConnectionStringCredentialsFromConnectionNode(connNode, driver, format);
    }
    checkAllNodesAreFromSameConnection(treeNodes) {
        let cn;
        let cn_temp;
        if (treeNodes[1]) {
            let atn = treeNodes[1];
            for (let ct of atn) {
                cn_temp = this.getConnectionNodeFromTreeNode(ct);
                if (cn) {
                    if (cn !== cn_temp)
                        return false;
                }
                else {
                    cn = cn_temp;
                }
            }
        }
        return true;
    }
    isNodeTableOrView(tn) {
        let ty = tn.ddexObjectType;
        switch (ty) {
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_Table:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTable:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTable:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTable:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_QueueTable:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_View:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalView:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedView:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectView:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLView:
                return true;
            default:
                break;
        }
        return false;
    }
    isNodeTableOrViewColumn(tn) {
        let ty = tn.ddexObjectType;
        switch (ty) {
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_TableColumn:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalTableColumn:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectTableColumn:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLTableColumn:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ViewColumn:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_RelationalViewColumn:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_MaterializedViewColumn:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_ObjectViewColumn:
            case dataExplorerRequests_1.OracleDDEXObjectTypes.OraDDEX_XMLViewColumn:
                return true;
            default:
                break;
        }
        return false;
    }
    checkNodeIsValidCodeGenerationNode(tn) {
        if (this.isNodeTableOrView(tn) || this.isNodeTableOrViewColumn(tn))
            return true;
        else
            return false;
    }
    checkAllNodesAreValidCodeGenerationNodes(treeNodes) {
        if (treeNodes[1]) {
            let atn = treeNodes[1];
            for (let ct of atn) {
                if (!this.checkNodeIsValidCodeGenerationNode(ct))
                    return false;
            }
        }
        else {
            return this.checkNodeIsValidCodeGenerationNode(treeNodes[0]);
        }
        return true;
    }
    getConnectionNodeFromTreeNode(treeNode) {
        let cn = null;
        let tn = treeNode;
        while (tn) {
            if (tn instanceof connectionNode_1.ConnectionNode) {
                cn = tn;
                break;
            }
            else
                tn = tn.parent;
        }
        return cn;
    }
    getSelectedTablesViews(treeNodes) {
        let aliasIndex = 1;
        let tn = treeNodes[0];
        let tables = new Map();
        let dbObject;
        let tAlias;
        let tNode;
        let cNode;
        let key;
        if (treeNodes[1]) {
            let atn = treeNodes[1];
            for (let ct of atn) {
                if (this.isNodeTableOrView(ct)) {
                    tNode = ct;
                    dbObject = tNode.databaseObject;
                    key = `${dbObject.schema}.${dbObject.name}`;
                    if (!tables.has(key)) {
                        tAlias = `t${aliasIndex++}`;
                        tables.set(key, { table_view: dbObject, alias: tAlias });
                    }
                }
                else if (this.isNodeTableOrViewColumn(ct)) {
                    cNode = ct;
                    tNode = cNode.parent;
                    dbObject = tNode.databaseObject;
                    key = `${dbObject.schema}.${dbObject.name}`;
                    if (!tables.has(key)) {
                        tAlias = `t${aliasIndex++}`;
                        tables.set(key, { table_view: dbObject, alias: tAlias });
                    }
                }
            }
        }
        else {
            if (this.isNodeTableOrView(tn)) {
                tNode = tn;
                dbObject = tNode.databaseObject;
                tAlias = `t${aliasIndex++}`;
                key = `${dbObject.schema}.${dbObject.name}`;
                tables.set(key, { table_view: dbObject, alias: tAlias });
            }
            else if (this.isNodeTableOrViewColumn(tn)) {
                cNode = tn;
                tNode = cNode.parent;
                dbObject = tNode.databaseObject;
                tAlias = `t${aliasIndex++}`;
                key = `${dbObject.schema}.${dbObject.name}`;
                tables.set(key, { table_view: dbObject, alias: tAlias });
            }
        }
        return tables;
    }
    getSelectedTablesViewsConstraintsSqlAndParameters(tables) {
        let sql = oracleCodeGenerationConstants_1.OracleCodeGenerationConstants.s_vGetConstraintsSelect;
        let pars = [];
        let paramIndex = 1;
        sql += "(";
        for (let t of tables.values()) {
            sql += `(OWNER = :${paramIndex} \n`;
            pars.push({
                parameterName: `${paramIndex++}`,
                direction: "Input",
                oracleDbType: "Varchar2",
                value: t.table_view.schema
            });
            sql += `AND TABLE_NAME = :${paramIndex}) OR\n`;
            pars.push({
                parameterName: `${paramIndex++}`,
                direction: "Input",
                oracleDbType: "Varchar2",
                value: t.table_view.name
            });
        }
        sql = sql.substring(0, sql.length - 4);
        sql += `) ${oracleCodeGenerationConstants_1.OracleCodeGenerationConstants.s_vGetConstraintsOrderBy}`;
        return { sql, pars };
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
    async getSelectedTablesViewsConstraints(treeNodes) {
        let cons;
        let connNode = this.getConnectionNodeFromTreeNode(treeNodes[0]);
        let isConnected = await this.ConnectToDatabase(connNode);
        if (isConnected === true) {
            let conn = await oracleConnectionProxy_1.OracleConnectionProxy.CreateConnectionFromConnectionNode(connNode);
            let result = await conn.Open();
            let { sql, pars } = this.getSelectedTablesViewsConstraintsSqlAndParameters(this.getSelectedTablesViews(treeNodes));
            cons = await conn.ExecuteGetSingleList(sql, pars);
            conn.Dispose();
        }
        let pairs = this.getForeignKeyPrimaryKeyPairs(cons);
        return cons;
    }
    getForeignKeyPrimaryKeyPairs(cons) {
        let pairs = [];
        let idx = cons.findIndex((val) => val.CONSTRAINT_TYPE === 'P');
        let fks = cons.slice(0, idx);
        let pks = cons.slice(idx);
        let pk;
        for (let fk of fks) {
            pk = pks.find((val) => val.OWNER === fk.R_OWNER && val.CONSTRAINT_NAME === fk.R_CONSTRAINT_NAME && val.TABLE_NAME !== fk.TABLE_NAME);
            if (pk)
                pairs.push({ FK: fk, PK: pk });
        }
        return pairs;
    }
    getRelevantFK_PKConstraints(pairs) {
        let rCons = new Map();
        let c;
        let s;
        for (let p of pairs) {
            c = p.FK;
            s = `${c.OWNER}.${c.CONSTRAINT_NAME}`;
            if (!rCons.has(s))
                rCons.set(s, c);
            c = p.PK;
            s = `${c.OWNER}.${c.CONSTRAINT_NAME}`;
            if (!rCons.has(s))
                rCons.set(s, c);
        }
        return rCons;
    }
    async getRelevantConstraintsColumns(rCons, conn) {
        let sql = oracleCodeGenerationConstants_1.OracleCodeGenerationConstants.s_vGetConstraintsColumnsSelect;
        let pars = [];
        let paramIndex = 1;
        sql += "(";
        for (let t of rCons) {
            sql += `(OWNER = :${paramIndex} \n`;
            pars.push({
                parameterName: `${paramIndex++}`,
                direction: "Input",
                oracleDbType: "Varchar2",
                value: t[1].OWNER
            });
            sql += `AND CONSTRAINT_NAME = :${paramIndex}) OR\n`;
            pars.push({
                parameterName: `${paramIndex++}`,
                direction: "Input",
                oracleDbType: "Varchar2",
                value: t[1].CONSTRAINT_NAME
            });
        }
        sql = sql.substring(0, sql.length - 4);
        sql += `) ${oracleCodeGenerationConstants_1.OracleCodeGenerationConstants.s_vGetConstraintsColumnsOrderBy}`;
        let cols = await conn.ExecuteGetSingleList(sql, pars);
        let s;
        let tc;
        for (let col of cols) {
            s = `${col.OWNER}.${col.CONSTRAINT_NAME}`;
            tc = rCons.get(s);
            if (!tc.COLUMNS)
                tc.COLUMNS = [];
            tc.COLUMNS.push(col);
        }
    }
    getJoinStatementWhereClause(pairs, selectedTables, connSchema, useAliases = true) {
        let fk, pk;
        let s = " WHERE";
        let i;
        let key;
        let tAlias;
        for (let p of pairs) {
            fk = p.FK;
            pk = p.PK;
            for (i = 0; i < fk.COLUMNS.length; i++) {
                if (useAliases) {
                    key = `${fk.OWNER}.${fk.TABLE_NAME}`;
                    tAlias = selectedTables.get(key).alias;
                    s += ` ${tAlias}.${OracleCodeGenerationUtilities.getStringObjectName(fk.COLUMNS[i].COLUMN_NAME)} = `;
                    key = `${pk.OWNER}.${pk.TABLE_NAME}`;
                    tAlias = selectedTables.get(key).alias;
                    s += `${tAlias}.${OracleCodeGenerationUtilities.getStringObjectName(pk.COLUMNS[i].COLUMN_NAME)} AND`;
                }
                else {
                    if (fk.OWNER === connSchema)
                        s += ` ${OracleCodeGenerationUtilities.getStringObjectName(fk.TABLE_NAME)}.${OracleCodeGenerationUtilities.getStringObjectName(fk.COLUMNS[i].COLUMN_NAME)} = `;
                    else
                        s += ` ${OracleCodeGenerationUtilities.getStringObjectName(fk.OWNER)}.${OracleCodeGenerationUtilities.getStringObjectName(fk.TABLE_NAME)}.${OracleCodeGenerationUtilities.getStringObjectName(fk.COLUMNS[i].COLUMN_NAME)} = `;
                    if (pk.OWNER === connSchema)
                        s += `${OracleCodeGenerationUtilities.getStringObjectName(pk.TABLE_NAME)}.${OracleCodeGenerationUtilities.getStringObjectName(pk.COLUMNS[i].COLUMN_NAME)} AND`;
                    else
                        s += `${OracleCodeGenerationUtilities.getStringObjectName(pk.OWNER)}.${OracleCodeGenerationUtilities.getStringObjectName(pk.TABLE_NAME)}.${OracleCodeGenerationUtilities.getStringObjectName(pk.COLUMNS[i].COLUMN_NAME)} AND`;
                }
            }
        }
        s = s.substring(0, s.length - 4);
        return s;
    }
    async getSqlStatement(treeNodes, selectedTables, useAliases = true, useCurrentSchema = true) {
        let s = null;
        let tn = treeNodes[0];
        let connNode = this.getConnectionNodeFromTreeNode(tn);
        let tNode;
        let cNode;
        let key;
        let tAlias;
        let connSchema = useCurrentSchema ? connNode.schemaName : connNode.connectionProperties.userID;
        let children;
        let stc = selectedTables.size;
        let objName;
        if (treeNodes[1]) {
            let atn = treeNodes[1];
            s = "SELECT ";
            for (let ct of atn) {
                if (this.isNodeTableOrView(ct)) {
                    tNode = ct;
                    if (useAliases) {
                        key = `${tNode.databaseObject.schema}.${tNode.databaseObject.name}`;
                        tAlias = selectedTables.get(key).alias;
                    }
                    else {
                        if (connSchema === tNode.databaseObject.schema)
                            tAlias = OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name);
                        else
                            tAlias = `${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.schema)}.${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name)}`;
                    }
                    children = tNode.children ? tNode.children : await tNode.getChildren();
                    for (let c of children) {
                        if (this.isNodeTableOrViewColumn(c)) {
                            cNode = c;
                            if (cNode) {
                                s += `${tAlias}.${OracleCodeGenerationUtilities.getStringObjectName(cNode.databaseObject.name)}, `;
                            }
                        }
                    }
                }
                else if (this.isNodeTableOrViewColumn(ct)) {
                    cNode = ct;
                    tNode = cNode.parent;
                    if (useAliases) {
                        key = `${tNode.databaseObject.schema}.${tNode.databaseObject.name}`;
                        tAlias = selectedTables.get(key).alias;
                    }
                    else {
                        if (connSchema === tNode.databaseObject.schema)
                            tAlias = OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name);
                        else
                            tAlias = `${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.schema)}.${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name)}`;
                    }
                    if (stc === 1)
                        s += `${OracleCodeGenerationUtilities.getStringObjectName(cNode.databaseObject.name)}, `;
                    else
                        s += `${tAlias}.${OracleCodeGenerationUtilities.getStringObjectName(cNode.databaseObject.name)}, `;
                }
            }
            s = s.slice(0, -2);
            s += " FROM ";
            for (const ta of selectedTables) {
                if (connSchema !== ta[1].table_view.schema)
                    s += `${OracleCodeGenerationUtilities.getStringObjectName(ta[1].table_view.schema)}.`;
                if (useAliases) {
                    s += `${OracleCodeGenerationUtilities.getStringObjectName(ta[1].table_view.name)} ${ta[1].alias}, `;
                }
                else {
                    s += `${OracleCodeGenerationUtilities.getStringObjectName(ta[1].table_view.name)}, `;
                }
            }
            s = s.slice(0, -2);
        }
        else {
            if (this.isNodeTableOrView(tn)) {
                tNode = tn;
                let sameSchema = connSchema === tNode.databaseObject.schema;
                s = "SELECT ";
                if (useAliases) {
                    key = `${tNode.databaseObject.schema}.${tNode.databaseObject.name}`;
                    tAlias = selectedTables.get(key).alias;
                }
                else {
                    if (sameSchema)
                        tAlias = OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name);
                    else
                        tAlias = `${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.schema)}.${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name)}`;
                }
                children = tNode.children ? tNode.children : await tNode.getChildren();
                for (let c of children) {
                    if (this.isNodeTableOrViewColumn(c)) {
                        cNode = c;
                        if (cNode) {
                            if (stc === 1)
                                s += `${OracleCodeGenerationUtilities.getStringObjectName(cNode.databaseObject.name)}, `;
                            else
                                s += `${tAlias}.${OracleCodeGenerationUtilities.getStringObjectName(cNode.databaseObject.name)}, `;
                        }
                    }
                }
                s = s.slice(0, -2);
                s += " FROM ";
                if (useAliases) {
                    if (!sameSchema)
                        s += `${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.schema)}.`;
                    s += `${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name)} ${tAlias}`;
                }
                else
                    s += `${tAlias}`;
            }
            else if (this.isNodeTableOrViewColumn(tn)) {
                tNode = tn.parent;
                let sameSchema = connSchema === tNode.databaseObject.schema;
                if (useAliases) {
                    key = `${tNode.databaseObject.schema}.${tNode.databaseObject.name}`;
                    tAlias = selectedTables.get(key).alias;
                    if (sameSchema)
                        objName = `${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name)}`;
                    else
                        objName = `${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.schema)}.${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name)}`;
                    if (stc === 1)
                        s = `SELECT ${OracleCodeGenerationUtilities.getStringObjectName(tn.databaseObject.name)} FROM ${objName} ${tAlias}`;
                    else
                        s = `SELECT ${tAlias}.${OracleCodeGenerationUtilities.getStringObjectName(tn.databaseObject.name)} FROM ${objName} ${tAlias}`;
                }
                else {
                    if (sameSchema)
                        tAlias = OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name);
                    else
                        tAlias = `${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.schema)}.${OracleCodeGenerationUtilities.getStringObjectName(tNode.databaseObject.name)}`;
                    if (stc === 1)
                        s = `SELECT ${OracleCodeGenerationUtilities.getStringObjectName(tn.databaseObject.name)} FROM ${tAlias}`;
                    else
                        s = `SELECT ${tAlias}.${OracleCodeGenerationUtilities.getStringObjectName(tn.databaseObject.name)} FROM ${tAlias}`;
                }
            }
        }
        return s;
    }
    async getJoinStatement(treeNodes, useAliases = true, useCurrentSchema = true) {
        let selectedTables = this.getSelectedTablesViews(treeNodes);
        let s;
        if (selectedTables.size > 1) {
            let connNode = this.getConnectionNodeFromTreeNode(treeNodes[0]);
            let isConnected = await this.ConnectToDatabase(connNode);
            let conn;
            let cons;
            s = await this.getSqlStatement(treeNodes, selectedTables, useAliases, useCurrentSchema);
            if (isConnected === true) {
                conn = await oracleConnectionProxy_1.OracleConnectionProxy.CreateConnectionFromConnectionNode(connNode);
                let result = await conn.Open();
                let { sql, pars } = this.getSelectedTablesViewsConstraintsSqlAndParameters(selectedTables);
                cons = await conn.ExecuteGetSingleList(sql, pars);
                let pairs = this.getForeignKeyPrimaryKeyPairs(cons);
                if (pairs.length > 0) {
                    let rCons = this.getRelevantFK_PKConstraints(pairs);
                    await this.getRelevantConstraintsColumns(rCons, conn);
                    s += this.getJoinStatementWhereClause(pairs, selectedTables, connNode.schemaName, useAliases);
                }
                conn.Dispose();
            }
        }
        else {
            s = await this.getSqlStatement(treeNodes, selectedTables, false, useCurrentSchema);
        }
        s = await this.formatSqlText(s);
        return s;
    }
    static getStringObjectName(name) {
        if (!name)
            return name;
        if (OracleCodeGenerationUtilities.identifiersRE.test(name))
            return name;
        else
            return `\"${name}\"`;
    }
    async openNewDocument(languageId) {
        let document = await vscode.workspace.openTextDocument({ language: languageId, content: "" });
        await vscode.languages.setTextDocumentLanguage(document, languageId);
        return await vscode.window.showTextDocument(document, vscode.ViewColumn.Active, false);
    }
    getDriverAndFormat(languageId) {
        let driver = "odp";
        let format = "standard";
        switch (languageId) {
            case "java":
                driver = "jdbc";
                break;
            case "python":
                driver = "python";
                break;
            case "javascript":
                driver = "nodejs";
                break;
            case "csharp":
            default:
                driver = "odp";
                break;
        }
        return { driver: driver, format: format };
    }
}
exports.OracleCodeGenerationUtilities = OracleCodeGenerationUtilities;
OracleCodeGenerationUtilities.identifiersRE = new RegExp("^[A-Z][A-Z0-9_\$#]*$");
class OracleLanguageCodeGeneration {
    constructor(languageId) {
        this.languageId = languageId;
    }
}
exports.OracleLanguageCodeGeneration = OracleLanguageCodeGeneration;
class OraclePythonCodeGeneration extends OracleLanguageCodeGeneration {
    constructor() {
        super(oracleCodeGenerationConstants_2.OracleCodeGenerationLanguageIDs.python);
    }
    generateConnectionOpenCode(cs) {
        let s;
        s = `connectionOpen_string{oracledb.connect(
  user = '${cs.userName.replace(OraclePythonCodeGeneration.re1, "\\$1")}',
  password = '${cs.password ? cs.password.replace(OraclePythonCodeGeneration.re1, "\\$1") : ""}',
  dsn = '${cs.connectionString.replace(OraclePythonCodeGeneration.re1, "\\$1")}',`;
        if (cs.tnsAdmin) {
            s += `
  config_dir = '${cs.tnsAdmin.replace(OraclePythonCodeGeneration.re1, "\\$1")}',`;
        }
        if (cs.walletLocation) {
            s += `
  wallet_location = '${cs.walletLocation.replace(OraclePythonCodeGeneration.re1, "\\$1")}',
  wallet_password = '<WalletPassword>',`;
        }
        if (cs.dbaPrivilege) {
            s += `
  mode = ${cs.dbaPrivilege.replace(OraclePythonCodeGeneration.re1, "\\$1")},`;
        }
        s += `
)}`;
        return s;
    }
}
exports.OraclePythonCodeGeneration = OraclePythonCodeGeneration;
OraclePythonCodeGeneration.re1 = new RegExp("([\\\\'])", "gm");
OraclePythonCodeGeneration.re2 = new RegExp("([\\\\])", "gm");
class OracleNodeJSCodeGeneration extends OracleLanguageCodeGeneration {
    constructor() {
        super(oracleCodeGenerationConstants_2.OracleCodeGenerationLanguageIDs.javascript);
    }
    generateConnectionOpenCode(cs) {
        let s;
        s = `connectionConfig_string!const config = {
  user:'${cs.userName.replace(OracleNodeJSCodeGeneration.re1, "\\$1")}',
  password: '${cs.password ? cs.password.replace(OracleNodeJSCodeGeneration.re1, "\\$1") : ""}',
  connectionString: '${cs.connectionString.replace(OracleNodeJSCodeGeneration.re1, "\\$1")}',`;
        if (cs.tnsAdmin) {
            s += `
  configDir: '${cs.tnsAdmin.replace(OracleNodeJSCodeGeneration.re1, "\\$1")}',`;
        }
        if (cs.walletLocation) {
            s += `
  walletLocation: '${cs.walletLocation.replace(OracleNodeJSCodeGeneration.re1, "\\$1")}',
  walletPassword: '<WalletPassword>',`;
        }
        if (cs.dbaPrivilege) {
            s += `
  privilege: ${cs.dbaPrivilege.replace(OracleNodeJSCodeGeneration.re1, "\\$1")},`;
        }
        s += `
};!`;
        return s;
    }
}
exports.OracleNodeJSCodeGeneration = OracleNodeJSCodeGeneration;
OracleNodeJSCodeGeneration.re1 = new RegExp("([\\\\'])", "gm");
OracleNodeJSCodeGeneration.re2 = new RegExp("([\\\\`])", "gm");
class OracleJavaCodeGeneration extends OracleLanguageCodeGeneration {
    constructor() {
        super(oracleCodeGenerationConstants_2.OracleCodeGenerationLanguageIDs.java);
    }
}
exports.OracleJavaCodeGeneration = OracleJavaCodeGeneration;
OracleJavaCodeGeneration.re1 = new RegExp("([\\\\\"])", "gm");
OracleJavaCodeGeneration.re2 = new RegExp("([\\\\])", "gm");
class OracleCSharpCodeGeneration extends OracleLanguageCodeGeneration {
    constructor() {
        super(oracleCodeGenerationConstants_2.OracleCodeGenerationLanguageIDs.csharp);
    }
}
exports.OracleCSharpCodeGeneration = OracleCSharpCodeGeneration;
OracleCSharpCodeGeneration.re1 = new RegExp("([\\\\\"])", "gm");
OracleCSharpCodeGeneration.re2 = new RegExp("([\"])", "gm");
