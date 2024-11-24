"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableColumnNode = void 0;
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const vscode_1 = require("vscode");
class TableColumnNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.columnStr, new vscode_1.ThemeIcon('symbol-struct'), iExplorerNode_1.ExplorerNodeType.Leaf, schemaName, objectName);
        this.canRefresh = false;
    }
    async getChildren() {
        return null;
    }
    setExtendedProperties(dbo) {
        this.columnObj = dbo;
        super.setExtendedProperties(dbo);
    }
}
exports.TableColumnNode = TableColumnNode;
