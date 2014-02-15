/// <reference path="./node.d.ts" />
/// <reference path="../typings/commander/commander.d.ts" />

import formatter = require("../typescript-toolbox/src/formatter");
import program = require("commander");

import fs = require("fs");

var packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json").toString());

program
	.version(packageJson.version)
	.usage('[options] <file ...>')
	.option('-r, --replace', 'Replace .ts file')
	.parse(process.argv);

var replace = !!(<any>program).replace;
var args:string[] = (<any>program).args;
if (args.length === 0) {
	(<any>program).outputHelp();
	process.exit(1);
}

var options = formatter.createDefaultFormatCodeOptions();
options.NewLineCharacter = "\n";
options.ConvertTabsToSpaces = false;

args.forEach(fileName => {
	if (!fs.existsSync(fileName)) {
		console.error(fileName + " is not exists. process abort.");
		process.exit(1);
		return;
	}
	var content = fs.readFileSync(fileName).toString();
	var formattedCode = formatter.applyFormatterToContent(content, options);
	if (replace) {
		fs.writeFileSync(fileName, formattedCode);
		console.log("replaced " + fileName);
	} else {
		console.log(formattedCode);
	}
});
