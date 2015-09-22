"use strict";

import ts = require("typescript");
import lib = require("./index");

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

export function createDefaultAdditionalFormatCodeOptions(): lib.AdditionalFormatOptions {
    "use strict";

    return {
		 noConsecutiveBlankLines: false,
		 noTrailingWhitespace: false
    };
}
