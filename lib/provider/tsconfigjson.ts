import * as ts from "typescript";

import * as path from "path";
import * as fs from "fs";

import { Options } from "../";
import { getConfigFileName, parseJSON } from "../utils";

interface TsconfigSettings {
    compilerOptions: {
        newLine: string;
    };
}

export default function makeFormatCodeOptions(fileName: string, opts: Options, formatSettings: ts.FormatCodeSettings): ts.FormatCodeSettings {

    let baseDir = opts.baseDir ? path.resolve(opts.baseDir) : path.dirname(path.resolve(fileName));
    let configFileName = getConfigFileName(baseDir, "tsconfig.json");
    if (!configFileName) {
        return formatSettings;
    }
    if (opts.verbose) {
        console.log(`read ${configFileName} for ${fileName}`);
    }

    let config: TsconfigSettings = parseJSON(fs.readFileSync(configFileName, "utf-8"));
    if (!config.compilerOptions || !config.compilerOptions.newLine) {
        return formatSettings;
    }

    if (config.compilerOptions.newLine.toLowerCase() === "crlf") {
        formatSettings.newLineCharacter = "\r\n";
    } else if (config.compilerOptions.newLine.toLowerCase() === "lf") {
        formatSettings.newLineCharacter = "\n";
    }

    return formatSettings;
}
