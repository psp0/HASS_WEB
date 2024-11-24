"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionScenarioManager = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
const localizedConstants_1 = require("../constants/localizedConstants");
const oracleVSCodeConnector_1 = require("../infrastructure/oracleVSCodeConnector");
const connectionModels_1 = require("../models/connectionModels");
const question_1 = require("../prompts/question");
const helper = require("../utilities/helper");
const Utils = require("../utilities/helper");
const connectionCommandsScenarioManager_1 = require("./connectionCommandsScenarioManager");
const utilities_1 = require("../explorer/utilities");
const scriptExcutionCommandHandler_1 = require("../scriptExecution/scriptExcutionCommandHandler");
const scriptExecutionModels_1 = require("../models/scriptExecutionModels");
const defaultConnectionManager_1 = require("./defaultConnectionManager");
class ConnectionScenarioManager {
    constructor(varConnectionCmdHandler, varConnectionRepository, varPrompter, varOracleVsCodeConnector, varScriptExecutionCommandHandler) {
        this.varConnectionCmdHandler = varConnectionCmdHandler;
        this.varConnectionRepository = varConnectionRepository;
        this.varPrompter = varPrompter;
        this.varOracleVsCodeConnector = varOracleVsCodeConnector;
        this.varScriptExecutionCommandHandler = varScriptExecutionCommandHandler;
        if (!varOracleVsCodeConnector) {
            this.OracleVSCodeConnector = new oracleVSCodeConnector_1.OracleVSCodeConnector();
        }
    }
    get connCommandHandler() {
        return this.varConnectionCmdHandler;
    }
    get OracleVSCodeConnector() {
        return this.varOracleVsCodeConnector;
    }
    set OracleVSCodeConnector(value) {
        this.varOracleVsCodeConnector = value;
    }
    async displayConnectionList(showExistingProfiles, showExistingProfilesOnly, docUri) {
        const self = this;
        let listOfConns = await self.varConnectionRepository.getConnectionListForDropDown(showExistingProfiles, showExistingProfilesOnly);
        if (docUri) {
            let workspaceFolder = vscode.workspace.getWorkspaceFolder(docUri);
            if (workspaceFolder) {
                let folderName = workspaceFolder.name;
                if (folderName) {
                    listOfConns = listOfConns.filter(conn => !conn.connectionProperties || !conn.connectionProperties.workspaceFolder ||
                        (conn.connectionProperties.workspaceFolder.index === workspaceFolder.index && conn.connectionProperties.workspaceFolder.name === workspaceFolder.name));
                }
            }
        }
        let profileCreatedOrSelected;
        try {
            {
                const selectedConn = await self.askUserToSelectFromList({
                    placeHolder: localizedConstants_1.default.labelSelectConnectionFromList,
                    matchOnDescription: true,
                }, listOfConns);
                if (selectedConn) {
                    profileCreatedOrSelected = await self.processSelectedConnection(selectedConn);
                }
            }
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
        return profileCreatedOrSelected;
    }
    async askLanguageChange() {
        const self = this;
        const picklist = [
            {
                label: localizedConstants_1.default.extensionOwner,
                description: localizedConstants_1.default.plsqlLanguageDescription,
                providerName: constants_1.Constants.extensionOwner,
            },
            {
                label: localizedConstants_1.default.noneOwner,
                description: localizedConstants_1.default.useNoneLanguage,
                providerName: constants_1.Constants.noneOwner,
            },
        ];
        try {
            const selection = await self.askUserToSelectFromList({
                placeHolder: localizedConstants_1.default.selectLanguage,
                matchOnDescription: true,
            }, picklist);
            if (selection) {
                return selection.providerName;
            }
            else {
                return undefined;
            }
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            return undefined;
        }
    }
    async aksToCancelConnection() {
        const self = this;
        let valToReturn = false;
        const question = {
            type: question_1.QuestionTypes.confirm,
            name: "cnfCancelConnect",
            message: localizedConstants_1.default.cnfCancelConnection,
        };
        try {
            const askResult = await self.varPrompter.promptSingle(question);
            valToReturn = askResult ? true : false;
        }
        catch (err) {
            helper.logErroAfterValidating(err);
        }
        return valToReturn;
    }
    async askForLanguageModeChange() {
        const self = this;
        const question = {
            type: question_1.QuestionTypes.confirm,
            name: "cnfLangChange",
            message: localizedConstants_1.default.cnfChangeLanguageMode,
        };
        let funcresult = false;
        try {
            const selValue = await self.varPrompter.promptSingle(question);
            if (selValue) {
                await vscode.commands.executeCommand("workbench.action.editor.changeLanguageMode");
                funcresult = await self.stopTillLanguageIsOraclePLSQL();
            }
            else {
                funcresult = false;
            }
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            funcresult = false;
        }
        return funcresult;
    }
    async handleDisconnectChoice() {
        const self = this;
        try {
            const question = {
                type: question_1.QuestionTypes.confirm,
                name: localizedConstants_1.default.disconnectConnectionMessage,
                message: localizedConstants_1.default.cnfDisconnectConnection,
            };
            const result = await self.varPrompter.promptSingle(question);
            return result;
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            return false;
        }
    }
    async removeProfile(connProfile) {
        const self = this;
        let continueWithRemove = true;
        if (!connProfile) {
            const profiles = await self.varConnectionRepository.getSavedConnectionProfilesList(false);
            connProfile = await self.selectProfileForRemoval(profiles);
        }
        else {
            let msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConfirmProfileRemoval, connProfile.uniqueName);
            continueWithRemove = await Utils.Utils.promptForConfirmation(msg, this.OracleVSCodeConnector);
        }
        if (connProfile && continueWithRemove) {
            const profileDeleted = await self.varConnectionRepository.deleteConnectionProfile(connProfile);
            if (profileDeleted === true) {
                self.varOracleVsCodeConnector.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgProfileRemovedSuccess, connProfile.uniqueName));
                await defaultConnectionManager_1.DefaultConnectionManager.instance.connectionDeleted(connProfile);
            }
            return profileDeleted;
        }
        else {
            return false;
        }
    }
    async updateProfile(connProfile) {
        const self = this;
        try {
            if (!connProfile) {
                const profiles = await self.varConnectionRepository.getSavedConnectionProfilesList(false);
                connProfile = await self.selectProfileForUpdate(profiles);
            }
            if (connProfile) {
                const args = new scriptExcutionCommandHandler_1.RootWebPageArguments();
                args.uri = helper.Utils.getConnectionUri(utilities_1.TreeViewConstants.baseUri, connProfile.uniqueName) + "_Update";
                args.executionId = (++self.varScriptExecutionCommandHandler.scriptExecutionCount).toString();
                args.windowUri = constants_1.Constants.connectionWindowUri;
                args.uiMode = scriptExecutionModels_1.UIDisplayMode.ConnectionManagement;
                args.isCreate = false;
                args.profileName = connProfile.name;
                args.configurationTarget = connProfile.configurationTarget;
                args.workspaceFolderName = connProfile.workspaceFolder?.name;
                args.workspaceFolderUri = connProfile.workspaceFolder?.uri?.toString();
                args.workspaceFolderIndex = connProfile.workspaceFolder?.index;
                args.windowTitle = localizedConstants_1.default.connectionUITitle;
                self.connCommandHandler.openProfileUI(args);
            }
            else {
                return false;
            }
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            return false;
        }
    }
    async shallAskForAnyMissingConnInfo(connPropVsCode, ignoreFocusOut = false) {
        const self = this;
        let connPropToReturn;
        if (connPropVsCode.connectionString) {
            connPropToReturn = (connPropVsCode);
        }
        else {
            const passwordEmptyInConfigFile = Utils.isEmpty(connPropVsCode.password);
            try {
                connPropToReturn =
                    await connectionCommandsScenarioManager_1.ConnectionPropertiesPresenter.promptsAndAcceptsVariousConnProperties(connPropVsCode, false, passwordEmptyInConfigFile, self.varPrompter, self.varConnectionRepository, null, false, ignoreFocusOut);
            }
            catch (err) {
                helper.logErroAfterValidating(err);
            }
        }
        return connPropToReturn;
    }
    askUserToSelectFromList(options, choices) {
        const self = this;
        const question = {
            choices,
            matchOptions: options,
            message: options.placeHolder,
            name: "connectionselectquestion",
            type: question_1.QuestionTypes.expand,
        };
        return self.varPrompter.promptSingle(question);
    }
    async processSelectedConnection(selectedItem) {
        const self = this;
        let profileToreturn;
        if (selectedItem !== undefined) {
            profileToreturn = selectedItem.connectionProperties;
            try {
                switch (selectedItem.matchingEnumType) {
                    case connectionModels_1.ConnectionAttributesSelection.CreateNew:
                        await self.connCommandHandler.openCreateProfileUI(self.OracleVSCodeConnector.activeTextEditorUri, true);
                        break;
                    default:
                }
            }
            catch (err) {
                helper.logErroAfterValidating(err);
            }
        }
        return profileToreturn;
    }
    async askToClearRecentConnectionsList() {
        const self = this;
        try {
            const question = {
                message: localizedConstants_1.default.cnfClearRecentConnectionList,
                name: localizedConstants_1.default.cnfClearRecentConnectionList,
                type: question_1.QuestionTypes.confirm,
            };
            const result = await self.varPrompter.promptSingle(question);
            return result ? true : false;
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            return false;
        }
    }
    async saveVsCodeProfile(oracleVsCodeprofile, oldConnectionUniqueName, useCredStoreSettings = false) {
        let savedProfile;
        const self = this;
        savedProfile = await self.varConnectionRepository.saveConnectionProfileToConfig(oracleVsCodeprofile, oldConnectionUniqueName, useCredStoreSettings);
        return savedProfile;
    }
    async selectProfileForRemoval(profiles) {
        const self = this;
        if (!profiles || profiles.length === 0) {
            self.varOracleVsCodeConnector.showErrorMessage(localizedConstants_1.default.msgNoProfileAvaialble);
            return undefined;
        }
        const questions = [
            {
                choices: profiles,
                matchOptions: { matchOnDescription: true },
                message: localizedConstants_1.default.msgSelectProfileToRemove,
                name: "selectProfile",
                type: question_1.QuestionTypes.expand,
                onAnswered: (value) => {
                    const connectionProps = value.connectionProperties;
                    const connectionName = connectionProps.uniqueName;
                    questions[1].message = helper.stringFormatterCsharpStyle(localizedConstants_1.default.msgConfirmProfileRemoval, connectionName);
                }
            },
            {
                message: localizedConstants_1.default.msgConfirmProfileRemoval,
                name: "cnfREmoval",
                type: question_1.QuestionTypes.confirm,
            },
        ];
        try {
            const answers = await self.varPrompter.prompt(questions);
            if (answers && answers.cnfREmoval) {
                const profilePickItem = answers.selectProfile;
                return profilePickItem.connectionProperties;
            }
            else {
                return undefined;
            }
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            return undefined;
        }
    }
    async selectProfileForUpdate(profiles) {
        const self = this;
        if (!profiles || profiles.length === 0) {
            self.varOracleVsCodeConnector.showErrorMessage(localizedConstants_1.default.msgNoProfileAvaialble);
            return undefined;
        }
        const questions = [
            {
                choices: profiles,
                matchOptions: { matchOnDescription: true },
                message: localizedConstants_1.default.msgSelectProfileToUpdate,
                name: "selectProfile",
                type: question_1.QuestionTypes.expand,
            }
        ];
        try {
            const answers = await self.varPrompter.prompt(questions);
            if (answers) {
                const profilePickItem = answers.selectProfile;
                return profilePickItem.connectionProperties;
            }
            else {
                return undefined;
            }
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            return undefined;
        }
    }
    stopForDocumentToAssociateWWithOracle(resolve, timer) {
        const self = this;
        if (timer.getDuration() > constants_1.Constants.timeToWaitForLanguageModeChange) {
            resolve(false);
        }
        else if (self.OracleVSCodeConnector.isActiveOracleFile) {
            resolve(true);
        }
        else {
            setTimeout(self.stopForDocumentToAssociateWWithOracle.bind(self, resolve, timer), 50);
        }
    }
    stopTillLanguageIsOraclePLSQL() {
        const self = this;
        return new Promise((resolve, reject) => {
            const timer = new Utils.Timer();
            timer.start();
            self.stopForDocumentToAssociateWWithOracle(resolve, timer);
        });
    }
    async renameRecentlyUsedConnection(oldConn, newConn) {
        await this.varConnectionRepository.renameRecentlyUsedConnection(oldConn, newConn);
    }
}
exports.ConnectionScenarioManager = ConnectionScenarioManager;
