require("es6-promise").polyfill();

import * as fs from "fs";
import * as commandpost from "commandpost";
import * as path from "path";

import * as lib from "./";
import {getConfigFileName} from "./utils";

let packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json").toString());

interface RootOptions {
    replace: boolean;
    verify: boolean;
    stdin: boolean;
    tslint: boolean;
    editorconfig: boolean;
    tsfmt: boolean;
    verbose: boolean;
}

interface RootArguments {
    files: string[];
}

let root = commandpost
    .create<RootOptions, RootArguments>("tsfmt [files...]")
    .version(packageJson.version, "-v, --version")
    .option("-r, --replace", "replace .ts file")
    .option("--verify", "checking file format")
    .option("--stdin", "get formatting content from stdin")
    .option("--no-tslint", "don't read a tslint.json")
    .option("--no-editorconfig", "don't read a .editorconfig")
    .option("--no-tsfmt", "don't read a tsfmt.json")
    .option("--verbose", "makes output more verbose")
    .action((opts, args) => {
        let replace = !!opts.replace;
        let verify = !!opts.verify;
        let stdin = !!opts.stdin;
        let tslint = !!opts.tslint;
        let editorconfig = !!opts.editorconfig;
        let tsfmt = !!opts.tsfmt;
        let verbose = !!opts.verbose;

        let files = args.files;
        let useTsconfig = false;
        if (files.length === 0) {
            let configFileName = getConfigFileName(process.cwd(), "tsconfig.json");
            if (configFileName) {
                files = readFilesFromTsconfig(configFileName);
                if (verbose) {
                    console.log(`read: ${configFileName}`);
                }
                useTsconfig = true;
            }
        }

        if (files.length === 0 && !opts.stdin) {
            process.stdout.write(root.helpText() + '\n');
            return;
        }

        if (verbose) {
            console.log("replace:	  " + (replace ? "ON" : "OFF"));
            console.log("verify:	   " + (verify ? "ON" : "OFF"));
            console.log("stdin:		" + (stdin ? "ON" : "OFF"));
            console.log("tsconfig:	 " + (useTsconfig ? "ON" : "OFF"));
            console.log("tslint:	   " + (tslint ? "ON" : "OFF"));
            console.log("editorconfig: " + (editorconfig ? "ON" : "OFF"));
            console.log("tsfmt:		" + (tsfmt ? "ON" : "OFF"));
        }

        if (stdin) {
            if (replace) {
                errorHandler("--stdin option can not use with --replace option");
                return;
            }
            lib
                .processStream(files[0] || "temp.ts", process.stdin, {
                    replace: replace,
                    verify: verify,
                    tslint: tslint,
                    editorconfig: editorconfig,
                    tsfmt: tsfmt,
                    verbose: verbose
                })
                .then(result => {
                    let resultMap: lib.ResultMap = {};
                    resultMap[result.fileName] = result;
                    return resultMap;
                })
                .then(showResultHandler)
                .catch(errorHandler);
        } else {
            lib
                .processFiles(files, {
                    replace: replace,
                    verify: verify,
                    tslint: tslint,
                    editorconfig: editorconfig,
                    tsfmt: tsfmt,
                    verbose: verbose
                })
                .then(showResultHandler)
                .catch(errorHandler);
        }
    });

commandpost
    .exec(root, process.argv)
    .catch(errorHandler);

function showResultHandler(resultMap: lib.ResultMap): Promise<any> {
    "use strict";

    let hasError = Object.keys(resultMap).filter(fileName => resultMap[fileName].error).length !== 0;
    if (hasError) {
        Object.keys(resultMap)
            .map(fileName => resultMap[fileName])
            .filter(result => result.error)
            .forEach(result => console.error(result.message));
        process.exit(1);
    } else {
        Object.keys(resultMap)
            .map(fileName => resultMap[fileName])
            .forEach(result => {
                if (result.message) {
                    console.log(result.message);
                }
            });
    }
    return null;
}

function errorHandler(err: any): Promise<any> {
    "use strict";

    if (err instanceof Error) {
        console.error(err.stack);
    } else {
        console.error(err);
    }
    return Promise.resolve(null).then(() => {
        process.exit(1);
        return null;
    });
}

function readFilesFromTsconfig(configPath: string) {
    "use strict";

    let tsconfigDir = path.dirname(configPath);
    let tsconfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (tsconfig.files) {
        let files: string[] = tsconfig.files;
        return files.map(filePath => path.resolve(tsconfigDir, filePath));
    } else {
        throw new Error(`No "files" section present in tsconfig.json`);
    }
}
