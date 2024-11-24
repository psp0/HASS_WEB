"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynonymNode = void 0;
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const vscode_1 = require("vscode");
class SynonymNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.synonymStr, new vscode_1.ThemeIcon('go-to-file'), iExplorerNode_1.ExplorerNodeType.Leaf, schemaName, objectName);
    }
    async getChildren() {
        return null;
    }
    setExtendedProperties(dbo) {
        this.synonymObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.SynonymNode = SynonymNode;
