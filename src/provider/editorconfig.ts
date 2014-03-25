/// <reference path="../../typescript-toolbox/src/formatter.ts" />

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
	console.log("editorconfig makeFormatCodeOptions");

	if (config.indent_style === "tab") {
		options.ConvertTabsToSpaces = false;
		if (typeof config.tab_width === "string") {
			options.TabSize = parseInt(config.tab_width);
		}
	} else if (typeof config.indent_size === "string") {
		options.ConvertTabsToSpaces = true;
		options.IndentSize = parseInt(config.indent_size);
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
