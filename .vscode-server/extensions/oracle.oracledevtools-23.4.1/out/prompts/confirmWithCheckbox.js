"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const prompt_1 = require("./prompt");
class ConfirmWithCheckboxPrompt extends prompt_1.default {
    constructor(question, ignoreFocusOut) {
        super(question, ignoreFocusOut);
    }
    async render() {
        let choices = this.varQuestion.choices;
        choices = choices.reduce((result, choice) => {
            if (choice.label) {
                result[`${choice.value === true ? prompt_1.symbols.radioOn : prompt_1.symbols.radioOff} ${choice.label}`] = choice;
            }
            else {
                result[choice.name] = choice;
            }
            return result;
        }, {});
        const options = this.quickPickDefaults;
        options.placeHolder = this.varQuestion.message;
        options.title = this.varQuestion.name;
        let result = await vscode_1.window.showQuickPick(Object.keys(choices), options);
        if (result === undefined) {
            throw new Error();
        }
        else {
            let v = choices[result];
            if (v.label !== undefined) {
                v.value = !v.value;
                return this.render();
            }
            else
                v.value = true;
        }
        return result;
    }
}
exports.default = ConfirmWithCheckboxPrompt;
