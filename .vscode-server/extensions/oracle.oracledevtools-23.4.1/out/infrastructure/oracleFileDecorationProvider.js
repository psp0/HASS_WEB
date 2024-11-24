"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleFileDecorationProvider = void 0;
const vscode = require("vscode");
const dataExplorerManager_1 = require("../explorer/dataExplorerManager");
const constants_1 = require("../constants/constants");
const editorUtils_1 = require("../explorer/editors/editorUtils");
class oracleFileDecorationProvider {
    constructor(dataExpManger, connectionController) {
        this.disposables = [];
        this._onDidChangeFileDecorations = new vscode.EventEmitter();
        this.onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
        this.dataExpManger = dataExpManger;
        this.connectionController = connectionController;
        this.disposables = [];
    }
    async provideFileDecoration(uri) {
        let connColor;
        if (uri === undefined || uri === null) {
            return undefined;
        }
        if (uri && this.connectionController.fileHasErrors(uri.toString())) {
            return undefined;
        }
        if (uri.scheme && uri.scheme == constants_1.Constants.oracleExplorerScheme) {
            let connectionNode = this.dataExpManger?.getConnectionNode(uri.scheme + "://" + uri.authority);
            connColor = connectionNode.connectionProperties.color;
        }
        else if (uri.scheme && uri.scheme == constants_1.Constants.oracleScheme) {
            let params = editorUtils_1.editorUtils.getQueryParameters(uri);
            if (params) {
                let connUri = params.connectionUri;
                let connNode = dataExplorerManager_1.DataExplorerManager.Instance.getConnectionNodeFromConnectionUri(connUri);
                if (connNode) {
                    connColor = connNode.connectionProperties.color;
                }
            }
        }
        else if (uri.scheme && (uri.scheme == "file" || uri.scheme == "untitled")) {
            let connInfo = this.connectionController?.getSavedConnectionProperties(uri.toString());
            if (connInfo && connInfo.connectionAttributes) {
                let connPropsVsCode = connInfo.connectionAttributes;
                if (connPropsVsCode) {
                    connColor = connPropsVsCode.color;
                }
            }
        }
        else if (uri.scheme && uri.scheme == "webview-panel") {
        }
        if (connColor) {
            return { color: new vscode.ThemeColor("treeItem." + connColor) };
        }
        return undefined;
    }
    dispose() {
        this.disposables.forEach((d) => d.dispose());
    }
}
exports.oracleFileDecorationProvider = oracleFileDecorationProvider;
