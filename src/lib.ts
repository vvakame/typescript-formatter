/// <reference path="./node.d.ts" />

import formatter = require("../typescript-toolbox/src/formatter");

import fs = require("fs");

import base = require("./provider/base");
import editorconfig = require("./provider/editorconfig");
import tslintjson = require("./provider/tslintjson");

var providers = [base, editorconfig, tslintjson];

export interface IOptions {
	dryRun?: boolean;
	replace?:boolean;
}

export interface IResultMap {
	[fileName:string]:IResult;
}

export interface IResult {
	fileName: string;
	options: TypeScript.Services.FormatCodeOptions;
	src: string;
	dest: string;
}

export function processFiles(opts:IOptions, files:string[]):IResultMap {
	var result:IResultMap = {};
	files.forEach(fileName => {
		if (!fs.existsSync(fileName)) {
			console.error(fileName + " is not exists. process abort.");
			process.exit(1);
			return;
		}
		var content = fs.readFileSync(fileName).toString();

		var options = formatter.createDefaultFormatCodeOptions();
		providers.forEach(provider=> provider.makeFormatCodeOptions(fileName, options));

		var formattedCode = formatter.applyFormatterToContent(content, options);
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
