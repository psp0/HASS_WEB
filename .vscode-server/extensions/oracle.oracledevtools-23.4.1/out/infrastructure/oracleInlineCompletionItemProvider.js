"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oracleInlineCompletionitemProvider = void 0;
const vscode = require("vscode");
class oracleInlineCompletionitemProvider {
    provideInlineCompletionItems(document, position, context, token) {
        if (context.triggerKind == vscode.InlineCompletionTriggerKind.Invoke) {
            let vscodeRange = new vscode.Range(oracleInlineCompletionitemProvider.startPosition, position);
            let item = new vscode.InlineCompletionItem(`${oracleInlineCompletionitemProvider.hint}`, vscodeRange);
            return [item];
        }
        else {
            return [];
        }
    }
}
exports.oracleInlineCompletionitemProvider = oracleInlineCompletionitemProvider;
oracleInlineCompletionitemProvider.hint = " ";
