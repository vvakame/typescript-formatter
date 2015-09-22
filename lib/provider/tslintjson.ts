"use strict";

import * as ts from "typescript";

import * as path from "path";
import * as fs from "fs";

import {Options, AdditionalFormatOptions} from "../";
import {getConfigFileName} from "../utils";

interface TslintSettings {
    rules: {
        indent: {
            0: boolean;
            1: string;
        };
        "no-consecutive-blank-lines": boolean,
        "no-trailing-whitespace": boolean,
        whitespace: {
            0: boolean;
            1: string;
            2: string;
            3: string;
            4: string;
            5: string;
            [key: string]: any;
        };
    };
}

export default function makeFormatCodeOptions(fileName: string, opts: Options, formatOptions: ts.FormatCodeOptions, additionalOptions: AdditionalFormatOptions): ts.FormatCodeOptions {
    "use strict";

    let baseDir = opts.baseDir ? path.resolve(opts.baseDir) : path.dirname(path.resolve(fileName));
    let configFileName = getConfigFileName(baseDir, "tslint.json");
    if (!configFileName) {
        return formatOptions;
    }
    if (opts.verbose) {
        console.log(`read ${configFileName} for ${fileName}`);
    }

    let config: TslintSettings = JSON.parse(<any>fs.readFileSync(configFileName, "utf-8"));
    if (!config.rules) {
        return formatOptions;
    }
    if (config.rules.indent && config.rules.indent[0] && config.rules.indent[1] === "spaces") {
        formatOptions.ConvertTabsToSpaces = true;
    }
    if (config.rules.whitespace && config.rules.whitespace[0]) {
        for (let p in config.rules.whitespace) {
            let value = config.rules.whitespace[p];
            if (value === "check-branch") {
                formatOptions.InsertSpaceAfterKeywordsInControlFlowStatements = true;
            } else if (value === "check-decl") {
                // none?
            } else if (value === "check-operator") {
                formatOptions.InsertSpaceBeforeAndAfterBinaryOperators = true;
            } else if (value === "check-separator") {
                formatOptions.InsertSpaceAfterCommaDelimiter = true;
                formatOptions.InsertSpaceAfterSemicolonInForStatements = true;
            } else if (value === "check-type") {
                // none?
            }
        }
    }

    if (config.rules["no-consecutive-blank-lines"] === true) {
        additionalOptions.noConsecutiveBlankLines = true;
    }

    if (config.rules["no-trailing-whitespace"] === true) {
        additionalOptions.noTrailingWhitespace = true;
    }

    return formatOptions;
}
