"use strict";

import ts = require("typescript");

export function createDefaultFormatCodeOptions():ts.FormatCodeOptions {
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
		PlaceOpenBraceOnNewLineForFunctions: false,
		PlaceOpenBraceOnNewLineForControlBlocks: false
	};
}
