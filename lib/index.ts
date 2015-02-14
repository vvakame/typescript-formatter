/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/typescript/typescript.d.ts" />

"use strict";

import ts = require("typescript");
import formatter = require("./formatter");
import utils = require("./utils");

import fs = require("fs");

import base = require("./provider/base");
import editorconfig = require("./provider/editorconfig");
import tslintjson = require("./provider/tslintjson");

var providers: {makeFormatCodeOptions: Function;}[] = [];

export interface IOptions {
	dryRun?: boolean;
	verbose?: boolean;
	replace: boolean;
	tslint: boolean;
	editorconfig: boolean;
	tsfmt: boolean;
}

export interface IResultMap {
	[fileName: string]: IResult;
}

export interface IResult {
	fileName: string;
	options: ts.FormatCodeOptions;
	src: string;
	dest: string;
}

export function processFiles(files:string[], opts:IOptions):IResultMap {
	"use strict";

	var result:IResultMap = {};
	files.forEach(fileName => {
		if (!fs.existsSync(fileName)) {
			console.error(fileName + " is not exists. process abort.");
			process.exit(1);
			return;
		}
		var content = fs.readFileSync(fileName).toString();

		var options = utils.createDefaultFormatCodeOptions();
		if (opts.tsfmt) {
			providers.push(base);
		}
		if (opts.editorconfig) {
			providers.push(editorconfig);
		}
		if (opts.tslint) {
			providers.push(tslintjson);
		}
		providers.forEach(provider=> provider.makeFormatCodeOptions(fileName, options));

		var formattedCode = formatter(content, options);
		// TODO replace newline code. NewLineCharacter params affect to only "new" newline. maybe.
		if (opts && opts.replace) {
			if (content !== formattedCode) {
				fs.writeFileSync(fileName, formattedCode);
				console.log("replaced " + fileName);
			}
		} else if (opts && !opts.dryRun) {
			console.log(formattedCode);
		}
		result[fileName] = {
			fileName: fileName,
			options: options,
			src: content,
			dest: formattedCode
		};
	});
	return result;
}
