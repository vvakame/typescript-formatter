"use strict";

import ts = require("typescript");
import formatter = require("./formatter");
import utils = require("./utils");

import fs = require("fs");

import base = require("./provider/base");
import editorconfig = require("./provider/editorconfig");
import tslintjson = require("./provider/tslintjson");

export interface Options {
    dryRun?: boolean;
    verbose?: boolean;
    replace: boolean;
    verify: boolean;
    tslint: boolean;
    editorconfig: boolean;
    tsfmt: boolean;
}

export interface ResultMap {
    [fileName: string]: Result;
}

export interface Result {
    fileName: string;
    options: ts.FormatCodeOptions;
    message: string;
    error: boolean;
    src: string;
    dest: string;
}

export interface AdditionalFormatOptions {
	noConsecutiveBlankLines: boolean;
	noTrailingWhitespace: boolean;
}

export function processFiles(files: string[], opts: Options): Promise<ResultMap> {
    "use strict";

    var resultMap: ResultMap = {};
    var promises = files.map(fileName => {
        if (!fs.existsSync(fileName)) {
            var result: Result = {
                fileName: fileName,
                options: null,
                message: `${fileName} does not exist. process abort.\n`,
                error: true,
                src: "",
                dest: ""
            };
            return Promise.resolve(result);
        }

        var content = fs.readFileSync(fileName).toString();
        return processString(fileName, content, opts);
    });
    return Promise.all(promises).then(resultList=> {
        resultList.forEach(result => {
            resultMap[result.fileName] = result;
        });
        return resultMap;
    });
}

export function processStream(fileName: string, input: NodeJS.ReadableStream, opts: Options): Promise<Result> {
    "use strict";

    input.setEncoding("utf8");

    var promise = new Promise<string>((resolve, reject) => {
        var fragment = "";
        input.on("data", (chunk: string) => {
            fragment += chunk;
        });

        input.on("end", () => {
            resolve(fragment);
        });
    });
    return promise.then(content => processString(fileName, content, opts));
}

export function processString(fileName: string, content: string, opts: Options): Promise<Result> {
    "use strict";

    var options = utils.createDefaultFormatCodeOptions();
	 var additionalOptions = utils.createDefaultAdditionalFormatCodeOptions();
    var optGenPromises: (ts.FormatCodeOptions | Promise<ts.FormatCodeOptions>)[] = [];
    if (opts.tsfmt) {
        optGenPromises.push(base.makeFormatCodeOptions(fileName, options));
    }
    if (opts.editorconfig) {
        optGenPromises.push(editorconfig.makeFormatCodeOptions(fileName, options));
    }
    if (opts.tslint) {
        optGenPromises.push(tslintjson.makeFormatCodeOptions(fileName, options, additionalOptions));
    }

    return Promise
        .all(optGenPromises)
        .then(() => {
            var formattedCode = formatter(fileName, content, options);
            if ((<any>formattedCode).trimRight) {
                formattedCode = (<any>formattedCode).trimRight();
                formattedCode += "\n";
            }

				if (additionalOptions.noTrailingWhitespace) {
					formattedCode = formattedCode.replace(/^\s+$/mg, "");
				}

				if (additionalOptions.noConsecutiveBlankLines) {
					formattedCode = formattedCode.replace(/\n\n^$/mg, "");
				}

            // TODO replace newline code. NewLineCharacter params affect to only "new" newline. maybe.
            var message: string;
            var error = false;
            if (opts && opts.verify) {
                if (content !== formattedCode) {
                    message = `${fileName} is not formatted\n`;
                    error = true;
                }
            } else if (opts && opts.replace) {
                if (content !== formattedCode) {
                    fs.writeFileSync(fileName, formattedCode);
                    message = `replaced ${fileName}\n`;
                }
            } else if (opts && !opts.dryRun) {
                message = formattedCode;
            }

            var result: Result = {
                fileName: fileName,
                options: options,
                message: message,
                error: error,
                src: content,
                dest: formattedCode
            };
            return Promise.resolve(result);
        });
}
