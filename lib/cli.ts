require("es6-promise").polyfill();

import fs = require("fs");
import commandpost = require("commandpost");

import lib = require("./index");

var packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json").toString());

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

var root = commandpost
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
        var replace = !!opts.replace;
        var verify = !!opts.verify;
        var stdin = !!opts.stdin;
        var tslint = !!opts.tslint;
        var editorconfig = !!opts.editorconfig;
        var tsfmt = !!opts.tsfmt;

        if (args.files.length === 0 && !opts.stdin) {
            process.stdout.write(root.helpText() + '\n');
            return;
        }

        if (opts.verbose) {
            console.log("replace:	  " + (replace ? "ON" : "OFF"));
            console.log("verify:	   " + (verify ? "ON" : "OFF"));
            console.log("stdin:		" + (stdin ? "ON" : "OFF"));
            console.log("tslint:	   " + (tslint ? "ON" : "OFF"));
            console.log("editorconfig: " + (editorconfig ? "ON" : "OFF"));
            console.log("tsfmt:		" + (tsfmt ? "ON" : "OFF"));
        }

        if (opts.stdin) {
            if (opts.replace) {
                errorHandler("--stdin option can not use with --replace option");
                return;
            }
            lib
                .processStream(args.files[0] || "temp.ts", process.stdin, {
                    replace: replace,
                    verify: verify,
                    tslint: tslint,
                    editorconfig: editorconfig,
                    tsfmt: tsfmt
                })
                .then(result => {
                    var resultMap: lib.ResultMap = {};
                    resultMap[result.fileName] = result;
                    return resultMap;
                })
                .then(showResultHandler)
                .catch(errorHandler);
        } else {
            lib
                .processFiles(args.files, {
                    replace: replace,
                    verify: verify,
                    tslint: tslint,
                    editorconfig: editorconfig,
                    tsfmt: tsfmt
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

    var hasError = Object.keys(resultMap).filter(fileName => resultMap[fileName].error).length !== 0;
    if (hasError) {
        Object.keys(resultMap)
            .map(fileName => resultMap[fileName])
            .filter(result => result.error)
            .forEach(result => process.stderr.write(result.message));
        process.exit(1);
    } else {
        Object.keys(resultMap)
            .map(fileName => resultMap[fileName])
            .forEach(result => {
                if (result.message) {
                    process.stdout.write(result.message.replace(/^\s+$/mg, "").replace(/\n\n^$/mg, ""));
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
