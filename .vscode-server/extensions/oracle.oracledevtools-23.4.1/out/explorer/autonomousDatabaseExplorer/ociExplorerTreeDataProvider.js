"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCIExplorerTreeDataProvider = void 0;
const vscode = require("vscode");
class OCIExplorerTreeDataProvider {
    constructor(model) {
        this.model = model;
        this._varonDidChangeTreeData = new vscode.EventEmitter();
        this.nodes = new Map();
        this.onDidChangeTreeData = this._varonDidChangeTreeData.event;
        model.addModelChangedHandler((data) => {
            this.varonDidChangeTreeData.fire(data);
        });
    }
    get varonDidChangeTreeData() {
        return this._varonDidChangeTreeData;
    }
    set varonDidChangeTreeData(value) {
        this._varonDidChangeTreeData = value;
    }
    getTreeItem(element) {
        return element ? element.getTreeItem() : null;
    }
    async getChildren(element) {
        let children = await this.model.getChildren(element);
        if (children) {
            children.forEach((child) => {
                if (child) {
                    this.nodes.set(child.getNodeIdentifier, child);
                }
            });
        }
        return Promise.resolve(children);
    }
    getParent(element) {
        let result;
        if (element) {
            let treeNode = element;
            if (treeNode.parentPath) {
                let lastTokenStart = treeNode.parentPath.lastIndexOf("\\");
                let nodeIdentifer = treeNode.parentPath.substring(lastTokenStart + 1);
                if (this.nodes.has(nodeIdentifer)) {
                    result = this.nodes.get(nodeIdentifer);
                }
            }
        }
        return result;
    }
}
exports.OCIExplorerTreeDataProvider = OCIExplorerTreeDataProvider;
