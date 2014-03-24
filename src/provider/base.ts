/// <reference path="../../typescript-toolbox/src/formatter.ts" />

/// <reference path="../node.d.ts" />

import TypeScript = require("../../typescript-toolbox/typescript/tss");

import path = require("path");
import fs = require("fs");

function getConfigFileName(baseFileName:string, configFileName:string):string {
	var baseDir = path.dirname(baseFileName);

	if (fs.existsSync(baseDir + path.sep + configFileName)) {
		return baseDir + path.sep + configFileName;
	}

	if (baseDir.length === path.dirname(baseDir).length) {
		return null;
	}

	return getConfigFileName(baseDir, configFileName);
}

interface ITsfmtSettings {
	// from FormatCodeOptions
	insertSpaceAfterCommaDelimiter?: boolean;
	insertSpaceAfterSemicolonInForStatements?: boolean;
	insertSpaceBeforeAndAfterBinaryOperators?: boolean;
	insertSpaceAfterKeywordsInControlFlowStatements?: boolean;
	insertSpaceAfterFunctionKeywordForAnonymousFunctions?: boolean;
	insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis?: boolean;
	placeOpenBraceOnNewLineForFunctions?: boolean;
	placeOpenBraceOnNewLineForControlBlocks?: boolean;
	// from EditorOptions
	indentSize?: number;
	tabSize?: number;
	newLineCharacter?: string;
	convertTabsToSpaces?: boolean;
}

export function makeFormatCodeOptions(fileName:string, options:TypeScript.Services.FormatCodeOptions):TypeScript.Services.FormatCodeOptions {
	var configFileName = getConfigFileName(path.resolve(fileName), "tsfmt.json");
	if (!configFileName) {
		return options;
	}
	console.log("read " + configFileName);

	var config:ITsfmtSettings = JSON.parse(<any>fs.readFileSync(configFileName, "utf-8"));
	if (typeof config.insertSpaceAfterCommaDelimiter === "boolean") {
		options.InsertSpaceAfterCommaDelimiter = config.insertSpaceAfterCommaDelimiter;
	}
	if (typeof config.insertSpaceAfterSemicolonInForStatements === "boolean") {
		options.InsertSpaceAfterSemicolonInForStatements = config.insertSpaceAfterSemicolonInForStatements;
	}
	if (typeof config.insertSpaceBeforeAndAfterBinaryOperators === "boolean") {
		options.InsertSpaceBeforeAndAfterBinaryOperators = config.insertSpaceBeforeAndAfterBinaryOperators;
	}
	if (typeof config.insertSpaceAfterKeywordsInControlFlowStatements === "boolean") {
		options.InsertSpaceAfterKeywordsInControlFlowStatements = config.insertSpaceAfterKeywordsInControlFlowStatements;
	}
	if (typeof config.insertSpaceAfterFunctionKeywordForAnonymousFunctions === "boolean") {
		options.InsertSpaceAfterFunctionKeywordForAnonymousFunctions = config.insertSpaceAfterFunctionKeywordForAnonymousFunctions;
	}
	if (typeof config.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis === "boolean") {
		options.InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis = config.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis;
	}
	if (typeof config.placeOpenBraceOnNewLineForFunctions === "boolean") {
		options.PlaceOpenBraceOnNewLineForFunctions = config.placeOpenBraceOnNewLineForFunctions;
	}
	if (typeof config.placeOpenBraceOnNewLineForControlBlocks === "boolean") {
		options.PlaceOpenBraceOnNewLineForControlBlocks = config.placeOpenBraceOnNewLineForControlBlocks;
	}
	if (typeof config.indentSize === "number") {
		options.IndentSize = config.indentSize;
	}
	if (typeof config.tabSize === "number") {
		options.TabSize = config.tabSize;
	}
	if (typeof config.newLineCharacter === "string") {
		// TODO 環境依存のアレを入れる
		options.NewLineCharacter = config.newLineCharacter;
	}
	if (typeof config.convertTabsToSpaces === "boolean") {
		options.ConvertTabsToSpaces = config.convertTabsToSpaces;
	}

	return options;
}
