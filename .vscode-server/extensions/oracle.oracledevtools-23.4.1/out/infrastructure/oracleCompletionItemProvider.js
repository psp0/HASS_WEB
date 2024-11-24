"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleStaticSQLFunction = exports.OracleKeyWordList = exports.oracleCompletionitemProvider = exports.oracleCompletionItemDataProvider = exports.oracleIntelliSenseInfo = exports.oracleDocumentIntelliSenseManager = exports.TokenInfo = exports.TokenPositionHelper = exports.OracleAutoCompletionUtils = exports.OracleColumn = exports.OracleSynonym = exports.OracleMethod = exports.OracleEntity = exports.OracleObject = exports.OracleItem = exports.OracleCompletionItem = void 0;
const vscode = require("vscode");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
const localizedConstants_1 = require("../constants/localizedConstants");
const helper = require("./../utilities/helper");
const logger = require("./../infrastructure/logger");
const constants_1 = require("../constants/constants");
const oracleSignatureHelpProvider_1 = require("./oracleSignatureHelpProvider");
const logger_1 = require("./../infrastructure/logger");
const vscode_1 = require("vscode");
const iLanguageTokenHandler_1 = require("./iLanguageTokenHandler");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const oracleAutoCompletionHelper_1 = require("./oracleAutoCompletionHelper");
const oracleLanguageFeaturesHelper_1 = require("./oracleLanguageFeaturesHelper");
const intellisenseModels_1 = require("../models/intellisenseModels");
const settings_1 = require("../utilities/settings");
const intellisenseRequests_1 = require("../models/intellisenseRequests");
const LangService = require("../models/intellisenseRequests");
const fileLogger = logger.FileStreamLogger.Instance;
class OracleCompletionItem {
    constructor() {
        this.detail = null;
        this.completionItemKind = vscode_1.CompletionItemKind.Property;
        this.insertText = null;
        this.documentation = null;
        this.subObjects = null;
        this.methodArgumentList = null;
        this.quoteNeeded = false;
    }
}
exports.OracleCompletionItem = OracleCompletionItem;
class OracleItem {
}
exports.OracleItem = OracleItem;
class OracleObject extends OracleItem {
}
exports.OracleObject = OracleObject;
class OracleEntity extends OracleObject {
}
exports.OracleEntity = OracleEntity;
class OracleMethod extends OracleObject {
}
exports.OracleMethod = OracleMethod;
class OracleSynonym {
}
exports.OracleSynonym = OracleSynonym;
class OracleColumn extends OracleObject {
}
exports.OracleColumn = OracleColumn;
class OracleAutoCompletionUtils {
    static getFormattedParamter(name, direction, type) {
        return `${name} => ${direction} ${type}`;
    }
    static setMethodArgumentCasing(argumentList, caseSettings) {
        if (argumentList === undefined || argumentList === null)
            return;
        argumentList.forEach(param => {
            param.name = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(param.name, caseSettings.objectNameCase);
            param.dataType = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(param.dataType, caseSettings.keywordCase);
            param.direction = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(param.direction, caseSettings.keywordCase);
        });
    }
    static getMethodSignatureLabel(paramObjectList, methodName, parameterInformationList, keywordCase) {
        var retDetail = null;
        var isFunction = false;
        var argumentList = '';
        var argCounter = 0;
        var optionalParameter = false;
        var showEnclosingParenthesis = true;
        for (var paramIdx = 0; paramIdx < paramObjectList.length; paramIdx++) {
            if (paramObjectList[paramIdx].direction?.toUpperCase() != "RETURN") {
                var paraminfo;
                optionalParameter = false;
                if (paramObjectList[paramIdx].hasOwnProperty('optional') &&
                    paramObjectList[paramIdx]['optional'] === constants_1.Constants.optionalParamTrue) {
                    optionalParameter = true;
                }
                if (argCounter > 0 && !optionalParameter) {
                    argumentList = argumentList.concat(', ');
                }
                if (paramObjectList[paramIdx].hasOwnProperty('name') &&
                    paramObjectList[paramIdx].name && paramObjectList[paramIdx].name.length > 0) {
                    paraminfo = paramObjectList[paramIdx].name + ' ';
                }
                if (paramObjectList[paramIdx].hasOwnProperty('direction') &&
                    paramObjectList[paramIdx].direction && paramObjectList[paramIdx].direction.length > 0) {
                    if (paraminfo != undefined) {
                        paraminfo = `${paraminfo}${paramObjectList[paramIdx].direction} `;
                    }
                    else {
                        paraminfo = `${paramObjectList[paramIdx].direction} `;
                    }
                }
                if (paramObjectList[paramIdx].hasOwnProperty('dataType') && paramObjectList[paramIdx].dataType.length > 0) {
                    if (paraminfo != undefined) {
                        paraminfo = `${paraminfo}${paramObjectList[paramIdx].dataType}`;
                    }
                    else {
                        paraminfo = `${paramObjectList[paramIdx].dataType} `;
                    }
                    paraminfo = paraminfo.trimEnd();
                }
                if (optionalParameter) {
                    paraminfo = argCounter === 0 ? `[${paraminfo}]` : ` [, ${paraminfo}]`;
                }
                argCounter++;
                argumentList = argumentList.concat(paraminfo);
                if (parameterInformationList != null) {
                    parameterInformationList.push(new vscode.ParameterInformation(paraminfo));
                }
            }
            else {
                var returns = oracleLanguageFeaturesHelper_1.CasingHelper.setCase('RETURNS', keywordCase);
                retDetail = `${returns} ${paramObjectList[paramIdx].dataType}`;
                if (paramObjectList[paramIdx].hasOwnProperty('hideparenthesis')) {
                    showEnclosingParenthesis = false;
                }
            }
        }
        if (showEnclosingParenthesis) {
            argumentList = `(${argumentList})`;
        }
        var sigStr = `${methodName}${argumentList}`;
        if (retDetail != null) {
            sigStr = `${sigStr} ${retDetail}`;
            isFunction = true;
        }
        return { label: sigStr, isFunction: isFunction };
    }
    static sortListOnParameterCount(argumentList) {
        var sortable = [];
        for (var key in argumentList)
            sortable.push([key, argumentList[key]]);
        sortable.sort(function (a, b) {
            var x = a[1] ? a[1].length : 0;
            var y = b[1] ? b[1].length : 0;
            return x < y ? -1 : x > y ? 1 : 0;
        });
        return sortable;
    }
    static GetSchemaObjectTypeDisplayName(objectType) {
        var objectDisplayName = '';
        if (OracleAutoCompletionUtils.objectTypeVsString.size == 0) {
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Table, localizedConstants_1.default.table);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.View, localizedConstants_1.default.view);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.StoredProcedure, localizedConstants_1.default.procedure);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Function, localizedConstants_1.default.function);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.StaticSQLFunction, localizedConstants_1.default.function);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Package, localizedConstants_1.default.package);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Synonym, localizedConstants_1.default.synonym);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.PackageMethod, localizedConstants_1.default.packageMethod);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.TableColumn, localizedConstants_1.default.column);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Sequence, localizedConstants_1.default.sequence);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.ObjectAttribute, localizedConstants_1.default.sequenceValue);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.PublicSynonym, localizedConstants_1.default.publicSynonym);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Schema, localizedConstants_1.default.schemaUppr);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.SubqueryAlias, localizedConstants_1.default.subqueryAliasForDetail);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.SubqueryTableColumn, localizedConstants_1.default.column);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.SubqueryTableColumnAlias, localizedConstants_1.default.columnAliasUppr);
            -OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.Asteric, localizedConstants_1.default.allColumns);
            OracleAutoCompletionUtils.objectTypeVsString.set(intellisenseRequests_1.SchemaObjectType.TableViewSubqueryAllColumn, localizedConstants_1.default.allColumns);
        }
        if (OracleAutoCompletionUtils.objectTypeVsString.has(objectType)) {
            objectDisplayName = OracleAutoCompletionUtils.objectTypeVsString.get(objectType);
        }
        else {
            objectDisplayName = objectType ? objectType.toString() : objectDisplayName;
        }
        return objectDisplayName;
    }
    static compareString(s1, s2) {
        s1 = s1.toLocaleLowerCase();
        s2 = s2.toLocaleLowerCase();
        return s1 < s2 ? -1 : (s1 > s2 ? 1 : 0);
    }
    static LogError(tokeninfo, error) {
        var errorMsg = '';
        if (tokeninfo != undefined) {
            errorMsg = "Error for Token : " + tokeninfo.getToken();
        }
        if (error && error.message) {
            errorMsg += error.message;
        }
        logger_1.FileStreamLogger.Instance.error(errorMsg);
    }
    static getTokenCountAndTokenInfo(tokenResponse, isTokenSpaceKey = false) {
        var tokenInfo = new TokenInfo();
        if (tokenResponse != null && tokenResponse != undefined) {
            tokenInfo.commaCount = tokenResponse.commaCount;
            tokenInfo.paramList = tokenResponse.paramList;
            tokenInfo.tokenTerminator = tokenResponse.tokenTerminator;
            tokenInfo.ctrlSpaceKeyPressed = tokenResponse.ctrlSpaceKeyPressed;
            tokenInfo.stmtContext = tokenResponse.stmtContext;
            tokenInfo.stmtSubType = tokenResponse.stmtSubType;
            tokenInfo.stmtType = tokenResponse.stmtType;
            tokenInfo.parameterToken = tokenResponse.parameterToken;
            tokenInfo.count = tokenResponse.count;
            tokenInfo.token1 = tokenResponse.token1;
            tokenInfo.token2 = tokenResponse.token2;
            tokenInfo.token3 = tokenResponse.token3;
            tokenInfo.dbFormattedToken1 = tokenResponse.dbFormattedToken1;
            tokenInfo.dbFormattedToken2 = tokenResponse.dbFormattedToken2;
            tokenInfo.dbFormattedToken3 = tokenResponse.dbFormattedToken3;
            tokenInfo.isQuoted = tokenResponse.isQuoted;
        }
        return tokenInfo;
    }
    static getSelection(position) {
        return {
            startLine: position.line,
            startColumn: position.character,
            endLine: position.line,
            endColumn: position.character,
        };
    }
    static getVSCodeCompletionItem(intelliSenseSettings, item, range, sortText = "H", ignoreCaseSetting = false) {
        let vsCodeItem = null;
        let objNameCase = intelliSenseSettings.objectNameCase;
        if (sortText == null || sortText == undefined) {
            sortText = "H";
        }
        if (item && item.name) {
            let name = item.name;
            let oracleItem;
            if (item.hasOwnProperty('schemaQualifiedName') && item.schemaQualifiedName) {
                oracleItem = item;
                vsCodeItem = new vscode.CompletionItem(`${oracleItem.schemaQualifiedName}`);
            }
            else if (item.hasOwnProperty('appendParent')) {
                oracleItem = item;
                name = oracleItem.appendParent ? `${oracleItem.parentName}.${item.name}` : item.name;
                vsCodeItem = new vscode.CompletionItem(name);
            }
            else {
                oracleItem = item;
                vsCodeItem = new vscode.CompletionItem(oracleItem.name);
            }
            if (item.quoteNeeded || oracleLanguageFeaturesHelper_1.CasingHelper.isQuoted(item.name)) {
                let filterText = item.name.replace(/["']/g, '');
                vsCodeItem.filterText = filterText;
            }
            vsCodeItem.sortText = item.sortText ?? sortText;
            vsCodeItem.documentation = item.documentation?.markedDownString;
            vsCodeItem.detail = item.detail;
            vsCodeItem.kind = item.completionItemKind;
            if (item.hasOwnProperty("insertTextServer") && item.insertTextServer) {
                vsCodeItem.insertText = item.insertText = new vscode.SnippetString(item.insertTextServer);
            }
            else if (item.insertText != null) {
                vsCodeItem.insertText = item.insertText;
            }
            else {
                vsCodeItem.insertText = (vsCodeItem.label);
            }
            if (range)
                vsCodeItem.range = range;
        }
        return vsCodeItem?.label ? vsCodeItem : null;
    }
    static getVscodeListFromCompletionList(intelliSenseSettings, completionList, range, sortText = null, ignoreCaseSetting = false) {
        var vsCodeList = new vscode.CompletionList();
        completionList.forEach(element => {
            let item = this.getVSCodeCompletionItem(intelliSenseSettings, element, range, sortText, ignoreCaseSetting);
            if (item)
                vsCodeList.items.push(item);
        });
        return vsCodeList;
    }
    static prepareItemInfo(item, intellisenseSettings, tokenPostion) {
        var caseSettings = new intellisenseModels_1.CaseSettings(intellisenseSettings.keywordCase, intellisenseSettings.objectNameCase);
        let codeObject = false;
        switch (item.objectType) {
            case intellisenseRequests_1.SchemaObjectType.Schema:
                {
                    item.detail = localizedConstants_1.default.schema;
                    let markDownString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString();
                    markDownString.appendNameValueString(localizedConstants_1.default.schema, item.name);
                    item.documentation = markDownString;
                    item.completionItemKind = vscode_1.CompletionItemKind.User;
                }
                break;
            case intellisenseRequests_1.SchemaObjectType.TableColumn:
                {
                    item.completionItemKind = vscode_1.CompletionItemKind.Struct;
                    let col = item;
                    let tables;
                    let schemas;
                    if (col.columnData) {
                        [tables, schemas] = this.getColumnDetail(col.columnData.tables, intellisenseSettings.objectNameCase);
                        tables = tables ? tables : col.parentName;
                        schemas = schemas ? schemas : col.owner;
                        let markDownString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString();
                        markDownString.appendNameValueString(localizedConstants_1.default.schemas, `${schemas}`);
                        markDownString.appendNameValueString(localizedConstants_1.default.table_view, `${tables}`);
                        col.documentation = markDownString;
                    }
                }
                break;
            case intellisenseRequests_1.SchemaObjectType.View:
                item.completionItemKind = vscode_1.CompletionItemKind.Enum;
                if (item.hasOwnProperty('aliasName') && item.aliasName) {
                    OracleAutoCompletionUtils.populateItemDetailAndDocumentation(item);
                }
                break;
            case intellisenseRequests_1.SchemaObjectType.Table:
                item.completionItemKind = vscode_1.CompletionItemKind.Constant;
                if (item.hasOwnProperty('aliasName') && item.aliasName) {
                    OracleAutoCompletionUtils.populateItemDetailAndDocumentation(item);
                }
                break;
            case intellisenseRequests_1.SchemaObjectType.StoredProcedure:
            case intellisenseRequests_1.SchemaObjectType.Function:
            case intellisenseRequests_1.SchemaObjectType.StaticSQLFunction:
            case intellisenseRequests_1.SchemaObjectType.PackageMethod:
                codeObject = true;
                {
                    let method = item;
                    if (method != null) {
                        var sortedList = OracleAutoCompletionUtils.sortListOnParameterCount(method.methodArgumentList);
                        var parameters = sortedList.length > 0 ? sortedList[0][1] : null;
                        OracleAutoCompletionUtils.setMethodArgumentCasing(parameters, caseSettings);
                        OracleAutoCompletionUtils.populateMethodDetailAndDocumentation(method, parameters, caseSettings.keywordCase);
                        item.insertText = OracleAutoCompletionUtils.getTextToInsert(method, parameters, tokenPostion, false, caseSettings.objectNameCase);
                        item.completionItemKind = vscode_1.CompletionItemKind.Method;
                    }
                }
                break;
            case intellisenseRequests_1.SchemaObjectType.Package:
                item.completionItemKind = vscode_1.CompletionItemKind.Class;
                break;
            case intellisenseRequests_1.SchemaObjectType.ObjectAttribute:
                item.completionItemKind = vscode_1.CompletionItemKind.Value;
                break;
            case intellisenseRequests_1.SchemaObjectType.PublicSynonym:
            case intellisenseRequests_1.SchemaObjectType.Synonym:
                item.completionItemKind = vscode_1.CompletionItemKind.Reference;
                {
                    let method = item;
                    if (method != null && method.methodArgumentList != null) {
                        var sortedList = OracleAutoCompletionUtils.sortListOnParameterCount(method.methodArgumentList);
                        var parameters = sortedList.length > 0 ? sortedList[0][1] : null;
                        OracleAutoCompletionUtils.setMethodArgumentCasing(parameters, caseSettings);
                        OracleAutoCompletionUtils.populateMethodDetailAndDocumentation(method, parameters, caseSettings.keywordCase);
                        item.insertText = OracleAutoCompletionUtils.getTextToInsert(method, parameters, tokenPostion, false, caseSettings.objectNameCase);
                    }
                }
                break;
            case intellisenseRequests_1.SchemaObjectType.Asteric:
                item.completionItemKind = vscode_1.CompletionItemKind.Struct;
                item.documentation = new oracleLanguageFeaturesHelper_1.oracleMarkDownString();
                break;
            case intellisenseRequests_1.SchemaObjectType.TableViewSubqueryAllColumn:
            case intellisenseRequests_1.SchemaObjectType.SubqueryTableColumn:
            case intellisenseRequests_1.SchemaObjectType.SubqueryTableColumnAlias:
                item.completionItemKind = vscode_1.CompletionItemKind.Struct;
                OracleAutoCompletionUtils.populateItemDetailAndDocumentation(item);
                break;
            case intellisenseRequests_1.SchemaObjectType.SubqueryAlias:
                item.completionItemKind = vscode_1.CompletionItemKind.Constant;
                OracleAutoCompletionUtils.populateItemDetailAndDocumentation(item);
                break;
        }
        if (!codeObject) {
            if (!item.detail) {
                item.detail = this.getItemDetail(item.objectType);
            }
            if (!item.documentation) {
                let markDownString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString();
                markDownString.appendNameValueString(localizedConstants_1.default.name, item.name);
                if (item.objectType == intellisenseRequests_1.SchemaObjectType.TableColumn && item.parentName) {
                    markDownString.appendNameValueString(localizedConstants_1.default.table_view, item.parentName);
                }
                if (item.objectType == intellisenseRequests_1.SchemaObjectType.ObjectAttribute && item.parentName) {
                    markDownString.appendNameValueString(localizedConstants_1.default.sequenceName, item.parentName);
                }
                if (item.owner)
                    markDownString.appendNameValueString(localizedConstants_1.default.schema, item.owner);
                item.documentation = markDownString;
            }
        }
        return item;
    }
    static getItemDetail(type) {
        return `${OracleAutoCompletionUtils.GetSchemaObjectTypeDisplayName(type)}`;
    }
    static populateMethodDetailAndDocumentation(item, paramObjectList, keywordCase) {
        var signature = '';
        if (paramObjectList == null) {
            signature = `${item.name}()`;
        }
        else {
            var { label, isFunction } = OracleAutoCompletionUtils.getMethodSignatureLabel(paramObjectList, item.name, null, keywordCase);
            signature = label;
        }
        if (!item.detail) {
            switch (item.objectType) {
                case intellisenseRequests_1.SchemaObjectType.StoredProcedure:
                    item.detail = localizedConstants_1.default.procedure;
                    break;
                case intellisenseRequests_1.SchemaObjectType.Function:
                    item.detail = localizedConstants_1.default.function;
                    break;
                case intellisenseRequests_1.SchemaObjectType.Synonym:
                    item.detail = localizedConstants_1.default.synonym;
                    break;
                case intellisenseRequests_1.SchemaObjectType.PublicSynonym:
                    item.detail = localizedConstants_1.default.publicSynonym;
                    break;
                case intellisenseRequests_1.SchemaObjectType.PackageMethod:
                case intellisenseRequests_1.SchemaObjectType.PackageMember:
                    item.detail = isFunction ? localizedConstants_1.default.function : localizedConstants_1.default.procedure;
                    break;
            }
        }
        let markDownString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString();
        markDownString.appendNameValueString(localizedConstants_1.default.name, item.name);
        if (item.objectType == intellisenseRequests_1.SchemaObjectType.PackageMethod) {
            markDownString.appendNameValueString(localizedConstants_1.default.packageName, item.parentName);
        }
        if (item.owner != undefined) {
            markDownString.appendNameValueString(localizedConstants_1.default.schema, item.owner);
        }
        markDownString.appendNameValueString(null, signature);
        item.documentation = markDownString;
    }
    static populateItemDetailAndDocumentation(item) {
        let detail = '';
        let documentation = item.documentation;
        let markDownString = new oracleLanguageFeaturesHelper_1.oracleMarkDownString();
        switch (item.objectType) {
            case intellisenseRequests_1.SchemaObjectType.Table:
                detail = localizedConstants_1.default.tableAliasForDetail;
                markDownString.appendNameValueString(localizedConstants_1.default.alias, item.name);
                markDownString.appendNameValueString(localizedConstants_1.default.tableName, item.aliasedItemName);
                markDownString.appendNameValueString(localizedConstants_1.default.schema, item.owner);
                documentation = markDownString;
                break;
            case intellisenseRequests_1.SchemaObjectType.View:
                detail = localizedConstants_1.default.viewAliasForDetail;
                markDownString.appendNameValueString(localizedConstants_1.default.alias, item.name);
                markDownString.appendNameValueString(localizedConstants_1.default.viewName, item.aliasedItemName);
                markDownString.appendNameValueString(localizedConstants_1.default.schema, item.owner);
                documentation = markDownString;
                break;
            case intellisenseRequests_1.SchemaObjectType.SubqueryAlias:
                detail = localizedConstants_1.default.subqueryAliasForDetail;
                markDownString.appendNameValueString(localizedConstants_1.default.alias, item.name);
                markDownString.appendNameValueString(localizedConstants_1.default.tableExpression, item.aliasedItemName);
                documentation = markDownString;
                break;
            case intellisenseRequests_1.SchemaObjectType.SubqueryTableColumn:
                detail = localizedConstants_1.default.column;
                markDownString.appendNameValueString(localizedConstants_1.default.tableExpression, item.aliasedExpressionName);
                documentation = markDownString;
                break;
            case intellisenseRequests_1.SchemaObjectType.SubqueryTableColumnAlias:
                detail = localizedConstants_1.default.columnAliasForDetail;
                markDownString.appendNameValueString(localizedConstants_1.default.alias, item.name);
                markDownString.appendNameValueString(localizedConstants_1.default.column, item.aliasedItemName);
                markDownString.appendNameValueString(localizedConstants_1.default.tableExpression, item.aliasedExpressionName);
                documentation = markDownString;
                break;
        }
        item.detail = detail;
        item.documentation = documentation;
    }
    static getTextToInsert(item, parameters, tokenPostion, forStaticFunction, objNameCase) {
        let parentName = '';
        if (item.objectType === intellisenseRequests_1.SchemaObjectType.PackageMethod && item.appendParent)
            parentName = `${item.parentName}.`;
        var methodName = `${parentName}${item.name}`;
        if (parameters == null) {
            return new vscode.SnippetString(`${methodName}()`);
        }
        let parameterList = new Array();
        let formattedString = null;
        let placeHolder = oracleLanguageFeaturesHelper_1.CasingHelper.setCase('P_', objNameCase);
        if (forStaticFunction) {
            for (var paramIdx = 0; paramIdx < parameters.length; paramIdx++) {
                let nameInfo = '';
                if (parameters[paramIdx].direction?.toUpperCase() != "RETURN") {
                    if (parameters[paramIdx].name != "") {
                        nameInfo = parameters[paramIdx].name;
                    }
                    if (parameters[paramIdx].dataType != "") {
                        nameInfo = (nameInfo == '') ? parameters[paramIdx].dataType : nameInfo + ` ${parameters[paramIdx].dataType}`;
                    }
                    parameterList.push(nameInfo);
                }
            }
            var identetaion = tokenPostion != null && tokenPostion.position != null ? tokenPostion.getStartingPositionForNewLine(methodName) : 0;
            let space = " ";
            parameterList.forEach((paramterInfo, index) => {
                if (formattedString != null) {
                    formattedString += `\${${index + 1}:${placeHolder}} /*${paramterInfo.trim()}*/`;
                }
                else {
                    formattedString = `\${${index + 1}:${placeHolder}} /*${paramterInfo.trim()}*/`;
                }
                if (index < parameterList.length - 1 && parameterList.length > 1) {
                    if (tokenPostion.tokenInfo.stmtType === oracleAutoCompletionHelper_1.OracleSQLPlusStmtType.G_C_SQLPLUS && tokenPostion.tokenInfo.stmtSubType === oracleAutoCompletionHelper_1.OracleSQLPlusStmtSubType.G_S_EXECUTE)
                        formattedString += `,${space.repeat(1)}`;
                    else
                        formattedString += `,\r\n${space.repeat(identetaion)}`;
                }
            });
        }
        else {
            for (var paramIdx = 0; paramIdx < parameters.length; paramIdx++) {
                if (parameters[paramIdx].direction?.toUpperCase() != "RETURN") {
                    parameterList.push(OracleAutoCompletionUtils.getFormattedParamter(parameters[paramIdx].name, parameters[paramIdx].direction, parameters[paramIdx].dataType));
                }
            }
            var identetaion = tokenPostion != null ? tokenPostion.getStartingPositionForNewLine(methodName) : 0;
            let space = " ";
            parameterList.forEach((type, index) => {
                const [argName, argType] = type.split("=>");
                if (formattedString != null) {
                    formattedString += `${argName} => \${${index + 1}:${placeHolder}} /*${argType.trim()}*/`;
                }
                else {
                    formattedString = `${argName} => \${${index + 1}:${placeHolder}} /*${argType.trim()}*/`;
                }
                if (index < parameterList.length - 1 && parameterList.length > 1) {
                    if (tokenPostion.tokenInfo.stmtType === oracleAutoCompletionHelper_1.OracleSQLPlusStmtType.G_C_SQLPLUS && tokenPostion.tokenInfo.stmtSubType === oracleAutoCompletionHelper_1.OracleSQLPlusStmtSubType.G_S_EXECUTE)
                        formattedString += `,${space.repeat(1)}`;
                    else
                        formattedString += `,\r\n${space.repeat(identetaion)}`;
                }
            });
        }
        let finalStringToInsert = formattedString == null ? `${methodName}()` : `${methodName}(${formattedString})`;
        return new vscode.SnippetString(finalStringToInsert).appendTabstop(0);
    }
    static getColumnDetail(items, objNameCase = intellisenseModels_1.Casing.None) {
        let schemaSet = new Set();
        let stringTable = '';
        let schemaTable = '';
        for (const key in items) {
            let value = items[key];
            if (stringTable.length < 128)
                stringTable = OracleAutoCompletionUtils.appendToList(key, stringTable, objNameCase);
            if (schemaTable.length < 128) {
                if (!schemaSet.has(value.owner)) {
                    schemaSet.add(value.owner);
                    schemaTable = OracleAutoCompletionUtils.appendToList(value.owner, schemaTable, objNameCase);
                }
            }
            else
                break;
        }
        if (stringTable.length >= 128)
            stringTable = `${stringTable.substr(0, 127)}...`;
        if (schemaTable.length >= 128)
            schemaTable = `${schemaTable.substr(0, 127)}...`;
        return [stringTable, schemaTable];
    }
    static appendToList(key, list, objNameCase = intellisenseModels_1.Casing.None) {
        let modifiedKey;
        if (list.length > 0) {
            list = list.concat(",");
        }
        if (key) {
            if (key.toLowerCase() == key)
                modifiedKey = key;
            else
                modifiedKey = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(key, objNameCase);
            list = list.concat(modifiedKey);
        }
        return list;
    }
    static getCompletionItemFromMethodArgumentList(item, intelliSenseSettings, tokenPostion, forStaticFunction, appendParent = false) {
        let completionItems = new Array();
        var sortedList = OracleAutoCompletionUtils.sortListOnParameterCount(item.methodArgumentList);
        for (let idx = 0; idx < sortedList.length; idx++) {
            let paramObjectList = sortedList[idx][1];
            var caseSettings = new intellisenseModels_1.CaseSettings(intelliSenseSettings.keywordCase, intelliSenseSettings.objectNameCase);
            OracleAutoCompletionUtils.setMethodArgumentCasing(paramObjectList, caseSettings);
            let completionItem = new OracleMethod();
            completionItem.name = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.name, intelliSenseSettings.keywordCase);
            completionItem.objectType = item.objectType;
            completionItem.owner = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.owner, intelliSenseSettings.keywordCase);
            completionItem.quoteNeeded = item.quoteNeeded;
            completionItem.completionItemKind = vscode.CompletionItemKind.Method;
            completionItem.methodArgumentList = item.methodArgumentList;
            OracleAutoCompletionUtils.populateMethodDetailAndDocumentation(completionItem, paramObjectList, caseSettings.keywordCase);
            completionItem.insertText = OracleAutoCompletionUtils.getTextToInsert(completionItem, paramObjectList, tokenPostion, forStaticFunction, caseSettings.objectNameCase);
            completionItems.push(completionItem);
        }
        return completionItems;
    }
}
exports.OracleAutoCompletionUtils = OracleAutoCompletionUtils;
OracleAutoCompletionUtils.objectTypeVsString = new Map();
OracleAutoCompletionUtils.MaximumItemstoDisplay = 10;
OracleAutoCompletionUtils.MaximumItemstoDisplayForStaticData = 10;
OracleAutoCompletionUtils.MaximumObjectstoDisplay = 5;
class TokenPositionHelper {
    constructor(tokenInfo, position, document, scopeItems = null) {
        this.tokenInfo = tokenInfo;
        this.position = position;
        this.document = document;
        this.scopeItems = scopeItems;
    }
    getFirstNonWhitespaceCharacterIndex() {
        return this.document.lineAt(this.position).firstNonWhitespaceCharacterIndex;
    }
    getStartingPositionForNewLine(token) {
        var offset = 0;
        var userEnteredtokenLength = 0;
        if (this.tokenInfo != null) {
            userEnteredtokenLength = this.tokenInfo.token1 != null ? this.tokenInfo.token1.length : 0;
        }
        offset = token != null ? (token.length - userEnteredtokenLength) : userEnteredtokenLength;
        var position = (this.position.character - this.getFirstNonWhitespaceCharacterIndex()) + offset + 1;
        return (position > 0 ? position : 0);
    }
}
exports.TokenPositionHelper = TokenPositionHelper;
class TokenInfo {
    constructor() {
        this.token3 = null;
        this.token2 = null;
        this.token1 = null;
        this.dbFormattedToken3 = null;
        this.dbFormattedToken2 = null;
        this.dbFormattedToken1 = null;
        this.tokenTerminator = intellisenseRequests_1.TokenTerminator.None;
        this.commaCount = 0;
        this.count = 0;
        this.aliasInfo = new oracleLanguageFeaturesHelper_1.AliasInfo();
        this.stmtSubType = oracleAutoCompletionHelper_1.OracleSQLPlusStmtSubType.G_S_UNKNOWN;
        this.ctrlSpaceKeyPressed = false;
        this.stmtContext = oracleAutoCompletionHelper_1.StatementContext.unknown;
        this.stmtType = oracleAutoCompletionHelper_1.OracleSQLPlusStmtType.G_C_UNKNOWN;
    }
    getToken() {
        var tokenText = undefined;
        switch (this.count) {
            case 1:
                tokenText = this.token1;
                break;
            case 2:
                tokenText = (this.token1 != null) ? `${this.token2}.${this.token1}` : `${this.token2}.`;
                break;
            case 3:
                tokenText = (this.token1 != null) ? `${this.token3}.${this.token2}.${this.token1}` : `${this.token3}.${this.token2}.`;
                break;
            default:
                break;
        }
        return tokenText;
    }
}
exports.TokenInfo = TokenInfo;
class oracleDocumentIntelliSenseManager {
    constructor() {
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.IntelliSenseReadyNotification.event, this.intellisenseServiceReadyEventHandler());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.IntelliSenseStartNotification.event, this.intellisenseServiceStartEventHandler());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.ClearIntelliSenseNotification.event, this.OnClearIntelliSenseCache());
        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.onNotification(LangService.rebuildIntelliSenseOnReconnectEvent.event, this.onRebuildIntelliSenseOnReconnect());
        this.intelliSenseData = new Map();
    }
    setStatusBarManager(statusbarMgr) {
        this.statusBarManager = statusbarMgr;
    }
    updateStatusBarManager(fileUri, msg) {
        this.statusBarManager.displayLangServiceStatus(fileUri, helper.stringFormatterCsharpStyle(localizedConstants_1.default.updatingIntellisenseObjectMessage, msg));
    }
    static get instance() {
        if (oracleDocumentIntelliSenseManager.varInstance == undefined) {
            var tempInstance = new oracleDocumentIntelliSenseManager();
            oracleDocumentIntelliSenseManager.varInstance = tempInstance;
        }
        return oracleDocumentIntelliSenseManager.varInstance;
    }
    getIntelliSenseObjectforDocument(uri) {
        var intelliSenseData = null;
        if (this.intelliSenseData.has(uri)) {
            intelliSenseData = this.intelliSenseData.get(uri);
        }
        else {
            intelliSenseData = new oracleIntelliSenseInfo();
        }
        return intelliSenseData;
    }
    intellisenseServiceReadyEventHandler() {
        return (event) => {
            try {
                this.statusBarManager.displayLangServiceStatus(event.uri, "");
                var data = this.getIntelliSenseObjectforDocument(event.uri);
                fileLogger.info("IntelliSense completed for document.");
            }
            catch (error) {
                fileLogger.error(`intellisenseServiceReadyEventHandler(): error: ${this.getErrorMessage(error)}`);
            }
        };
    }
    intellisenseServiceStartEventHandler() {
        return (event) => {
            try {
                this.updateStatusBarManager(event.uri, `${event.schema}`);
                var data = this.getIntelliSenseObjectforDocument(event.uri);
                fileLogger.info("IntelliSense completed for document.");
            }
            catch (error) {
                fileLogger.error(`intellisenseServiceReadyEventHandler(): error: ${this.getErrorMessage(error)}`);
            }
        };
    }
    OnClearIntelliSenseCache() {
        return (event) => {
            this.clearCacheForDocument(event.uri);
        };
    }
    getErrorMessage(error) {
        var msg = "";
        if (error && error.message) {
            msg = error.message;
        }
        return msg;
    }
    clearCacheForDocument(connectionURI) {
        try {
            if (this.intelliSenseData.has(connectionURI)) {
                var intelliSenseInfo = this.intelliSenseData.get(connectionURI);
                this.intelliSenseData.delete(connectionURI);
                fileLogger.info(`Cache cleared for document.`);
            }
        }
        catch (error) {
            fileLogger.error(`clearCacheForDocument(): error: ${this.getErrorMessage(error)}`);
        }
    }
    updateLanguageFeatureForDocument(docID, enable) {
        if (this.intelliSenseData.has(docID)) {
            var data = this.intelliSenseData.get(docID);
            data.IntellisenseEnable = enable;
            if (enable) {
                fileLogger.info(`intellisense enabled for document.`);
            }
            else {
                fileLogger.info(`intellisense disabled for document.`);
            }
        }
    }
    isLanguageFeaturenableForDocument(docID) {
        try {
            var enable = true;
            if (this.intelliSenseData.has(docID)) {
                var data = this.intelliSenseData.get(docID);
                enable = data.IntellisenseEnable;
            }
        }
        catch (error) {
            fileLogger.error(`isLanguageFeaturenableForDocument(): error: ${this.getErrorMessage(error)}`);
        }
        return enable;
    }
    onRebuildIntelliSenseOnReconnect() {
        return (event) => {
            this.statusBarManager.displayLangServiceStatus(event.ownerUri, localizedConstants_1.default.updatingIntellisenseMessage);
            oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendNotification(intellisenseRequests_1.RebuildIntelliSenseNotification.event, { uri: event.ownerUri, forceRebuild: false });
        };
    }
}
exports.oracleDocumentIntelliSenseManager = oracleDocumentIntelliSenseManager;
oracleDocumentIntelliSenseManager.varInstance = undefined;
class oracleIntelliSenseInfo {
    constructor() {
        this.IntellisenseEnable = true;
        this.buildingIntelliSense = false;
    }
}
exports.oracleIntelliSenseInfo = oracleIntelliSenseInfo;
class oracleCompletionItemDataProvider extends oracleSignatureHelpProvider_1.oracleAutoCompletionDataProvider {
    constructor(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager) {
        super(intelliSenseSettings, vscodeConnector, connectionCommandHandler, dataExplorerManager);
    }
    getCombinedList(vsCodeConnectedObjectList, vsCodeColumnList) {
        var vsCodeCompletionList = vsCodeConnectedObjectList;
        vsCodeColumnList.items.forEach(codeitem => {
            vsCodeConnectedObjectList.items.push(codeitem);
        });
        return vsCodeCompletionList;
    }
    async handleThreePartIdentifierResolution(documentToken) {
        var vsCodeList = new vscode.CompletionList();
        if (documentToken.followupToken && documentToken.followupToken.length > 0) {
            vsCodeList = await this.tokensBasedOnParser(documentToken);
            return vsCodeList;
        }
        return vsCodeList;
    }
    async getMatchingStaticKeywordList(vsCodeList, documentToken) {
        this.addStaticSQLFunctions(vsCodeList, documentToken);
        await this.addKeywords(vsCodeList, documentToken);
    }
    async handleOnePartIdentifierResolution(documentToken) {
        var vsCodeList = new vscode.CompletionList();
        var vsCodeObjectList = new vscode.CompletionList();
        if (documentToken.tokenInfo.completionItems) {
            let completionList = new Array();
            documentToken.tokenInfo.completionItems.forEach(item => {
                item = OracleAutoCompletionUtils.prepareItemInfo(item, this.intelliSenseSettings, documentToken.tokenPosition);
                completionList.push(item);
            });
            vsCodeObjectList = OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.intelliSenseSettings, completionList, documentToken.lastTokenRange);
        }
        if (documentToken.tokenInfo.stmtContext !== oracleAutoCompletionHelper_1.StatementContext.unknown) {
            await this.getMatchingStaticKeywordList(vsCodeObjectList, documentToken);
        }
        let arr = [];
        switch (documentToken.tokenInfo.stmtContext) {
            case oracleAutoCompletionHelper_1.StatementContext.unknown:
                arr = ['SELECT', 'DROP', 'UPDATE', 'DELETE', 'INSERT'];
                await this.getMatchingStaticKeywordList(vsCodeList, documentToken);
                if (!(documentToken.tokenInfo.stmtSubType >= oracleAutoCompletionHelper_1.OracleSQLPlusStmtSubType.G_S_CREATE_PACKAGE_HEADER &&
                    documentToken.tokenInfo.stmtSubType <= oracleAutoCompletionHelper_1.OracleSQLPlusStmtSubType.G_S_CREATE_UNKNOWN))
                    await this.updateKeywordOnCertainContext(documentToken, vsCodeList, arr);
                vsCodeList = this.getCombinedList(vsCodeList, vsCodeObjectList);
                if (documentToken.tokenInfo.tokensAfterObjects) {
                    await this.AddTokensFromParser(documentToken, vsCodeList);
                }
                break;
            case oracleAutoCompletionHelper_1.StatementContext.values_clause:
                arr = ['SELECT'];
                await this.updateKeywordOnCertainContext(documentToken, vsCodeObjectList, arr);
                vsCodeList = this.getCombinedList(vsCodeList, vsCodeObjectList);
                if (documentToken.tokenInfo.tokensAfterObjects) {
                    await this.AddTokensFromParser(documentToken, vsCodeList);
                }
                break;
            default: {
                vsCodeList = vsCodeObjectList;
                if (documentToken.tokenInfo.tokensAfterObjects) {
                    await this.AddTokensFromParser(documentToken, vsCodeList);
                }
            }
        }
        return vsCodeList;
    }
    async tokensBasedOnParser(documentToken) {
        var vsCodeList = new vscode.CompletionList();
        switch (documentToken.tokenInfo.stmtContext) {
            case oracleAutoCompletionHelper_1.StatementContext.from_clause:
                {
                    let arr = documentToken.followupToken;
                    if (arr && documentToken.tokenInfo.dbFormattedToken1 != null && documentToken.tokenInfo.dbFormattedToken1.length > 1) {
                        await this.updateKeywordOnCertainContext(documentToken, vsCodeList, arr, true);
                    }
                    if (arr.length > 0 && vsCodeList.items.length === 0)
                        return null;
                }
                break;
            case oracleAutoCompletionHelper_1.StatementContext.insert_into_clause:
            case oracleAutoCompletionHelper_1.StatementContext.insert_into_clause_columns:
            case oracleAutoCompletionHelper_1.StatementContext.conditional_insert_clause:
            case oracleAutoCompletionHelper_1.StatementContext.set_operation:
            case oracleAutoCompletionHelper_1.StatementContext.update:
            case oracleAutoCompletionHelper_1.StatementContext.delete:
            case oracleAutoCompletionHelper_1.StatementContext.where_clause:
            case oracleAutoCompletionHelper_1.StatementContext.select_list:
            case oracleAutoCompletionHelper_1.StatementContext.from_clause:
            case oracleAutoCompletionHelper_1.StatementContext.update_set_clause:
            case oracleAutoCompletionHelper_1.StatementContext.unknown:
            case oracleAutoCompletionHelper_1.StatementContext.values_clause:
            default:
                let arr = documentToken.followupToken;
                if (arr) {
                    await this.updateKeywordOnCertainContext(documentToken, vsCodeList, arr, true);
                }
                break;
        }
        return vsCodeList;
    }
    async handleTwoPartIdentifierResolution(documentToken) {
        var vsCodeList = new vscode.CompletionList();
        if (documentToken.followupToken && documentToken.followupToken.length > 0) {
            vsCodeList = await this.tokensBasedOnParser(documentToken);
            return vsCodeList;
        }
        return vsCodeList;
    }
    async updateKeywordOnCertainContext(documentToken, vsCodeList, arr, sortText = false) {
        let caseArr = arr.map((label) => oracleLanguageFeaturesHelper_1.CasingHelper.setCase(label, this.intelliSenseSettings.keywordCase));
        let count = 0;
        await caseArr.forEach(async (item) => {
            let obj = vsCodeList.items.find(label => label.label === item && label.kind
                && label.kind === vscode_1.CompletionItemKind.Keyword);
            if (obj)
                obj.sortText = count.toString();
            else if (documentToken.tokenInfo.dbFormattedToken1 === null || (documentToken.tokenInfo.dbFormattedToken1 != null &&
                item.toLocaleUpperCase().startsWith(documentToken.tokenInfo.dbFormattedToken1.toLocaleUpperCase()))) {
                obj = await this.getSpecificKeyword(item.toUpperCase());
                if (obj) {
                    obj.sortText = count.toString();
                    vsCodeList.items.push(obj);
                }
                else {
                    let newItem = new vscode.CompletionItem(item);
                    newItem.sortText = count.toString();
                    newItem.kind = vscode_1.CompletionItemKind.Operator;
                    vsCodeList.items.push(newItem);
                }
                if (sortText)
                    count++;
            }
        });
    }
    async AddTokensFromParser(documentToken, vsCodeList) {
        documentToken.tokenInfo.tokensAfterObjects.forEach((item) => {
            item.item1 = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(item.item1, this.intelliSenseSettings.keywordCase);
        });
        let caseArr = documentToken.tokenInfo.tokensAfterObjects;
        await caseArr.map(async (item) => {
            let obj = vsCodeList.items.find(label => label.label === item.item1 && label.kind === vscode_1.CompletionItemKind.Keyword);
            if (obj) {
                obj.sortText = item.item2;
            }
            else {
                obj = await this.getSpecificKeyword(item.item1.toUpperCase());
                if (obj) {
                    obj.sortText = item.item2;
                }
                else {
                    obj = new vscode.CompletionItem(item.item1);
                    obj.sortText = item.item2;
                    obj.kind = vscode_1.CompletionItemKind.Operator;
                }
                vsCodeList.items.push(obj);
            }
        });
    }
    addStaticSQLFunctions(vsCodeCompletionList, documentToken) {
        var sqlFunctions = OracleStaticSQLFunction.getStaticSQLFunctionCompletionList(this.intelliSenseSettings.objectNameCase);
        var completionItems = new Array();
        var vsCodeList = null;
        let maximumObjectstoDisplay = OracleAutoCompletionUtils.MaximumObjectstoDisplay;
        let count = 0;
        try {
            if (documentToken.tokenInfo.stmtContext != oracleAutoCompletionHelper_1.StatementContext.from_clause &&
                documentToken.tokenInfo.stmtContext != oracleAutoCompletionHelper_1.StatementContext.join_clause &&
                documentToken.tokenInfo.stmtContext != oracleAutoCompletionHelper_1.StatementContext.outer_join_clause &&
                documentToken.tokenInfo.stmtContext != oracleAutoCompletionHelper_1.StatementContext.inner_cross_join_clause &&
                documentToken.tokenInfo.stmtContext != oracleAutoCompletionHelper_1.StatementContext.update &&
                documentToken.tokenInfo.stmtContext != oracleAutoCompletionHelper_1.StatementContext.insert_into_clause &&
                documentToken.tokenInfo.stmtContext != oracleAutoCompletionHelper_1.StatementContext.delete)
                for (const [key, completionItem] of sqlFunctions) {
                    if (documentToken.tokenInfo.dbFormattedToken1 != null && !key.startsWith(documentToken.tokenInfo.dbFormattedToken1))
                        continue;
                    var completionList = OracleAutoCompletionUtils.getCompletionItemFromMethodArgumentList(completionItem, this.intelliSenseSettings, documentToken.tokenPosition, true);
                    completionItem.objectType = intellisenseRequests_1.SchemaObjectType.StaticSQLFunction;
                    completionList.forEach(item => {
                        if (documentToken.tokenInfo.stmtContext === oracleAutoCompletionHelper_1.StatementContext.values_clause)
                            item.sortText = '2';
                        else if (documentToken.staticFunctionSortText != null) {
                            item.sortText = documentToken.staticFunctionSortText;
                        }
                        else {
                            item.sortText = "I";
                            ;
                        }
                        completionItems.push(item);
                    });
                    vsCodeList = OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.intelliSenseSettings, completionList, documentToken.lastTokenRange);
                    for (var idx = 0; idx < vsCodeList.items.length; idx++) {
                        count++;
                        vsCodeCompletionList.items.push(vsCodeList.items[idx]);
                    }
                    if (count >= maximumObjectstoDisplay) {
                        break;
                    }
                }
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("error in reading static functions.");
            helper.logErroAfterValidating(error);
        }
    }
    async addKeywords(vsCodeCompletionList, documentToken) {
        var oracleKeyWordList = OracleKeyWordList.getOracleKeywordList(this.intelliSenseSettings.keywordCase, OracleKeyWordList.staticKeywordListfromAPI);
        let maximumObjectstoDisplay = OracleAutoCompletionUtils.MaximumObjectstoDisplay;
        let count = 0;
        for (const [key, oracleKeywordItem] of oracleKeyWordList) {
            if (documentToken.tokenInfo.dbFormattedToken1 != null && !key.startsWith(documentToken.tokenInfo.dbFormattedToken1)
                || ((documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.from_clause || documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.outer_join_clause
                    || documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.inner_cross_join_clause || documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.values_clause)
                    && (oracleKeywordItem.completionItemKind == vscode_1.CompletionItemKind.Value || oracleKeywordItem.completionItemKind == vscode_1.CompletionItemKind.Variable))) {
                continue;
            }
            oracleKeywordItem.detail = oracleKeywordItem.detail + " ";
            oracleKeywordItem.sortText = "H";
            let item = OracleAutoCompletionUtils.getVSCodeCompletionItem(this.intelliSenseSettings, oracleKeywordItem, documentToken.lastTokenRange, "H", true);
            if (item)
                vsCodeCompletionList.items.push(item);
            count++;
            if (count >= maximumObjectstoDisplay) {
                break;
            }
        }
        if (documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.select_list || documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.select_term) {
            let item = vsCodeCompletionList.items.find(i => i.label?.toUpperCase() === localizedConstants_1.default.ai);
            if (item == null && (documentToken.tokenInfo.dbFormattedToken1 == null || localizedConstants_1.default.ai.startsWith(documentToken.tokenInfo.dbFormattedToken1))) {
                item = await this.getSpecificKeyword(localizedConstants_1.default.ai);
                vsCodeCompletionList.items.push(item);
            }
            if (item) {
                item.sortText = "G";
            }
        }
    }
    async getSpecificKeyword(keyword) {
        let vsCodeItem = null;
        var oracleKeyWordList = OracleKeyWordList.getOracleKeywordList(this.intelliSenseSettings.keywordCase, OracleKeyWordList.staticKeywordListfromAPI);
        let item = oracleKeyWordList.get(keyword);
        if (item) {
            item.detail = item.detail + " ";
            vsCodeItem = OracleAutoCompletionUtils.getVSCodeCompletionItem(this.intelliSenseSettings, item, null, "H", true);
            if (vsCodeItem)
                vsCodeItem.sortText = "1";
        }
        return vsCodeItem;
    }
    static async handleKeywordRequest() {
        if (OracleKeyWordList.staticKeywordListfromAPI.length == 0) {
            const fileName = "./oracleStaticSQLFunctions";
            var sqlFunctions;
            try {
                sqlFunctions = require(fileName);
                let functionList = Object.keys(sqlFunctions);
                OracleKeyWordList.staticKeywordListfromAPI = await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(intellisenseRequests_1.KeywordsRequest.Request, new intellisenseRequests_1.KeywordRequestParam(functionList));
                fileLogger.info("Autocompletion: getKeywordList() request completed: the list is returned");
            }
            catch (e) {
                logger_1.FileStreamLogger.Instance.error("error in reading static keywords.");
                helper.logErroAfterValidating(e);
            }
        }
    }
    async handleLanguageFeatureRequest(document, position, token, context) {
        return new Promise(async (resolve, reject) => {
            let documentToken = new iLanguageTokenHandler_1.DocumentToken();
            try {
                var tokenPostion = new TokenPositionHelper(null, position, document);
                if (this.intelliSenseSettings.enabled && this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                    var docAndUserID = this.getConnecteduserAndDocID(document);
                    var documentId = docAndUserID[0];
                    var connectedUser = docAndUserID[1];
                    var fileURI = docAndUserID[2];
                    const executeQueryRequest = new scriptExecutionModels_1.ScriptExecuteParams();
                    executeQueryRequest.ownerUri = this.vscodeConnector.activeTextEditorUri;
                    executeQueryRequest.selection = OracleAutoCompletionUtils.getSelection(position);
                    executeQueryRequest.querySettings = settings_1.Settings.getQueryExecutionSettingsForDoc(document);
                    documentToken.isTokenSpaceKey = (context != null && context.triggerCharacter != null && context.triggerCharacter == ' ') ? true : false;
                    documentToken.connectedSchema = connectedUser;
                    documentToken.tokenPosition = tokenPostion;
                    documentToken.documentId = documentId;
                    token.onCancellationRequested(async () => {
                        fileLogger.info("Cancellation request for Autocompletion");
                        oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(intellisenseRequests_1.IntelliSenseCancelTokenRequest.type, new intellisenseRequests_1.TokenRequestParameter(0, 0, fileURI, intellisenseRequests_1.TokenSource.AutoComplete, null, false, null));
                        reject();
                    });
                    if (tokenPostion.position.line == 0 && (tokenPostion.position.character == 1 || tokenPostion.position.character == 0)) {
                        var vsCodeList = new vscode.CompletionList();
                        documentToken.tokenInfo.dbFormattedToken1 = tokenPostion.document.getText();
                        documentToken.tokenInfo.dbFormattedToken1 = documentToken.tokenInfo.dbFormattedToken1 && documentToken.tokenInfo.dbFormattedToken1 != ' ' ? documentToken.tokenInfo.dbFormattedToken1.toUpperCase() : '';
                        await this.getMatchingStaticKeywordList(vsCodeList, documentToken);
                        vsCodeList.isIncomplete = true;
                        resolve(vsCodeList);
                        return;
                    }
                    await this.languageServerClient.sendRequest(intellisenseRequests_1.IntelliSenseTokenRequest.type, new intellisenseRequests_1.TokenRequestParameter(position.line, position.character, fileURI, intellisenseRequests_1.TokenSource.AutoComplete, executeQueryRequest, documentToken.isTokenSpaceKey, this.intelliSenseSettings))
                        .then(async (result) => {
                        fileLogger.info(`intellisense is  result received`);
                        if (result === null)
                            resolve(null);
                        var tokenResponse = result;
                        documentToken.aliasInfo = tokenResponse.aliasInfo;
                        documentToken.followupToken = tokenResponse.followupToken;
                        documentToken.tokenInfo = OracleAutoCompletionUtils.getTokenCountAndTokenInfo(tokenResponse, documentToken.isTokenSpaceKey);
                        documentToken.tokenInfo.completionItems = result.completionItems;
                        documentToken.tokenPosition.tokenInfo = documentToken.tokenInfo;
                        documentToken.staticFunctionSortText = documentToken.tokenInfo.stmtContext == oracleAutoCompletionHelper_1.StatementContext.having_clause ? "0" : null;
                        documentToken.tokenInfo.tokensAfterObjects = result.tokensAfterObjects;
                        var objectList = null;
                        switch (documentToken.tokenInfo.count) {
                            case 1:
                                {
                                    if (documentToken.isTokenSpaceKey && documentToken.tokenInfo.stmtContext === oracleAutoCompletionHelper_1.StatementContext.values_clause) {
                                        resolve(null);
                                        return;
                                    }
                                    if (documentToken.followupToken && documentToken.followupToken.length > 0) {
                                        let vsCodeList = await this.tokensBasedOnParser(documentToken);
                                        if (vsCodeList != null)
                                            vsCodeList.isIncomplete = true;
                                        if (vsCodeList == null || vsCodeList.items.length > 0) {
                                            resolve(vsCodeList);
                                            return;
                                        }
                                    }
                                    if (documentToken.tokenInfo.dbFormattedToken2) {
                                        let length = documentToken.tokenInfo.dbFormattedToken2.length;
                                        if (!documentToken.tokenInfo.isQuoted) {
                                            let startPos = new vscode.Position(position.line, position.character - length);
                                            documentToken.lastTokenRange = new vscode.Range(startPos, position);
                                        }
                                    }
                                    objectList = await this.handleOnePartIdentifierResolution(documentToken);
                                    fileLogger.info(`intellisense is one part end `);
                                }
                                break;
                            case 2:
                            case 3:
                                if (!documentToken.tokenInfo.isQuoted) {
                                    let lastTokenLength = documentToken.tokenInfo.dbFormattedToken1 == null ?
                                        documentToken.tokenInfo.dbFormattedToken2 == null ? 0 : documentToken.tokenInfo.dbFormattedToken2.length
                                        : documentToken.tokenInfo.dbFormattedToken1.length;
                                    if (lastTokenLength > 0 && documentToken.tokenInfo.tokenTerminator !== intellisenseRequests_1.TokenTerminator.EndWithDOT) {
                                        documentToken.lastTokenRange = new vscode.Range(new vscode.Position(position.line, position.character - lastTokenLength), position);
                                    }
                                }
                                let completionList = new Array();
                                documentToken.tokenInfo.completionItems.forEach(item => {
                                    item = OracleAutoCompletionUtils.prepareItemInfo(item, this.intelliSenseSettings, documentToken.tokenPosition);
                                    completionList.push(item);
                                });
                                objectList = OracleAutoCompletionUtils.getVscodeListFromCompletionList(this.intelliSenseSettings, completionList, documentToken.lastTokenRange);
                                break;
                            default:
                                objectList = new vscode.CompletionList();
                                break;
                        }
                        let text = documentToken.isTokenSpaceKey ? "objects for space key" : "objects";
                        let databaseObject = documentToken.connectedSchema == null ? "static" : "database";
                        if (objectList) {
                            fileLogger.info(`sending: ${databaseObject} ${text} count : ${objectList.items.length}`);
                            objectList.isIncomplete = objectList.items.length >= OracleAutoCompletionUtils.MaximumObjectstoDisplay
                                ? true : false;
                            resolve(objectList);
                        }
                        else
                            resolve(null);
                    }, (error) => {
                        helper.logErroAfterValidating(error);
                        resolve(new vscode.CompletionList());
                    });
                }
                else {
                    if (this.intelliSenseSettings.enabled) {
                        fileLogger.info(`intellisense is disabled for oracle VS Code. tried for doc ${this.vscodeConnector.activeTextEditorUri}`);
                    }
                    else if (this.oracleIntelliSenseDataMgr.isLanguageFeaturenableForDocument(this.vscodeConnector.activeTextEditorUri)) {
                        fileLogger.info(`intellisense is disabled for doc : ${this.vscodeConnector.activeTextEditorUri}`);
                    }
                    fileLogger.info(`sending no objects`);
                    resolve(new vscode.CompletionList());
                }
            }
            catch (error) {
                OracleAutoCompletionUtils.LogError(documentToken.tokenInfo, error);
                resolve(new vscode.CompletionList());
            }
        });
    }
}
exports.oracleCompletionItemDataProvider = oracleCompletionItemDataProvider;
class oracleCompletionitemProvider {
    constructor(vscodeConnector, connectionCommandHandler, dataExplorerManager, signatureHelpProvider) {
        this.items = new Array();
        this.vscodeConnector = undefined;
        this.connectionCommandHandler = undefined;
        this.dataExplorerManager = undefined;
        fileLogger.info("Initializing oracleCompletionItem Provider.");
        this.vscodeConnector = vscodeConnector;
        this.connectionCommandHandler = connectionCommandHandler;
        this.dataExplorerManager = dataExplorerManager;
        this.getKeywordList();
    }
    async getKeywordList() {
        oracleCompletionItemDataProvider.handleKeywordRequest();
    }
    provideCompletionItems(document, position, token, context) {
        fileLogger.info(`intellisense is request start`);
        let intelliSenseSettings = settings_1.Settings.Instance.getIntelliSenseSettingsForDoc(document);
        var completionItemDataProvider = new oracleCompletionItemDataProvider(intelliSenseSettings, this.vscodeConnector, this.connectionCommandHandler, this.dataExplorerManager);
        return completionItemDataProvider.handleLanguageFeatureRequest(document, position, token, context);
    }
    resolveCompletionItem(item, token) {
        return null;
    }
}
exports.oracleCompletionitemProvider = oracleCompletionitemProvider;
class OracleKeyWordList {
    static GetItemDetail(command) {
        var detail = command.name;
        let completionKind = vscode.CompletionItemKind.Keyword;
        let space = " ";
        switch (command.type) {
            case "command":
                detail = `${localizedConstants_1.default.command}`;
                completionKind = vscode.CompletionItemKind.Text;
                break;
            case "value":
                detail = `${localizedConstants_1.default.value}`;
                completionKind = vscode.CompletionItemKind.Value;
                break;
            case "variable":
                detail = `${localizedConstants_1.default.variable}`;
                completionKind = vscode.CompletionItemKind.Variable;
                break;
            case "keyword":
                detail = `${localizedConstants_1.default.keyword}`;
                break;
            default:
                break;
        }
        return { detail, completionKind };
    }
    static PrepareOracleKeywordList(keywordCasing, keywords) {
        if (!this.staticOracleKeywordList.has(keywordCasing)) {
            let keywordList = new Map();
            this.staticOracleKeywordList.set(keywordCasing, keywordList);
            var itemInfo;
            try {
                keywords.forEach(keyword => {
                    var item = new OracleObject();
                    item.name = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(keyword.name, keywordCasing);
                    itemInfo = this.GetItemDetail(keyword);
                    item.detail = itemInfo.detail;
                    item.completionItemKind = itemInfo.completionKind;
                    item.insertText = (keyword.name != undefined) ?
                        new vscode.SnippetString(oracleLanguageFeaturesHelper_1.CasingHelper.setCase(keyword.name, keywordCasing))
                        : null;
                    if (!keywordList.has(keyword.name))
                        keywordList.set(keyword.name, item);
                });
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Could not find file having keyword List");
                helper.logErroAfterValidating(error);
            }
        }
        return OracleKeyWordList.staticOracleKeywordList.get(keywordCasing);
    }
    static getOracleKeywordList(keywordCasing, keywords) {
        return this.PrepareOracleKeywordList(keywordCasing, keywords);
    }
    static clearOracleKeywordList() {
        if (this.staticKeywordListfromAPI.length > 0)
            this.staticKeywordListfromAPI = [];
        if (this.staticOracleKeywordList.size > 0)
            this.staticOracleKeywordList.clear();
    }
}
exports.OracleKeyWordList = OracleKeyWordList;
OracleKeyWordList.staticKeywordListfromAPI = [];
OracleKeyWordList.staticOracleKeywordList = new Map();
class OracleStaticSQLFunction {
    static prepareStaticSQLFunctionList(objectNameCasing) {
        if (!this.staticSQLCompletionList.has(objectNameCasing)) {
            let sqlCompletionList = new Map();
            this.staticSQLCompletionList.set(objectNameCasing, sqlCompletionList);
            const fileName = "./oracleStaticSQLFunctions";
            var sqlFunctions;
            try {
                sqlFunctions = require(fileName);
                let functionList = Object.keys(sqlFunctions);
                functionList = functionList.sort((a, b) => { return OracleAutoCompletionUtils.compareString(a, b); });
                for (var key in functionList) {
                    var funcName = functionList[key];
                    var argumentList = sqlFunctions[funcName];
                    if (argumentList != undefined) {
                        var item = new OracleMethod();
                        item.name = oracleLanguageFeaturesHelper_1.CasingHelper.setCase(funcName, objectNameCasing);
                        item.objectType = intellisenseRequests_1.SchemaObjectType.Function;
                        item.methodArgumentList = argumentList;
                        if (!sqlCompletionList.has(funcName))
                            sqlCompletionList.set(funcName, item);
                    }
                }
            }
            catch (error) {
                logger_1.FileStreamLogger.Instance.error("Could not find file having static SQL functions");
                helper.logErroAfterValidating(error);
            }
        }
    }
    static getStaticSQLFunctionCompletionList(objectNameCasing) {
        this.prepareStaticSQLFunctionList(objectNameCasing);
        return this.staticSQLCompletionList.get(objectNameCasing);
    }
    static clearStaticSQLCompletionList() {
        if (this.staticSQLCompletionList.size > 0)
            this.staticSQLCompletionList.clear();
    }
}
exports.OracleStaticSQLFunction = OracleStaticSQLFunction;
OracleStaticSQLFunction.staticSQLCompletionList = new Map();
