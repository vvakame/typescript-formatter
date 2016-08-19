import * as ts from "typescript";

import * as editorconfig from "editorconfig";

import { Options } from "../";

let emitBaseDirWarning = false;

export default function makeFormatCodeOptions(fileName: string, opts: Options, formatOptions: ts.FormatCodeOptions): Promise<ts.FormatCodeOptions> {

    if (opts.verbose && opts.baseDir && !emitBaseDirWarning) {
        console.log("editorconfig is not supported baseDir options");
        emitBaseDirWarning = true;
    }

    return editorconfig
        .parse(fileName)
        .then(config => {
            if (Object.keys(config).length === 0) {
                return formatOptions;
            }
            if (opts.verbose) {
                console.log("editorconfig: \n" + "file: " + fileName + "\n" + JSON.stringify(config, null, 2));
            }

            if (config.indent_style === "tab") {
                formatOptions.ConvertTabsToSpaces = false;
                // if (typeof config.tab_width === "number") {
                // 	options.TabSize = config.tab_width;
                // }
            } else if (typeof config.indent_size === "number") {
                formatOptions.ConvertTabsToSpaces = true;
                formatOptions.IndentSize = config.indent_size;
            }
            if (config.end_of_line === "lf") {
                formatOptions.NewLineCharacter = "\n";
            } else if (config.end_of_line === "cr") {
                formatOptions.NewLineCharacter = "\r";
            } else if (config.end_of_line === "crlf") {
                formatOptions.NewLineCharacter = "\r\n";
            }

            return formatOptions;
        });
}
