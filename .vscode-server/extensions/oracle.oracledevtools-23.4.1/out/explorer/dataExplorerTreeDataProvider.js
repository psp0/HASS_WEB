"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataExplorerTreeDataProvider = void 0;
const vscode = require("vscode");
const logger_1 = require("../infrastructure/logger");
const helper = require("../utilities/helper");
class DataExplorerTreeDataProvider {
    constructor(model) {
        this.model = model;
        this._varonDidChangeTreeData = new vscode.EventEmitter();
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
    refresh(element) {
        this.varonDidChangeTreeData.fire(element);
    }
    getTreeItem(element) {
        return element ? element.getTreeItem() : null;
    }
    async getChildren(element) {
        let children = await this.model.getChildren(element);
        if (children) {
            children.forEach((child) => {
                child.parent = element;
            });
        }
        return Promise.resolve(children);
    }
    getParent(element) {
        let parentNode = undefined;
        try {
            if (element) {
                let treeNode = element;
                if (treeNode) {
                    parentNode = treeNode.parent;
                }
            }
        }
        catch (err) {
            logger_1.FileStreamLogger.Instance.error("Error on finding parent node");
            helper.logErroAfterValidating(err);
        }
        return parentNode;
    }
}
exports.DataExplorerTreeDataProvider = DataExplorerTreeDataProvider;
