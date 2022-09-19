import * as vscode from "vscode";
import { hoverProviderDisposable } from "./hover-provider";
import { extractForLangDisposable } from "./extract-for-langs-cmd";

// 1. Allow extracting text/string into (ae|es).json files
// 2. Hovering over labels, show actual values for (ae & es)

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(extractForLangDisposable);
  /**
   * Register hover provider for `ae` and `es` json
   */
  context.subscriptions.push(hoverProviderDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
