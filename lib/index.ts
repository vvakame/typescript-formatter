import * as ts from "typescript";
import formatter from "./formatter";
import { createDefaultFormatCodeOptions, parseJSON } from "./utils";

export { parseJSON };

import * as fs from "fs";

import base from "./provider/base";
import tsconfigjson from "./provider/tsconfigjson";
import editorconfig, { postProcess as editorconfigPostProcess } from "./provider/editorconfig";
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

export interface OptionModifier {
    (fileName: string, opts: Options, formatOptions: ts.FormatCodeOptions): ts.FormatCodeOptions | Promise<ts.FormatCodeOptions>;
}

export interface PostProcessor {
    (fileName: string, formattedCode: string, opts: Options, formatOptions: ts.FormatCodeOptions): string | Promise<string>;
}

class Processor {
    optionModifiers: OptionModifier[] = [];
    postProcessors: PostProcessor[] = [];

    addOptionModify(modifier: OptionModifier) {
        this.optionModifiers.push(modifier);
    }

    processFormatCodeOptions(fileName: string, opts: Options, formatOptions: ts.FormatCodeOptions): Promise<ts.FormatCodeOptions> {
        let optionModifiers = [...this.optionModifiers];

        let next = (formatOptions: ts.FormatCodeOptions): Promise<ts.FormatCodeOptions> => {
            if (optionModifiers.length === 0) {
                return Promise.resolve(formatOptions);
            }
            let modifier = optionModifiers.shift()!;
            let ret = modifier(fileName, opts, formatOptions);
            return Promise.resolve(ret).then(formatOptions => next(formatOptions));
        };

        return next(formatOptions);
    }

    addPostProcess(postProcessor: PostProcessor) {
        this.postProcessors.push(postProcessor);
    }

    postProcess(fileName: string, formattedCode: string, opts: Options, formatOptions: ts.FormatCodeOptions): Promise<string> {
        let postProcessors = [...this.postProcessors];

        let next = (formattedCode: string): Promise<string> => {
            if (postProcessors.length === 0) {
                return Promise.resolve(formattedCode);
            }
            let processor = postProcessors.shift()!;
            let ret = processor(fileName, formattedCode, opts, formatOptions);
            return Promise.resolve(ret).then(formattedCode => next(formattedCode));
        };

        return next(formattedCode);
    }
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

    let processor = new Processor();
    if (opts.tsfmt) {
        processor.addOptionModify(base);
    }
    if (opts.tsconfig) {
        processor.addOptionModify(tsconfigjson);
    }
    if (opts.editorconfig) {
        processor.addOptionModify(editorconfig);
        processor.addPostProcess(editorconfigPostProcess);
    }
    if (opts.tslint) {
        processor.addOptionModify(tslintjson);
        processor.addPostProcess(tslintPostProcess);
    }
    processor.addPostProcess((_fileName: string, formattedCode: string, _opts: Options, formatOptions: ts.FormatCodeOptions) => {
        // replace newline code. maybe NewLineCharacter params affect to only "new" newline by language service.
        formattedCode = formattedCode.replace(/\r?\n/g, formatOptions.NewLineCharacter);
        return Promise.resolve(formattedCode);
    });

    let formatOptions = createDefaultFormatCodeOptions();
    return processor.processFormatCodeOptions(fileName, opts, formatOptions)
        .then(formatOptions => {
            let formattedCode = formatter(fileName, content, formatOptions);

            // apply post process logic
            return processor.postProcess(fileName, formattedCode, opts, formatOptions);

        }).then(formattedCode => {
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
