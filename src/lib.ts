/// <reference path="./node.d.ts" />

import formatter = require("../typescript-toolbox/src/formatter");

import fs = require("fs");

import base = require("./provider/base");
import editorconfig = require("./provider/editorconfig");
import tslintjson = require("./provider/tslintjson");

var providers = [base, editorconfig, tslintjson];

export interface IOptions {
	replace:boolean;
}

export function processFiles(opts:IOptions, files:string[]) {
	files.forEach(fileName => {
		if (!fs.existsSync(fileName)) {
			console.error(fileName + " is not exists. process abort.");
			process.exit(1);
			return;
		}
		var content = fs.readFileSync(fileName).toString();

		console.log("target:" + fileName);
		var options = formatter.createDefaultFormatCodeOptions();
		console.log("before:\n" + JSON.stringify(options, null, 2));

		providers.forEach(provider=> provider.makeFormatCodeOptions(fileName, options));

		console.log("after:\n" + JSON.stringify(options, null, 2));
		return;

		var formattedCode = formatter.applyFormatterToContent(content, options);
		if (opts && opts.replace) {
			if (content !== formattedCode) {
				fs.writeFileSync(fileName, formattedCode);
				console.log("replaced " + fileName);
			}
		} else {
			console.log(formattedCode);
		}
	});
}
