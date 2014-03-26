/// <reference path="./node.d.ts" />
/// <reference path="../typings/commander/commander.d.ts" />

import fs = require("fs");
import program = require("commander");

import lib = require("./lib");

var packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json").toString());

program
	.version(packageJson.version)
	.usage("[options] <file ...>")
	.option("-r, --replace", "replace .ts file")
	.option("--no-tslint", "don't read a tslint.json")
	.option("--no-editorconfig", "don't read a .editorconfig")
	.option("--no-tsfmt", "don't read a tsfmt.json")
	.option("--verbose", "makes output more verbose")
	.parse(process.argv);

var replace = !!(<any>program).replace;
var tslint = !!(<any>program).tslint;
var editorconfig = !!(<any>program).editorconfig;
var tsfmt = !!(<any>program).tsfmt;

var args:string[] = (<any>program).args;
if (args.length === 0) {
	(<any>program).outputHelp();
	process.exit(1);
}

if (!!(<any>program).verbose) {
	console.log("replace:      " + (replace ? "ON" : "OFF"));
	console.log("tslint:       " + (tslint ? "ON" : "OFF"));
	console.log("editorconfig: " + (editorconfig ? "ON" : "OFF"));
	console.log("tsfmt:        " + (tsfmt ? "ON" : "OFF"));
}

lib.processFiles(args, {
	replace: replace,
	tslint: tslint,
	editorconfig: editorconfig,
	tsfmt: tsfmt
});
