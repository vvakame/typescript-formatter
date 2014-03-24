/// <reference path="./node.d.ts" />
/// <reference path="../typings/commander/commander.d.ts" />

import formatter = require("../typescript-toolbox/src/formatter");
import program = require("commander");

import fs = require("fs");

import base = require("./provider/base");
import editorconfig = require("./provider/editorconfig");
import tslintjson = require("./provider/tslintjson");

var packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json").toString());

program
	.version(packageJson.version)
	.usage("[options] <file ...>")
	.option("-r, --replace", "Replace .ts file")
	.parse(process.argv);

var replace = !!(<any>program).replace;
var args:string[] = (<any>program).args;
if (args.length === 0) {
	(<any>program).outputHelp();
	process.exit(1);
}

args.forEach(fileName => {
	if (!fs.existsSync(fileName)) {
		console.error(fileName + " is not exists. process abort.");
		process.exit(1);
		return;
	}
	var content = fs.readFileSync(fileName).toString();

	console.log("target:" + fileName);
	var options = formatter.createDefaultFormatCodeOptions();
	console.log("before:\n" + JSON.stringify(options, null, 2));

	[
		base,
		editorconfig,
		tslintjson
	].forEach(provider=> provider.makeFormatCodeOptions(fileName, options));

	console.log("after:\n" + JSON.stringify(options, null, 2));
	return;

	var formattedCode = formatter.applyFormatterToContent(content, options);
	if (replace) {
		if (content !== formattedCode) {
			fs.writeFileSync(fileName, formattedCode);
			console.log("replaced " + fileName);
		}
	} else {
		console.log(formattedCode);
	}
});
