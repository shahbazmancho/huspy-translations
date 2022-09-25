import * as vscode from "vscode";
import * as path from "path";
import { readJSONFile } from "./utils";
var get = require("lodash.get");

const getPxOrRemValue = (textBeingHovered: string) => {
  const isPxOrRem = /(\d+)(px|rem)/g.test(textBeingHovered);
  if (textBeingHovered.length < 5 && isPxOrRem) {
    if (/rem/g.test(textBeingHovered)) {
      const remValue = textBeingHovered.replace(/rem/g, "");
      const pxValue = parseFloat(remValue) * 16;
      return `${pxValue}px`;
    } else if (/px/g.test(textBeingHovered)) {
      const pxValue = textBeingHovered.replace(/px/g, "");
      const remValue = parseFloat(pxValue) / 16;
      return `${remValue}rem`;
    }
  }
  return null;
};
export const hoverProviderDisposable = vscode.languages.registerHoverProvider(
  { pattern: "**/*.tsx" },
  {
    provideHover(
      document: vscode.TextDocument,
      position: vscode.Position,
      token: vscode.CancellationToken
    ) {
      const extractedText: string = document.getText(
        document.getWordRangeAtPosition(
          position,
          /t\(\"(.*)\"\)|(\d+)(px|rem)/g
        )
      );

      let textBeingHovered = extractedText;
      const transTextRegExp: RegExp = /t\(\"(.*)\"\)|(\d+)(px|rem)/g;
      const shouldHover = transTextRegExp.test(textBeingHovered);

      //if t() not included in text then exclude
      if (!shouldHover || textBeingHovered.length > 150) {
        return undefined;
      }

      //removing t("") from text
      textBeingHovered = textBeingHovered.replace(/t\(\"|\"\)/g, "");

      const remOrPxVlaue = getPxOrRemValue(textBeingHovered);
      if (remOrPxVlaue) {
        const _marked: vscode.MarkdownString = new vscode.MarkdownString();
        _marked.appendText(remOrPxVlaue);
        return new vscode.Hover(_marked);
      }

      const folderPath: string = vscode.workspace.rootPath as string;
      const langsPath: string = path.join(folderPath, "/public/locales");

      const aeFileContent: Record<string, any> = readJSONFile(
        path.join(langsPath, "/ae/common.json")
      );

      const esFileContent: Record<string, any> = readJSONFile(
        path.join(langsPath, "/es/common.json")
      );

      const aeValue: string = get(aeFileContent, textBeingHovered);
      const esValue: string = get(esFileContent, textBeingHovered);

      if (!aeValue && !esValue) {
        // return undefined;
        const _marked: vscode.MarkdownString = new vscode.MarkdownString();
        _marked.appendText("No translation strings were found.");
        return new vscode.Hover(_marked);
      }

      // Template for markdown to return to hover provider
      const marked: vscode.MarkdownString = new vscode.MarkdownString();
      marked.appendCodeblock(`ae (English)`);
      marked.appendText(aeValue || "-- No value --");
      marked.appendCodeblock(`es (Spanish)`);
      marked.appendText(esValue || "-- No value --");

      return new vscode.Hover(marked);
    },
  }
);
