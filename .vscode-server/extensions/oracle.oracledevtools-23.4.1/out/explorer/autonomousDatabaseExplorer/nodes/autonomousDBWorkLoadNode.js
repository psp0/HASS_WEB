"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADBJSONWorkLoadNode = exports.ADWWorkLoadNode = exports.ATPWorkLoadNode = exports.ADBWorkLoadNode = exports.CreateNewAutonomousDatabase = exports.CreateNewAutonomousDatabaseData = void 0;
const vscode = require("vscode");
const treeNodeBase_1 = require("../../treeNodeBase");
const iExplorerNode_1 = require("../../iExplorerNode");
const utilities_1 = require("../../utilities");
const ociExplorerModel_1 = require("../ociExplorerModel");
const autonomousDBInstanceNode_1 = require("./autonomousDBInstanceNode");
const helper = require("../../../utilities/helper");
const localizedConstants_1 = require("../../../constants/localizedConstants");
const database = require("oci-database");
const autonomousDBModels_1 = require("../../../models/autonomousDBModels");
const constants_1 = require("../../../constants/constants");
const adbInstanceStatusHandler_1 = require("../adbInstanceStatusHandler");
const autonomousDBUtils_1 = require("../autonomousDBUtils");
const logger_1 = require("../../../infrastructure/logger");
const model_1 = require("oci-database/lib/model");
var DbWorkload;
(function (DbWorkload) {
    DbWorkload["Oltp"] = "OLTP";
    DbWorkload["Dw"] = "DW";
    DbWorkload["Ajd"] = "AJD";
    DbWorkload["Apex"] = "APEX";
})(DbWorkload || (DbWorkload = {}));
var LicenseModel;
(function (LicenseModel) {
    LicenseModel["LicenseIncluded"] = "LICENSE_INCLUDED";
    LicenseModel["BringYourOwnLicense"] = "BRING_YOUR_OWN_LICENSE";
})(LicenseModel || (LicenseModel = {}));
class CreateNewAutonomousDatabaseData {
    constructor() {
        this.whitelistedIps = [];
        this.isMtlsConnectionRequired = true;
    }
}
exports.CreateNewAutonomousDatabaseData = CreateNewAutonomousDatabaseData;
class CreateNewAutonomousDatabase {
    static createAndGetADBDatabaseNode(response, workLoadNode) {
        let instanceNode = null;
        let profileNode = workLoadNode.getRootNode();
        var ociDatabaseProperties = new autonomousDBInstanceNode_1.AutonomousDBInfo();
        ociDatabaseProperties.adbInstanceDisplayName = response.autonomousDatabase.displayName;
        ociDatabaseProperties.adbInstanceID = response.autonomousDatabase.id;
        ociDatabaseProperties.adbInstanceName = response.autonomousDatabase.dbName;
        ociDatabaseProperties.adbInstanceStatus = autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBLifeCycleState(response.autonomousDatabase.lifecycleState);
        ociDatabaseProperties.alwaysFree = response.autonomousDatabase.isFreeTier;
        ociDatabaseProperties.dedicated = response.autonomousDatabase.isDedicated;
        ociDatabaseProperties.serviceConsoleUrl = response.autonomousDatabase.serviceConsoleUrl;
        ociDatabaseProperties.profileName = profileNode.getProfileName();
        instanceNode = new autonomousDBInstanceNode_1.AutonomousDBInstance(ociDatabaseProperties, workLoadNode, profileNode);
        return instanceNode;
    }
    static async getCreateAutonomousDBInitializationData(rootNode, workloadtype) {
        let createNewAutonomousDatabaseData = new CreateNewAutonomousDatabaseData();
        let defaultDBName = autonomousDBUtils_1.AutonomousDBUtils.getdefaultDatabaseName();
        createNewAutonomousDatabaseData.userName = "ADMIN";
        createNewAutonomousDatabaseData.alwaysFree = false;
        createNewAutonomousDatabaseData.dedicated = false;
        createNewAutonomousDatabaseData.cpuCoreCount = 2;
        createNewAutonomousDatabaseData.autoScaling = true;
        createNewAutonomousDatabaseData.autoScalingForStorage = false;
        createNewAutonomousDatabaseData.displayName = defaultDBName;
        createNewAutonomousDatabaseData.workLoadType = workloadtype;
        createNewAutonomousDatabaseData.dbName = defaultDBName;
        createNewAutonomousDatabaseData.compartmentFullPathForDisplay = rootNode.getcompartmentFullPathForDisplay();
        createNewAutonomousDatabaseData.compartmentID = rootNode.getcompartmentID();
        createNewAutonomousDatabaseData.profileName = rootNode.getProfileName();
        createNewAutonomousDatabaseData.computeModel = autonomousDBModels_1.ADBComputeModel.ECPU;
        switch (workloadtype) {
            case autonomousDBModels_1.ADBworkLoadType.OLTP:
                createNewAutonomousDatabaseData.licenseType = autonomousDBModels_1.ADBLicenseType.BringYourLicense;
                createNewAutonomousDatabaseData.storage = 1024;
                createNewAutonomousDatabaseData.storageUnit = autonomousDBModels_1.ADBStorageUnit.GB;
                createNewAutonomousDatabaseData.storageLabel = localizedConstants_1.default.storageInGB;
                break;
            case autonomousDBModels_1.ADBworkLoadType.AJD:
                createNewAutonomousDatabaseData.licenseType = autonomousDBModels_1.ADBLicenseType.SubscribeToNewLicense;
                createNewAutonomousDatabaseData.storage = 1024;
                createNewAutonomousDatabaseData.storageUnit = autonomousDBModels_1.ADBStorageUnit.GB;
                createNewAutonomousDatabaseData.storageLabel = localizedConstants_1.default.storageInGB;
                ;
                break;
            case autonomousDBModels_1.ADBworkLoadType.DW:
                createNewAutonomousDatabaseData.licenseType = autonomousDBModels_1.ADBLicenseType.BringYourLicense;
                createNewAutonomousDatabaseData.storage = 1;
                createNewAutonomousDatabaseData.storageUnit = autonomousDBModels_1.ADBStorageUnit.TB;
                createNewAutonomousDatabaseData.storageLabel = localizedConstants_1.default.storage;
                break;
            default:
                break;
        }
        createNewAutonomousDatabaseData.compartmentData = await rootNode.getCompartmentListForTenancyNode();
        createNewAutonomousDatabaseData.workloadSupportedDBVersionsList = await rootNode.getSupportedDBVersionListForTenancy();
        createNewAutonomousDatabaseData;
        return createNewAutonomousDatabaseData;
    }
    static getLicenseType(licenseType) {
        let licenseModel = LicenseModel.BringYourOwnLicense;
        if (licenseType) {
            licenseModel = ((licenseType == autonomousDBModels_1.ADBLicenseType.BringYourLicense) ? LicenseModel.BringYourOwnLicense : LicenseModel.LicenseIncluded);
        }
        return licenseModel;
    }
    static getDatabaseEditionType(editionType) {
        return ((editionType == autonomousDBModels_1.ADBDatabaseEdition.DatabaseEnterpriseEdition) ? "ENTERPRISE_EDITION" : "STANDARD_EDITION");
    }
    static getWorkloadType(adbWorkloadNodeType) {
        let dbWorkload = DbWorkload.Oltp;
        switch (adbWorkloadNodeType) {
            case autonomousDBModels_1.ADBworkLoadType.OLTP:
                dbWorkload = DbWorkload.Oltp;
                break;
            case autonomousDBModels_1.ADBworkLoadType.DW:
                dbWorkload = DbWorkload.Dw;
                break;
            case autonomousDBModels_1.ADBworkLoadType.AJD:
                dbWorkload = DbWorkload.Ajd;
                break;
            default:
                break;
        }
        return dbWorkload;
    }
    static async getAutonomousContainerDatabases(adbContainerDBRequest, accountComponent) {
        return new Promise(async (resolve, error) => {
            let containerDBresponse = new autonomousDBModels_1.autonomousContainerDatabasesResponse();
            try {
                logger_1.FileStreamLogger.Instance.info("Fetching container databases for selected compartment");
                const autonomousContainerDatabaseRequest = {
                    compartmentId: adbContainerDBRequest.compartmentID,
                    lifecycleState: database.models.AutonomousContainerDatabaseSummary.LifecycleState.Available
                };
                let containerDatabases = accountComponent.ServicesClients.DatabaseServiceClient.listAllAutonomousContainerDatabases(autonomousContainerDatabaseRequest);
                logger_1.FileStreamLogger.Instance.info("Received data from ListAutonomousContainerDatabasesRequest");
                let adbContainerDBResponse = null;
                containerDBresponse.windowUri = adbContainerDBRequest.windowUri;
                containerDBresponse.executionId = adbContainerDBRequest.executionId;
                for await (const response of containerDatabases) {
                    adbContainerDBResponse = new autonomousDBModels_1.autonomousContainerDBResponse();
                    adbContainerDBResponse.containerDatabaseID = response.id;
                    adbContainerDBResponse.compartmentId = response.compartmentId;
                    adbContainerDBResponse.displayName = response.displayName;
                    adbContainerDBResponse.dbUniqueName = response.dbVersion;
                    adbContainerDBResponse.provisionableCpus = response.provisionableCpus;
                    if (response.computeModel) {
                        adbContainerDBResponse.computeModel = response.computeModel == model_1.AutonomousContainerDatabaseSummary.ComputeModel.Ecpu ? autonomousDBModels_1.ADBComputeModel.ECPU : autonomousDBModels_1.ADBComputeModel.OCPU;
                    }
                    else {
                        adbContainerDBResponse.computeModel = null;
                    }
                    containerDBresponse.adbContainerDatabases.push(adbContainerDBResponse);
                }
                if (containerDBresponse.adbContainerDatabases.length > 0) {
                    logger_1.FileStreamLogger.Instance.info("Fetched container databases for selected compartment");
                }
                else {
                    logger_1.FileStreamLogger.Instance.info("No container databases found for selected compartment");
                }
                resolve(containerDBresponse);
            }
            catch (error) {
                helper.logErroAfterValidating(error);
                if (error && error.message) {
                    let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.getAutonomousDBContainerDatabasesFailed, adbContainerDBRequest.compartmentName, error.message);
                    logger_1.ChannelLogger.Instance.info(errorMessage);
                    vscode.window.showErrorMessage(errorMessage);
                    containerDBresponse.errorMessage = error.message;
                }
                resolve(containerDBresponse);
            }
        });
    }
    static updateModel(param) {
        ociExplorerModel_1.OCIExplorerModel.getInstance().EmitModelChangeEvent(param);
    }
    static logDBCreateInfoToOutputWindow(createNewdatabaseRequest) {
        try {
            logger_1.ChannelLogger.Instance.info(` ${localizedConstants_1.default.database}: ${createNewdatabaseRequest.displayName} - ${autonomousDBModels_1.LifecycleState.Provisioning}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.profile}: ${createNewdatabaseRequest.profileName}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.compartment}: ${createNewdatabaseRequest.compartmentFullPath}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.workloadType}: ${autonomousDBUtils_1.AutonomousDBUtils.getworkLoadTypeDisplayString(createNewdatabaseRequest.workLoadType)}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.databaseName}: ${createNewdatabaseRequest.dbName}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.displayName}: ${createNewdatabaseRequest.displayName}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.alwaysFree}: ${createNewdatabaseRequest.alwaysFree ? true : false}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.deploymentType}: ${createNewdatabaseRequest.dedicated ? localizedConstants_1.default.dedicatedInfrastructure : localizedConstants_1.default.sharedInfrastructure}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.databaseVersion}: ${createNewdatabaseRequest.dbVersion}`);
            let ocpuECPUCountLabel = createNewdatabaseRequest.computeModel == autonomousDBModels_1.ADBComputeModel.ECPU ? localizedConstants_1.default.ecpuCount : localizedConstants_1.default.OCPUCount;
            logger_1.ChannelLogger.Instance.log(` ${ocpuECPUCountLabel}: ${createNewdatabaseRequest.cpuCoreCount}`);
            let storageLabel = localizedConstants_1.default.storage;
            let storage = createNewdatabaseRequest.dataStorageSizeInTBs;
            if (createNewdatabaseRequest.dataStorageSizeInGBs) {
                storageLabel = localizedConstants_1.default.storageInGB;
                storage = createNewdatabaseRequest.dataStorageSizeInGBs;
            }
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.storage}: ${storage}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.autoScaling}: ${createNewdatabaseRequest.autoScaling ? true : false}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.autoScalingForStorage}: ${createNewdatabaseRequest.autoScalingForStorage ? true : false}`);
            logger_1.ChannelLogger.Instance.log(` ${localizedConstants_1.default.licenseType}: ${autonomousDBUtils_1.AutonomousDBUtils.getLicenseTypeDisplayString(createNewdatabaseRequest.licenseType)}`);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
    static createNewAutonomousDatabase(createNewdatabaseRequest, workLoadNode) {
        let createAutonomousDatabaseRequest = null;
        try {
            vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.autonomousCreatingDB, createNewdatabaseRequest.displayName));
            if (createNewdatabaseRequest.dedicated) {
                createAutonomousDatabaseRequest = {
                    createAutonomousDatabaseDetails: {
                        source: "NONE",
                        compartmentId: createNewdatabaseRequest.compartmentID,
                        dbName: createNewdatabaseRequest.dbName,
                        displayName: createNewdatabaseRequest.displayName,
                        isDedicated: createNewdatabaseRequest.dedicated,
                        isFreeTier: createNewdatabaseRequest.alwaysFree,
                        dbWorkload: CreateNewAutonomousDatabase.getWorkloadType(createNewdatabaseRequest.workLoadType),
                        adminPassword: String.fromCodePoint(...createNewdatabaseRequest.password),
                        dataStorageSizeInGBs: createNewdatabaseRequest.dataStorageSizeInGBs,
                        computeCount: createNewdatabaseRequest.cpuCoreCount,
                        isAutoScalingEnabled: createNewdatabaseRequest.autoScaling,
                        autonomousContainerDatabaseId: createNewdatabaseRequest.autonomousContainerDatabaseId,
                        isAccessControlEnabled: createNewdatabaseRequest.isAccessControlEnabled,
                        whitelistedIps: createNewdatabaseRequest.whitelistedIps,
                        computeModel: createNewdatabaseRequest.computeModel == autonomousDBModels_1.ADBComputeModel.ECPU ? model_1.CreateAutonomousDatabaseBase.ComputeModel.Ecpu : model_1.CreateAutonomousDatabaseBase.ComputeModel.Ocpu,
                    }
                };
                let arr = createNewdatabaseRequest.password;
                createNewdatabaseRequest.password = null;
                if (arr !== undefined && arr !== null && arr.length > 0) {
                    arr.fill(0);
                    arr.splice(0, arr.length);
                    arr = null;
                }
            }
            else {
                let licenseModel = CreateNewAutonomousDatabase.getLicenseType(createNewdatabaseRequest.licenseType);
                let adbCreateRequest = {
                    source: "NONE",
                    compartmentId: createNewdatabaseRequest.compartmentID,
                    dbName: createNewdatabaseRequest.dbName,
                    displayName: createNewdatabaseRequest.displayName,
                    isDedicated: createNewdatabaseRequest.dedicated,
                    isFreeTier: createNewdatabaseRequest.alwaysFree,
                    dbWorkload: CreateNewAutonomousDatabase.getWorkloadType(createNewdatabaseRequest.workLoadType),
                    adminPassword: String.fromCodePoint(...createNewdatabaseRequest.password),
                    dataStorageSizeInGBs: createNewdatabaseRequest.dataStorageSizeInGBs,
                    dataStorageSizeInTBs: createNewdatabaseRequest.dataStorageSizeInTBs,
                    isAutoScalingEnabled: createNewdatabaseRequest.autoScaling,
                    isAutoScalingForStorageEnabled: createNewdatabaseRequest.autoScalingForStorage,
                    autonomousContainerDatabaseId: createNewdatabaseRequest.autonomousContainerDatabaseId,
                    licenseModel: licenseModel,
                    dbVersion: createNewdatabaseRequest.dbVersion,
                    whitelistedIps: createNewdatabaseRequest.whitelistedIps,
                    isMtlsConnectionRequired: createNewdatabaseRequest.isMtlsConnectionRequired,
                    databaseEdition: licenseModel == LicenseModel.BringYourOwnLicense ? CreateNewAutonomousDatabase.getDatabaseEditionType(createNewdatabaseRequest.databaseEditionType) : null,
                    computeModel: createNewdatabaseRequest.computeModel == autonomousDBModels_1.ADBComputeModel.ECPU ? model_1.CreateAutonomousDatabaseBase.ComputeModel.Ecpu : model_1.CreateAutonomousDatabaseBase.ComputeModel.Ocpu,
                    computeCount: createNewdatabaseRequest.cpuCoreCount
                };
                createAutonomousDatabaseRequest = {
                    createAutonomousDatabaseDetails: adbCreateRequest
                };
                let arr = createNewdatabaseRequest.password;
                createNewdatabaseRequest.password = null;
                if (arr !== undefined && arr !== null && arr.length > 0) {
                    arr.fill(0);
                    arr.splice(0, arr.length);
                    arr = null;
                }
            }
            CreateNewAutonomousDatabase.logDBCreateInfoToOutputWindow(createNewdatabaseRequest);
            workLoadNode.getAccountComponent().ServicesClients.DatabaseServiceClient.createAutonomousDatabase(createAutonomousDatabaseRequest).
                then(async (response) => {
                await workLoadNode.addADBDatabaseNodeOrRefresh(CreateNewAutonomousDatabase.createAndGetADBDatabaseNode(response, workLoadNode));
                let adbDatabaseNode = workLoadNode.getADBDatabaseNode(response.autonomousDatabase.id);
                if (adbDatabaseNode) {
                    var adbInstanceStateHandler = new adbInstanceStatusHandler_1.adbInstanceStatusHandler(workLoadNode.getAccountComponent(), adbDatabaseNode, new Date().getTime(), this.updateModel, autonomousDBModels_1.ADBDatabaseOperation.createDatabase, createNewdatabaseRequest, new adbInstanceStatusHandler_1.adbOutputWindowMessageHandler(autonomousDBModels_1.ADBDatabaseOperation.createDatabase));
                    await adbInstanceStateHandler.getAutonomousDatabasePropertiesPeriodically();
                }
            }, (error) => {
                helper.logErroAfterValidating(error);
                let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.autonomousCreateDBFailed, createNewdatabaseRequest.displayName, error.message);
                logger_1.ChannelLogger.Instance.error(errorMessage);
                vscode.window.showErrorMessage(errorMessage);
                ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendCreateNewAutonomousDBResponse(autonomousDBUtils_1.AutonomousDBUtils.getCreateDBResponse(createNewdatabaseRequest, false));
            });
        }
        catch (err) {
            helper.logErroAfterValidating(err);
            let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.autonomousCreateDBFailed, createNewdatabaseRequest.displayName, err.message);
            logger_1.ChannelLogger.Instance.error(errorMessage);
            vscode.window.showErrorMessage(errorMessage);
            ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendCreateNewAutonomousDBResponse(autonomousDBUtils_1.AutonomousDBUtils.getCreateDBResponse(createNewdatabaseRequest, false));
        }
        finally {
            if (createNewdatabaseRequest !== undefined && createNewdatabaseRequest !== null &&
                createNewdatabaseRequest.password !== undefined && createNewdatabaseRequest.password !== null) {
                let arr = createNewdatabaseRequest.password;
                createNewdatabaseRequest.password = null;
                if (arr !== undefined && arr !== null && arr.length > 0) {
                    arr.fill(0);
                    arr.splice(0, arr.length);
                    arr = null;
                }
            }
        }
    }
}
exports.CreateNewAutonomousDatabase = CreateNewAutonomousDatabase;
class ADBWorkLoadNode extends treeNodeBase_1.TreeNodeBase {
    constructor(connectionURI, parentPath, nodeID, nodeType, contextValue, iconPath, schemaName, nodeLabel, rootNode, accountComponent) {
        super(connectionURI, parentPath, nodeID, nodeType, contextValue, iconPath, schemaName, nodeLabel);
        this.rootNode = rootNode;
        this.accountComponent = accountComponent;
        this.expandNode = false;
        this.fetchDatabaseInstances = true;
    }
    getWorkloadNodeName() {
        let workloadName = localizedConstants_1.default.ATPWorkloadNode;
        switch (this.adbworkLoadType) {
            case autonomousDBModels_1.ADBworkLoadType.OLTP:
                workloadName = localizedConstants_1.default.ATPWorkloadNode;
                break;
            case autonomousDBModels_1.ADBworkLoadType.DW:
                workloadName = localizedConstants_1.default.ADWWorkloadNode;
                break;
            case autonomousDBModels_1.ADBworkLoadType.AJD:
                workloadName = localizedConstants_1.default.AJDWorkloadNode;
                break;
            default:
                break;
        }
        return workloadName;
    }
    async refresh() {
        this.fetchDatabaseInstances = true;
        try {
            await this.fetcADBInstances();
            this.updateModel(this);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
            let errorMessage = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorRefreshingworkLoadNode, this.getWorkloadNodeName(), this.rootNode.getProfileName(), error.message);
            logger_1.ChannelLogger.Instance.error(errorMessage);
            vscode.window.showErrorMessage(errorMessage);
        }
    }
    getNodeExpansionState() {
        return this.expandNode ? vscode.TreeItemCollapsibleState.Expanded : this.getExpansionState();
    }
    async fetcADBInstances() {
        let listAutonomousDatabasesRequest;
        let compartmentID = this.rootNode.getcompartmentID();
        switch (this.adbworkLoadType) {
            case autonomousDBModels_1.ADBworkLoadType.OLTP:
                listAutonomousDatabasesRequest = {
                    compartmentId: compartmentID,
                    dbWorkload: "OLTP"
                };
                break;
            case autonomousDBModels_1.ADBworkLoadType.DW:
                listAutonomousDatabasesRequest = {
                    compartmentId: compartmentID,
                    dbWorkload: "DW"
                };
                break;
            case autonomousDBModels_1.ADBworkLoadType.AJD:
                listAutonomousDatabasesRequest = {
                    compartmentId: compartmentID,
                    dbWorkload: "AJD"
                };
                break;
        }
        try {
            const adbInstances = this.accountComponent.ServicesClients.DatabaseServiceClient.listAllAutonomousDatabases(listAutonomousDatabasesRequest);
            this.children = [];
            let adbstate = autonomousDBModels_1.LifecycleState.UnknownValue;
            for await (const atpInstance of adbInstances) {
                adbstate = autonomousDBUtils_1.AutonomousDBUtils.getADBLifeCycleStateFromOCIADBSummaryLifeCycleState(atpInstance.lifecycleState);
                var ociDatabaseProperties = new autonomousDBInstanceNode_1.AutonomousDBInfo();
                ociDatabaseProperties.adbInstanceDisplayName = atpInstance.displayName;
                ociDatabaseProperties.adbInstanceID = atpInstance.id;
                ociDatabaseProperties.adbInstanceName = atpInstance.dbName;
                ociDatabaseProperties.adbInstanceStatus = adbstate;
                ociDatabaseProperties.alwaysFree = atpInstance.isFreeTier;
                ociDatabaseProperties.dedicated = atpInstance.isDedicated;
                ociDatabaseProperties.profileName = this.rootNode.getProfileName();
                ociDatabaseProperties.serviceConsoleUrl = atpInstance.serviceConsoleUrl;
                ociDatabaseProperties.whitelistedIps = atpInstance.whitelistedIps;
                ociDatabaseProperties.isAccessControlEnabled = atpInstance.isAccessControlEnabled;
                this.children.push(new autonomousDBInstanceNode_1.AutonomousDBInstance(ociDatabaseProperties, this, this.rootNode));
            }
            this.fetchDatabaseInstances = false;
        }
        catch (error) {
            this.fetchDatabaseInstances = false;
            throw error;
        }
    }
    updateModel(param) {
        ociExplorerModel_1.OCIExplorerModel.getInstance().EmitModelChangeEvent(param);
    }
    async addADBDatabaseNodeOrRefresh(childNode) {
        if (this.children) {
            this.children.push(childNode);
            this.updateModel(this);
        }
        else {
            await this.refresh();
        }
    }
    getADBDatabaseNode(adbDatabaseID) {
        let adbDatabaseNode = null;
        let adbDatabaseFoundNode = null;
        if (this.children && this.children.length > 0) {
            for (var node of this.children) {
                adbDatabaseFoundNode = node;
                if (adbDatabaseFoundNode.adbInstanceNodeProperties.adbInstanceID == adbDatabaseID) {
                    adbDatabaseNode = adbDatabaseFoundNode;
                    break;
                }
            }
        }
        return adbDatabaseNode;
    }
    updateChildren(childNode) {
        if (this.children && this.children.length > 0) {
            var dbInstanceNode = null;
            var childFound = false;
            for (var node of this.children) {
                dbInstanceNode = node;
                if (dbInstanceNode.getNodeIdentifier == childNode.getNodeIdentifier) {
                    dbInstanceNode.adbInstanceNodeProperties.adbInstanceStatus = childNode.adbInstanceNodeProperties.adbInstanceStatus;
                    childFound = true;
                    break;
                }
            }
            if (childFound) {
                this.updateModel(this);
            }
        }
    }
    getAccountComponent() {
        return this.accountComponent;
    }
    async getCreateAutonomousDBInitializationData() {
        let createNewAutonomousDatabaseData = await CreateNewAutonomousDatabase.getCreateAutonomousDBInitializationData(this.rootNode, this.adbworkLoadType);
        return createNewAutonomousDatabaseData;
    }
    getTreeItem() {
        const treeItemObject = {};
        treeItemObject.label = this.getNodeIdentifier;
        treeItemObject.collapsibleState = this.getNodeExpansionState();
        treeItemObject.contextValue = this.getContextValue;
        treeItemObject.iconPath = this.getIconPath;
        treeItemObject.command = this.getCommandObject();
        return treeItemObject;
    }
    getADWWindowTitle() {
        let title = localizedConstants_1.default.adbCreateADB;
        return title;
    }
    getADBWindowURI() {
        return constants_1.Constants.adbCreateNewDatabaseWindowUri;
    }
    getWorkLoadType() {
        return this.adbworkLoadType;
    }
    getRootNode() {
        return this.rootNode;
    }
    getInstanceNode(instanceName) {
        let adbInstanceNode = null;
        let adbNode = null;
        for (var node of this.children) {
            adbNode = node;
            if (adbNode.getNodeIdentifier == instanceName) {
                adbInstanceNode = adbNode;
                break;
            }
        }
        return adbInstanceNode;
    }
    async CreateNewAutonomousDatabase(createNewdatabaseRequest) {
        CreateNewAutonomousDatabase.createNewAutonomousDatabase(createNewdatabaseRequest, this);
    }
    async getAutonomousContainerDatabases(adbContainerDBRequest) {
        CreateNewAutonomousDatabase.getAutonomousContainerDatabases(adbContainerDBRequest, this.accountComponent).
            then((adbContainerDatabases) => {
            ociExplorerModel_1.OCIExplorerModel.getInstance().ociExplorerUIHandler.sendAutonomousContainerDatabases(adbContainerDatabases);
        }, (error) => {
        });
    }
    async LaunchCreateNewDatabaseUI() {
        try {
            var explorerModel = ociExplorerModel_1.OCIExplorerModel.getInstance();
            explorerModel.ociExplorerUIHandler.openCreateADBDatabaseUI(this);
        }
        catch (error) {
            helper.logErroAfterValidating(error);
        }
    }
}
exports.ADBWorkLoadNode = ADBWorkLoadNode;
class ATPWorkLoadNode extends ADBWorkLoadNode {
    constructor(name, rootNode) {
        super("", "", name, iExplorerNode_1.ExplorerNodeType.Category, utilities_1.TreeViewConstants.ociWorkloadItemStr, new vscode.ThemeIcon('file-directory'), "", "", rootNode, rootNode.getAccountComponent());
        this.adbworkLoadType = autonomousDBModels_1.ADBworkLoadType.OLTP;
    }
    async getChildren() {
        try {
            if (this.fetchDatabaseInstances) {
                await this.fetcADBInstances();
            }
        }
        catch (error) {
            helper.logErroAfterValidating(error);
            this.children = [];
            let msg = null;
            if (this.rootNode.getcompartmentFullPathForDisplay()) {
                msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForWorkloadNode, localizedConstants_1.default.ATPWorkloadNode, this.rootNode.getcompartmentFullPathForDisplay(), this.rootNode.tenancyName, error.message);
            }
            else {
                msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForRootNode, localizedConstants_1.default.ATPWorkloadNode, this.rootNode.tenancyName, error.message);
            }
            vscode.window.showErrorMessage(msg);
        }
        return this.children;
    }
}
exports.ATPWorkLoadNode = ATPWorkLoadNode;
class ADWWorkLoadNode extends ADBWorkLoadNode {
    constructor(name, rootNode) {
        super("", "", name, iExplorerNode_1.ExplorerNodeType.Category, utilities_1.TreeViewConstants.ociWorkloadItemStr, new vscode.ThemeIcon('file-directory'), "", "", rootNode, rootNode.getAccountComponent());
        this.adbworkLoadType = autonomousDBModels_1.ADBworkLoadType.DW;
    }
    async getChildren() {
        try {
            if (this.fetchDatabaseInstances) {
                await this.fetcADBInstances();
            }
        }
        catch (error) {
            helper.logErroAfterValidating(error);
            this.children = [];
            let msg = null;
            if (this.rootNode.getcompartmentFullPathForDisplay()) {
                msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForWorkloadNode, localizedConstants_1.default.ADWWorkloadNode, this.rootNode.getcompartmentFullPathForDisplay(), this.rootNode.tenancyName, error.message);
            }
            else {
                msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForRootNode, localizedConstants_1.default.ADWWorkloadNode, this.rootNode.tenancyName, error.message);
            }
            vscode.window.showErrorMessage(msg);
        }
        return this.children;
    }
}
exports.ADWWorkLoadNode = ADWWorkLoadNode;
class ADBJSONWorkLoadNode extends ADBWorkLoadNode {
    constructor(name, rootNode) {
        super("", "", name, iExplorerNode_1.ExplorerNodeType.Category, utilities_1.TreeViewConstants.ociWorkloadItemStr, new vscode.ThemeIcon('file-directory'), "", "", rootNode, rootNode.getAccountComponent());
        this.adbworkLoadType = autonomousDBModels_1.ADBworkLoadType.AJD;
    }
    async getChildren() {
        try {
            if (this.fetchDatabaseInstances) {
                await this.fetcADBInstances();
            }
        }
        catch (error) {
            helper.logErroAfterValidating(error);
            this.children = [];
            let msg = null;
            if (this.rootNode.getcompartmentFullPathForDisplay()) {
                msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForWorkloadNode, localizedConstants_1.default.AJDWorkloadNode, this.rootNode.getcompartmentFullPathForDisplay(), this.rootNode.tenancyName, error.message);
            }
            else {
                msg = helper.stringFormatterCsharpStyle(localizedConstants_1.default.errorGettingADBInstancesForRootNode, localizedConstants_1.default.AJDWorkloadNode, this.rootNode.tenancyName, error.message);
            }
            vscode.window.showErrorMessage(msg);
        }
        return this.children;
    }
}
exports.ADBJSONWorkLoadNode = ADBJSONWorkLoadNode;
