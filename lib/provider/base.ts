/// <reference path="../../typescript-toolbox/lib/formatter.ts" />

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
	// コンマ区切り記号の後にスペースを追加する
	insertSpaceAfterCommaDelimiter?: boolean;
	// 'for' ステートメントでセミコロンの後にスペースを挿入する
	insertSpaceAfterSemicolonInForStatements?: boolean;
	// 二項演算子の前後にスペースを挿入する
	insertSpaceBeforeAndAfterBinaryOperators?: boolean;
	// 制御フローステートメント内のキーワードの後にスペースを追加する
	insertSpaceAfterKeywordsInControlFlowStatements?: boolean;
	// 匿名関数に対する関数キーワードの後にスペースを追加する
	insertSpaceAfterFunctionKeywordForAnonymousFunctions?: boolean;
	// かっこ内が空でない場合に始め括弧の後ろと終わりカッコの前にスペースを挿入する
	insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis?: boolean;
	// 新しい行に関数の始め中括弧を配置する
	placeOpenBraceOnNewLineForFunctions?: boolean;
	// 新しい行にコントロールブロックの始め中括弧を配置する
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
	// console.log("base makeFormatCodeOptions");
	// console.log("read " + configFileName);

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
		options.NewLineCharacter = config.newLineCharacter;
	}
	if (typeof config.convertTabsToSpaces === "boolean") {
		options.ConvertTabsToSpaces = config.convertTabsToSpaces;
	}

	return options;
}
