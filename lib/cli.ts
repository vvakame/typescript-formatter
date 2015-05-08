/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../node_modules/commandpost/commandpost.d.ts" />

require("es6-promise").polyfill();

import fs = require("fs");
import commandpost = require("commandpost");

import lib = require("./index");

var packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json").toString());

interface RootOptions {
	replace:boolean;
	stdin:boolean;
	tslint:boolean;
	editorconfig:boolean;
	tsfmt:boolean;
	verbose:boolean;
}

interface RootArguments {
	files: string[];
}

var root = commandpost
	.create<RootOptions, RootArguments>("tsfmt [files...]")
	.version(packageJson.version, "-v, --version")
	.option("-r, --replace", "replace .ts file")
	.option("--stdin", "get formatting content from stdin")
	.option("--no-tslint", "don't read a tslint.json")
	.option("--no-editorconfig", "don't read a .editorconfig")
	.option("--no-tsfmt", "don't read a tsfmt.json")
	.option("--verbose", "makes output more verbose")
	.action((opts, args)=> {
		var replace = !!opts.replace;
		var stdin = !!opts.stdin;
		var tslint = !!opts.tslint;
		var editorconfig = !!opts.editorconfig;
		var tsfmt = !!opts.tsfmt;

		if (args.files.length === 0 && !opts.stdin) {
			process.stdout.write(root.helpText() + '\n');
			return;
		}

		if (opts.verbose) {
			console.log("replace:	  " + (replace ? "ON" : "OFF"));
			console.log("stdin:		" + (stdin ? "ON" : "OFF"));
			console.log("tslint:	   " + (tslint ? "ON" : "OFF"));
			console.log("editorconfig: " + (editorconfig ? "ON" : "OFF"));
			console.log("tsfmt:		" + (tsfmt ? "ON" : "OFF"));
		}

		if (opts.stdin) {
			if (opts.replace) {
				errorHandler("--stdin option can not use with --replace option");
				return;
			}
			lib
				.processStream(args.files[0] || "temp.ts", process.stdin, {
					replace: replace,
					tslint: tslint,
					editorconfig: editorconfig,
					tsfmt: tsfmt
				})
				.catch(errorHandler);
		} else {
			lib
				.processFiles(args.files, {
					replace: replace,
					tslint: tslint,
					editorconfig: editorconfig,
					tsfmt: tsfmt
				})
				.catch(errorHandler);
		}
	});

commandpost
	.exec(root, process.argv)
	.catch(errorHandler);

function errorHandler(err:any) {
	"use strict";

	if (err instanceof Error) {
		console.error(err.stack);
	} else {
		console.error(err);
	}
	return Promise.resolve(null).then(()=> {
		process.exit(1);
	});
}
