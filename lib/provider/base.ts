"use strict";

import * as ts from "typescript";

import * as path from "path";
import * as fs from "fs";

import {Options} from "../";
import {getConfigFileName} from "../utils";

interface TsfmtSettings {
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
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets?: boolean;
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

export default function makeFormatCodeOptions(fileName: string, opts: Options, formatOptions: ts.FormatCodeOptions): ts.FormatCodeOptions {
    "use strict";

    var configFileName = getConfigFileName(path.dirname(path.resolve(fileName)), "tsfmt.json");
    if (!configFileName) {
        return formatOptions;
    }

    if (opts.verbose) {
        console.log(`read ${configFileName}`);
    }

    var config: TsfmtSettings = JSON.parse(<any>fs.readFileSync(configFileName, "utf-8"));
    if (typeof config.insertSpaceAfterCommaDelimiter === "boolean") {
        formatOptions.InsertSpaceAfterCommaDelimiter = config.insertSpaceAfterCommaDelimiter;
    }
    if (typeof config.insertSpaceAfterSemicolonInForStatements === "boolean") {
        formatOptions.InsertSpaceAfterSemicolonInForStatements = config.insertSpaceAfterSemicolonInForStatements;
    }
    if (typeof config.insertSpaceBeforeAndAfterBinaryOperators === "boolean") {
        formatOptions.InsertSpaceBeforeAndAfterBinaryOperators = config.insertSpaceBeforeAndAfterBinaryOperators;
    }
    if (typeof config.insertSpaceAfterKeywordsInControlFlowStatements === "boolean") {
        formatOptions.InsertSpaceAfterKeywordsInControlFlowStatements = config.insertSpaceAfterKeywordsInControlFlowStatements;
    }
    if (typeof config.insertSpaceAfterFunctionKeywordForAnonymousFunctions === "boolean") {
        formatOptions.InsertSpaceAfterFunctionKeywordForAnonymousFunctions = config.insertSpaceAfterFunctionKeywordForAnonymousFunctions;
    }
    if (typeof config.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis === "boolean") {
        formatOptions.InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis = config.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis;
    }
    if (typeof config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets === "boolean") {
        formatOptions.InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets = config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets;
    }
    if (typeof config.placeOpenBraceOnNewLineForFunctions === "boolean") {
        formatOptions.PlaceOpenBraceOnNewLineForFunctions = config.placeOpenBraceOnNewLineForFunctions;
    }
    if (typeof config.placeOpenBraceOnNewLineForControlBlocks === "boolean") {
        formatOptions.PlaceOpenBraceOnNewLineForControlBlocks = config.placeOpenBraceOnNewLineForControlBlocks;
    }
    if (typeof config.indentSize === "number") {
        formatOptions.IndentSize = config.indentSize;
    }
    if (typeof config.tabSize === "number") {
        formatOptions.TabSize = config.tabSize;
    }
    if (typeof config.newLineCharacter === "string") {
        formatOptions.NewLineCharacter = config.newLineCharacter;
    }
    if (typeof config.convertTabsToSpaces === "boolean") {
        formatOptions.ConvertTabsToSpaces = config.convertTabsToSpaces;
    }

    return formatOptions;
}
