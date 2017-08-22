import * as ts from "typescript";

import * as path from "path";
import * as fs from "fs";

import { Options } from "../";
import { getConfigFileName, parseJSON } from "../utils";

interface TslintSettings {
    rules: {
        indent: {
            0: boolean;
            1: string;
        };
        "no-consecutive-blank-lines": boolean,
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

export interface AdditionalFormatSettings {
    $noConsecutiveBlankLines: boolean;
}

export function makeFormatCodeOptions(fileName: string, opts: Options, formatSettings: ts.FormatCodeSettings): ts.FormatCodeSettings {

    let baseDir = opts.baseDir ? path.resolve(opts.baseDir) : path.dirname(path.resolve(fileName));
    let configFileName: string | null;
    if (opts.tslintFile && path.isAbsolute(opts.tslintFile)) {
        configFileName = opts.tslintFile;
    } else {
        configFileName = getConfigFileName(baseDir, opts.tslintFile || "tslint.json");
    }
    if (!configFileName) {
        return formatSettings;
    }

    if (opts.verbose) {
        console.log(`read ${configFileName} for ${fileName}`);
    }

    let config: TslintSettings = parseJSON(fs.readFileSync(configFileName, "utf-8"));
    if (!config.rules) {
        return formatSettings;
    }
    if (config.rules.indent && config.rules.indent[0]) {
        if (config.rules.indent[1] === "spaces") {
            formatSettings.convertTabsToSpaces = true;
        } else if (config.rules.indent[1] === "tabs") {
            formatSettings.convertTabsToSpaces = false;
        }
    }
    if (config.rules.whitespace && config.rules.whitespace[0]) {
        for (let p in config.rules.whitespace) {
            let value = config.rules.whitespace[p];
            if (value === "check-branch") {
                formatSettings.insertSpaceAfterKeywordsInControlFlowStatements = true;
            } else if (value === "check-decl") {
                // none?
            } else if (value === "check-operator") {
                formatSettings.insertSpaceBeforeAndAfterBinaryOperators = true;
            } else if (value === "check-separator") {
                formatSettings.insertSpaceAfterCommaDelimiter = true;
                formatSettings.insertSpaceAfterSemicolonInForStatements = true;
            } else if (value === "check-type") {
                // none?
            } else if (value === "check-typecast") {
                formatSettings.insertSpaceAfterTypeAssertion = true;
            }
        }
    }

    return formatSettings;
}

export function postProcess(fileName: string, formattedCode: string, opts: Options, _formatSettings: ts.FormatCodeSettings): string {

    let baseDir = opts.baseDir ? path.resolve(opts.baseDir) : path.dirname(path.resolve(fileName));
    let configFileName: string | null;
    if (opts.tslintFile && path.isAbsolute(opts.tslintFile)) {
        configFileName = opts.tslintFile;
    } else {
        configFileName = getConfigFileName(baseDir, opts.tslintFile || "tslint.json");
    }
    if (!configFileName) {
        return formattedCode;
    }

    let config: TslintSettings = parseJSON(fs.readFileSync(configFileName, "utf-8"));
    if (!config.rules) {
        return formattedCode;
    }

    let additionalOptions = createDefaultAdditionalFormatCodeSettings();
    if (config.rules["no-consecutive-blank-lines"] === true) {
        additionalOptions.$noConsecutiveBlankLines = true;
    }

    if (additionalOptions.$noConsecutiveBlankLines) {
        formattedCode = formattedCode.replace(/\n+^$/mg, "\n");
    }

    return formattedCode;
}

function createDefaultAdditionalFormatCodeSettings(): AdditionalFormatSettings {

    return {
        $noConsecutiveBlankLines: false,
    };
}
