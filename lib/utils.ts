import * as ts from "typescript";

import * as fs from "fs";
import * as path from "path";

const TSCONFIG_CACHE: { [filePath: string]: ts.ParsedCommandLine; } = {};

export function createDefaultFormatCodeSettings(): ts.FormatCodeSettings {

    return {
        baseIndentSize: 0,
        indentSize: 4,
        tabSize: 4,
        indentStyle: ts.IndentStyle.Smart,
        newLineCharacter: "\r\n",
        convertTabsToSpaces: true,
        insertSpaceAfterCommaDelimiter: true,
        insertSpaceAfterSemicolonInForStatements: true,
        insertSpaceBeforeAndAfterBinaryOperators: true,
        insertSpaceAfterConstructor: false,
        insertSpaceAfterKeywordsInControlFlowStatements: true,
        insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
        insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
        insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
        insertSpaceAfterTypeAssertion: false,
        insertSpaceBeforeFunctionParenthesis: false,
        placeOpenBraceOnNewLineForFunctions: false,
        placeOpenBraceOnNewLineForControlBlocks: false,
    };
}

export function getConfigFileName(baseDir: string, configFileName: string): string | null {

    let configFilePath = path.resolve(baseDir, configFileName);
    if (fs.existsSync(configFilePath)) {
        return configFilePath;
    }

    if (baseDir.length === path.dirname(baseDir).length) {
        return null;
    }

    return getConfigFileName(path.resolve(baseDir, "../"), configFileName);
}

export function readFilesFromTsconfig(configPath: string): string[] {
    return readTsconfig(configPath).fileNames;
}

export function readTsconfig(configPath: string): ts.ParsedCommandLine {
    if (TSCONFIG_CACHE[configPath]) {
        return TSCONFIG_CACHE[configPath];
    }

    // for `extends` support. It supported from TypeScript 2.1.1.
    // `& { readFile(path: string): string; }` is backword compat for TypeScript compiler 2.0.3 support.
    const host: ts.ParseConfigHost & { readFile(path: string): string; } = {
        useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
        readDirectory: ts.sys.readDirectory,
        fileExists: path => fs.existsSync(path),
        readFile: (path: string) => fs.readFileSync(path, "utf-8"),
    };
    let rootConfig = parseJSON(fs.readFileSync(configPath, "utf-8"));
    let parsed = ts.parseJsonConfigFileContent(rootConfig, host, path.dirname(configPath));
    if (parsed.errors && parsed.errors.length !== 0) {
        throw new Error(parsed.errors.map(e => e.messageText).join("\n"));
    }

    TSCONFIG_CACHE[configPath] = parsed;

    return parsed;
}

export function parseJSON(jsonText: string): any {
    let result = ts.parseConfigFileTextToJson("tmp.json", jsonText);
    if (result.error) {
        throw new Error("JSON parse error");
    }

    return result.config;
}
