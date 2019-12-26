const VSCode = require('vscode');
const FS = require('fs');
const Path = require('path');

exports.activate = (context) => {
	context.subscriptions.push(VSCode.commands.registerCommand('sky-csv.edit', (uri) => {

		let filePath = uri.fsPath;
		let fileName = Path.basename(filePath);

		let webView = VSCode.window.createWebviewPanel(
			'Sky CSV',
			fileName,
			VSCode.ViewColumn.One,
			{
				enableScripts: true
			}
		).webview;

		webView.onDidReceiveMessage((message) => {

			if (message.command === 'loadData') {
				webView.postMessage({
					command: 'loadData',
					content: FS.readFileSync(filePath, 'utf8')
				});
			}

			else if (message.command === 'save') {
				FS.writeFileSync(filePath, message.content, 'utf8');
				VSCode.window.showInformationMessage(fileName + ' saved.');
			}
		});

		let resource = (path) => {
			return 'vscode-resource:' + Path.join(context.extensionPath, path).replace(/\\/g, '/');
		};

		webView.html = `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
		<meta http-equiv="X-UA-Compatible" content="IE=Edge, chrome=1">
		<link rel="stylesheet" media="screen" href="${resource('handsontable/handsontable.full.min.css')}">
		<link rel="stylesheet" media="screen" href="${resource('base.css')}">
	</head>
	<body>
		<script src="${resource('handsontable/handsontable.full.min.js')}"></script>
		<script src="${resource('handsontable/BROWSER.js')}"></script>
		<script src="${resource('papaparse.js')}"></script>
		<script src="${resource('index.js')}"></script>
	</body>
</html>`;
	}));
};