"use strict";

import * as ts from "typescript";
import formatter from "./formatter";
import {createDefaultFormatCodeOptions} from "./utils";

import * as fs from "fs";

import base from "./provider/base";
import editorconfig from "./provider/editorconfig";
import tslintjson from "./provider/tslintjson";

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

export function processFiles(files: string[], opts: Options): Promise<ResultMap> {
    "use strict";

    let resultMap: ResultMap = {};
    let promises = files.map(fileName => {
        if (!fs.existsSync(fileName)) {
            let result: Result = {
                fileName: fileName,
                options: null,
                message: `${fileName} is not exists. process abort.`,
                error: true,
                src: "",
                dest: ""
            };
            return Promise.resolve(result);
        }

        let content = fs.readFileSync(fileName).toString();
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

    let promise = new Promise<string>((resolve, reject) => {
        let fragment = "";
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

    let options = createDefaultFormatCodeOptions();
    let optGenPromises: (ts.FormatCodeOptions | Promise<ts.FormatCodeOptions>)[] = [];
    if (opts.tsfmt) {
        optGenPromises.push(base(fileName, options));
    }
    if (opts.editorconfig) {
        optGenPromises.push(editorconfig(fileName, options));
    }
    if (opts.tslint) {
        optGenPromises.push(tslintjson(fileName, options));
    }

    return Promise
        .all(optGenPromises)
        .then(() => {
            let formattedCode = formatter(fileName, content, options);
            if ((<any>formattedCode).trimRight) {
                formattedCode = (<any>formattedCode).trimRight();
                formattedCode += "\n";
            }

            // TODO replace newline code. NewLineCharacter params affect to only "new" newline. maybe.
            let message: string;
            let error = false;
            if (opts && opts.verify) {
                if (content !== formattedCode) {
                    message = `${fileName} is not formatted`;
                    error = true;
                }
            } else if (opts && opts.replace) {
                if (content !== formattedCode) {
                    fs.writeFileSync(fileName, formattedCode);
                    message = `replaced ${fileName}`;
                }
            } else if (opts && !opts.dryRun) {
                message = formattedCode;
            }

            let result: Result = {
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
