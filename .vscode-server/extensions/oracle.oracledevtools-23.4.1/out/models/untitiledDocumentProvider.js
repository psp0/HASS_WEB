"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_1 = require("../extension");
class UntitiledDocumentProvider {
    constructor(vscodeWrapper) {
        this.vscodeWrapper = vscodeWrapper;
    }
    async createAndOpen(content = "") {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = await this.vscodeWrapper.openOracleUntitiledDocument(content);
                const systemManager = (0, extension_1.getSystemManager)();
                systemManager.fileDecorationProvider._onDidChangeFileDecorations.fire(doc.uri);
                await this.vscodeWrapper.showTextDocument(doc, 1, false);
                resolve(doc);
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.default = UntitiledDocumentProvider;
