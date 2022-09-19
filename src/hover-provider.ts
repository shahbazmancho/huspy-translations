import * as vscode from "vscode";
import * as path from "path";
import { readJSONFile } from "./utils";
var get = require("lodash.get");

export const hoverProviderDisposable = vscode.languages.registerHoverProvider(
  { pattern: "**/*.tsx" },
  {
    provideHover(
      document: vscode.TextDocument,
      position: vscode.Position,
      token: vscode.CancellationToken
    ) {
      let textBeingHovered: string = document.getText(
        document.getWordRangeAtPosition(position, /t\([^)]*\)/i)
      );

      // just check if atleast text has one underscore, to narrow down the search
      const transTextRegExp: RegExp = /t\([^)]*\)/i;
      const shouldHover = transTextRegExp.test(textBeingHovered);

      //if t() not included in text then exclude
      if (!shouldHover || textBeingHovered.length > 150) {
        return undefined;
      }

      textBeingHovered = textBeingHovered
        .replace('t("', "")
        .replace('")', "")
        .trim();

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
