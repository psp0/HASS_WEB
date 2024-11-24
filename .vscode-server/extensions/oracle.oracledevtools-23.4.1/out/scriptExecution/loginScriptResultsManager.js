"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginScriptResultsProvider = void 0;
class LoginScriptResultsProvider {
    constructor(viewType) {
        LoginScriptResultsProvider.viewType = viewType;
    }
    async resolveWebviewView(webviewView, context, token) {
        webviewView.show(true);
        LoginScriptResultsProvider.view = webviewView;
    }
}
exports.LoginScriptResultsProvider = LoginScriptResultsProvider;
