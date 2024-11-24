"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.caseMap = exports.IntelliSenseSettings = exports.OracleParameterList = exports.LocalSymbolType = exports.MethodParam = exports.DbObjectName = exports.CaseSettings = exports.Casing = void 0;
var Casing;
(function (Casing) {
    Casing[Casing["None"] = 0] = "None";
    Casing[Casing["Uppercase"] = 1] = "Uppercase";
    Casing[Casing["Lowercase"] = 2] = "Lowercase";
    Casing[Casing["Titlecase"] = 3] = "Titlecase";
    Casing[Casing["SameAsIntellisense"] = 4] = "SameAsIntellisense";
})(Casing = exports.Casing || (exports.Casing = {}));
class CaseSettings {
    constructor(keywordCase, objectNameCase) {
        this.keywordCase = keywordCase;
        this.objectNameCase = objectNameCase;
    }
    Equals(newSettings) {
        return this.keywordCase == newSettings.keywordCase &&
            this.objectNameCase == newSettings.objectNameCase;
    }
}
exports.CaseSettings = CaseSettings;
class DbObjectName {
}
exports.DbObjectName = DbObjectName;
class MethodParam {
}
exports.MethodParam = MethodParam;
var LocalSymbolType;
(function (LocalSymbolType) {
    LocalSymbolType[LocalSymbolType["Unknown"] = 0] = "Unknown";
    LocalSymbolType[LocalSymbolType["Variable"] = 1] = "Variable";
    LocalSymbolType[LocalSymbolType["Constant"] = 2] = "Constant";
    LocalSymbolType[LocalSymbolType["Cursor"] = 3] = "Cursor";
    LocalSymbolType[LocalSymbolType["Subtype"] = 4] = "Subtype";
    LocalSymbolType[LocalSymbolType["Exception"] = 5] = "Exception";
    LocalSymbolType[LocalSymbolType["Pragma"] = 6] = "Pragma";
    LocalSymbolType[LocalSymbolType["Procedure"] = 7] = "Procedure";
    LocalSymbolType[LocalSymbolType["Function"] = 8] = "Function";
    LocalSymbolType[LocalSymbolType["Type"] = 9] = "Type";
    LocalSymbolType[LocalSymbolType["Parameter"] = 10] = "Parameter";
    LocalSymbolType[LocalSymbolType["TableAlias"] = 11] = "TableAlias";
    LocalSymbolType[LocalSymbolType["ColumnAlias"] = 12] = "ColumnAlias";
})(LocalSymbolType = exports.LocalSymbolType || (exports.LocalSymbolType = {}));
class OracleParameterList {
    constructor(isFunction, parameters) {
        this.isFunction = isFunction;
        this.parameters = parameters;
    }
}
exports.OracleParameterList = OracleParameterList;
class IntelliSenseSettings {
    constructor(enabled = true, keywordCase = Casing.Uppercase, objectNameCase = Casing.Uppercase, synonymDepth = 1, rebuildOnConnAssociation = false) {
        this.enabled = enabled;
        this.keywordCase = keywordCase;
        this.objectNameCase = objectNameCase;
        this.synonymDepth = synonymDepth;
        this.rebuildOnConnAssociation = rebuildOnConnAssociation;
    }
}
exports.IntelliSenseSettings = IntelliSenseSettings;
exports.caseMap = {
    'Uppercase': Casing.Uppercase,
    'Lowercase': Casing.Lowercase,
    'Titlecase': Casing.Titlecase,
    'None': Casing.None
};
