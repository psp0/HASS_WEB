"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.getSystemManager = exports.activate = void 0;
const vscode = require("vscode");
const localizedConstants_1 = require("./constants/localizedConstants");
const logger_1 = require("./infrastructure/logger");
const systemManager_1 = require("./infrastructure/systemManager");
const constants_1 = require("./constants/constants");
const setup_1 = require("./utilities/setup");
const util = require("util");
const childProcess = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");
const helper = require("./utilities/helper");
let systemManager;
let dotnetRuntimeMajorVersion;
let dotnetRuntimeFullVersion;
let dotnetRuntimePath;
let dotnetRuntimeDirname;
async function activate(context) {
    let dotnetRuntimeFound = false;
    try {
        let extnLogDir;
        try {
            if (context.logUri && context.logUri.fsPath) {
                if (!fs.existsSync(context.logUri.fsPath)) {
                    fs.mkdirSync(context.logUri.fsPath, { recursive: true });
                }
                extnLogDir = context.logUri.fsPath;
            }
        }
        catch (error) { }
        if (!extnLogDir) {
            extnLogDir = context.extensionPath;
        }
        logger_1.FileStreamLogger.extensionPath = extnLogDir;
        constants_1.Constants.setPaths(context.extensionPath);
        logger_1.FileStreamLogger.Instance.info("Activating Extension...!" + context.extensionPath);
        logger_1.ChannelLogger.Instance.info(localizedConstants_1.default.msgActivatingExtension);
        try {
            logger_1.FileStreamLogger.Instance.info("Setting user directory - Start");
            if (context && context.globalStorageUri && context.globalStorageUri.fsPath) {
                helper.Utils.userDataDirectory = path.resolve(context.globalStorageUri.fsPath, "../..");
                logger_1.FileStreamLogger.Instance.info("Setting user directory - user directory set");
            }
            logger_1.FileStreamLogger.Instance.info("Setting user directory - End");
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error("Setting user directory - Error");
            helper.logErroAfterValidating(error);
        }
        setup_1.Setup.CurrentColorThemeKind = vscode.window.activeColorTheme.kind;
        logger_1.FileStreamLogger.Instance.info(`Active Color Theme Kind: ${setup_1.Setup.CurrentColorThemeKind}`);
        let val = false;
        let doneValidatingInstalledRuntime = false;
        let installedDotnetPath = context.globalState.get("odtvscodeInstalledDotnetPath");
        if (installedDotnetPath && fs.existsSync(installedDotnetPath)) {
            dotnetRuntimePath = installedDotnetPath;
            dotnetRuntimeDirname = path.dirname(installedDotnetPath);
            logger_1.FileStreamLogger.Instance.info(`Checking previously installed dotnet runtime in VSCode`);
            try {
                val = await checkDotnetRuntimeInfo(context);
                if (val) {
                    doneValidatingInstalledRuntime = true;
                    dotnetRuntimeFound = val;
                    logger_1.FileStreamLogger.Instance.info(`Using previously installed dotnet runtime in VSCode`);
                    await setup_1.Setup.migrateSettings(context);
                    logger_1.FileStreamLogger.Instance.info("Extension will be activated using dotnet runtime: " + dotnetRuntimeFullVersion);
                    await startExtension(context);
                }
                else {
                    doneValidatingInstalledRuntime = true;
                    dotnetRuntimeFound = false;
                    logger_1.FileStreamLogger.Instance.info(`Previously installed dotnet runtime in VSCode not found`);
                }
            }
            catch (err) {
                doneValidatingInstalledRuntime = true;
                dotnetRuntimeFound = false;
                logger_1.FileStreamLogger.Instance.info(`Exception checking previously installed dotnet runtime in VSCode: ${err}`);
            }
            if (!dotnetRuntimeFound) {
                logger_1.FileStreamLogger.Instance.info(`Checking dotnet runtime on local machine`);
                val = await checkDotnetInfoOnLocalMachine(context, dotnetRuntimeFound, doneValidatingInstalledRuntime);
                if (!val) {
                    logger_1.FileStreamLogger.Instance.error("No compatible dotnet runtime in VSCode or local machine. Extension activation will fail");
                    return false;
                }
            }
            setup_1.Setup.CurrentColorThemeKind = vscode.window.activeColorTheme.kind;
        }
        else {
            dotnetRuntimeFound = false;
            doneValidatingInstalledRuntime = true;
            logger_1.FileStreamLogger.Instance.info("Either no dotnet runtime was installed in VSCode or the previously installed dotnet runtime is not found");
            val = await checkDotnetInfoOnLocalMachine(context, dotnetRuntimeFound, doneValidatingInstalledRuntime);
            if (!val) {
                logger_1.FileStreamLogger.Instance.error("No compatible dotnet runtime in VSCode or local machine. Extension activation will fail");
                return false;
            }
        }
    }
    catch (error) {
        logger_1.FileStreamLogger.Instance.error("Error during extension activation : " + error.message);
        logger_1.ChannelLogger.Instance.error(error);
        return false;
    }
    return true;
}
exports.activate = activate;
async function startExtension(context) {
    try {
        logger_1.FileStreamLogger.Instance.info("Oracle Developer Tools Extension will be activated with dotnetRuntimeVersion:" + dotnetRuntimeFullVersion);
        systemManager = new systemManager_1.SystemManager(context);
        await systemManager.init(dotnetRuntimeFullVersion, dotnetRuntimeMajorVersion, dotnetRuntimePath);
        logger_1.FileStreamLogger.Instance.info("Oracle Developer Tools Extension Activated");
        logger_1.ChannelLogger.Instance.info(localizedConstants_1.default.msgOracleDevToolsActivated);
    }
    catch (error) {
        logger_1.FileStreamLogger.Instance.error("Error during start extension activation: " + error);
        logger_1.ChannelLogger.Instance.error(error);
        throw new Error(error);
    }
}
function getSystemManager() { return systemManager; }
exports.getSystemManager = getSystemManager;
async function deactivate() {
    return systemManager?.deactivate();
}
exports.deactivate = deactivate;
async function checkDotnetInfoOnLocalMachine(context, dotnetRuntimeFound, doneValidatingInstalledRuntime) {
    let retVal = false;
    if (!dotnetRuntimeFound && doneValidatingInstalledRuntime) {
        dotnetRuntimePath = "dotnet";
        dotnetRuntimeDirname = null;
        logger_1.FileStreamLogger.Instance.info(`Checking installed dotnet runtime on machine`);
        try {
            let val = await checkDotnetRuntimeInfo(context);
            if (val) {
                dotnetRuntimeFound = val;
                logger_1.FileStreamLogger.Instance.info(`Using installed dotnet runtime on machine`);
                await setup_1.Setup.migrateSettings(context);
                logger_1.FileStreamLogger.Instance.info(`Extension will be activated using dotnet runtime: ${dotnetRuntimeFullVersion}`);
                await startExtension(context);
                retVal = true;
            }
            else {
                dotnetRuntimeFound = false;
                logger_1.FileStreamLogger.Instance.info(`No compatible installed dotnet runtimes on machine`);
            }
        }
        catch (err) {
            dotnetRuntimeFound = false;
            logger_1.FileStreamLogger.Instance.info(`Exception checking installed dotnet runtimes on machine: ${err}`);
        }
        if (!dotnetRuntimeFound) {
            logger_1.FileStreamLogger.Instance.info(`Trying to install dotnet runtime in VSCode...`);
            try {
                let dotnetPath = await installDotnetRuntime(context);
                if (dotnetPath) {
                    dotnetRuntimePath = dotnetPath;
                    logger_1.FileStreamLogger.Instance.info(`Installed dotnet runtime in VSCode: ${dotnetRuntimePath}`);
                    dotnetRuntimeDirname = path.dirname(dotnetPath);
                    logger_1.FileStreamLogger.Instance.info(`Saving installed dotnet Runtime in VSCode to cache: ${dotnetRuntimePath}`);
                    await context.globalState.update("odtvscodeInstalledDotnetPath", dotnetPath);
                    logger_1.FileStreamLogger.Instance.info(`Saved installed dotnet runtime in VSCode to cache: ${dotnetRuntimePath}`);
                    try {
                        let val = await checkDotnetRuntimeInfo(context);
                        if (val) {
                            dotnetRuntimeFound = val;
                            logger_1.FileStreamLogger.Instance.info(`Found installed dotnet runtime in VSCode`);
                            await setup_1.Setup.migrateSettings(context);
                            logger_1.FileStreamLogger.Instance.info("Extension will be activated using dotnet runtime: " + dotnetRuntimeFullVersion);
                            startExtension(context);
                            retVal = true;
                        }
                        else {
                            dotnetRuntimeFound = false;
                            logger_1.FileStreamLogger.Instance.warn(`Checking newly installed dotnet runtime in VSCode failed`);
                            logger_1.FileStreamLogger.Instance.warn(`Failed to install dotnet runtime in VSCode`);
                        }
                    }
                    catch (err) {
                        dotnetRuntimeFound = false;
                        logger_1.FileStreamLogger.Instance.error(`Exception checking newly installed dotnet runtime in VSCode: ${err}`);
                        logger_1.FileStreamLogger.Instance.warn(`Failed to install dotnet runtime in VSCode: ${err}`);
                    }
                }
                else {
                    dotnetRuntimePath = null;
                    dotnetRuntimeDirname = null;
                    dotnetRuntimeFound = false;
                    logger_1.FileStreamLogger.Instance.warn(`Failed to install dotnet runtime in VSCode`);
                }
            }
            catch (err) {
                dotnetRuntimePath = null;
                dotnetRuntimeDirname = null;
                dotnetRuntimeFound = false;
                logger_1.FileStreamLogger.Instance.warn(`Exception installing dotnet runtime in VSCode: ${err}`);
            }
            retVal = dotnetRuntimeFound;
            if (!dotnetRuntimeFound) {
                logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.msgdotnetRuntimeNotFound);
                ShowDotnetRuntimeInstallInfoDialog(context);
            }
        }
    }
    return retVal;
}
async function checkDotnetRuntimeInfo(context) {
    let dotnetRuntimeFound = false;
    let dotnetVer = "";
    let errMsg = "";
    logger_1.FileStreamLogger.Instance.info("Checking installed dotnet runtimes");
    try {
        let val = await getDotnetInfo();
        if (val) {
            logger_1.FileStreamLogger.Instance.info("Found dotnet runtimes");
            var dotnetversions = null;
            if (dotnetRuntimeDirname != null && val.indexOf(dotnetRuntimeDirname) > 0) {
                dotnetversions = val.split(os.EOL);
                if (dotnetversions != null && dotnetversions.length > 0) {
                    for (let i = dotnetversions.length - 2; i >= 0; i--) {
                        if (dotnetversions[i].indexOf(dotnetRuntimeDirname) > 0) {
                            dotnetRuntimeFound = IsRequiredDotnetVersion(dotnetversions[i]);
                            if (dotnetRuntimeFound) {
                                break;
                            }
                        }
                    }
                }
            }
            else {
                dotnetRuntimeFound = IsRequiredDotnetVersion(val);
                if (!dotnetRuntimeFound) {
                    var dotnetversions = val.split(os.EOL);
                    if (dotnetversions != null && dotnetversions.length > 0) {
                        for (let i = dotnetversions.length - 2; i >= 0; i--) {
                            dotnetRuntimeFound = IsRequiredDotnetVersion(dotnetversions[i]);
                            if (dotnetRuntimeFound) {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        logger_1.FileStreamLogger.Instance.error("Finding installed dotnet runtimes returns error");
        logger_1.FileStreamLogger.Instance.error(err.message);
        logger_1.ChannelLogger.Instance.error(err);
        dotnetRuntimeFound = false;
    }
    if (!dotnetRuntimeFound) {
        logger_1.FileStreamLogger.Instance.info(`No compatible dotnet runtime found`);
    }
    return dotnetRuntimeFound;
}
function IsRequiredDotnetVersion(val) {
    let dotnetRuntimeFound = false;
    let dotnetRuntimeName = constants_1.Constants.dotnetRuntime + " ";
    let dotnetVer = "";
    try {
        if (val != null) {
            let idx = val.lastIndexOf(dotnetRuntimeName);
            if (idx >= 0) {
                logger_1.FileStreamLogger.Instance.info("Found " + constants_1.Constants.dotnetRuntime);
                var substr = val.substring(idx);
                var strs = substr.split(" ", 2);
                if (strs != null && strs.length > 1) {
                    dotnetVer = strs[1];
                    logger_1.FileStreamLogger.Instance.info("dotnet runtime found, version: " + dotnetVer);
                    strs = dotnetVer.split(".", 3);
                    if (strs != null && strs.length > 1) {
                        var majorVer = Number(strs[0]);
                        var minorVer = Number(strs[1]);
                        logger_1.FileStreamLogger.Instance.info("dotnet runtime majorver: " + majorVer + " minorver: " + minorVer);
                        if ((majorVer === 8 || majorVer === 6) && minorVer === 0) {
                            let serverdll = "";
                            switch (majorVer) {
                                case 6:
                                    serverdll = path.join(path.dirname(__dirname), "out", "server", constants_1.Constants.server60DllName);
                                    break;
                                case 8:
                                    serverdll = path.join(path.dirname(__dirname), "out", "server", constants_1.Constants.server80DllName);
                                    break;
                                default:
                                    break;
                            }
                            if (serverdll && serverdll.length > 0) {
                                logger_1.FileStreamLogger.Instance.info("Checking if OracleVSCode Language Server assembly " + serverdll + " exists");
                                if (fs.existsSync(serverdll)) {
                                    logger_1.FileStreamLogger.Instance.info(serverdll + " Exists");
                                    logger_1.FileStreamLogger.Instance.info("Using OracleVSCode Language Server assembly: " + serverdll);
                                    dotnetRuntimeMajorVersion = majorVer;
                                    dotnetRuntimeFullVersion = dotnetVer;
                                    dotnetRuntimeFound = true;
                                }
                                else {
                                    logger_1.FileStreamLogger.Instance.info(serverdll + " is missing");
                                }
                            }
                            else {
                                logger_1.FileStreamLogger.Instance.info(`serverdll is empty. Net Runtime ${majorVer}.${minorVer} is not supported`);
                            }
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        dotnetRuntimeFound = false;
        if (val) {
            logger_1.FileStreamLogger.Instance.error(`Error checking if ${val} is a supported dotruntime version: ${error}`);
        }
        else {
            logger_1.FileStreamLogger.Instance.error(`Error checking supported dotruntime version. Input arg val is null or undefined: ${error}`);
        }
    }
    return dotnetRuntimeFound;
}
async function getDotnetInfo() {
    logger_1.FileStreamLogger.Instance.info("Finding installed dotnet runtimes using dotnet runtime path: " + dotnetRuntimePath);
    const exec = util.promisify(childProcess.exec);
    let dotnetPath = null;
    if (dotnetRuntimePath.indexOf(' ') < 0) {
        dotnetPath = dotnetRuntimePath + ' --list-runtimes';
    }
    else {
        logger_1.FileStreamLogger.Instance.info("dotnet runtime path includes space characters, enclosing path in double quotes");
        dotnetPath = '"' + dotnetRuntimePath + '" --list-runtimes';
    }
    logger_1.FileStreamLogger.Instance.info(`List dotnet runtimes using ${dotnetPath}`);
    const { stdout, stderr } = await exec(dotnetPath);
    if (stdout != null && stdout.length > 0)
        return stdout;
    if (stderr != null && stderr.length > 0) {
        logger_1.FileStreamLogger.Instance.error("Error finding installed dotnet runtimes");
        logger_1.FileStreamLogger.Instance.error(stderr);
        return Promise.reject(new Error(stderr));
    }
    else {
        logger_1.FileStreamLogger.Instance.error("No installed dotnet runtimes found");
        return Promise.reject(new Error(localizedConstants_1.default.msgdotnetRuntimeNotFound));
    }
}
async function onLaunchDotnetPage() {
    let startCommand = `${constants_1.Constants.linuxOpenCommand} ${constants_1.Constants.oracleDotNetRuntimeInstallInfoLink_AnyOs}`;
    if (process.platform === constants_1.Constants.windowsProcessPlatform) {
        startCommand = `${constants_1.Constants.windowsOpenCommand} ${constants_1.Constants.oracleDotNetRuntimeInstallInfoLink_Windows}`;
    }
    else if (process.platform === constants_1.Constants.macOSprocessplatform) {
        startCommand = `${constants_1.Constants.macOSOpenCommand} ${constants_1.Constants.oracleDotNetRuntimeInstallInfoLink_Mac}`;
    }
    else if (process.platform === constants_1.Constants.linuxProcessPlatform) {
        startCommand = `${constants_1.Constants.linuxOpenCommand} ${constants_1.Constants.oracleDotNetRuntimeInstallInfoLink_Linux}`;
    }
    await childProcess.exec(startCommand);
    return true;
}
function ShowDotnetRuntimeInstallInfoDialog(context) {
    if (setup_1.Setup.getShowMissingDotnetCoreRuntimeDialog(context)) {
        vscode.window.showWarningMessage(localizedConstants_1.default.msgDialogTextMissingDotnetRuntime, { modal: true }, localizedConstants_1.default.messageDontShowDialogAgain, localizedConstants_1.default.messageGoToDownloadPage).then(action => {
            if (action && action === localizedConstants_1.default.messageGoToDownloadPage) {
                onLaunchDotnetPage();
            }
            else if (action === localizedConstants_1.default.messageDontShowDialogAgain) {
                setup_1.Setup.updateShowMissingDotnetCoreRuntimeDialog(context, true);
            }
        });
    }
}
async function installDotnetRuntime(context) {
    let dotnetPath = null;
    logger_1.FileStreamLogger.Instance.info("Starting dotnet runtime install");
    logger_1.ChannelLogger.Instance.info(localizedConstants_1.default.downloadingDotnetRuntime);
    try {
        logger_1.FileStreamLogger.Instance.info("Executing command dotnet.showAcquisitonLog, to show dotnet runtime download and install acquisition log");
        await vscode.commands.executeCommand('dotnet.showAcquisitionLog');
        logger_1.FileStreamLogger.Instance.info("Successfully enabled showing acquisition logs using dotnet.showAcquisitonLog");
    }
    catch (err) {
        logger_1.FileStreamLogger.Instance.error(`Error Executing command dotnet.showAcquisitonLog`);
        logger_1.FileStreamLogger.Instance.error(`Error: ${err}`);
    }
    const context2 = { version: '8.0', requestingExtensionId: 'Oracle.oracledevtools' };
    let result = null;
    let checkAcquireStatus = true;
    try {
        logger_1.FileStreamLogger.Instance.info(`Executing command dotnet.acquire, to download/install dotnet runtime.`);
        result = await vscode.commands.executeCommand('dotnet.acquire', context2);
        if (result && result.dotnetPath) {
            logger_1.FileStreamLogger.Instance.info(`Successfully downloaded/installed dotnet runtime using dotnet.acquire`);
            logger_1.FileStreamLogger.Instance.info(`Result from dotnet.acquire: ${result}`);
            dotnetPath = result.dotnetPath;
            logger_1.FileStreamLogger.Instance.info(`Not executing command dotnetPath.acquireStatus`);
            checkAcquireStatus = false;
        }
    }
    catch (error) {
        logger_1.FileStreamLogger.Instance.error(`Error downloading/installing dotnet runtime in vscode using dotnet.acquire`);
        logger_1.FileStreamLogger.Instance.error(`Error: ${error}`);
        logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
        return Promise.reject(new Error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime));
    }
    if (checkAcquireStatus) {
        try {
            logger_1.FileStreamLogger.Instance.info(`Executing command dotnet.acquireStatus, to get status of dotnet download/install.`);
            result = await vscode.commands.executeCommand('dotnet.acquireStatus', context2);
        }
        catch (error) {
            logger_1.FileStreamLogger.Instance.error(`Error getting dotnet runtime download/install status using dotnet.acquireStatus`);
            logger_1.FileStreamLogger.Instance.error(`Error: ${error}`);
            logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
            return Promise.reject(new Error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime));
        }
        if (result && result.dotnetPath) {
            logger_1.FileStreamLogger.Instance.info("Successfully acquired dotnet runtime download/install status using dotnet.acquireStatus");
            logger_1.FileStreamLogger.Instance.info(`Result from dotnet.acquireStatus: ${result}`);
            dotnetPath = result.dotnetPath;
        }
        else {
            logger_1.FileStreamLogger.Instance.error(`Failed to get dotnet download/install status using dotnet.acquireStatus`);
            logger_1.FileStreamLogger.Instance.error(`Error: ${result}`);
            logger_1.ChannelLogger.Instance.error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime);
            return Promise.reject(new Error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime));
        }
    }
    if (!dotnetPath) {
        logger_1.FileStreamLogger.Instance.error("Failed to get installed path for dotnet runtime, dotnetPath is null or undefined, returning error.");
        return Promise.reject(new Error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime));
    }
    else {
        logger_1.FileStreamLogger.Instance.info("dotnetPath: " + dotnetPath);
        logger_1.ChannelLogger.Instance.info(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadAndInstallCompleteForDotnetRuntime, dotnetPath));
    }
    try {
        logger_1.FileStreamLogger.Instance.info("Executing command dotnet.ensureDotnetDependencies, to ensure all required dotnet runtime dependencies are installed.");
        await vscode.commands.executeCommand('dotnet.ensureDotnetDependencies', { command: dotnetPath, arguments: undefined });
        logger_1.FileStreamLogger.Instance.info("Successfully executed command dotnet.ensureDotnetDependencies");
    }
    catch (error) {
        logger_1.FileStreamLogger.Instance.error('Error ensuring all required dotnet runtime dependencies are installed using dotnet.ensureDotnetDependencies.');
        return Promise.reject(new Error(localizedConstants_1.default.downloadAndInstallFailedForDotnetRuntime));
    }
    logger_1.FileStreamLogger.Instance.info("Finished dotnet runtime download/install, returning dotnetRuntimePath: " + dotnetPath);
    return dotnetPath;
}
