import * as vscode from "vscode";
import * as path from "path";
var merge = require("lodash.merge");

import { getCommonExistingKey, readJSONFile, writeJSONFile } from "./utils";

export const extractForLangDisposable = vscode.commands.registerCommand(
  "huspy-translations.extractForLang",
  async () => {
    const editor: vscode.TextEditor = vscode.window
      .activeTextEditor as vscode.TextEditor;

    if (!editor) {
      return;
    }

    // remove \n chars and tab spaces
    const selectedText: string = editor.document
      .getText(editor.selection)
      .replace(/\n/g, "")
      .replace(/\s+/g, " ");

    const selection: vscode.Selection = editor.selection;

    // if there's no selection, show error message
    if (selection.isEmpty || selectedText.trim().length === 0) {
      vscode.window.showErrorMessage("You haven't made any selection.");
      return;
    }

    const folderPath: string = vscode.workspace.rootPath as string;
    //public/locales/ae/common.json
    const langsPath: string = path.join(folderPath, "/public/locales");

    // read json content from `en` and `ar` json files
    let aeJSONContent: Record<string, any> = readJSONFile(
      path.join(langsPath, "/ae/common.json")
    );

    let esJSONContent: Record<string, any> = readJSONFile(
      path.join(langsPath, "/es/common.json")
    );

    let options: vscode.InputBoxOptions = {
      prompt: "Label: ",
      placeHolder: "Label for translation string",
    };

    // get user input `label` to be placed in JSONs
    let label: string = (await vscode.window.showInputBox(options)) || "";
    let keyWasFound: boolean = false; // to control file writes

    // try finding existing common key, if can't find ask again
    if (label.trim() === ".") {
      let [foundLabel, isKeyWasFound] = getCommonExistingKey(
        selectedText,
        aeJSONContent
      );

      label = foundLabel;
      keyWasFound = isKeyWasFound;

      label =
        (await vscode.window.showInputBox({
          prompt: "Label: ",
          placeHolder: "Could not find common label, create_new",
          value: keyWasFound ? label : "txt_",
          valueSelection: keyWasFound ? [label.length, label.length] : [4, 4],
        })) || "";
    }

    if (!label) {
      return;
    }

    // replace the selected text in file
    editor.edit((builder) => {
      // find the placeholder and insert new line with const-label
      const indexOfPlaceholder: number = editor.document
        .getText()
        .indexOf("// @translation-strings");

      if (indexOfPlaceholder > -1) {
        const matchStart: vscode.Position =
          editor.document.positionAt(indexOfPlaceholder);

        builder.insert(
          new vscode.Position(matchStart.line + 1, 2),
          `const ${label} = t('${label}');\n`
        );
        builder.replace(selection, `{${label}}`);
      } else {
        // if no placeholder found, use inline
        builder.replace(selection, `{t('${label}')}`);
      }
    });

    // keep same text in `ae` but prepend with `__` in `es`
    if (!keyWasFound) {
      aeJSONContent = merge(
        aeJSONContent,
        getNewObjWithAddedLabel(label, selectedText, "ae")
      );
      esJSONContent = merge(
        esJSONContent,
        getNewObjWithAddedLabel(label, selectedText, "es")
      );

      writeJSONFile(path.join(langsPath, "/ae/common.json"), aeJSONContent);
      writeJSONFile(path.join(langsPath, "/es/common.json"), esJSONContent);
    }
  }
);

function getNewObjWithAddedLabel(
  labelString: string,
  newTrans: string,
  lang: "ae" | "es"
) {
  let resultObj = {} as any;
  const splitLabel = labelString.split(".");
  const length = splitLabel.length - 1;
  let i = length;
  while (i >= 0) {
    const key = splitLabel[i];
    console.log(key);
    if (i === length) {
      resultObj[key] = lang === "ae" ? newTrans : "__" + newTrans;
    } else {
      const prevObj = resultObj;
      resultObj = {};
      resultObj[key] = prevObj;
    }
    i--;
  }

  return resultObj;
}
