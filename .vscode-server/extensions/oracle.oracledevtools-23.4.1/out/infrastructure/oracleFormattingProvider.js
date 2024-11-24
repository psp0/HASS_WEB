"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleTypeFormattingProvider = exports.oracleRangeFormattingProvider = exports.oracleDocumentFormattingProvider = exports.oracleFormattingProvider = void 0;
const vscode_1 = require("vscode");
const documentConnectionInformation_1 = require("../connectionManagement/documentConnectionInformation");
const formatterSettingsManager_1 = require("../explorer/formatterSettingsManager");
const formattingModels_1 = require("../models/formattingModels");
const oracleLanguageServerClient_1 = require("./oracleLanguageServerClient");
class oracleFormattingProvider {
    populateFormatOptions(options, editorDoc) {
        this.formatConfiguration = formatterSettingsManager_1.FormatterSettingsManager.getFormatterSettings(editorDoc, options);
        if (this.formatConfiguration == null) {
            this.formatConfiguration = new formattingModels_1.FormatOptions();
            this.formatConfiguration.tabSize = options.tabSize;
            this.formatConfiguration.insertSpaces = options.insertSpaces;
        }
    }
}
exports.oracleFormattingProvider = oracleFormattingProvider;
class oracleDocumentFormattingProvider extends oracleFormattingProvider {
    provideDocumentFormattingEdits(document, options, token) {
        return new Promise(async (resolve, reject) => {
            this.populateFormatOptions(options, document);
            let requestParams = new formattingModels_1.FormatTextRequestParam(document.uri.toString(), this.formatConfiguration, formattingModels_1.FormatType.FormatDocument);
            requestParams.selection = {
                startLine: 0,
                startColumn: 0,
                endLine: document.lineCount - 1,
                endColumn: document.lineAt(document.lineCount - 1).range.end.character
            };
            documentConnectionInformation_1.fileLogger.info("Sending format document request");
            token.onCancellationRequested(async () => {
                documentConnectionInformation_1.fileLogger.info("Cancellation request for Format document ");
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextCancelRequest.type, requestParams);
                reject();
            });
            await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextRequest.type, requestParams)
                .then((result) => {
                if (result) {
                    if (result.formattedText) {
                        let textRange = new vscode_1.Range(document.lineAt(0).range.start, document.lineAt(document.lineCount - 1).range.end);
                        resolve([new vscode_1.TextEdit(textRange, result.formattedText)]);
                    }
                    else
                        reject();
                    documentConnectionInformation_1.fileLogger.info(result.resultMessage);
                    return;
                }
            }, error => {
                documentConnectionInformation_1.fileLogger.error(error);
                reject();
            });
            reject();
        });
    }
}
exports.oracleDocumentFormattingProvider = oracleDocumentFormattingProvider;
class oracleRangeFormattingProvider extends oracleFormattingProvider {
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        return new Promise(async (resolve, reject) => {
            this.populateFormatOptions(options, document);
            let requestParams = new formattingModels_1.FormatTextRequestParam(document.uri.toString(), this.formatConfiguration, formattingModels_1.FormatType.FormatRange);
            requestParams.text = document.getText(range);
            requestParams.selection = {
                startLine: 0,
                startColumn: 0,
                endLine: document.lineCount - 1,
                endColumn: document.lineAt(document.lineCount - 1).range.end.character
            };
            documentConnectionInformation_1.fileLogger.info("Sending Format selection request");
            token.onCancellationRequested(async () => {
                documentConnectionInformation_1.fileLogger.info("Cancellation request for Format on selection ");
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextCancelRequest.type, requestParams);
                reject();
            });
            await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextRequest.type, requestParams)
                .then((result) => {
                if (result) {
                    if (result.formattedText)
                        resolve([new vscode_1.TextEdit(range, result.formattedText)]);
                    else
                        reject();
                    documentConnectionInformation_1.fileLogger.info(result.resultMessage);
                }
            }, error => {
                documentConnectionInformation_1.fileLogger.error(error);
                reject();
            });
            reject();
        });
    }
}
exports.oracleRangeFormattingProvider = oracleRangeFormattingProvider;
class oracleTypeFormattingProvider extends oracleFormattingProvider {
    provideOnTypeFormattingEdits(document, position, ch, options, token) {
        return new Promise(async (resolve, reject) => {
            this.populateFormatOptions(options, document);
            let requestParams = new formattingModels_1.FormatTextRequestParam(document.uri.toString(), this.formatConfiguration, formattingModels_1.FormatType.FormatOnType);
            requestParams.selection = {
                startLine: position.line, startColumn: position.character - 1,
                endLine: position.line, endColumn: position.character - 1
            };
            requestParams.triggerChar = ch;
            documentConnectionInformation_1.fileLogger.info("Sending Format on Type request");
            token.onCancellationRequested(async () => {
                documentConnectionInformation_1.fileLogger.info("Cancellation request for Format on Type ");
                oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextCancelRequest.type, requestParams);
                reject();
            });
            await oracleLanguageServerClient_1.OracleLanguageServerClient.instance.sendRequest(formattingModels_1.FormatTextRequest.type, requestParams)
                .then(result => {
                if (result) {
                    if (result.formattedText && result.replacementRange) {
                        let start = new vscode_1.Position(result.replacementRange.startLine, result.replacementRange.startColumn);
                        let end = new vscode_1.Position(result.replacementRange.endLine, result.replacementRange.endColumn);
                        let textRange = new vscode_1.Range(start, end);
                        resolve([new vscode_1.TextEdit(textRange, result.formattedText)]);
                    }
                    else
                        reject();
                    documentConnectionInformation_1.fileLogger.info(result.resultMessage);
                    return;
                }
            }, error => {
                documentConnectionInformation_1.fileLogger.error(error);
                reject();
            });
            reject();
        });
    }
}
exports.oracleTypeFormattingProvider = oracleTypeFormattingProvider;
