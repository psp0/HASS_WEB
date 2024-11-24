"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleCodeGenerationConstants = exports.OracleCodeGenerationLanguageIDs = exports.OracleCodeGenerationStatementType = exports.OracleCodeGenerationContext = void 0;
var OracleCodeGenerationContext;
(function (OracleCodeGenerationContext) {
    OracleCodeGenerationContext[OracleCodeGenerationContext["DML"] = 1] = "DML";
})(OracleCodeGenerationContext = exports.OracleCodeGenerationContext || (exports.OracleCodeGenerationContext = {}));
var OracleCodeGenerationStatementType;
(function (OracleCodeGenerationStatementType) {
    OracleCodeGenerationStatementType[OracleCodeGenerationStatementType["Default"] = 0] = "Default";
    OracleCodeGenerationStatementType[OracleCodeGenerationStatementType["Select_Cartesian_Product"] = 1] = "Select_Cartesian_Product";
    OracleCodeGenerationStatementType[OracleCodeGenerationStatementType["Select"] = 2] = "Select";
    OracleCodeGenerationStatementType[OracleCodeGenerationStatementType["Insert"] = 3] = "Insert";
    OracleCodeGenerationStatementType[OracleCodeGenerationStatementType["Update"] = 4] = "Update";
    OracleCodeGenerationStatementType[OracleCodeGenerationStatementType["Delete"] = 5] = "Delete";
    OracleCodeGenerationStatementType[OracleCodeGenerationStatementType["ExecuteStoredProcedure"] = 6] = "ExecuteStoredProcedure";
})(OracleCodeGenerationStatementType = exports.OracleCodeGenerationStatementType || (exports.OracleCodeGenerationStatementType = {}));
var OracleCodeGenerationLanguageIDs;
(function (OracleCodeGenerationLanguageIDs) {
    OracleCodeGenerationLanguageIDs["csharp"] = "csharp";
    OracleCodeGenerationLanguageIDs["python"] = "python";
    OracleCodeGenerationLanguageIDs["java"] = "java";
    OracleCodeGenerationLanguageIDs["javascript"] = "javascript";
})(OracleCodeGenerationLanguageIDs = exports.OracleCodeGenerationLanguageIDs || (exports.OracleCodeGenerationLanguageIDs = {}));
class OracleCodeGenerationConstants {
}
exports.OracleCodeGenerationConstants = OracleCodeGenerationConstants;
OracleCodeGenerationConstants.s_vCodeGenerationQueryType = [
    {
        name: "Select",
        value: OracleCodeGenerationStatementType.Select
    },
];
OracleCodeGenerationConstants.s_vCodeGenerationLanguages = [
    {
        name: "C#",
        value: OracleCodeGenerationLanguageIDs.csharp
    },
    {
        name: "Java",
        value: OracleCodeGenerationLanguageIDs.java
    },
    {
        name: "Python",
        value: OracleCodeGenerationLanguageIDs.python
    },
    {
        name: "JavaScript",
        value: OracleCodeGenerationLanguageIDs.javascript
    }
];
OracleCodeGenerationConstants.s_vCodeGenerationLanguageIds = new Set(OracleCodeGenerationConstants.s_vCodeGenerationLanguages.map((x) => x.value));
OracleCodeGenerationConstants.s_vGetConstraintsSelect = `SELECT
  OWNER, CONSTRAINT_NAME, TABLE_NAME, CONSTRAINT_TYPE,
  R_OWNER, R_CONSTRAINT_NAME
FROM
  ALL_CONSTRAINTS
WHERE
  STATUS = 'ENABLED' AND
  CONSTRAINT_TYPE IN ('R','P') AND
`;
OracleCodeGenerationConstants.s_vGetConstraintsOrderBy = `
ORDER BY
  CONSTRAINT_TYPE DESC,
  TABLE_NAME ASC,
  CONSTRAINT_NAME ASC
`;
OracleCodeGenerationConstants.s_vGetConstraintsColumnsSelect = `SELECT
  OWNER, CONSTRAINT_NAME, COLUMN_NAME, POSITION
FROM
  ALL_CONS_COLUMNS
WHERE
`;
OracleCodeGenerationConstants.s_vGetConstraintsColumnsOrderBy = `
ORDER BY
  OWNER ASC,
  CONSTRAINT_NAME ASC,
  POSITION ASC
`;
