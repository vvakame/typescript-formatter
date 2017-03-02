try {
    require("typescript");
} catch (e) {
    console.error("typescript is required. please try 'npm install -g typescript'\n");
}

import * as fs from "fs";
import * as path from "path";
import * as commandpost from "commandpost";

import * as lib from "./";
import { getConfigFileName, readFilesFromTsconfig } from "./utils";

let packageJson = JSON.parse(fs.readFileSync(__dirname + "/../package.json").toString());

interface RootOptions {
    replace: boolean;
    verify: boolean;
    baseDir: string[];
    stdin: boolean;
    tsconfig: boolean;
    tslint: boolean;
    editorconfig: boolean;
    vscode: boolean;
    tsfmt: boolean;
    useTsconfig: string[];
    useTslint: string[];
    useTsfmt: string[];
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
    .option("--baseDir <path>", "config file lookup from <path>")
    .option("--stdin", "get formatting content from stdin")
    .option("--no-tsconfig", "don't read a tsconfig.json")
    .option("--no-tslint", "don't read a tslint.json")
    .option("--no-editorconfig", "don't read a .editorconfig")
    .option("--no-vscode", "don't read a .vscode/settings.json")
    .option("--no-tsfmt", "don't read a tsfmt.json")
    .option("--useTsconfig <path>", "using specified config file insteaf of tsconfig.json")
    .option("--useTslint <path>", "using specified config file insteaf of tslint.json")
    .option("--useTsfmt <path>", "using specified config file insteaf of tsfmt.json")
    .option("--verbose", "makes output more verbose")
    .action((opts, args) => {
        let replace = !!opts.replace;
        let verify = !!opts.verify;
        let baseDir = opts.baseDir ? opts.baseDir[0] : void 0;
        let stdin = !!opts.stdin;
        let tsconfig = !!opts.tsconfig;
        let tslint = !!opts.tslint;
        let editorconfig = !!opts.editorconfig;
        let vscode = !!opts.vscode;
        let tsfmt = !!opts.tsfmt;
        let tsconfigFile = opts.useTsconfig[0] ? path.join(process.cwd(), opts.useTsconfig[0]) : null;
        let tslintFile = opts.useTslint[0] ? path.join(process.cwd(), opts.useTslint[0]) : null;
        let tsfmtFile = opts.useTsfmt[0] ? path.join(process.cwd(), opts.useTsfmt[0]) : null;
        let verbose = !!opts.verbose;

        let files = args.files;
        let useTsconfig = false;
        if (files.length === 0) {
            let configFileName = getConfigFileName(baseDir || process.cwd(), "tsconfig.json");
            if (configFileName) {
                files = readFilesFromTsconfig(configFileName);
                if (verbose) {
                    console.log(`read: ${configFileName}`);
                }
                useTsconfig = true;
            }
        }

        if (files.length === 0 && !opts.stdin) {
            process.stdout.write(root.helpText() + "\n");
            return;
        }

        if (verbose) {
            const printPool: { [name: string]: string; } = {};
            const printSetting = (name: string, value: string | boolean) => {
                if (typeof value === "boolean") {
                    printPool[name] = value ? "ON" : "OFF";
                } else {
                    printPool[name] = value;
                }
            };
            const doPrint = () => {
                const maxLength = Object.keys(printPool).reduce((p, c) => Math.max(p, c.length), 0);
                Object.keys(printPool).forEach(key => {
                    const value = printPool[key];
                    console.log(`${padSpaces(key, maxLength + 1)}: ${value}`);
                });

                function padSpaces(str: string, len: number) {
                    let result = str;
                    while (result.length < len) {
                        result += " ";
                    }
                    return result;
                }
            };

            printSetting("replace", replace);
            printSetting("verify", verify);
            printSetting("baseDir", baseDir ? baseDir : process.cwd());
            printSetting("stdin", stdin);
            printSetting("files from tsconfig", useTsconfig);
            printSetting("tsconfig", tsconfig);
            if (tsconfigFile) {
                printSetting("specified tsconfig.json", tsconfigFile);
            }
            printSetting("tslint", tslint);
            if (tslintFile) {
                printSetting("specified tslint.json", tslintFile);
            }
            printSetting("editorconfig", editorconfig);
            printSetting("vscode", vscode);
            printSetting("tsfmt", tsfmt);
            if (tsfmtFile) {
                printSetting("specified tsfmt.json", tsfmtFile);
            }

            doPrint();
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
                    baseDir: baseDir,
                    tsconfig: tsconfig,
                    tsconfigFile: tsconfigFile,
                    tslint: tslint,
                    tslintFile: tslintFile,
                    editorconfig: editorconfig,
                    vscode: vscode,
                    tsfmt: tsfmt,
                    tsfmtFile: tsfmtFile,
                    verbose: verbose,
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
                    baseDir: baseDir,
                    tsconfig: tsconfig,
                    tsconfigFile: tsconfigFile,
                    tslint: tslint,
                    tslintFile: tslintFile,
                    editorconfig: editorconfig,
                    vscode: vscode,
                    tsfmt: tsfmt,
                    tsfmtFile: tsfmtFile,
                    verbose: verbose,
                })
                .then(showResultHandler)
                .catch(errorHandler);
        }
    });

commandpost
    .exec(root, process.argv)
    .catch(errorHandler);

function showResultHandler(resultMap: lib.ResultMap): Promise<any> {

    let hasError = Object.keys(resultMap).filter(fileName => resultMap[fileName].error).length !== 0;
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
                    process.stdout.write(result.message);
                }
            });
    }
    return Promise.resolve(null);
}

function errorHandler(err: any): Promise<any> {

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
