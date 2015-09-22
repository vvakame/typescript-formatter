"use strict";

import * as ts from "typescript";

import * as fs from "fs";
import * as path from "path";

import {AdditionalFormatOptions} from "./";

export function createDefaultFormatCodeOptions(): ts.FormatCodeOptions {
    "use strict";

    return {
        IndentSize: 4,
        TabSize: 4,
        NewLineCharacter: '\r\n',
        ConvertTabsToSpaces: true,
        InsertSpaceAfterCommaDelimiter: true,
        InsertSpaceAfterSemicolonInForStatements: true,
        InsertSpaceBeforeAndAfterBinaryOperators: true,
        InsertSpaceAfterKeywordsInControlFlowStatements: true,
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
        PlaceOpenBraceOnNewLineForFunctions: false,
        PlaceOpenBraceOnNewLineForControlBlocks: false
    };
}

export function getConfigFileName(baseDir: string, configFileName: string): string {
    "use strict";

    let configFilePath = path.resolve(baseDir, configFileName);
    if (fs.existsSync(configFilePath)) {
        return configFilePath;
    }

    if (baseDir.length === path.dirname(baseDir).length) {
        return null;
    }

    return getConfigFileName(path.resolve(baseDir, "../"), configFileName);
}

export function createDefaultAdditionalFormatCodeOptions(): AdditionalFormatOptions {
    "use strict";

    return {
        noConsecutiveBlankLines: false,
        noTrailingWhitespace: false
    };
}
