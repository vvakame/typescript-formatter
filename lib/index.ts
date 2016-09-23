import * as ts from "typescript";
import formatter from "./formatter";
import { createDefaultFormatCodeOptions, parseJSON } from "./utils";

export { parseJSON };

import * as fs from "fs";

import base from "./provider/base";
import tsconfigjson from "./provider/tsconfigjson";
import editorconfig from "./provider/editorconfig";
import tslintjson, { postProcess as tslintPostProcess } from "./provider/tslintjson";

export interface Options {
    dryRun?: boolean;
    verbose?: boolean;
    baseDir?: string;
    replace: boolean;
    verify: boolean;
    tsconfig: boolean;
    tslint: boolean;
    editorconfig: boolean;
    tsfmt: boolean;
}

export interface PostProcess {
    (fileName: string, formattedCode: string, opts: Options, formatOptions: ts.FormatCodeOptions): string;
}

export interface ResultMap {
    [fileName: string]: Result;
}

export interface Result {
    fileName: string;
    options: ts.FormatCodeOptions | null;
    message: string;
    error: boolean;
    src: string;
    dest: string;
}

export function processFiles(files: string[], opts: Options): Promise<ResultMap> {

    let resultMap: ResultMap = {};
    let promises = files.map(fileName => {
        if (!fs.existsSync(fileName)) {
            let result: Result = {
                fileName: fileName,
                options: null,
                message: `${fileName} does not exist. process abort.\n`,
                error: true,
                src: "",
                dest: "",
            };
            return Promise.resolve(result);
        }

        let content = fs.readFileSync(fileName).toString();
        return processString(fileName, content, opts);
    });
    return Promise.all<Result>(promises).then(resultList => {
        resultList.forEach(result => {
            resultMap[result.fileName] = result;
        });
        return resultMap;
    });
}

export function processStream(fileName: string, input: NodeJS.ReadableStream, opts: Options): Promise<Result> {

    input.setEncoding("utf8");

    let promise = new Promise<string>((resolve, _reject) => {
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

    let formatOptions = createDefaultFormatCodeOptions();
    let optGenPromises: (ts.FormatCodeOptions | Promise<ts.FormatCodeOptions>)[] = [];
    let postProcesses: PostProcess[] = [];
    if (opts.tsfmt) {
        optGenPromises.push(base(fileName, opts, formatOptions));
    }
    if (opts.tsconfig) {
        optGenPromises.push(tsconfigjson(fileName, opts, formatOptions));
    }
    if (opts.editorconfig) {
        optGenPromises.push(editorconfig(fileName, opts, formatOptions));
    }
    if (opts.tslint) {
        optGenPromises.push(tslintjson(fileName, opts, formatOptions));
        postProcesses.push(tslintPostProcess);
    }

    return Promise
        .all(optGenPromises)
        .then(() => {
            let formattedCode = formatter(fileName, content, formatOptions);
            if ((<any>formattedCode).trimRight) {
                formattedCode = (<any>formattedCode).trimRight();
                formattedCode += formatOptions.NewLineCharacter;
            }

            postProcesses.forEach(postProcess => {
                formattedCode = postProcess(fileName, formattedCode, opts, formatOptions) || formattedCode;
            });

            // replace newline code. maybe NewLineCharacter params affect to only "new" newline by language service.
            formattedCode = formattedCode.replace(/\r?\n/g, formatOptions.NewLineCharacter);

            let message = "";
            let error = false;
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

            let result: Result = {
                fileName: fileName,
                options: formatOptions,
                message: message,
                error: error,
                src: content,
                dest: formattedCode,
            };
            return Promise.resolve(result);
        });
}
