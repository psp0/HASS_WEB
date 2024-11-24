"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionProcedureParameterNode = void 0;
const helper = require("../../utilities/helper");
const iExplorerNode_1 = require("../iExplorerNode");
const utilities_1 = require("../utilities");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
const vscode_1 = require("vscode");
class functionProcedureParameterNode extends databaseObjectBasic_1.DatabaseObjectBasic {
    constructor(connURI = "", parentPath = "", schemaName = "", objectName = "") {
        super(connURI, parentPath, utilities_1.TreeViewConstants.parameterStr, new vscode_1.ThemeIcon('symbol-parameter'), iExplorerNode_1.ExplorerNodeType.Leaf, schemaName, objectName);
        this.canRefresh = false;
    }
    async getChildren() {
        return null;
    }
    setExtendedProperties(dbo) {
        this.parameterObj = dbo;
        super.setExtendedProperties(dbo);
        if (this.parameterObj.direction === utilities_1.TreeViewConstants.parameterDirectionOUT && this.parameterObj.ordinal == 0) {
            this.nodeID = helper.stringFormatterCsharpStyle(utilities_1.TreeViewConstants.returnValueCaptionStr, this.databaseObject['dataType']);
            this.databaseObject['isReturnValue'] = true;
        }
        else {
            this.nodeID = this.getNodeIdentifier + ': ' + this.databaseObject['dataType'];
            this.toolTipMsg = this.databaseObject['name'] + ' ' + this.databaseObject['direction'] + ' ' + this.databaseObject['dataType'];
        }
    }
}
exports.functionProcedureParameterNode = functionProcedureParameterNode;
