/// <reference path="../../typescript-toolbox/lib/formatter.ts" />

/// <reference path="../node.d.ts" />
/// <reference path="../editorconfig.d.ts" />

import path = require("path");
import fs = require("fs");

import editorconfig = require("editorconfig");

export function makeFormatCodeOptions(fileName:string, options:TypeScript.Services.FormatCodeOptions):TypeScript.Services.FormatCodeOptions {
	var config = editorconfig.parse(fileName);
	if (Object.keys(config).length === 0) {
		return options;
	}
	// console.log("editorconfig makeFormatCodeOptions");
	// console.log(config);

	if (config.indent_style === "tab") {
		options.ConvertTabsToSpaces = false;
		// if (typeof config.tab_width === "number") {
		// 	options.TabSize = config.tab_width;
		// }
	} else if (typeof config.indent_size === "number") {
		options.ConvertTabsToSpaces = true;
		options.IndentSize = config.indent_size;
	}
	if (config.end_of_line === "lf") {
		options.NewLineCharacter = "\n";
	} else if (config.end_of_line === "cr") {
		options.NewLineCharacter = "\r";
	} else if (config.end_of_line === "crlf") {
		options.NewLineCharacter = "\r\n";
	}

	return options;
}
