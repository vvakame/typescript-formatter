"use strict";

import ts = require("typescript");

import path = require("path");
import fs = require("fs");

function getConfigFileName(baseFileName:string, configFileName:string):string {
	"use strict";

	var baseDir = path.dirname(baseFileName);

	if (fs.existsSync(baseDir + path.sep + configFileName)) {
		return baseDir + path.sep + configFileName;
	}

	if (baseDir.length === path.dirname(baseDir).length) {
		return null;
	}

	return getConfigFileName(baseDir, configFileName);
}

interface TslintSettings {
	rules: {
		indent: {
			0: boolean;
			1: number;
		};
		whitespace: {
			0: boolean;
			1: string;
			2: string;
			3: string;
			4: string;
			5: string;
			[key: string]: any;
		};
	};
}

export function makeFormatCodeOptions(fileName:string, options:ts.FormatCodeOptions):ts.FormatCodeOptions {
	"use strict";

	var configFileName = getConfigFileName(path.resolve(fileName), "tslint.json");
	if (!configFileName) {
		return options;
	}
	// console.log("tslint makeFormatCodeOptions");
	// console.log("read " + configFileName);

	var config:TslintSettings = JSON.parse(<any>fs.readFileSync(configFileName, "utf-8"));
	if (!config.rules) {
		return options;
	}
	if (config.rules.indent && config.rules.indent[0]) {
		options.IndentSize = config.rules.indent[1];
	}
	if (config.rules.whitespace && config.rules.whitespace[0]) {
		for (var p in config.rules.whitespace) {
			var value = config.rules.whitespace[p];
			if (value === "check-branch") {
				options.InsertSpaceAfterKeywordsInControlFlowStatements = true;
			} else if (value === "check-decl") {
				// none?
			} else if (value === "check-operator") {
				options.InsertSpaceBeforeAndAfterBinaryOperators = true;
			} else if (value === "check-separator") {
				options.InsertSpaceAfterCommaDelimiter = true;
				options.InsertSpaceAfterSemicolonInForStatements = true;
			} else if (value === "check-type") {
				// none?
			}
		}
	}

	return options;
}
