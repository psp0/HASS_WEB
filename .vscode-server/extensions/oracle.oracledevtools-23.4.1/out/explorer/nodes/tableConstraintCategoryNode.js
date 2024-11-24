"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableConstraintCategoryNode = void 0;
const utilities_1 = require("../utilities");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
class TableConstraintCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, parentSchema, parentName, ddexType, schemaName) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.constraintsStr, utilities_1.TreeViewConstants.constraintsStr, schemaName);
        this.parentSchema = parentSchema;
        this.parentName = parentName;
        this.ddexType = ddexType;
    }
    async getChildren() {
        let restrictions = [];
        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.parentSchema));
        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_ParentObjectName, this.parentName));
        return utilities_1.ExplorerUtilities.getChildNodes(this, this.ddexType, restrictions);
    }
}
exports.TableConstraintCategoryNode = TableConstraintCategoryNode;
