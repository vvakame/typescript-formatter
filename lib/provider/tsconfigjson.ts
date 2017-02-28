import * as ts from "typescript";

import * as path from "path";
import * as fs from "fs";

import { Options } from "../";
import { getConfigFileName, parseJSON } from "../utils";

export default function makeFormatCodeOptions(fileName: string, opts: Options, formatSettings: ts.FormatCodeSettings): ts.FormatCodeSettings {

    let baseDir = opts.baseDir ? path.resolve(opts.baseDir) : path.dirname(path.resolve(fileName));
    let configFileName = getConfigFileName(baseDir, "tsconfig.json");
    if (!configFileName) {
        return formatSettings;
    }
    if (opts.verbose) {
        console.log(`read ${configFileName} for ${fileName}`);
    }

    // for `extends` support. It supported from TypeScript 2.1.1.
    // `& { readFile(path: string): string; }` is backword compat for TypeScript compiler 2.0.3 support.
    const host: ts.ParseConfigHost & { readFile(path: string): string; } = {
        useCaseSensitiveFileNames: true,
        readDirectory: (rootDir, _extensions, excludes, _includes) => {
            // _extensions -> [ '.ts', '.tsx', '.d.ts' ]
            // _includes   -> [ '**/*' ]

            const files = fs.readdirSync(rootDir);
            return files
                .filter(file => excludes.every(exclude => file !== exclude));
        },
        fileExists: path => fs.existsSync(path),
        readFile: (path: string) => fs.readFileSync(path, "utf-8"),
    };
    let rootConfig = parseJSON(fs.readFileSync(configFileName, "utf-8"));
    let parsed = ts.parseJsonConfigFileContent(rootConfig, host, baseDir);
    if (parsed.errors && parsed.errors.length !== 0) {
        throw new Error(parsed.errors.map(e => e.messageText).join("\n"));
    }

    if (parsed.options.newLine === ts.NewLineKind.CarriageReturnLineFeed) {
        formatSettings.newLineCharacter = "\r\n";
    } else if (parsed.options.newLine === ts.NewLineKind.LineFeed) {
        formatSettings.newLineCharacter = "\n";
    }

    return formatSettings;
}
