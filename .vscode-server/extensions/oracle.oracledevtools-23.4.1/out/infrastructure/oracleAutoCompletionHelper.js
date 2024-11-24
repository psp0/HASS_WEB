"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntellisenseFetchStatus = exports.OracleSQLPlusStmtType = exports.StatementContext = exports.OracleSQLPlusStmtSubType = exports.ProcessOracleStatement = void 0;
const oracleLanguageFeaturesHelper_1 = require("./oracleLanguageFeaturesHelper");
class ProcessOracleStatement {
    constructor(intelliSenseSettings, oracleIntelliSenseDataMgr, documentToken) {
        this.intelliSenseSettings = intelliSenseSettings;
        this.oracleIntelliSenseDataMgr = oracleIntelliSenseDataMgr;
        this.documentToken = documentToken;
    }
    getObjectNameFromAliases(token2, token1) {
        let actualtoken2 = token2;
        let actualtoken1 = token1;
        let foundAlias = "";
        if (this.documentToken.aliasInfo && this.documentToken.aliasInfo.tableAliases) {
            let parsedObject = ProcessOracleStatement.getMatchedAlias(token2, this.documentToken.aliasInfo.tableAliases);
            if (parsedObject) {
                let parsedTable = parsedObject.parsedObject;
                if (parsedTable) {
                    actualtoken2 = parsedTable.dbFormatedName;
                    actualtoken1 = parsedTable.dbFormatedSchema;
                    if (parsedObject.dbFormatedAlias)
                        foundAlias = oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(parsedObject.alias) ? parsedObject.alias :
                            oracleLanguageFeaturesHelper_1.CasingHelper.setCase(parsedObject.dbFormatedAlias, this.intelliSenseSettings.objectNameCase);
                }
            }
        }
        return [actualtoken1, actualtoken2, foundAlias];
    }
    static getMatchedAlias(token, aliasList) {
        if (aliasList) {
            for (let index = 0; index < aliasList.length; index++) {
                const element = aliasList[index];
                if (element.dbFormatedAlias === token) {
                    return element;
                }
            }
        }
        return null;
    }
    static getMatchedAliasObject(token, aliasList) {
        if (aliasList) {
            for (let index = 0; index < aliasList.length; index++) {
                const element = aliasList[index];
                if (element.dbFormatedAlias === token) {
                    return element.parsedObject;
                }
            }
        }
        return null;
    }
    static getTableListFromTableExpressionDetail(aliasesInExpr) {
        let tableList = [];
        if (aliasesInExpr && aliasesInExpr.length > 0) {
            aliasesInExpr.forEach(item => {
                if (item.parsedObject.parsedObjectType === oracleLanguageFeaturesHelper_1.ParsedObjectType.Table)
                    tableList.push(item.parsedObject);
            });
        }
        return tableList;
    }
}
exports.ProcessOracleStatement = ProcessOracleStatement;
var OracleSQLPlusStmtSubType;
(function (OracleSQLPlusStmtSubType) {
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_UNKNOWN"] = 0] = "G_S_UNKNOWN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ACCEPT"] = 1] = "G_S_ACCEPT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ALTER"] = 2] = "G_S_ALTER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ANALYZE"] = 3] = "G_S_ANALYZE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_APPEND"] = 4] = "G_S_APPEND";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ARCHIVE"] = 5] = "G_S_ARCHIVE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ASSOCIATE"] = 6] = "G_S_ASSOCIATE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_AT"] = 7] = "G_S_AT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ATNESTED"] = 8] = "G_S_ATNESTED";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ATTRIBUTE"] = 9] = "G_S_ATTRIBUTE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_AUDIT"] = 10] = "G_S_AUDIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BEGIN"] = 11] = "G_S_BEGIN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BLOCKTERMINATOR"] = 12] = "G_S_BLOCKTERMINATOR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BREAK"] = 13] = "G_S_BREAK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BTITLE"] = 14] = "G_S_BTITLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CALL"] = 15] = "G_S_CALL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CHANGE"] = 16] = "G_S_CHANGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CLEAR"] = 17] = "G_S_CLEAR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COLUMN"] = 18] = "G_S_COLUMN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COMMENT_SQL"] = 19] = "G_S_COMMENT_SQL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COMMIT"] = 20] = "G_S_COMMIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COMMENT_PLUS"] = 21] = "G_S_COMMENT_PLUS";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COMPUTE"] = 22] = "G_S_COMPUTE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CONNECT"] = 23] = "G_S_CONNECT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COPY"] = 24] = "G_S_COPY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DECLARE"] = 25] = "G_S_DECLARE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DEFINE"] = 26] = "G_S_DEFINE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DEL_PLUS"] = 27] = "G_S_DEL_PLUS";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DELETE"] = 28] = "G_S_DELETE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DESCRIBE"] = 29] = "G_S_DESCRIBE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DISASSOCIATE"] = 30] = "G_S_DISASSOCIATE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DISCONNECT"] = 31] = "G_S_DISCONNECT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_DROP"] = 32] = "G_S_DROP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_EDIT"] = 33] = "G_S_EDIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_EXECUTE"] = 34] = "G_S_EXECUTE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_EXPAND"] = 35] = "G_S_EXPAND";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_EXIT"] = 36] = "G_S_EXIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_EXPLAIN"] = 37] = "G_S_EXPLAIN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_FLASHBACK"] = 38] = "G_S_FLASHBACK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_GET"] = 39] = "G_S_GET";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_GRANT"] = 40] = "G_S_GRANT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_HOST"] = 41] = "G_S_HOST";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_HOSTALIAS"] = 42] = "G_S_HOSTALIAS";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_HELP"] = 43] = "G_S_HELP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_INPUT"] = 44] = "G_S_INPUT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_INSERT"] = 45] = "G_S_INSERT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_LIST"] = 46] = "G_S_LIST";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_LOCK"] = 47] = "G_S_LOCK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_MERGE"] = 48] = "G_S_MERGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_NEWPAGE"] = 49] = "G_S_NEWPAGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_NOAUDIT"] = 50] = "G_S_NOAUDIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ORADEBUG"] = 51] = "G_S_ORADEBUG";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PWORD"] = 52] = "G_S_PWORD";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PLSQLLABEL"] = 53] = "G_S_PLSQLLABEL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PAUSE"] = 54] = "G_S_PAUSE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PRINT"] = 55] = "G_S_PRINT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PROMPT"] = 56] = "G_S_PROMPT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_PURGE"] = 57] = "G_S_PURGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_QUIT"] = 58] = "G_S_QUIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_RENAME"] = 59] = "G_S_RENAME";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_RECOVER"] = 60] = "G_S_RECOVER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_REPFOOTER"] = 61] = "G_S_REPFOOTER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_REPHEADER"] = 62] = "G_S_REPHEADER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_REVOKE"] = 63] = "G_S_REVOKE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ROLLBACK_PLUS"] = 64] = "G_S_ROLLBACK_PLUS";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_ROLLBACK_SQL"] = 65] = "G_S_ROLLBACK_SQL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_RUN"] = 66] = "G_S_RUN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SAVE"] = 67] = "G_S_SAVE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SAVEPOINT"] = 68] = "G_S_SAVEPOINT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SELECT"] = 69] = "G_S_SELECT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SHOW"] = 70] = "G_S_SHOW";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SHUTDOWN"] = 71] = "G_S_SHUTDOWN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SLASH"] = 72] = "G_S_SLASH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SPOOL"] = 73] = "G_S_SPOOL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SQLPLUSPREFIX"] = 74] = "G_S_SQLPLUSPREFIX";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SQLTERMINATOR"] = 75] = "G_S_SQLTERMINATOR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_START"] = 76] = "G_S_START";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_STARTUP"] = 77] = "G_S_STARTUP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_STORE"] = 78] = "G_S_STORE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_TIMING"] = 79] = "G_S_TIMING";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_TRUNCATE"] = 80] = "G_S_TRUNCATE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_TTITLE"] = 81] = "G_S_TTITLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_UNDEFINE"] = 82] = "G_S_UNDEFINE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_UPDATE"] = 83] = "G_S_UPDATE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_VALIDATE"] = 84] = "G_S_VALIDATE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_VARIABLE"] = 85] = "G_S_VARIABLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_WHENEVER"] = 86] = "G_S_WHENEVER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_WITH"] = 87] = "G_S_WITH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET"] = 88] = "G_S_SET";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_XQUERY"] = 89] = "G_S_XQUERY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SETLOGLEVEL"] = 90] = "G_S_SETLOGLEVEL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_LOADQUERYFILE"] = 91] = "G_S_LOADQUERYFILE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ARRAYSIZE"] = 92] = "G_S_SET_ARRAYSIZE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_APPINFO"] = 93] = "G_S_SET_APPINFO";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_AUTOCOMMIT"] = 94] = "G_S_SET_AUTOCOMMIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_AUTOPRINT"] = 95] = "G_S_SET_AUTOPRINT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_AUTOTRACE"] = 96] = "G_S_SET_AUTOTRACE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COPYCOMMIT"] = 97] = "G_S_SET_COPYCOMMIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ESCAPE"] = 98] = "G_S_SET_ESCAPE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_FEEDBACK"] = 99] = "G_S_SET_FEEDBACK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_OWA"] = 100] = "G_S_SET_OWA";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_GETPAGE"] = 101] = "G_S_SET_GETPAGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SERVEROUTPUT"] = 102] = "G_S_SET_SERVEROUTPUT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SPOOL"] = 103] = "G_S_SET_SPOOL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TERM"] = 104] = "G_S_SET_TERM";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TIMING"] = 105] = "G_S_SET_TIMING";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_VERIFY"] = 106] = "G_S_SET_VERIFY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XQUERY"] = 107] = "G_S_SET_XQUERY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_CONSTRAINT"] = 108] = "G_S_SET_CONSTRAINT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ROLE"] = 109] = "G_S_SET_ROLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TRANSACTION"] = 110] = "G_S_SET_TRANSACTION";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_PAUSE"] = 111] = "G_S_SET_PAUSE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ECHO"] = 112] = "G_S_SET_ECHO";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_DEFINE"] = 113] = "G_S_SET_DEFINE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SCAN"] = 114] = "G_S_SET_SCAN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_NULL"] = 115] = "G_S_SET_NULL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_UNKNOWN"] = 116] = "G_S_SET_UNKNOWN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_PAGESIZE"] = 117] = "G_S_SET_PAGESIZE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LINESIZE"] = 118] = "G_S_SET_LINESIZE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LONG"] = 119] = "G_S_SET_LONG";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COLSEP"] = 120] = "G_S_SET_COLSEP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_HEADING"] = 121] = "G_S_SET_HEADING";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_HEADINGSEP"] = 122] = "G_S_SET_HEADINGSEP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_WRAP"] = 123] = "G_S_SET_WRAP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_NUMBERWIDTH"] = 124] = "G_S_SET_NUMBERWIDTH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_NUMBERFORMAT"] = 125] = "G_S_SET_NUMBERFORMAT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_PACKAGE_HEADER"] = 126] = "G_S_CREATE_PACKAGE_HEADER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_PACKAGE_BODY"] = 127] = "G_S_CREATE_PACKAGE_BODY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_PROCEDURE"] = 128] = "G_S_CREATE_PROCEDURE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_TRIGGER"] = 129] = "G_S_CREATE_TRIGGER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_FUNCTION"] = 130] = "G_S_CREATE_FUNCTION";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_TYPE"] = 131] = "G_S_CREATE_TYPE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_LIBRARY"] = 132] = "G_S_CREATE_LIBRARY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_JAVA"] = 133] = "G_S_CREATE_JAVA";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_TABLE"] = 134] = "G_S_CREATE_TABLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_DATABASE"] = 135] = "G_S_CREATE_DATABASE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_CONN"] = 136] = "G_S_CREATE_CONN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_UNKNOWN"] = 137] = "G_S_CREATE_UNKNOWN";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_FORALLEVENTS_STMTSUBTYPE"] = 138] = "G_S_FORALLEVENTS_STMTSUBTYPE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_FORALLSTMTS_STMTSUBTYPE"] = 139] = "G_S_FORALLSTMTS_STMTSUBTYPE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BEFOREAFTER_SCRIPT"] = 140] = "G_S_BEFOREAFTER_SCRIPT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_WORKSHEETNAME"] = 141] = "G_S_SET_WORKSHEETNAME";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BRIDGE"] = 142] = "G_S_BRIDGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_EXITC"] = 143] = "G_S_SET_EXITC";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TIME"] = 144] = "G_S_SET_TIME";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LOBOFFSET"] = 145] = "G_S_SET_LOBOFFSET";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLPROMPT"] = 146] = "G_S_SET_SQLPROMPT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_RECSEPCHAR"] = 147] = "G_S_SET_RECSEPCHAR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_RECSEP"] = 148] = "G_S_SET_RECSEP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XQUERY_BASEURI"] = 149] = "G_S_SET_XQUERY_BASEURI";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XQUERY_ORDERING"] = 150] = "G_S_SET_XQUERY_ORDERING";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XQUERY_NODE"] = 151] = "G_S_SET_XQUERY_NODE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XQUERY_CONTEXT"] = 152] = "G_S_SET_XQUERY_CONTEXT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COPYTYPECHECK"] = 153] = "G_S_SET_COPYTYPECHECK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLCASE"] = 154] = "G_S_SET_SQLCASE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SUFFIX"] = 155] = "G_S_SET_SUFFIX";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ESCCHAR"] = 156] = "G_S_SET_ESCCHAR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLBLANKLINES"] = 157] = "G_S_SET_SQLBLANKLINES";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLTERMINATOR"] = 158] = "G_S_SET_SQLTERMINATOR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SHOWMODE"] = 159] = "G_S_SET_SHOWMODE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_FLAGGER"] = 160] = "G_S_SET_FLAGGER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COLINVISIBLE"] = 161] = "G_S_SET_COLINVISIBLE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_XMLOPTIMIZATIONCHECK"] = 162] = "G_S_SET_XMLOPTIMIZATIONCHECK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_BLOCKTERMINATOR"] = 163] = "G_S_SET_BLOCKTERMINATOR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_CONCAT"] = 164] = "G_S_SET_CONCAT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ERRORLOGGING"] = 165] = "G_S_SET_ERRORLOGGING";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_DESCRIBE"] = 166] = "G_S_SET_DESCRIBE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLNUMBER"] = 167] = "G_S_SET_SQLNUMBER";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_MARKUP"] = 168] = "G_S_SET_MARKUP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TRIMS"] = 169] = "G_S_SET_TRIMS";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TRIM"] = 170] = "G_S_SET_TRIM";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLCONTINUE"] = 171] = "G_S_SET_SQLCONTINUE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_UNDERLINE"] = 172] = "G_S_SET_UNDERLINE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_INSTANCE"] = 173] = "G_S_SET_INSTANCE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LONGCHUNKSIZE"] = 174] = "G_S_SET_LONGCHUNKSIZE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLPLUSCOMPATIBILITY"] = 175] = "G_S_SET_SQLPLUSCOMPATIBILITY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SQLTERMINATOR_CHAR"] = 176] = "G_S_SQLTERMINATOR_CHAR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_BLOCKTERMINATOR_CHAR"] = 177] = "G_S_BLOCKTERMINATOR_CHAR";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_NEWPAGE"] = 178] = "G_S_SET_NEWPAGE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_EMBEDDED"] = 179] = "G_S_SET_EMBEDDED";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SQLPREFIX"] = 180] = "G_S_SET_SQLPREFIX";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_CMDSEP"] = 181] = "G_S_SET_CMDSEP";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_COMPOUND_STATEMENT"] = 182] = "G_S_COMPOUND_STATEMENT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_CREATE_DATABASE_LINK"] = 183] = "G_S_CREATE_DATABASE_LINK";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_HISTORY"] = 184] = "G_S_HISTORY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_AUTORECOVERY"] = 185] = "G_S_SET_AUTORECOVERY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COLJSON"] = 186] = "G_S_SET_COLJSON";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_COMPATIBILITY"] = 187] = "G_S_SET_COMPATIBILITY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_EDITFILE"] = 188] = "G_S_SET_EDITFILE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_FULLCOLNAME"] = 189] = "G_S_SET_FULLCOLNAME";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_FLUSH"] = 190] = "G_S_SET_FLUSH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_HISTORY"] = 191] = "G_S_SET_HISTORY";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LOBPREFETCH"] = 192] = "G_S_SET_LOBPREFETCH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_LOGSOURCE"] = 193] = "G_S_SET_LOGSOURCE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ROWPREFETCH"] = 194] = "G_S_SET_ROWPREFETCH";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_ROWLIMIT"] = 195] = "G_S_SET_ROWLIMIT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SECUREDCOL"] = 196] = "G_S_SET_SECUREDCOL";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_SHIFTINOUT"] = 197] = "G_S_SET_SHIFTINOUT";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_STATEMENTCACHE"] = 198] = "G_S_SET_STATEMENTCACHE";
    OracleSQLPlusStmtSubType[OracleSQLPlusStmtSubType["G_S_SET_TAB"] = 199] = "G_S_SET_TAB";
})(OracleSQLPlusStmtSubType = exports.OracleSQLPlusStmtSubType || (exports.OracleSQLPlusStmtSubType = {}));
var StatementContext;
(function (StatementContext) {
    StatementContext[StatementContext["select_term"] = 0] = "select_term";
    StatementContext[StatementContext["select_list"] = 1] = "select_list";
    StatementContext[StatementContext["into_list"] = 2] = "into_list";
    StatementContext[StatementContext["select_clause"] = 3] = "select_clause";
    StatementContext[StatementContext["from_clause"] = 4] = "from_clause";
    StatementContext[StatementContext["join_clause"] = 5] = "join_clause";
    StatementContext[StatementContext["inner_cross_join_clause"] = 6] = "inner_cross_join_clause";
    StatementContext[StatementContext["outer_join_clause"] = 7] = "outer_join_clause";
    StatementContext[StatementContext["cross_outer_apply_clause"] = 8] = "cross_outer_apply_clause";
    StatementContext[StatementContext["on_using_condition"] = 9] = "on_using_condition";
    StatementContext[StatementContext["where_clause"] = 10] = "where_clause";
    StatementContext[StatementContext["order_by_clause"] = 11] = "order_by_clause";
    StatementContext[StatementContext["group_by_clause"] = 12] = "group_by_clause";
    StatementContext[StatementContext["having_clause"] = 13] = "having_clause";
    StatementContext[StatementContext["for_update_clause"] = 14] = "for_update_clause";
    StatementContext[StatementContext["select"] = 15] = "select";
    StatementContext[StatementContext["insert_into_clause"] = 16] = "insert_into_clause";
    StatementContext[StatementContext["insert_into_clause_columns"] = 17] = "insert_into_clause_columns";
    StatementContext[StatementContext["values_clause"] = 18] = "values_clause";
    StatementContext[StatementContext["returning_clause"] = 19] = "returning_clause";
    StatementContext[StatementContext["error_logging_clause"] = 20] = "error_logging_clause";
    StatementContext[StatementContext["conditional_insert_clause"] = 21] = "conditional_insert_clause";
    StatementContext[StatementContext["aliased_dml_table_expression_clause"] = 22] = "aliased_dml_table_expression_clause";
    StatementContext[StatementContext["dml_table_expression_clause"] = 23] = "dml_table_expression_clause";
    StatementContext[StatementContext["hint"] = 24] = "hint";
    StatementContext[StatementContext["insert"] = 25] = "insert";
    StatementContext[StatementContext["single_table_insert"] = 26] = "single_table_insert";
    StatementContext[StatementContext["multi_table_insert"] = 27] = "multi_table_insert";
    StatementContext[StatementContext["subquery"] = 28] = "subquery";
    StatementContext[StatementContext["update_set_clause"] = 29] = "update_set_clause";
    StatementContext[StatementContext["update"] = 30] = "update";
    StatementContext[StatementContext["delete"] = 31] = "delete";
    StatementContext[StatementContext["set_operation"] = 32] = "set_operation";
    StatementContext[StatementContext["with_clause"] = 33] = "with_clause";
    StatementContext[StatementContext["subquery_factoring_clause"] = 34] = "subquery_factoring_clause";
    StatementContext[StatementContext["colmapped_query_name"] = 35] = "colmapped_query_name";
    StatementContext[StatementContext["unknown"] = -1] = "unknown";
})(StatementContext = exports.StatementContext || (exports.StatementContext = {}));
var OracleSQLPlusStmtType;
(function (OracleSQLPlusStmtType) {
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_UNKNOWN"] = 1] = "G_C_UNKNOWN";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_SQL"] = 2] = "G_C_SQL";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_PLSQL"] = 3] = "G_C_PLSQL";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_SQLPLUS"] = 4] = "G_C_SQLPLUS";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_COMMENT"] = 5] = "G_C_COMMENT";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_EMPTYLINE"] = 6] = "G_C_EMPTYLINE";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_MULTILINECOMMENT"] = 7] = "G_C_MULTILINECOMMENT";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_OLDCOMMENT"] = 8] = "G_C_OLDCOMMENT";
    OracleSQLPlusStmtType[OracleSQLPlusStmtType["G_C_USERDEFINED"] = 9] = "G_C_USERDEFINED";
})(OracleSQLPlusStmtType = exports.OracleSQLPlusStmtType || (exports.OracleSQLPlusStmtType = {}));
var IntellisenseFetchStatus;
(function (IntellisenseFetchStatus) {
    IntellisenseFetchStatus[IntellisenseFetchStatus["NotInitialized"] = 1] = "NotInitialized";
    IntellisenseFetchStatus[IntellisenseFetchStatus["Fetching"] = 2] = "Fetching";
    IntellisenseFetchStatus[IntellisenseFetchStatus["Fetched"] = 3] = "Fetched";
})(IntellisenseFetchStatus = exports.IntellisenseFetchStatus || (exports.IntellisenseFetchStatus = {}));
