import * as ts from "typescript";

import * as path from "path";
import * as fs from "fs";

import { Options } from "../";
import { getConfigFileName, parseJSON } from "../utils";

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
    // template string literalsの括弧内にスペースを挿入する
    insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces?: boolean;
    // 新しい行に関数の始め中括弧を配置する
    placeOpenBraceOnNewLineForFunctions?: boolean;
    // 新しい行にコントロールブロックの始め中括弧を配置する
    placeOpenBraceOnNewLineForControlBlocks?: boolean;
    // from EditorOptions
    indentSize?: number;
    // 0, 1, 2 or None, Block, Smart
    indentStyle?: number | string;
    tabSize?: number;
    newLineCharacter?: string;
    convertTabsToSpaces?: boolean;
}

export default function makeFormatCodeOptions(fileName: string, opts: Options, formatSettings: ts.FormatCodeSettings): ts.FormatCodeSettings {
    let baseDir = opts.baseDir ? path.resolve(opts.baseDir) : path.dirname(path.resolve(fileName));
    let configFileName = getConfigFileName(baseDir, "tsfmt.json");
    if (!configFileName) {
        return formatSettings;
    }

    if (opts.verbose) {
        console.log(`read ${configFileName} for ${fileName}`);
    }

    let config: TsfmtSettings = parseJSON(fs.readFileSync(configFileName, "utf-8"));
    if (typeof config.insertSpaceAfterCommaDelimiter === "boolean") {
        formatSettings.insertSpaceAfterCommaDelimiter = config.insertSpaceAfterCommaDelimiter;
    }
    if (typeof config.insertSpaceAfterSemicolonInForStatements === "boolean") {
        formatSettings.insertSpaceAfterSemicolonInForStatements = config.insertSpaceAfterSemicolonInForStatements;
    }
    if (typeof config.insertSpaceBeforeAndAfterBinaryOperators === "boolean") {
        formatSettings.insertSpaceBeforeAndAfterBinaryOperators = config.insertSpaceBeforeAndAfterBinaryOperators;
    }
    if (typeof config.insertSpaceAfterKeywordsInControlFlowStatements === "boolean") {
        formatSettings.insertSpaceAfterKeywordsInControlFlowStatements = config.insertSpaceAfterKeywordsInControlFlowStatements;
    }
    if (typeof config.insertSpaceAfterFunctionKeywordForAnonymousFunctions === "boolean") {
        formatSettings.insertSpaceAfterFunctionKeywordForAnonymousFunctions = config.insertSpaceAfterFunctionKeywordForAnonymousFunctions;
    }
    if (typeof config.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis === "boolean") {
        formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis = config.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis;
    }
    if (typeof config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets === "boolean") {
        formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets = config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets;
    }
    if (typeof config.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces === "boolean") {
        formatSettings.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces = config.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces;
    }
    if (typeof config.placeOpenBraceOnNewLineForFunctions === "boolean") {
        formatSettings.placeOpenBraceOnNewLineForFunctions = config.placeOpenBraceOnNewLineForFunctions;
    }
    if (typeof config.placeOpenBraceOnNewLineForControlBlocks === "boolean") {
        formatSettings.placeOpenBraceOnNewLineForControlBlocks = config.placeOpenBraceOnNewLineForControlBlocks;
    }
    if (typeof config.indentSize === "number") {
        formatSettings.indentSize = config.indentSize;
    }
    if (typeof config.indentStyle === "number") {
        formatSettings.indentStyle = config.indentStyle as number;
    } else if (typeof config.indentStyle === "string") {
        formatSettings.indentStyle = (ts.IndentStyle as any)[config.indentStyle] as number;
    }
    if (typeof config.tabSize === "number") {
        formatSettings.tabSize = config.tabSize;
    }
    if (typeof config.newLineCharacter === "string") {
        formatSettings.newLineCharacter = config.newLineCharacter;
    }
    if (typeof config.convertTabsToSpaces === "boolean") {
        formatSettings.convertTabsToSpaces = config.convertTabsToSpaces;
    }

    return formatSettings;
}
