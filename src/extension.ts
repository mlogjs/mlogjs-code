import { writeFile } from "fs/promises";
import { compile } from "mlogjs";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	const decorationType = vscode.window.createTextEditorDecorationType({
		border: "solid red 1px",
	});

	function update() {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const text = editor.document.getText();
		const { fileName } = editor.document;
		if (!fileName.endsWith(".mlog.ts") && !fileName.endsWith(".mlog.js")) {
			return;
		}

		const [out, error, [node]] = compile(text);

		if (error) {
			console.log(JSON.stringify(node.loc));
			editor.setDecorations(decorationType, [
				{
					range: new vscode.Range(
						new vscode.Position(
							node.loc!.start.line - 1,
							node.loc!.start.column
						),
						new vscode.Position(node.loc!.end.line - 1, node.loc!.end.column)
					),
					hoverMessage: error.message,
				},
			]);
			return;
		}

		editor.setDecorations(decorationType, []);

		if (!/\/\/\s*mlogjs-output/.test(text)) {
			return;
		}

		if (!out) {
			return;
		}

		writeFile(fileName.slice(0, -3), out);
	}

	vscode.workspace.onDidChangeTextDocument(update);
	vscode.window.onDidChangeActiveTextEditor(update);

	update();
}

export function deactivate() {}
