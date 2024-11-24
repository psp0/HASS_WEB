"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableIndexCategoryNode = void 0;
const utilities_1 = require("../utilities");
const dataExplorerRequests_1 = require("../dataExplorerRequests");
const databaseObjectBasic_1 = require("./databaseObjectBasic");
class TableIndexCategoryNode extends databaseObjectBasic_1.CategoryNodeBase {
    constructor(connURI, parentPath, parentSchema, parentName, ddexType, schemaName) {
        super(connURI, parentPath, utilities_1.TreeViewConstants.indexesStr, utilities_1.TreeViewConstants.indexesStr, schemaName);
        this.parentSchema = parentSchema;
        this.parentName = parentName;
        this.ddexType = ddexType;
    }
    async getChildren() {
        let restrictions = [];
        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_OwnerName, this.parentSchema));
        restrictions.push(new dataExplorerRequests_1.OracleDDEXRestriction(dataExplorerRequests_1.OracleDDEXRestrictionType.OraDDEXRestriction_DefinerObjectName, this.parentName));
        return utilities_1.ExplorerUtilities.getChildNodes(this, this.ddexType, restrictions);
    }
}
exports.TableIndexCategoryNode = TableIndexCategoryNode;
