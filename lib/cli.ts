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
	.option("--no-tslint", "don't read a tslint.json")
	.option("--no-editorconfig", "don't read a .editorconfig")
	.option("--no-tsfmt", "don't read a tsfmt.json")
	.option("--verbose", "makes output more verbose")
	.action((opts, args)=> {
		var replace = !!opts.replace;
		var tslint = !!opts.tslint;
		var editorconfig = !!opts.editorconfig;
		var tsfmt = !!opts.tsfmt;

		if (args.files.length === 0) {
			process.stdout.write(root.helpText() + '\n');
		} else {
			if (opts.verbose) {
				console.log("replace:      " + (replace ? "ON" : "OFF"));
				console.log("tslint:       " + (tslint ? "ON" : "OFF"));
				console.log("editorconfig: " + (editorconfig ? "ON" : "OFF"));
				console.log("tsfmt:        " + (tsfmt ? "ON" : "OFF"));
			}

			lib.processFiles(args.files, {
				replace: replace,
				tslint: tslint,
				editorconfig: editorconfig,
				tsfmt: tsfmt
			});
		}
	});

commandpost
	.exec(root, process.argv)
	.catch(err => {
		if (err instanceof Error) {
			console.error(err.stack);
		} else {
			console.error(err);
		}
		return Promise.resolve(null).then(()=> {
			process.exit(1);
		});
	});
