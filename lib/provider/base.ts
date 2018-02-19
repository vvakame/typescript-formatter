import * as ts from "typescript";

import * as path from "path";
import * as fs from "fs";

import { Options } from "../";
import { getConfigFileName, parseJSON } from "../utils";

interface TsfmtSettings {
    insertSpaceAfterCommaDelimiter?: boolean;
    insertSpaceAfterSemicolonInForStatements?: boolean;
    insertSpaceBeforeAndAfterBinaryOperators?: boolean;
    insertSpaceAfterConstructor?: boolean;
    insertSpaceAfterKeywordsInControlFlowStatements?: boolean;
    insertSpaceAfterFunctionKeywordForAnonymousFunctions?: boolean;
    insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis?: boolean;
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets?: boolean;
    insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces?: boolean;
    insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces?: boolean;
    insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces?: boolean;
    insertSpaceAfterTypeAssertion?: boolean;
    insertSpaceBeforeFunctionParenthesis?: boolean;
    placeOpenBraceOnNewLineForFunctions?: boolean;
    placeOpenBraceOnNewLineForControlBlocks?: boolean;
    insertSpaceBeforeTypeAnnotation?: boolean;
    baseIndentSize?: number;
    indentSize?: number;
    // 0, 1, 2 or None, Block, Smart
    indentStyle?: number | string;
    tabSize?: number;
    newLineCharacter?: string;
    convertTabsToSpaces?: boolean;
}

export function makeFormatCodeOptions(fileName: string, opts: Options, formatSettings: ts.FormatCodeSettings): ts.FormatCodeSettings {
    let baseDir = opts.baseDir ? path.resolve(opts.baseDir) : path.dirname(path.resolve(fileName));
    let configFileName: string | null;
    if (opts.tsfmtFile && path.isAbsolute(opts.tsfmtFile)) {
        configFileName = opts.tsfmtFile;
    } else {
        configFileName = getConfigFileName(baseDir, opts.tsfmtFile || "tsfmt.json");
    }
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
    if (typeof config.insertSpaceAfterConstructor === "boolean") {
        formatSettings.insertSpaceAfterConstructor = config.insertSpaceAfterConstructor;
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
    if (typeof config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces === "boolean") {
        formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces = config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces;
    }
    if (typeof config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets === "boolean") {
        formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets = config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets;
    }
    if (typeof config.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces === "boolean") {
        formatSettings.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces = config.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces;
    }
    if (typeof config.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces === "boolean") {
        formatSettings.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces = config.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces;
    }
    if (typeof config.insertSpaceAfterTypeAssertion === "boolean") {
        formatSettings.insertSpaceAfterTypeAssertion = config.insertSpaceAfterTypeAssertion;
    }
    if (typeof config.insertSpaceBeforeFunctionParenthesis === "boolean") {
        formatSettings.insertSpaceBeforeFunctionParenthesis = config.insertSpaceBeforeFunctionParenthesis;
    }
    if (typeof config.placeOpenBraceOnNewLineForFunctions === "boolean") {
        formatSettings.placeOpenBraceOnNewLineForFunctions = config.placeOpenBraceOnNewLineForFunctions;
    }
    if (typeof config.placeOpenBraceOnNewLineForControlBlocks === "boolean") {
        formatSettings.placeOpenBraceOnNewLineForControlBlocks = config.placeOpenBraceOnNewLineForControlBlocks;
    }
    if (typeof config.insertSpaceBeforeTypeAnnotation === "boolean") {
        formatSettings.insertSpaceBeforeTypeAnnotation = config.insertSpaceBeforeTypeAnnotation;
    }
    if (typeof config.baseIndentSize === "number") {
        formatSettings.baseIndentSize = config.baseIndentSize;
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
