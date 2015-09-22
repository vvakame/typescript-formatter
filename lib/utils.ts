"use strict";

import ts = require("typescript");

import fs = require("fs");
import path = require("path");

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

    var configFilePath = path.resolve(baseDir, configFileName);
    if (fs.existsSync(configFilePath)) {
        return configFilePath;
    }

    if (baseDir.length === path.dirname(baseDir).length) {
        return null;
    }

    return getConfigFileName(path.resolve(baseDir, "../"), configFileName);
}
