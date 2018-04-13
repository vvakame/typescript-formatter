import * as ts from "typescript";
import { IOptions as TslintOptions } from "tslint";
import * as path from "path";

import { Options } from "../";
import { getConfigFileName } from "../utils";


export interface AdditionalFormatSettings {
    $noConsecutiveBlankLines: boolean;
}

export async function makeFormatCodeOptions(fileName: string, opts: Options, formatSettings: ts.FormatCodeSettings): Promise<ts.FormatCodeSettings> {

    const rules = await getRules(fileName, opts);

    if (!rules) {
        return formatSettings;
    }

    const indent = rules.get("indent");
    const whitespace = rules.get("whitespace");

    if (indent && indent.ruleArguments) {
        switch (indent.ruleArguments[0]) {
            case "spaces":
                formatSettings.convertTabsToSpaces = true;
                break;
            case "tabs":
                formatSettings.convertTabsToSpaces = false;
                break;
            default:
                break;
        }
    }
    if (whitespace && whitespace.ruleArguments) {
        for (let p in whitespace.ruleArguments) {
            switch (whitespace.ruleArguments[p]) {
                case "check-branch":
                    formatSettings.insertSpaceAfterKeywordsInControlFlowStatements = true;
                    break;
                case "check-operator":
                    formatSettings.insertSpaceBeforeAndAfterBinaryOperators = true;
                    break;
                case "check-separator":
                    formatSettings.insertSpaceAfterCommaDelimiter = true;
                    formatSettings.insertSpaceAfterSemicolonInForStatements = true;
                    break;
                case "check-typecast":
                    formatSettings.insertSpaceAfterTypeAssertion = true;
                    break;
                default:
                    break;
            }
        }
    }

    return formatSettings;
}

export async function postProcess(fileName: string, formattedCode: string, opts: Options, _formatSettings: ts.FormatCodeSettings): Promise<string> {

    const rules = await getRules(fileName, opts);

    if (!rules) {
        return formattedCode;
    }

    if (rules.has("no-consecutive-blank-lines")) {
        formattedCode = formattedCode.replace(/\n+^$/mg, "\n");
    }

    return formattedCode;
}

async function getRules(fileName: string, opts: Options): Promise<Map<string, Partial<TslintOptions>> | undefined> {
    const baseDir = opts.baseDir ? path.resolve(opts.baseDir) : path.dirname(path.resolve(fileName));

    let configFileName: string | null;
    if (opts.tslintFile && path.isAbsolute(opts.tslintFile)) {
        configFileName = opts.tslintFile;
    } else {
        configFileName = getConfigFileName(baseDir, opts.tslintFile || "tslint.json");
    }

    if (!configFileName) {
        return undefined;
    }

    if (opts.verbose) {
        console.log(`read ${configFileName} for ${fileName}`);
    }

    const { Configuration } = await import("tslint");
    const { rules } = Configuration.loadConfigurationFromPath(configFileName);
    return rules;
}
