"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplainSettingType = exports.ExplainPlanConstants = exports.ExplainAndExecutionPlanConfig = exports.DbmsExplainPlanConfig = exports.DbmsXplanOption = exports.ExplainPlanConfig = exports.ExplainColumn = exports.ExplainFormatType = exports.explainPlanUtils = void 0;
const constants_1 = require("../constants/constants");
const settings_1 = require("../utilities/settings");
const logger = require("../infrastructure/logger");
const helper = require("./../utilities/helper");
class explainPlanUtils {
    static getExplainPlanSettings(settingType, editorDoc) {
        let config = null;
        switch (settingType) {
            case ExplainSettingType.ExplainPlan:
                config = this.getSetting(constants_1.Constants.explainPlanSettingProperty, settingType, editorDoc);
                break;
            case ExplainSettingType.DBMSExplainPlan:
                config = this.getSetting(constants_1.Constants.dbmsExplainPlanSettingProperty, settingType, editorDoc);
                break;
            case ExplainSettingType.ExecutionPlan:
                config = this.getSetting(constants_1.Constants.executionPlanSettingProperty, settingType, editorDoc);
                break;
            case ExplainSettingType.DBMSExecutionPlan:
                config = this.getSetting(constants_1.Constants.dbmsExecutionPlanSettingProperty, settingType, editorDoc);
                break;
        }
        return config;
    }
    static getSetting(property, settingType, editorDoc, configurationTarget = null, workspaceFolder = null) {
        let isDBMS = settingType === ExplainSettingType.DBMSExecutionPlan || settingType === ExplainSettingType.DBMSExplainPlan;
        let isExplainplan = settingType === ExplainSettingType.DBMSExplainPlan || settingType === ExplainSettingType.ExplainPlan;
        let savedValues, defaultValues, config = null;
        if (editorDoc)
            [savedValues, defaultValues] = settings_1.Settings.getEffectiveConfigValueForDocWithDefault(property, editorDoc);
        else
            [savedValues, defaultValues] = settings_1.Settings.getEffectiveConfigValueWithDefault(property, configurationTarget, workspaceFolder, true);
        savedValues = this.prepareSettingsWithDefaultValues(savedValues, defaultValues, isDBMS);
        if (savedValues)
            config = isDBMS ? this.processDBMSPlanConfigFromSettings(savedValues, isExplainplan, editorDoc !== null) : this.processExplainPlanConfigFromSettings(savedValues, isExplainplan);
        return config;
    }
    static getExplainAndExecutionPlanConfigForUI(configurationTarget, workspaceFolder) {
        let explainAndExecutionSettings = new ExplainAndExecutionPlanConfig();
        try {
            explainAndExecutionSettings.configurationTarget = configurationTarget;
            explainAndExecutionSettings.workspaceFolder = workspaceFolder;
            explainAndExecutionSettings.explainPlanConfig = this.getSetting(constants_1.Constants.explainPlanSettingProperty, ExplainSettingType.ExplainPlan, null, configurationTarget, workspaceFolder);
            ;
            explainAndExecutionSettings.dbmsExplainPlanConfig = this.getSetting(constants_1.Constants.dbmsExplainPlanSettingProperty, ExplainSettingType.DBMSExplainPlan, null, configurationTarget, workspaceFolder);
            explainAndExecutionSettings.executionPlanConfig = this.getSetting(constants_1.Constants.executionPlanSettingProperty, ExplainSettingType.ExecutionPlan, null, configurationTarget, workspaceFolder);
            explainAndExecutionSettings.dbmsExecutionPlanConfig = this.getSetting(constants_1.Constants.dbmsExecutionPlanSettingProperty, ExplainSettingType.DBMSExecutionPlan, null, configurationTarget, workspaceFolder);
        }
        catch (error) {
            logger.FileStreamLogger.Instance.error('Error in getExplainAndExecutionPlanConfig');
            helper.logErroAfterValidating(error);
        }
        return explainAndExecutionSettings;
    }
    static getExplainSettingDefaultValues() {
        let defaultValues = new ExplainAndExecutionPlanConfig();
        try {
            defaultValues.explainPlanConfig = this.processExplainPlanConfigFromSettings(settings_1.Settings.getDefaultConfigValue(constants_1.Constants.explainPlanSettingProperty), true);
            defaultValues.executionPlanConfig = this.processExplainPlanConfigFromSettings(settings_1.Settings.getDefaultConfigValue(constants_1.Constants.executionPlanSettingProperty), false);
            defaultValues.dbmsExplainPlanConfig = this.processDBMSPlanConfigFromSettings(settings_1.Settings.getDefaultConfigValue(constants_1.Constants.dbmsExplainPlanSettingProperty), true, false);
            defaultValues.dbmsExecutionPlanConfig = this.processDBMSPlanConfigFromSettings(settings_1.Settings.getDefaultConfigValue(constants_1.Constants.dbmsExecutionPlanSettingProperty), false, false);
        }
        catch (error) {
            logger.FileStreamLogger.Instance.error('Error in getExplainSettingDefaultValues');
            helper.logErroAfterValidating(error);
        }
        return defaultValues;
    }
    static processExplainPlanConfigToSave(config) {
        try {
            let explainPlan = {};
            let explainConstants = new ExplainPlanConstants(true, false);
            if (config) {
                explainPlan[ExplainPlanConstants.showAllColumns] = config.showAllColumns;
                let columnList = [];
                if (config.columnList && config.columnList.length > 0) {
                    for (let i = 0; i < config.columnList.length; ++i)
                        if (explainConstants.columnEnumToName.has(config.columnList[i]))
                            columnList.push(explainConstants.columnEnumToName.get(config.columnList[i]));
                }
                explainPlan[ExplainPlanConstants.columnList] = columnList;
            }
            return explainPlan;
        }
        catch (error) {
            logger.FileStreamLogger.Instance.error(error);
            return null;
        }
    }
    static processDBMSPlanConfigToSave(config, isDbmsExplainPlan) {
        try {
            let dbmsExplainPlan = {};
            let explainConstants = new ExplainPlanConstants(true, isDbmsExplainPlan);
            if (config) {
                if (explainConstants.formatEnumToName.has(config.format))
                    dbmsExplainPlan[ExplainPlanConstants.format] = explainConstants.formatEnumToName.get(config.format);
                dbmsExplainPlan[ExplainPlanConstants.customiseKeywords] = config.customiseKeywords;
                if (config.customiseKeywords) {
                    dbmsExplainPlan[ExplainPlanConstants.keywords] = [];
                    if (config.keywords && config.keywords.length > 0)
                        for (let i = 0; i < config.keywords.length; ++i)
                            dbmsExplainPlan[ExplainPlanConstants.keywords].push(explainConstants.dbmsOptionEnumToName.get(config.keywords[i]));
                }
            }
            return dbmsExplainPlan;
        }
        catch (error) {
            logger.FileStreamLogger.Instance.error(error);
            return null;
        }
    }
    static prepareSettingsWithDefaultValues(currentSettings, defaultSettings, isDbms) {
        if (!currentSettings)
            return defaultSettings;
        try {
            if (!isDbms) {
                if (currentSettings[ExplainPlanConstants.showAllColumns] == undefined)
                    currentSettings[ExplainPlanConstants.showAllColumns] = defaultSettings[ExplainPlanConstants.showAllColumns];
                if (currentSettings[ExplainPlanConstants.columnList] == undefined)
                    currentSettings[ExplainPlanConstants.columnList] = defaultSettings[ExplainPlanConstants.columnList];
            }
            else {
                if (currentSettings[ExplainPlanConstants.format] === undefined)
                    currentSettings[ExplainPlanConstants.format] = defaultSettings[ExplainPlanConstants.format];
                if (currentSettings[ExplainPlanConstants.customiseKeywords] == undefined)
                    currentSettings[ExplainPlanConstants.customiseKeywords] = defaultSettings[ExplainPlanConstants.customiseKeywords];
                if (currentSettings[ExplainPlanConstants.keywords] == undefined)
                    currentSettings[ExplainPlanConstants.keywords] = defaultSettings[ExplainPlanConstants.keywords];
            }
        }
        catch (error) {
            logger.FileStreamLogger.Instance.error(error);
        }
        return currentSettings;
    }
    static processExplainPlanConfigFromSettings(settingsObject, isExplainPlan) {
        let config = new ExplainPlanConfig();
        try {
            if (settingsObject) {
                let constants = new ExplainPlanConstants(false, isExplainPlan);
                config.showAllColumns = settingsObject[ExplainPlanConstants.showAllColumns];
                let columnList = [];
                if (settingsObject[ExplainPlanConstants.columnList] && settingsObject[ExplainPlanConstants.columnList].length > 0) {
                    for (let i = 0; i < settingsObject[ExplainPlanConstants.columnList].length; ++i)
                        if (constants.columnNameToEnum.has(settingsObject[ExplainPlanConstants.columnList][i]))
                            columnList.push(constants.columnNameToEnum.get(settingsObject[ExplainPlanConstants.columnList][i]));
                }
                config.columnList = columnList;
            }
        }
        catch (error) {
            logger.FileStreamLogger.Instance.error(error);
        }
        return config;
    }
    static processDBMSPlanConfigFromSettings(settingsObject, isExplainPlan, getIncludedExcludedLists) {
        let config = new DbmsExplainPlanConfig();
        try {
            if (settingsObject) {
                let constants = new ExplainPlanConstants(false, isExplainPlan);
                config.format = constants.formatNameToEnum.get(settingsObject[ExplainPlanConstants.format]);
                config.customiseKeywords = settingsObject[ExplainPlanConstants.customiseKeywords];
                config.keywords = [];
                if (settingsObject[ExplainPlanConstants.keywords] !== undefined) {
                    if (getIncludedExcludedLists) {
                        config.includedOptions = [];
                        config.excludedOptions = [];
                        for (let i = 0; i < settingsObject[ExplainPlanConstants.keywords].length; ++i) {
                            config.includedOptions.push(settingsObject[ExplainPlanConstants.keywords][i]);
                            constants.dbmsKeywordSet.delete(settingsObject[ExplainPlanConstants.keywords][i]);
                        }
                        constants.dbmsKeywordSet.forEach(item => {
                            config.excludedOptions.push(item);
                        });
                    }
                    else
                        for (let i = 0; i < settingsObject[ExplainPlanConstants.keywords].length; ++i)
                            config.keywords.push(constants.dbmsOptionNameToEnum.get(settingsObject[ExplainPlanConstants.keywords][i]));
                }
            }
        }
        catch (error) {
            logger.FileStreamLogger.Instance.error(error);
        }
        return config;
    }
}
exports.explainPlanUtils = explainPlanUtils;
var ExplainFormatType;
(function (ExplainFormatType) {
    ExplainFormatType[ExplainFormatType["Basic"] = 0] = "Basic";
    ExplainFormatType[ExplainFormatType["Typical"] = 1] = "Typical";
    ExplainFormatType[ExplainFormatType["Serial"] = 2] = "Serial";
    ExplainFormatType[ExplainFormatType["All"] = 3] = "All";
    ExplainFormatType[ExplainFormatType["Adaptive"] = 4] = "Adaptive";
})(ExplainFormatType = exports.ExplainFormatType || (exports.ExplainFormatType = {}));
var ExplainColumn;
(function (ExplainColumn) {
    ExplainColumn[ExplainColumn["BYTES"] = 0] = "BYTES";
    ExplainColumn[ExplainColumn["CARDINALITY"] = 1] = "CARDINALITY";
    ExplainColumn[ExplainColumn["COST"] = 2] = "COST";
    ExplainColumn[ExplainColumn["CPU_COST"] = 3] = "CPU_COST";
    ExplainColumn[ExplainColumn["DEPTH"] = 4] = "DEPTH";
    ExplainColumn[ExplainColumn["DISTRIBUTION"] = 5] = "DISTRIBUTION";
    ExplainColumn[ExplainColumn["IO_COST"] = 6] = "IO_COST";
    ExplainColumn[ExplainColumn["OBJECT_ALIAS"] = 7] = "OBJECT_ALIAS";
    ExplainColumn[ExplainColumn["OBJECT_INSTANCE"] = 8] = "OBJECT_INSTANCE";
    ExplainColumn[ExplainColumn["OBJECT_NAME"] = 9] = "OBJECT_NAME";
    ExplainColumn[ExplainColumn["OBJECT_NODE"] = 10] = "OBJECT_NODE";
    ExplainColumn[ExplainColumn["OBJECT_OWNER"] = 11] = "OBJECT_OWNER";
    ExplainColumn[ExplainColumn["OBJECT_TYPE"] = 12] = "OBJECT_TYPE";
    ExplainColumn[ExplainColumn["OPTIMIZER"] = 13] = "OPTIMIZER";
    ExplainColumn[ExplainColumn["OPTIONS"] = 14] = "OPTIONS";
    ExplainColumn[ExplainColumn["OTHER"] = 15] = "OTHER";
    ExplainColumn[ExplainColumn["OTHER_TAG"] = 16] = "OTHER_TAG";
    ExplainColumn[ExplainColumn["Other_XML_Column"] = 17] = "Other_XML_Column";
    ExplainColumn[ExplainColumn["PARENT_ID"] = 18] = "PARENT_ID";
    ExplainColumn[ExplainColumn["POSITION"] = 19] = "POSITION";
    ExplainColumn[ExplainColumn["Partition_Columns"] = 20] = "Partition_Columns";
    ExplainColumn[ExplainColumn["Predicate_Column"] = 21] = "Predicate_Column";
    ExplainColumn[ExplainColumn["Projection_Column"] = 22] = "Projection_Column";
    ExplainColumn[ExplainColumn["QBLOCK_NAME"] = 23] = "QBLOCK_NAME";
    ExplainColumn[ExplainColumn["SEARCH_COLUMNS"] = 24] = "SEARCH_COLUMNS";
    ExplainColumn[ExplainColumn["TEMP_SPACE"] = 25] = "TEMP_SPACE";
    ExplainColumn[ExplainColumn["TIME"] = 26] = "TIME";
})(ExplainColumn = exports.ExplainColumn || (exports.ExplainColumn = {}));
class ExplainPlanConfig {
}
exports.ExplainPlanConfig = ExplainPlanConfig;
var DbmsXplanOption;
(function (DbmsXplanOption) {
    DbmsXplanOption[DbmsXplanOption["ALIAS"] = 0] = "ALIAS";
    DbmsXplanOption[DbmsXplanOption["BYTES"] = 1] = "BYTES";
    DbmsXplanOption[DbmsXplanOption["COST"] = 2] = "COST";
    DbmsXplanOption[DbmsXplanOption["NOTE"] = 3] = "NOTE";
    DbmsXplanOption[DbmsXplanOption["PARALLEL"] = 4] = "PARALLEL";
    DbmsXplanOption[DbmsXplanOption["PARTITION"] = 5] = "PARTITION";
    DbmsXplanOption[DbmsXplanOption["PREDICATE"] = 6] = "PREDICATE";
    DbmsXplanOption[DbmsXplanOption["PROJECTION"] = 7] = "PROJECTION";
    DbmsXplanOption[DbmsXplanOption["REMOTE"] = 8] = "REMOTE";
    DbmsXplanOption[DbmsXplanOption["ROWS"] = 9] = "ROWS";
    DbmsXplanOption[DbmsXplanOption["IOSTATS"] = 10] = "IOSTATS";
    DbmsXplanOption[DbmsXplanOption["MEMSTATS"] = 11] = "MEMSTATS";
    DbmsXplanOption[DbmsXplanOption["ALLSTATS"] = 12] = "ALLSTATS";
    DbmsXplanOption[DbmsXplanOption["LAST"] = 13] = "LAST";
})(DbmsXplanOption = exports.DbmsXplanOption || (exports.DbmsXplanOption = {}));
class DbmsExplainPlanConfig {
}
exports.DbmsExplainPlanConfig = DbmsExplainPlanConfig;
class ExplainAndExecutionPlanConfig {
}
exports.ExplainAndExecutionPlanConfig = ExplainAndExecutionPlanConfig;
class ExplainPlanConstants {
    constructor(enumToString, isExplainPlan) {
        if (enumToString) {
            this.columnEnumToName = new Map([
                [ExplainColumn.BYTES, "BYTES"],
                [ExplainColumn.CARDINALITY, "CARDINALITY"],
                [ExplainColumn.COST, "COST"],
                [ExplainColumn.CPU_COST, "CPU_COST"],
                [ExplainColumn.DEPTH, "DEPTH"],
                [ExplainColumn.DISTRIBUTION, "DISTRIBUTION"],
                [ExplainColumn.IO_COST, "IO_COST"],
                [ExplainColumn.OBJECT_ALIAS, "OBJECT_ALIAS"],
                [ExplainColumn.OBJECT_INSTANCE, "OBJECT_INSTANCE"],
                [ExplainColumn.OBJECT_NAME, "OBJECT_NAME"],
                [ExplainColumn.OBJECT_NODE, "OBJECT_NODE"],
                [ExplainColumn.OBJECT_OWNER, "OBJECT_OWNER"],
                [ExplainColumn.OBJECT_TYPE, "OBJECT_TYPE"],
                [ExplainColumn.OPTIMIZER, "OPTIMIZER"],
                [ExplainColumn.OPTIONS, "OPTIONS"],
                [ExplainColumn.OTHER, "OTHER"],
                [ExplainColumn.OTHER_TAG, "OTHER_TAG"],
                [ExplainColumn.Other_XML_Column, "Other XML Column"],
                [ExplainColumn.PARENT_ID, "PARENT_ID"],
                [ExplainColumn.POSITION, "POSITION"],
                [ExplainColumn.Partition_Columns, "Partition Columns"],
                [ExplainColumn.Predicate_Column, "Predicate Column"],
                [ExplainColumn.Projection_Column, "Projection Column"],
                [ExplainColumn.QBLOCK_NAME, "QBLOCK_NAME"],
                [ExplainColumn.SEARCH_COLUMNS, "SEARCH_COLUMNS"],
                [ExplainColumn.TEMP_SPACE, "TEMP_SPACE"],
                [ExplainColumn.TIME, "TIME"]
            ]);
            this.formatEnumToName = new Map([
                [ExplainFormatType.Adaptive, "Adaptive"],
                [ExplainFormatType.All, "All"],
                [ExplainFormatType.Basic, "Basic"],
                [ExplainFormatType.Serial, "Serial"],
                [ExplainFormatType.Typical, "Typical"]
            ]);
            this.dbmsOptionEnumToName = new Map([
                [DbmsXplanOption.ROWS, "ROWS"],
                [DbmsXplanOption.PARTITION, "PARTITION"],
                [DbmsXplanOption.PARALLEL, "PARALLEL"],
                [DbmsXplanOption.PREDICATE, "PREDICATE"],
                [DbmsXplanOption.PROJECTION, "PROJECTION"],
                [DbmsXplanOption.ALIAS, "ALIAS"],
                [DbmsXplanOption.REMOTE, "REMOTE"],
                [DbmsXplanOption.NOTE, "NOTE"],
                [DbmsXplanOption.BYTES, "BYTES"],
                [DbmsXplanOption.COST, "COST"],
                [DbmsXplanOption.IOSTATS, "IOSTATS"],
                [DbmsXplanOption.MEMSTATS, "MEMSTATS"]
            ]);
        }
        else if (enumToString !== null) {
            this.columnNameToEnum = new Map([
                ["BYTES", ExplainColumn.BYTES],
                ["CARDINALITY", ExplainColumn.CARDINALITY],
                ["COST", ExplainColumn.COST],
                ["CPU_COST", ExplainColumn.CPU_COST],
                ["DEPTH", ExplainColumn.DEPTH],
                ["DISTRIBUTION", ExplainColumn.DISTRIBUTION],
                ["IO_COST", ExplainColumn.IO_COST],
                ["OBJECT_ALIAS", ExplainColumn.OBJECT_ALIAS],
                ["OBJECT_INSTANCE", ExplainColumn.OBJECT_INSTANCE],
                ["OBJECT_NAME", ExplainColumn.OBJECT_NAME],
                ["OBJECT_NODE", ExplainColumn.OBJECT_NODE],
                ["OBJECT_OWNER", ExplainColumn.OBJECT_OWNER],
                ["OBJECT_TYPE", ExplainColumn.OBJECT_TYPE],
                ["OPTIMIZER", ExplainColumn.OPTIMIZER],
                ["OPTIONS", ExplainColumn.OPTIONS],
                ["OTHER", ExplainColumn.OTHER],
                ["OTHER_TAG", ExplainColumn.OTHER_TAG],
                ["Other XML Column", ExplainColumn.Other_XML_Column],
                ["PARENT_ID", ExplainColumn.PARENT_ID],
                ["POSITION", ExplainColumn.POSITION],
                ["Partition Columns", ExplainColumn.Partition_Columns],
                ["Predicate Column", ExplainColumn.Predicate_Column],
                ["Projection Column", ExplainColumn.Projection_Column],
                ["QBLOCK_NAME", ExplainColumn.QBLOCK_NAME],
                ["SEARCH_COLUMNS", ExplainColumn.SEARCH_COLUMNS],
                ["TEMP_SPACE", ExplainColumn.TEMP_SPACE],
                ["TIME", ExplainColumn.TIME]
            ]);
            this.formatNameToEnum = new Map([
                ["Adaptive", ExplainFormatType.Adaptive],
                ["All", ExplainFormatType.All],
                ["Basic", ExplainFormatType.Basic],
                ["Serial", ExplainFormatType.Serial],
                ["Typical", ExplainFormatType.Typical]
            ]);
            this.dbmsOptionNameToEnum = new Map([
                ["ROWS", DbmsXplanOption.ROWS],
                ["PARTITION", DbmsXplanOption.PARTITION],
                ["PARALLEL", DbmsXplanOption.PARALLEL],
                ["PREDICATE", DbmsXplanOption.PREDICATE],
                ["PROJECTION", DbmsXplanOption.PROJECTION],
                ["ALIAS", DbmsXplanOption.ALIAS],
                ["REMOTE", DbmsXplanOption.REMOTE],
                ["NOTE", DbmsXplanOption.NOTE],
                ["BYTES", DbmsXplanOption.BYTES],
                ["COST", DbmsXplanOption.COST],
                ["IOSTATS", DbmsXplanOption.IOSTATS],
                ["MEMSTATS", DbmsXplanOption.MEMSTATS]
            ]);
            this.dbmsKeywordSet = new Set([
                "ALIAS",
                "BYTES",
                "COST",
                "NOTE",
                "PARALLEL",
                "PARTITION",
                "PREDICATE",
                "PROJECTION",
                "REMOTE",
                "ROWS"
            ]);
            if (!isExplainPlan) {
                this.dbmsKeywordSet.add("IOSTATS");
                this.dbmsKeywordSet.add("MEMSTATS");
            }
        }
    }
}
exports.ExplainPlanConstants = ExplainPlanConstants;
ExplainPlanConstants.format = "format";
ExplainPlanConstants.showAllColumns = "showAllColumns";
ExplainPlanConstants.columnList = "columnList";
ExplainPlanConstants.keywords = "keywords";
ExplainPlanConstants.customiseKeywords = "customiseKeywords";
var ExplainSettingType;
(function (ExplainSettingType) {
    ExplainSettingType[ExplainSettingType["ExplainPlan"] = 0] = "ExplainPlan";
    ExplainSettingType[ExplainSettingType["DBMSExplainPlan"] = 1] = "DBMSExplainPlan";
    ExplainSettingType[ExplainSettingType["ExecutionPlan"] = 2] = "ExecutionPlan";
    ExplainSettingType[ExplainSettingType["DBMSExecutionPlan"] = 3] = "DBMSExecutionPlan";
})(ExplainSettingType = exports.ExplainSettingType || (exports.ExplainSettingType = {}));
