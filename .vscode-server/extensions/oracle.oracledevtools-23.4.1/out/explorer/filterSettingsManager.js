"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterSettingsManager = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const resultsDataServer_1 = require("../scriptExecution/resultsDataServer");
const logger = require("../infrastructure/logger");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const localizedConstants_1 = require("./../constants/localizedConstants");
const utilities_1 = require("../explorer/utilities");
const helper = require("./../utilities/helper");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const connectionNode_1 = require("../explorer/nodes/connectionNode");
const connectionSettingsManager_1 = require("../connectionManagement/connectionSettingsManager");
const dataExplorerManager_1 = require("./dataExplorerManager");
const tableCategoryNode_1 = require("./nodes/tableCategoryNode");
const viewCategoryNode_1 = require("./nodes/viewCategoryNode");
const procedureCategoryNode_1 = require("./nodes/procedureCategoryNode");
const functionCategoryNode_1 = require("./nodes/functionCategoryNode");
const packageCategoryNode_1 = require("./nodes/packageCategoryNode");
const synonymCategoryNode_1 = require("./nodes/synonymCategoryNode");
const sequenceCategoryNode_1 = require("./nodes/sequenceCategoryNode");
const triggerCategoryNode_1 = require("./nodes/triggerCategoryNode");
const userCatetoryNode_1 = require("./nodes/userCatetoryNode");
const fileLogger = logger.FileStreamLogger.Instance;
class FilterSettingsManager {
    constructor(scriptExecuter, connCmdHdlr, vscodeConnector) {
        this.selectedCollection = scriptExecutionModels_1.FilterCollectionType.Connection;
        this.doSelectCollection = true;
        this.collectionToConstantDict = new Map([
            [scriptExecutionModels_1.FilterCollectionType.Connection, constants_1.Constants.connectionColl],
            [scriptExecutionModels_1.FilterCollectionType.PLSQLObjects, constants_1.Constants.plsqlObjects],
            [scriptExecutionModels_1.FilterCollectionType.Tables, constants_1.Constants.tables],
            [scriptExecutionModels_1.FilterCollectionType.RelationalTables, constants_1.Constants.relationalTables],
            [scriptExecutionModels_1.FilterCollectionType.ObjectTables, constants_1.Constants.objectTables],
            [scriptExecutionModels_1.FilterCollectionType.XMLTables, constants_1.Constants.xmlTables],
            [scriptExecutionModels_1.FilterCollectionType.Views, constants_1.Constants.views],
            [scriptExecutionModels_1.FilterCollectionType.RelationalViews, constants_1.Constants.relationalViews],
            [scriptExecutionModels_1.FilterCollectionType.ObjectViews, constants_1.Constants.objectViews],
            [scriptExecutionModels_1.FilterCollectionType.XMLViews, constants_1.Constants.xmlViews],
            [scriptExecutionModels_1.FilterCollectionType.MaterializedViews, constants_1.Constants.materializedViews],
            [scriptExecutionModels_1.FilterCollectionType.Procedures, constants_1.Constants.procedures],
            [scriptExecutionModels_1.FilterCollectionType.Functions, constants_1.Constants.functions],
            [scriptExecutionModels_1.FilterCollectionType.Packages, constants_1.Constants.packages],
            [scriptExecutionModels_1.FilterCollectionType.Sequences, constants_1.Constants.sequences],
            [scriptExecutionModels_1.FilterCollectionType.Synonyms, constants_1.Constants.synonyms],
            [scriptExecutionModels_1.FilterCollectionType.Triggers, constants_1.Constants.triggers],
            [scriptExecutionModels_1.FilterCollectionType.TableTriggers, constants_1.Constants.tableTriggers],
            [scriptExecutionModels_1.FilterCollectionType.ViewTriggers, constants_1.Constants.viewTriggers],
            [scriptExecutionModels_1.FilterCollectionType.SchemaTriggers, constants_1.Constants.schemaTriggers],
            [scriptExecutionModels_1.FilterCollectionType.DatabaseTriggers, constants_1.Constants.databaseTriggers],
            [scriptExecutionModels_1.FilterCollectionType.OtherUsers, constants_1.Constants.otherUsers]
        ]);
        this.constantToCollectionDict = new Map();
        this.propertyToConstantDict = new Map([
            [scriptExecutionModels_1.FilterProperties.VisibleCollections, constants_1.Constants.visibleCollections],
            [scriptExecutionModels_1.FilterProperties.ObjectName, constants_1.Constants.objectName],
            [scriptExecutionModels_1.FilterProperties.CompilationMode, constants_1.Constants.debug],
            [scriptExecutionModels_1.FilterProperties.Status, constants_1.Constants.status],
            [scriptExecutionModels_1.FilterProperties.TriggerStatus, constants_1.Constants.triggerStatus],
            [scriptExecutionModels_1.FilterProperties.CreatedDate, constants_1.Constants.createdDate],
            [scriptExecutionModels_1.FilterProperties.ModifiedDate, constants_1.Constants.modifiedDate],
            [scriptExecutionModels_1.FilterProperties.ObjectCount, constants_1.Constants.objectCount],
            [scriptExecutionModels_1.FilterProperties.ParentObjectName, constants_1.Constants.parentObjectName],
            [scriptExecutionModels_1.FilterProperties.ParentObjectOwnerName, constants_1.Constants.parentObjectOwnerName]
        ]);
        this.constantToPropertyDict = new Map();
        this.conditionToConstantDict = new Map([
            [scriptExecutionModels_1.FilterConditions.Is, constants_1.Constants.Is],
            [scriptExecutionModels_1.FilterConditions.IsNot, constants_1.Constants.IsNot],
            [scriptExecutionModels_1.FilterConditions.StartsWith, constants_1.Constants.startsWith],
            [scriptExecutionModels_1.FilterConditions.EndsWith, constants_1.Constants.endsWith],
            [scriptExecutionModels_1.FilterConditions.Contains, constants_1.Constants.contains],
            [scriptExecutionModels_1.FilterConditions.DoesNotContain, constants_1.Constants.doesNotContain]
        ]);
        this.constantToConditionDict = new Map();
        this.dateConditionToConstantDict = new Map([
            [scriptExecutionModels_1.FilterConditions.EqualTo, constants_1.Constants.equalTo],
            [scriptExecutionModels_1.FilterConditions.NotEqualTo, constants_1.Constants.notEqualTo],
            [scriptExecutionModels_1.FilterConditions.LessThan, constants_1.Constants.lessThan],
            [scriptExecutionModels_1.FilterConditions.GreaterThan, constants_1.Constants.greaterThan],
            [scriptExecutionModels_1.FilterConditions.LessThanOrEqualTo, constants_1.Constants.lessThanOrEqualTo],
            [scriptExecutionModels_1.FilterConditions.GreaterThanOrEqualTo, constants_1.Constants.greaterThanOrEqualTo],
            [scriptExecutionModels_1.FilterConditions.Between, constants_1.Constants.between],
            [scriptExecutionModels_1.FilterConditions.NotBetween, constants_1.Constants.notBetween]
        ]);
        this.constantToDateConditionDict = new Map();
        this.statusToConstantDict = new Map([
            [scriptExecutionModels_1.CodeObjectStatus.Valid, constants_1.Constants.filtersValid],
            [scriptExecutionModels_1.CodeObjectStatus.Invalid, constants_1.Constants.filtersInvalid]
        ]);
        this.constantToStatusDict = new Map();
        this.triggerStatusToConstantDict = new Map([
            [scriptExecutionModels_1.TriggerStatus.Enabled, constants_1.Constants.filtersEnabled],
            [scriptExecutionModels_1.TriggerStatus.Disabled, constants_1.Constants.filtersDisabled]
        ]);
        this.constantToTriggerStatusDict = new Map();
        this.matchToConstantDict = new Map([
            [scriptExecutionModels_1.FilterMatch.Any, constants_1.Constants.any],
            [scriptExecutionModels_1.FilterMatch.All, constants_1.Constants.all]
        ]);
        this.constantToMatchDict = new Map();
        this.scriptExecuter = scriptExecuter;
        this.connectionCommandsHandler = connCmdHdlr;
        this.vscodeConnector = vscodeConnector;
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.getFilterSettingsRequest, (message) => {
            this.handleGetFiltersRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.saveFilterSettingsRequest, (message) => {
            this.handleSaveFiltersRequest(message);
        });
        resultsDataServer_1.ResultDataServer.instanceSingle.addMessageHandler(scriptExecutionModels_1.MessageName.filterConnChangePromptRequest, (message) => {
            this.handleConnChangePromptRequest(message);
        });
        this.reverseDictionaries();
    }
    static CreateInstance(scriptExec, connCmd, vscodeConn) {
        try {
            if (FilterSettingsManager.instance === undefined) {
                FilterSettingsManager.instance = new FilterSettingsManager(scriptExec, connCmd, vscodeConn);
            }
            return FilterSettingsManager.instance;
        }
        catch (error) {
            helper.logErroAfterValidating(new Error(error));
        }
    }
    static get Instance() {
        return FilterSettingsManager.instance;
    }
    async openFilterSettings(treeNode) {
        try {
            this.selectedCollection = this.getSelectedCollection(treeNode);
            const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
            args.uri = utilities_1.TreeViewConstants.filterSettingsUri;
            args.executionId = (++this.scriptExecuter.scriptExecutionCount).toString();
            args.windowUri = constants_1.Constants.filterSettingsWindowUri;
            args.uiMode = scriptExecutionModels_1.UIDisplayMode.FilterSettings;
            args.windowTitle = localizedConstants_1.default.filterSettingsUITitle;
            args.configurationTarget = vscode.ConfigurationTarget.Global;
            if (treeNode) {
                let connNode;
                if (treeNode instanceof connectionNode_1.ConnectionNode) {
                    connNode = treeNode;
                }
                else {
                    connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNode(treeNode.connectionURI);
                }
                args.profileName = connNode.connectionProperties.name;
                args.configurationTarget = connNode.connectionProperties.configurationTarget;
                args.workspaceFolderName = connNode.connectionProperties.workspaceFolder?.name;
                args.workspaceFolderUri = connNode.connectionProperties.workspaceFolder?.uri?.toString();
                args.workspaceFolderIndex = connNode.connectionProperties.workspaceFolder?.index;
                args.connectionUniqueId = connNode.connectionUniqueId;
            }
            this.scriptExecuter.openFilterSettingsPanel(args);
        }
        catch (err) {
            fileLogger.error(err);
        }
    }
    async handleConnChangePromptRequest(message) {
        fileLogger.info("Received ConnChangePromptRequest");
        const connChangePromptResponse = new scriptExecutionModels_1.ConnChangePromptResponse();
        try {
            let msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.filterSettingsConnChangePrompt, message.currentConnection);
            let proceed = await helper.Utils.promptForConfirmation(msg, this.vscodeConnector);
            connChangePromptResponse.changeConnection = proceed;
            connChangePromptResponse.currentConnection = message.currentConnection;
            connChangePromptResponse.newConnection = message.newConnection;
        }
        catch (error) {
            connChangePromptResponse.changeConnection = false;
            connChangePromptResponse.currentConnection = message.currentConnection;
            connChangePromptResponse.newConnection = message.newConnection;
            fileLogger.error(error);
        }
        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.filterConnChangePromptResponse, connChangePromptResponse);
    }
    async handleGetFiltersRequest(message) {
        fileLogger.info('Received GetFilterSettingsRequest');
        const response = new scriptExecutionModels_1.GetFilterSettingsResponse();
        response.ownerUri = message.ownerUri;
        response.executionId = message.executionId;
        response.windowUri = message.windowUri;
        try {
            this.getFilterSettingsContinue(message);
        }
        catch (error) {
            response.success = false;
            response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.filterSettingsFailGetConnMsg, message.profileName);
            fileLogger.error(error);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFilterSettingsResponse, response);
        }
    }
    getFilterSettingsContinue(message) {
        fileLogger.info('Received GetFilterSettingsRequest');
        const response = new scriptExecutionModels_1.GetFilterSettingsResponse();
        response.ownerUri = message.ownerUri;
        response.executionId = message.executionId;
        response.windowUri = message.windowUri;
        try {
            const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
            const profiles = helperSettings.retrieveAllConnections(true);
            this.allProfiles = profiles;
            const profileNameInfo = [];
            let collectionFiltersJson = [];
            let profileName = "";
            let eachConnNodeByName = undefined;
            let selectedConnNodeById = undefined;
            let eachConnUniqueId = -1;
            let selectedConnUniqueId = -1;
            let selectedConnUniqueName = "";
            let didSetFirstProfile = false;
            let profileRenamed = false;
            if (profiles && profiles.length > 0) {
                if (helper.isEmpty(message.profileName)) {
                    if (profiles[0].filters !== undefined) {
                        collectionFiltersJson = profiles[0].filters;
                    }
                    profileName = profiles[0].name;
                    this.currentProfile = profiles[0];
                    eachConnNodeByName = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueName(profiles[0].uniqueName);
                    if (!eachConnNodeByName) {
                        response.success = false;
                        response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.filterSettingsConnDeleted, message.profileName);
                        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFilterSettingsResponse, response);
                        return false;
                    }
                    selectedConnNodeById = eachConnNodeByName;
                    selectedConnUniqueId = eachConnNodeByName.connectionUniqueId;
                    selectedConnUniqueName = profiles[0].uniqueName;
                    didSetFirstProfile = true;
                }
                else if (helper.isEmpty(message.connectionUniqueId)) {
                    let emptyUniqueName = helper.isEmpty(message.uniqueProfileName);
                    if (!emptyUniqueName) {
                        selectedConnNodeById = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueName(message.uniqueProfileName);
                    }
                    else {
                        selectedConnNodeById = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionScope(message.profileName, message.configurationTarget, message.workspaceFolder);
                    }
                    if (!selectedConnNodeById) {
                        response.success = false;
                        response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.filterSettingsConnDeleted, message.profileName);
                        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFilterSettingsResponse, response);
                        return false;
                    }
                    selectedConnUniqueId = selectedConnNodeById.connectionUniqueId;
                    selectedConnUniqueName = emptyUniqueName ? selectedConnNodeById.connectionProperties.uniqueName : message.uniqueProfileName;
                }
                else {
                    selectedConnNodeById = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueId(message.connectionUniqueId);
                    if (!selectedConnNodeById) {
                        response.success = false;
                        response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.filterSettingsConnDeleted, message.profileName);
                        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFilterSettingsResponse, response);
                        return false;
                    }
                    selectedConnUniqueId = selectedConnNodeById.connectionUniqueId;
                    selectedConnUniqueName = helper.isEmpty(message.uniqueProfileName) ? selectedConnNodeById.connectionProperties.uniqueName : message.uniqueProfileName;
                }
                for (let i = 0; i < profiles.length; i++) {
                    eachConnNodeByName = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueName(profiles[i].uniqueName);
                    if (!eachConnNodeByName)
                        continue;
                    eachConnUniqueId = eachConnNodeByName.connectionUniqueId;
                    profileNameInfo.push([profiles[i].name, profiles[i].uniqueName, profiles[i].configurationTarget, profiles[i].workspaceFolder, eachConnUniqueId]);
                    if (!didSetFirstProfile && eachConnUniqueId === selectedConnUniqueId) {
                        collectionFiltersJson = profiles[i].filters;
                        profileName = profiles[i].name;
                        this.currentProfile = profiles[i];
                        if (profileName !== message.profileName) {
                            profileRenamed = true;
                        }
                    }
                }
            }
            if (helper.isEmpty(profileName)) {
                response.success = false;
                response.message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.filterSettingsFailGetConnNotFoundMsg, message.profileName);
                resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFilterSettingsResponse, response);
                return false;
            }
            let collectionFilterSettings = this.processCollectionFilterConfigFromSettings(collectionFiltersJson);
            response.profileName = profileName;
            response.uniqueProfileName = selectedConnUniqueName;
            response.configurationTarget = this.currentProfile.configurationTarget;
            response.workspaceFolder = this.currentProfile.workspaceFolder;
            response.connectionUniqueId = selectedConnUniqueId;
            let responseMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.filterSettingsGetMsg, profileName);
            if (profileRenamed) {
                responseMessage += ` ${localizedConstants_1.default.filterSettingsConnRenamedNoRefresh}`;
                response.message = helper.stringFormatterCsharpStyle(responseMessage, message.profileName, profileName);
            }
            else
                response.message = responseMessage;
            response.success = true;
            response.collectionFilterSettings = collectionFilterSettings;
            response.profileNamesInfo = profileNameInfo;
            if (this.doSelectCollection) {
                response.selectedCollection = this.selectedCollection;
                this.doSelectCollection = false;
            }
            else {
                response.selectedCollection = scriptExecutionModels_1.FilterCollectionType.Connection;
            }
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.getFilterSettingsResponse, response);
            return true;
        }
        catch (error) {
            fileLogger.info("Unable to handle GetFiltersRequest");
            fileLogger.error(error);
            throw (error);
        }
    }
    async handleSaveFiltersRequest(message) {
        fileLogger.info("Received SaveFilterSettingsRequest");
        const response = new scriptExecutionModels_1.SaveFilterSettingsResponse();
        response.ownerUri = message.ownerUri;
        response.executionId = message.executionId;
        response.windowUri = message.windowUri;
        response.profileName = message.profileName;
        response.configurationTarget = message.configurationTarget;
        response.workspaceFolder = message.workspaceFolder;
        response.connectionUniqueId = message.connectionUniqueId;
        response.collectionFilterSettings = message.collectionFilterSettings;
        try {
            let connNodeById = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueId(message.connectionUniqueId);
            if (!connNodeById) {
                connNodeById = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUniqueName(message.uniqueProfileName);
                if (!connNodeById) {
                    response.success = false;
                    response.message = localizedConstants_1.default.filterSettingsFailSavedMsg + helper.stringFormatterCsharpStyle(localizedConstants_1.default.filterSettingsConnDeleted, message.profileName);
                    fileLogger.error(response.message);
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFilterSettingsResponse, response);
                }
            }
            if (connNodeById) {
                if (connNodeById.connectionProperties.uniqueName !== message.uniqueProfileName) {
                    response.success = false;
                    response.message = localizedConstants_1.default.filterSettingsFailSavedMsg + helper.stringFormatterCsharpStyle(localizedConstants_1.default.filterSettingsConnRenamed, message.profileName, connNodeById.connectionProperties.name);
                    fileLogger.error(response.message);
                    resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFilterSettingsResponse, response);
                }
                else {
                    let saveSuccess = await this.saveFilterSettingsToConfig(message, message.collectionFilterSettings, message.profileName, connNodeById);
                    if (!saveSuccess) {
                        response.success = false;
                        response.message = localizedConstants_1.default.filterSettingsFailSavedMsg;
                        fileLogger.error(response.message);
                        resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFilterSettingsResponse, response);
                    }
                }
            }
        }
        catch (error) {
            response.success = false;
            response.message = localizedConstants_1.default.filterSettingsFailSavedMsg + error;
            fileLogger.error(error);
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFilterSettingsResponse, response);
        }
    }
    processCollectionFilterConfigFromSettings(collFiltersJson = []) {
        let collectionFilterSettings = [];
        let checkForDuplicates = [];
        if (collFiltersJson !== undefined && collFiltersJson !== null) {
            for (let icfj = 0; icfj < collFiltersJson.length; icfj++) {
                let cfj = collFiltersJson[icfj];
                let collType = -1;
                if (cfj) {
                    collType = this.constantToCollectionDict.get(cfj.collection);
                    if (collType === undefined || collType === null) {
                        continue;
                    }
                }
                else {
                    continue;
                }
                let collFilter;
                let filters = [];
                let duplicateIndex = checkForDuplicates.indexOf(collType);
                if (duplicateIndex > -1) {
                    for (let icf = 0; icf < collectionFilterSettings.length; icf++) {
                        if (collectionFilterSettings[icf].collectionType === collType) {
                            collFilter = collectionFilterSettings[icf];
                            duplicateIndex = icf;
                            break;
                        }
                    }
                    if (collFilter)
                        filters = collFilter.filters;
                }
                else {
                    collFilter = this.verifyCollFilterJsonProps(cfj, cfj.collection, collType);
                    if (!collFilter)
                        continue;
                    checkForDuplicates.push(collType);
                }
                if (duplicateIndex === -1)
                    filters = this.processJsonFilters(cfj.filterProperties, filters, collType);
                if (filters.length > 0) {
                    collFilter.filters = filters;
                    if (duplicateIndex > -1) {
                        collectionFilterSettings.splice(duplicateIndex, 1, collFilter);
                    }
                    else {
                        collectionFilterSettings.push(collFilter);
                    }
                }
            }
        }
        return collectionFilterSettings;
    }
    async saveFilterSettingsToConfig(message, collFilters, profileName, connNode) {
        try {
            const filterSettingsJson = this.processFilterSettingsForConfig(collFilters);
            await this.saveFilterSettingsContinue(message, filterSettingsJson, profileName, connNode);
            return true;
        }
        catch (err) {
            fileLogger.info("Error on saving filter settings for connection " + profileName);
            helper.logErroAfterValidating(err);
            return false;
        }
    }
    async saveFilterSettingsContinue(message, collFilters, profileName, connNode) {
        const response = new scriptExecutionModels_1.SaveFilterSettingsResponse();
        try {
            let newprofile = Object.assign({}, connNode.connectionProperties);
            newprofile.name = profileName;
            newprofile.uniqueName = message.uniqueProfileName;
            newprofile.configurationTarget = connNode.connectionProperties.configurationTarget;
            newprofile.workspaceFolder = connNode.connectionProperties.workspaceFolder;
            newprofile.filters = collFilters;
            if (newprofile && newprofile.passwordSaved) {
                const helperSettings = new connectionSettingsManager_1.OracleVSCodeConnectionSettingsManager(this.vscodeConnector);
                await helperSettings.PostProcessReadProfileCredsAsync(newprofile);
            }
            const savedProfile = await this.connectionCommandsHandler.connectionLogicMgr.saveVsCodeProfile(newprofile, newprofile.uniqueName);
            this.currentProfile = savedProfile;
            response.message = localizedConstants_1.default.filterSettingsSavedMsg;
            if (savedProfile.filters && savedProfile.filters.length > 0)
                response.message += `\n${localizedConstants_1.default.filterSettingsNewAppliedMsg}`;
            response.success = true;
            response.connectionUniqueId = message.connectionUniqueId;
            response.collectionFilterSettings = message.collectionFilterSettings;
            response.profileName = profileName;
            response.uniqueProfileName = message.uniqueProfileName;
            response.configurationTarget = message.configurationTarget;
            response.workspaceFolder = message.workspaceFolder;
        }
        catch (err) {
            fileLogger.error(err);
            response.success = false;
            response.message = localizedConstants_1.default.filterSettingsFailSavedMsg + err;
        }
        finally {
            resultsDataServer_1.ResultDataServer.instanceSingle.postToClients(message.windowUri, message.executionId, scriptExecutionModels_1.MessageName.saveFilterSettingsResponse, response);
        }
        return response.success;
    }
    processFilterSettingsForConfig(collFilters) {
        let collectionFiltersJson = [];
        collFilters.forEach((collFilter) => {
            let collFilterJson = new scriptExecutionModels_1.CollectionFilterJson();
            collFilterJson.collection = collFilter.collectionName;
            collFilterJson.enableFiltersForExplorer = collFilter.enableFiltersForExplorer;
            collFilterJson.enableFiltersForIntellisense = collFilter.enableFiltersForIntellisense;
            if (collFilter.collectionType !== scriptExecutionModels_1.FilterCollectionType.Connection)
                collFilterJson.overrideConnectionFilter = collFilter.overrideConnectionFilter;
            collFilterJson.match = this.matchToConstantDict.get(collFilter.match);
            let filtersJson = [];
            collFilter.filters.forEach((f) => {
                let jsonItem = new scriptExecutionModels_1.FilterItemJson();
                jsonItem.propertyName = this.propertyToConstantDict.get(f.property);
                switch (f.property) {
                    case scriptExecutionModels_1.FilterProperties.CreatedDate:
                    case scriptExecutionModels_1.FilterProperties.ModifiedDate:
                    case scriptExecutionModels_1.FilterProperties.ObjectCount:
                        jsonItem.condition = this.dateConditionToConstantDict.get(f.condition);
                        break;
                    case scriptExecutionModels_1.FilterProperties.ObjectName:
                    case scriptExecutionModels_1.FilterProperties.ParentObjectName:
                    case scriptExecutionModels_1.FilterProperties.ParentObjectOwnerName:
                        jsonItem.caseSensitiveMatch = f.caseSensitiveMatch ? true : false;
                    default:
                        jsonItem.condition = this.conditionToConstantDict.get(f.condition);
                        break;
                }
                if ((f.condition === scriptExecutionModels_1.FilterConditions.Between || f.condition === scriptExecutionModels_1.FilterConditions.NotBetween)
                    && f.lowerLimit !== undefined && f.upperLimit !== undefined) {
                    if (f.property == scriptExecutionModels_1.FilterProperties.ObjectCount) {
                        jsonItem.lowerLimit = f.lowerLimit;
                        jsonItem.upperLimit = f.upperLimit;
                    }
                    else {
                        jsonItem.lowerLimit = f.lowerLimit;
                        jsonItem.upperLimit = f.upperLimit;
                    }
                    filtersJson.push(jsonItem);
                }
                else {
                    let value = this.getFilterValueJson(f.property, f.value);
                    if (value !== undefined && value !== null && value !== "") {
                        jsonItem.value = value;
                        filtersJson.push(jsonItem);
                    }
                }
            });
            collFilterJson.filterProperties = filtersJson;
            if (filtersJson.length > 0)
                collectionFiltersJson.push(collFilterJson);
        });
        return collectionFiltersJson;
    }
    getSelectedCollection(treeNode) {
        this.doSelectCollection = true;
        if (treeNode === undefined || treeNode === null) {
            this.doSelectCollection = false;
            return scriptExecutionModels_1.FilterCollectionType.Connection;
        }
        else if (treeNode instanceof tableCategoryNode_1.TableCategoryNode) {
            return scriptExecutionModels_1.FilterCollectionType.Tables;
        }
        else if (treeNode instanceof viewCategoryNode_1.ViewCategoryNode) {
            return scriptExecutionModels_1.FilterCollectionType.Views;
        }
        else if (treeNode instanceof procedureCategoryNode_1.ProcedureCategoryNode) {
            return scriptExecutionModels_1.FilterCollectionType.Procedures;
        }
        else if (treeNode instanceof functionCategoryNode_1.FunctionCategoryNode) {
            return scriptExecutionModels_1.FilterCollectionType.Functions;
        }
        else if (treeNode instanceof packageCategoryNode_1.PackageCategoryNode) {
            return scriptExecutionModels_1.FilterCollectionType.Packages;
        }
        else if (treeNode instanceof synonymCategoryNode_1.SynonymCategoryNode) {
            return scriptExecutionModels_1.FilterCollectionType.Synonyms;
        }
        else if (treeNode instanceof sequenceCategoryNode_1.SequenceCategoryNode) {
            return scriptExecutionModels_1.FilterCollectionType.Sequences;
        }
        else if (treeNode instanceof triggerCategoryNode_1.TriggerCategoryNode) {
            return scriptExecutionModels_1.FilterCollectionType.Triggers;
        }
        else if (treeNode instanceof userCatetoryNode_1.userCategoryNode) {
            return scriptExecutionModels_1.FilterCollectionType.OtherUsers;
        }
        else {
            this.doSelectCollection = false;
            return scriptExecutionModels_1.FilterCollectionType.Connection;
        }
    }
    verifyCollFilterJsonProps(cfj, collName, collType) {
        let cf = new scriptExecutionModels_1.CollectionFilterInfo();
        cf.collectionType = collType;
        cf.collectionName = collName;
        if (cfj.enableFiltersForExplorer === false)
            cf.enableFiltersForExplorer = false;
        else
            cf.enableFiltersForExplorer = true;
        if (cfj.enableFiltersForIntellisense === false)
            cf.enableFiltersForIntellisense = false;
        else
            cf.enableFiltersForIntellisense = true;
        if (cfj.match === constants_1.Constants.any)
            cf.match = scriptExecutionModels_1.FilterMatch.Any;
        else
            cf.match = scriptExecutionModels_1.FilterMatch.All;
        if (collType !== scriptExecutionModels_1.FilterCollectionType.Connection) {
            if (cfj.overrideConnectionFilter === true)
                cf.overrideConnectionFilter = true;
            else
                cf.overrideConnectionFilter = false;
        }
        return cf;
    }
    processJsonFilters(filtersJson, filters, collType) {
        if (filtersJson === undefined || filtersJson === null) {
            return filters;
        }
        let duplicateFilters = [];
        filters.forEach((f) => {
            if (f.property === scriptExecutionModels_1.FilterProperties.CompilationMode || f.property === scriptExecutionModels_1.FilterProperties.Status
                || f.property === scriptExecutionModels_1.FilterProperties.TriggerStatus || f.property === scriptExecutionModels_1.FilterProperties.VisibleCollections) {
                duplicateFilters.push(f.property);
            }
        });
        for (let ifj = 0; ifj < filtersJson.length; ifj++) {
            let fj = filtersJson[ifj];
            let newFilterItem = new scriptExecutionModels_1.FilterItem();
            let fprop;
            if (fj) {
                fprop = this.constantToPropertyDict.get(fj.propertyName);
                if (fprop === undefined || fprop === null) {
                    continue;
                }
            }
            else
                continue;
            if (fprop === scriptExecutionModels_1.FilterProperties.ObjectName) {
                if (helper.isEmpty(fj.value))
                    continue;
                newFilterItem.property = fprop;
                let fcond = this.constantToConditionDict.get(fj.condition);
                if (fcond !== undefined && fcond !== null)
                    newFilterItem.condition = fcond;
                else
                    newFilterItem.condition = scriptExecutionModels_1.FilterConditions.Is;
                newFilterItem.value = fj.value;
                if (fj.caseSensitiveMatch === true)
                    newFilterItem.caseSensitiveMatch = true;
                else
                    newFilterItem.caseSensitiveMatch = false;
            }
            else if (fprop === scriptExecutionModels_1.FilterProperties.VisibleCollections) {
                if (collType !== scriptExecutionModels_1.FilterCollectionType.Connection || duplicateFilters.indexOf(fprop) > -1)
                    continue;
                newFilterItem.property = fprop;
                newFilterItem.condition = scriptExecutionModels_1.FilterConditions.Is;
                let visColl = [];
                if (fj.value && fj.value.length > 0) {
                    fj.value.forEach((collString) => {
                        let coll = this.constantToCollectionDict.get(collString);
                        if (coll !== undefined && coll !== null && visColl.indexOf(coll) === -1)
                            visColl.push(coll);
                    });
                    if (visColl.length > 0)
                        newFilterItem.value = visColl;
                    else
                        continue;
                }
                else
                    continue;
            }
            else if (fprop === scriptExecutionModels_1.FilterProperties.CompilationMode) {
                if ((collType !== scriptExecutionModels_1.FilterCollectionType.Procedures && collType !== scriptExecutionModels_1.FilterCollectionType.Functions
                    && collType !== scriptExecutionModels_1.FilterCollectionType.Packages && collType !== scriptExecutionModels_1.FilterCollectionType.Triggers)
                    || duplicateFilters.indexOf(fprop) > -1 || helper.isEmpty(fj.value))
                    continue;
                newFilterItem.property = fprop;
                newFilterItem.condition = scriptExecutionModels_1.FilterConditions.Is;
                if (fj.value === constants_1.Constants.withDebug) {
                    newFilterItem.value = scriptExecutionModels_1.CodeObjectDebug.WithDebug;
                }
                else if (fj.value === constants_1.Constants.withoutDebug) {
                    newFilterItem.value = scriptExecutionModels_1.CodeObjectDebug.WithoutDebug;
                }
                else
                    continue;
            }
            else if (fprop === scriptExecutionModels_1.FilterProperties.Status) {
                if ((collType !== scriptExecutionModels_1.FilterCollectionType.Procedures && collType !== scriptExecutionModels_1.FilterCollectionType.Functions
                    && collType !== scriptExecutionModels_1.FilterCollectionType.Packages) || duplicateFilters.indexOf(fprop) > -1
                    || helper.isEmpty(fj.value))
                    continue;
                newFilterItem.property = fprop;
                newFilterItem.condition = scriptExecutionModels_1.FilterConditions.Is;
                if (fj.value === constants_1.Constants.filtersValid) {
                    newFilterItem.value = scriptExecutionModels_1.CodeObjectStatus.Valid;
                }
                else if (fj.value === constants_1.Constants.filtersInvalid) {
                    newFilterItem.value = scriptExecutionModels_1.CodeObjectStatus.Invalid;
                }
                else
                    continue;
            }
            else if (fprop === scriptExecutionModels_1.FilterProperties.TriggerStatus) {
                if (collType !== scriptExecutionModels_1.FilterCollectionType.Triggers || duplicateFilters.indexOf(fprop) > -1
                    || helper.isEmpty(fj.value))
                    continue;
                newFilterItem.property = fprop;
                newFilterItem.condition = scriptExecutionModels_1.FilterConditions.Is;
                if (fj.value === constants_1.Constants.filtersEnabled) {
                    newFilterItem.value = scriptExecutionModels_1.TriggerStatus.Enabled;
                }
                else if (fj.value === constants_1.Constants.filtersDisabled) {
                    newFilterItem.value = scriptExecutionModels_1.TriggerStatus.Disabled;
                }
                else
                    continue;
            }
            else if (fprop === scriptExecutionModels_1.FilterProperties.CreatedDate || fprop === scriptExecutionModels_1.FilterProperties.ModifiedDate) {
                if (collType !== scriptExecutionModels_1.FilterCollectionType.Tables && collType !== scriptExecutionModels_1.FilterCollectionType.Views
                    && collType !== scriptExecutionModels_1.FilterCollectionType.Procedures && collType !== scriptExecutionModels_1.FilterCollectionType.Functions
                    && collType !== scriptExecutionModels_1.FilterCollectionType.Packages)
                    continue;
                newFilterItem.property = fprop;
                let fcond = this.constantToDateConditionDict.get(fj.condition);
                if (fcond !== undefined && fcond !== null)
                    newFilterItem.condition = fcond;
                else
                    newFilterItem.condition = scriptExecutionModels_1.FilterConditions.Is;
                if (fcond === scriptExecutionModels_1.FilterConditions.Between || fcond === scriptExecutionModels_1.FilterConditions.NotBetween) {
                    if (helper.isEmpty(fj.lowerLimit) || helper.isEmpty(fj.upperLimit))
                        continue;
                    let lls = fj.lowerLimit;
                    let uls = fj.upperLimit;
                    if (lls.match(/^\d\d\d\d-\d\d-\d\d$/) && uls.match(/^\d\d\d\d-\d\d-\d\d$/)) {
                        newFilterItem.lowerLimit = lls;
                        newFilterItem.upperLimit = uls;
                    }
                    else
                        continue;
                    let lowerLimitDate = new Date(lls);
                    let upperLimitDate = new Date(uls);
                    if (upperLimitDate < lowerLimitDate)
                        continue;
                }
                else {
                    if (helper.isEmpty(fj.value))
                        continue;
                    let valuestr = fj.value;
                    if (valuestr.match(/^\d\d\d\d-\d\d-\d\d$/))
                        newFilterItem.value = valuestr;
                    else
                        continue;
                }
            }
            else if (fprop === scriptExecutionModels_1.FilterProperties.ObjectCount) {
                if (collType !== scriptExecutionModels_1.FilterCollectionType.OtherUsers)
                    continue;
                newFilterItem.property = fprop;
                let fcond = this.constantToDateConditionDict.get(fj.condition);
                if (fcond !== undefined && fcond !== null)
                    newFilterItem.condition = fcond;
                else
                    newFilterItem.condition = scriptExecutionModels_1.FilterConditions.Is;
                if (fcond === scriptExecutionModels_1.FilterConditions.Between || fcond === scriptExecutionModels_1.FilterConditions.NotBetween) {
                    if (!Number.isInteger(fj.lowerLimit) || !Number.isInteger(fj.upperLimit)) {
                        continue;
                    }
                    newFilterItem.lowerLimit = fj.lowerLimit;
                    newFilterItem.upperLimit = fj.upperLimit;
                    if (newFilterItem.lowerLimit < 0 || newFilterItem.upperLimit < 0 || newFilterItem.upperLimit < newFilterItem.lowerLimit) {
                        continue;
                    }
                }
                else {
                    if (!Number.isInteger(fj.value))
                        continue;
                    newFilterItem.value = fj.value;
                    if (newFilterItem.value < 0)
                        continue;
                }
            }
            else if (fprop === scriptExecutionModels_1.FilterProperties.ParentObjectName || fprop === scriptExecutionModels_1.FilterProperties.ParentObjectOwnerName) {
                if (collType !== scriptExecutionModels_1.FilterCollectionType.Synonyms || helper.isEmpty(fj.value))
                    continue;
                newFilterItem.property = fprop;
                let fcond = this.constantToConditionDict.get(fj.condition);
                if (fcond !== undefined && fcond !== null)
                    newFilterItem.condition = fcond;
                else
                    newFilterItem.condition = scriptExecutionModels_1.FilterConditions.Is;
                newFilterItem.value = fj.value;
                if (fj.caseSensitiveMatch === true)
                    newFilterItem.caseSensitiveMatch = true;
                else
                    newFilterItem.caseSensitiveMatch = false;
            }
            else
                continue;
            filters.push(newFilterItem);
        }
        return filters;
    }
    getFilterValueJson(prop, val) {
        switch (prop) {
            case scriptExecutionModels_1.FilterProperties.CompilationMode:
                switch (val) {
                    case scriptExecutionModels_1.CodeObjectDebug.WithDebug:
                        return constants_1.Constants.withDebug;
                    default:
                        return constants_1.Constants.withoutDebug;
                }
            case scriptExecutionModels_1.FilterProperties.Status:
                switch (val) {
                    case scriptExecutionModels_1.CodeObjectStatus.Invalid:
                        return constants_1.Constants.filtersInvalid;
                    default:
                        return constants_1.Constants.filtersValid;
                }
            case scriptExecutionModels_1.FilterProperties.TriggerStatus:
                switch (val) {
                    case scriptExecutionModels_1.TriggerStatus.Disabled:
                        return constants_1.Constants.filtersDisabled;
                    default:
                        return constants_1.Constants.filtersEnabled;
                }
            case scriptExecutionModels_1.FilterProperties.VisibleCollections:
                let visCollStr = [];
                if (val && val.length > 0) {
                    val.forEach((coll) => {
                        visCollStr.push(this.collectionToConstantDict.get(coll));
                    });
                }
                return visCollStr;
            case scriptExecutionModels_1.FilterProperties.ObjectCount:
                return val;
            default:
                return val;
        }
    }
    reverseDictionaries() {
        this.collectionToConstantDict.forEach((val, key, mp) => {
            this.constantToCollectionDict.set(val, key);
        });
        this.propertyToConstantDict.forEach((val, key, m) => {
            this.constantToPropertyDict.set(val, key);
        });
        this.conditionToConstantDict.forEach((val, key, m) => {
            this.constantToConditionDict.set(val, key);
        });
        this.statusToConstantDict.forEach((val, key, m) => {
            this.constantToStatusDict.set(val, key);
        });
        this.triggerStatusToConstantDict.forEach((val, key, m) => {
            this.constantToTriggerStatusDict.set(val, key);
        });
        this.matchToConstantDict.forEach((val, key, m) => {
            this.constantToMatchDict.set(val, key);
        });
        this.dateConditionToConstantDict.forEach((val, key, m) => {
            this.constantToDateConditionDict.set(val, key);
        });
    }
}
exports.FilterSettingsManager = FilterSettingsManager;
