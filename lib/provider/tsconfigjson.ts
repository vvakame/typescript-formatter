import * as ts from "typescript";

import * as path from "path";

import { Options } from "../";
import { getConfigFileName, readTsconfig } from "../utils";

export function makeFormatCodeOptions(fileName: string, opts: Options, formatSettings: ts.FormatCodeSettings): ts.FormatCodeSettings {

    let baseDir = opts.baseDir ? path.resolve(opts.baseDir) : path.dirname(path.resolve(fileName));
    let configFileName: string | null;
    if (opts.tsconfigFile && path.isAbsolute(opts.tsconfigFile)) {
        configFileName = opts.tsconfigFile;
    } else {
        configFileName = getConfigFileName(baseDir, opts.tsconfigFile || "tsconfig.json");
    }
    if (!configFileName) {
        return formatSettings;
    }
    if (opts.verbose) {
        console.log(`read ${configFileName} for ${fileName}`);
    }

    let parsed = readTsconfig(configFileName);
    if (parsed.options.newLine === ts.NewLineKind.CarriageReturnLineFeed) {
        formatSettings.newLineCharacter = "\r\n";
    } else if (parsed.options.newLine === ts.NewLineKind.LineFeed) {
        formatSettings.newLineCharacter = "\n";
    }

    return formatSettings;
}
