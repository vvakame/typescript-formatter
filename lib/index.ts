/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../node_modules/typescript/bin/typescript.d.ts" />

"use strict";

import ts = require("typescript");
import formatter = require("./formatter");
import utils = require("./utils");

import fs = require("fs");

import base = require("./provider/base");
import editorconfig = require("./provider/editorconfig");
import tslintjson = require("./provider/tslintjson");

export interface Options {
	dryRun?: boolean;
	verbose?: boolean;
	replace: boolean;
	tslint: boolean;
	editorconfig: boolean;
	tsfmt: boolean;
}

export interface ResultMap {
	[fileName: string]: Result;
}

export interface Result {
	fileName: string;
	options: ts.FormatCodeOptions;
	src: string;
	dest: string;
}

export function processFiles(files:string[], opts:Options):Promise<ResultMap> {
	"use strict";

	var resultMap:ResultMap = {};
	var promises = files.map(fileName => {
		if (!fs.existsSync(fileName)) {
			console.error(fileName + " is not exists. process abort.");
			process.exit(1);
			return;
		}

		var content = fs.readFileSync(fileName).toString();
		return processString(fileName, content, opts);
	});
	return Promise.all(promises).then(resultList=> {
		resultList.forEach(result => {
			resultMap[result.fileName] = result;
		});
		return resultMap;
	});
}

export function processStream(fileName:string, input:NodeJS.ReadableStream, opts:Options):Promise<Result> {
	"use strict";

	input.setEncoding("utf8");

	var promise = new Promise<string>((resolve, reject) => {
		var fragment = "";
		input.on("data", (chunk:string) => {
			if (chunk === "") {
				return;
			}
			fragment += chunk;
		});

		input.on("end", () => {
			resolve(fragment);
		});
	});
	return promise.then(content => processString(fileName, content, opts));
}

export function processString(fileName:string, content:string, opts:Options):Promise<Result> {
	"use strict";

	var options = utils.createDefaultFormatCodeOptions();
	var optGenPromises:(ts.FormatCodeOptions | Promise<ts.FormatCodeOptions>)[] = [];
	if (opts.tsfmt) {
		optGenPromises.push(base.makeFormatCodeOptions(fileName, options));
	}
	if (opts.editorconfig) {
		optGenPromises.push(editorconfig.makeFormatCodeOptions(fileName, options));
	}
	if (opts.tslint) {
		optGenPromises.push(tslintjson.makeFormatCodeOptions(fileName, options));
	}

	return Promise
		.all(optGenPromises)
		.then(()=> {
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

			var result:Result = {
				fileName: fileName,
				options: options,
				src: content,
				dest: formattedCode
			};
			return Promise.resolve(result);
		});
}
