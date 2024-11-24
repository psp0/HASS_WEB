"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutonomousDBWalletFileHandler = void 0;
const helper = require("../../utilities/helper");
const autonomousDBModels_1 = require("../../models/autonomousDBModels");
const stream = require("stream");
const fs = require("fs");
const unzipper = require("unzipper");
const path = require("path");
const model_1 = require("oci-database/lib/model");
const autonomousDBUtils_1 = require("./autonomousDBUtils");
const localizedConstants_1 = require("../../constants/localizedConstants");
const vscode = require("vscode");
const path_1 = require("path");
class ADBWalletFileInfo {
}
class AutonomousDBWalletFileHandler {
    constructor() {
        this.walletFileData = new Map();
    }
    add(databaseId, contents) {
        this.walletFileData.set(databaseId, contents);
    }
    saveToFile(walletFileRequest) {
        try {
            if (this.walletFileData.has(walletFileRequest.adbDatabaseID)) {
                var contents = this.walletFileData.get(walletFileRequest.adbDatabaseID);
                for (let index = 0; index < contents.length; index++) {
                    const content = contents[index];
                    fs.writeFileSync(content.filePath, content.fileContent);
                }
                vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadCompleteForCredentialFile, (0, path_1.resolve)(walletFileRequest.walletFilepath)));
            }
        }
        catch (error) {
            helper.logErroAfterValidating(error);
            let errorMessage = error.message ? error.message : error;
            vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadErrorForCredentialFile, (0, path_1.resolve)(walletFileRequest.walletFilepath), errorMessage));
        }
        finally {
            this.walletFileData.delete[walletFileRequest.adbDatabaseID];
        }
    }
    fileToSkip(walletFileRequest, filePathToVerify) {
        let fileToSkip = false;
        if (walletFileRequest.fileExistsAction == autonomousDBModels_1.FileExistsAction.Skip) {
            for (let idx = 0; idx < walletFileRequest.existingFiles.length; idx++) {
                if (filePathToVerify.indexOf(walletFileRequest.existingFiles[idx].name) >= 0) {
                    fileToSkip = true;
                    break;
                }
            }
        }
        return fileToSkip;
    }
    replaceORSkipFiles(walletFileRequest) {
        try {
            if (this.walletFileData.has(walletFileRequest.adbDatabaseID)) {
                var contents = this.walletFileData.get(walletFileRequest.adbDatabaseID);
                var newFilePath;
                var downloadedAnyFile = false;
                if (walletFileRequest.fileExistsAction == autonomousDBModels_1.FileExistsAction.Replace
                    || walletFileRequest.fileExistsAction == autonomousDBModels_1.FileExistsAction.Skip) {
                    for (let index = 0; index < contents.length; index++) {
                        const content = contents[index];
                        if (this.fileToSkip(walletFileRequest, content.filePath)) {
                            newFilePath = path.join(path.dirname(content.filePath), `${path.basename(content.filePath)}-copy${path.extname(content.filePath)}`);
                            continue;
                        }
                        if (fs.existsSync(content.filePath)) {
                            newFilePath = path.join(path.dirname(content.filePath), `${path.basename(content.filePath)}-copy${path.extname(content.filePath)}`);
                            fs.renameSync(content.filePath, newFilePath);
                        }
                        fs.writeFileSync(content.filePath, content.fileContent);
                        downloadedAnyFile = true;
                    }
                    if (downloadedAnyFile) {
                        vscode.window.showInformationMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadCompleteForCredentialFile, path.dirname((0, path_1.resolve)(newFilePath))));
                    }
                }
            }
        }
        catch (exp) {
            helper.logErroAfterValidating(exp);
            if (exp && exp.message) {
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadErrorForCredentialFile, path.dirname((0, path_1.resolve)(newFilePath)), exp.message));
            }
        }
        finally {
            this.walletFileData.delete[walletFileRequest.adbDatabaseID];
        }
    }
    clear(databaseID) {
        if (this.walletFileData.has(databaseID)) {
            this.walletFileData.delete[databaseID];
        }
    }
    getWalletType(walletFileRequest) {
        var generateType;
        switch (walletFileRequest.walletType) {
            case autonomousDBModels_1.WalletType.Instance:
                generateType = model_1.GenerateAutonomousDatabaseWalletDetails.GenerateType.Single;
                break;
            case autonomousDBModels_1.WalletType.Regional:
                generateType = model_1.GenerateAutonomousDatabaseWalletDetails.GenerateType.All;
                break;
        }
        return generateType;
    }
    async processDataFromStreamReadable(result, walletFileRequest, existingFiles) {
        let dirPath = walletFileRequest.walletFilepath;
        const zip = result.pipe(unzipper.Parse({ forceStream: true }));
        var filePath = "";
        var fileContents = new Array();
        for await (const entry of zip) {
            const content = await entry.buffer();
            filePath = path.join(dirPath, entry.path);
            fileContents.push({ filePath: filePath, fileContent: content });
            if (fs.existsSync(filePath)) {
                existingFiles.push(entry.path);
            }
        }
        this.add(walletFileRequest.adbDatabaseID, fileContents);
        if (existingFiles.length == 0) {
            this.saveToFile(walletFileRequest);
        }
    }
    async downloadWalletFileUsingSDK(accountComponent, pswd, walletFileRequest) {
        var walletDetails = null;
        let downloadCredentialsFilesData = new autonomousDBUtils_1.adbDownloadCredentialsFilesData();
        if (walletFileRequest.dedicatedDb) {
            walletDetails = {
                password: pswd
            };
        }
        else {
            walletDetails = {
                password: pswd,
                generateType: this.getWalletType(walletFileRequest)
            };
        }
        var generateAutonomousDatabaseWalletRequest = { autonomousDatabaseId: walletFileRequest.adbDatabaseID, generateAutonomousDatabaseWalletDetails: walletDetails };
        downloadCredentialsFilesData = await accountComponent.ServicesClients.DatabaseServiceClient.generateAutonomousDatabaseWallet(generateAutonomousDatabaseWalletRequest).
            then(async (response) => {
            var result;
            var dirPath = walletFileRequest.walletFilepath;
            var existingFiles = new Array();
            if (response.value instanceof stream.Readable) {
                await this.processDataFromStreamReadable(response.value, walletFileRequest, existingFiles);
                downloadCredentialsFilesData.existingFiles = existingFiles;
                return Promise.resolve(downloadCredentialsFilesData);
            }
            else if (response.value instanceof ReadableStream) {
                let readableDate = response.value;
                let readableStreamData = await this.getDataFromReadableStream(readableDate.getReader(), response.contentLength);
                if (readableStreamData) {
                    let readableStream = new stream.Readable();
                    readableStream.push(readableStreamData);
                    await this.processDataFromStreamReadable(readableStream, walletFileRequest, existingFiles);
                    downloadCredentialsFilesData.existingFiles = existingFiles;
                    return Promise.resolve(downloadCredentialsFilesData);
                }
            }
        }, error => {
            helper.logErroAfterValidating(error);
            if (error && error.message) {
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadWalletFileFailed, walletFileRequest.adbName, error.message));
                downloadCredentialsFilesData.errorMessage = error.message;
            }
            downloadCredentialsFilesData.existingFiles = [];
            return Promise.resolve(downloadCredentialsFilesData);
        });
        return Promise.resolve(downloadCredentialsFilesData);
    }
    ValidatePath(walletFileRequest) {
        var ret = true;
        try {
            if (!fs.existsSync(walletFileRequest.walletFilepath)) {
                fs.mkdirSync(walletFileRequest.walletFilepath, { recursive: true });
                ret = true;
            }
        }
        catch (exp) {
            if (exp && exp.message) {
                vscode.window.showErrorMessage(helper.stringFormatterCsharpStyle(localizedConstants_1.default.downloadWalletFileFailed, walletFileRequest.adbName, exp.message));
            }
            ret = false;
        }
        return ret;
    }
    async downloadWalletFile(accountComponent, walletFileRequest) {
        let downloadCredentialsFilesData = new autonomousDBUtils_1.adbDownloadCredentialsFilesData();
        if (this.ValidatePath(walletFileRequest)) {
            let pswd = "";
            if (!walletFileRequest.pswd) {
                var response = await autonomousDBUtils_1.AutonomousDBUtils.getWalletPassword({ windowUri: walletFileRequest.windowUri, databaseID: walletFileRequest.adbDatabaseID });
                pswd = response.pswd;
            }
            else {
                pswd = String.fromCodePoint(...walletFileRequest.pswd);
            }
            downloadCredentialsFilesData = await this.downloadWalletFileUsingSDK(accountComponent, pswd, walletFileRequest);
        }
        return downloadCredentialsFilesData;
    }
    async getDataFromReadableStream(reader, count) {
        let bytesReceived = 0;
        let result = new Uint8Array(count);
        let actualData = await reader.read().then(function processData({ done, value }) {
            if (done) {
                return Promise.resolve(result);
            }
            const chunk = value;
            if (bytesReceived > 0) {
                for (let index = 0; index < chunk.length; index++) {
                    result[index + bytesReceived] = chunk[index];
                }
            }
            else {
                for (let index = 0; index < chunk.length; index++) {
                    result[index] = chunk[index];
                }
            }
            bytesReceived += value.length;
            return reader.read().then(processData);
        });
        return Promise.resolve(actualData);
    }
}
exports.AutonomousDBWalletFileHandler = AutonomousDBWalletFileHandler;
