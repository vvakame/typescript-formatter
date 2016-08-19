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

export default function makeFormatCodeOptions(fileName: string, opts: Options, formatOptions: ts.FormatCodeOptions): ts.FormatCodeOptions {

    let baseDir = opts.baseDir ? path.resolve(opts.baseDir) : path.dirname(path.resolve(fileName));
    let configFileName = getConfigFileName(baseDir, "tsconfig.json");
    if (!configFileName) {
        return formatOptions;
    }
    if (opts.verbose) {
        console.log(`read ${configFileName} for ${fileName}`);
    }

    let config: TsconfigSettings = parseJSON(fs.readFileSync(configFileName, "utf-8"));
    if (!config.compilerOptions || !config.compilerOptions.newLine) {
        return formatOptions;
    }

    if (config.compilerOptions.newLine.toLowerCase() === "crlf") {
        formatOptions.NewLineCharacter = "\r\n";
    } else if (config.compilerOptions.newLine.toLowerCase() === "lf") {
        formatOptions.NewLineCharacter = "\n";
    }

    return formatOptions;
}
