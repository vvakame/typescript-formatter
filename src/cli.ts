/// <reference path="./node.d.ts" />
/// <reference path="../typings/commander/commander.d.ts" />

import fs = require("fs");
import program = require("commander");

import lib = require("./lib");

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

lib.processFiles({replace: replace}, args);
