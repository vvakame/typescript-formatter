import * as assert from "power-assert";

import fs = require("fs");
import path = require("path");
import childProcess = require("child_process");
import stream = require("stream");
import mkdirp = require("mkdirp");

import lib = require("../lib/");

function collectFileName(dirName: string): string[] {
    let fileName: string[] = [];
    fs
        .readdirSync(dirName)
        .forEach((name: string) => {
            let newName = dirName + "/" + name;
            let stats = fs.statSync(newName);
            if (stats.isDirectory()) {
                fileName = fileName.concat(collectFileName(newName));
            } else if (stats.isFile()) {
                fileName.push(newName);
            }
        });
    return fileName;
}

interface ExecResult {
    status: number;
    stdout: string;
    stderr: string;
}

function exec(cmd: string, args: string[], options: childProcess.SpawnOptions): Promise<ExecResult> {
    let process = childProcess.spawn(cmd, args, options);

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data: Buffer) => stdout += data.toString());
    process.stderr.on("data", (data: Buffer) => stderr += data.toString());

    return new Promise((resolve, _reject) => {
        process.on("exit", (status: number) => {
            resolve({
                status: status,
                stdout: stdout,
                stderr: stderr
            });
        });
    });
}

function checkByTslint(configFileName: string, tsfileName: string, errorExpected: boolean): Promise<boolean> {
    let process = childProcess.spawn("./node_modules/.bin/tslint", ["-c", configFileName, tsfileName]);

    let stdout = "";
    process.stdout.on("data", (data: any) => {
        stdout += data.toString();
    });

    let stderr = "";
    process.stderr.on("data", (data: any) => {
        stderr += data.toString();
    });

    return new Promise((resolve, reject) => {
        process.on("exit", (code: number) => {
            let success = !code; // 0 - exit with success
            if (!errorExpected) {
                // expected error
                if (success) {
                    resolve(true);
                } else {
                    reject(tsfileName + " must be a good code.\n" + stdout);
                }
            } else {
                // expected success
                if (success) {
                    reject(tsfileName + " must be a bad code.");
                } else {
                    resolve(true);
                }
            }
        });
    });
}

describe("tsfmt test", () => {
    let fixtureDir = "./test/fixture";
    let expectedDir = "./test/expected";

    describe("processFiles function", () => {
        let fileNames = collectFileName(fixtureDir);
        fileNames
            .filter(fileName => /\.ts$/.test(fileName))
            .forEach(fileName => {
                let ignoreList = [
                    "./test/fixture/editorconfig/space/main.ts", // TypeScript ignore indentSize: 8
                    "./test/fixture/tsfmt/a/main.ts", // TypeScript ignore indentSize: 1
                    "./test/fixture/tslint/indent/main.ts", // TypeScript ignore indentSize: 6
                ];
                if (ignoreList.indexOf(fileName) !== -1) {
                    it.skip(fileName, () => {
                        false;
                    });
                    return;
                }
                if (fileName.indexOf("./test/fixture/specified-config/") === 0) {
                    // uses later.
                    return;
                }

                it(fileName, () => {
                    return lib
                        .processFiles([fileName], {
                            dryRun: true,
                            replace: false,
                            verify: false,
                            tsconfig: true,
                            tsconfigFile: null,
                            tslint: true,
                            tslintFile: null,
                            editorconfig: true,
                            vscode: true,
                            tsfmt: true,
                            tsfmtFile: null,
                        })
                        .then(resultMap => {
                            let result = resultMap[fileName];
                            assert(result !== null);
                            assert(result.error === false);

                            let expectedTsFileName = fileName.replace(fixtureDir, expectedDir);
                            // console.log(fileName, expectedFileName);

                            if (!fs.existsSync(expectedTsFileName)) {
                                mkdirp.sync(path.dirname(expectedTsFileName));
                                fs.writeFileSync(expectedTsFileName, result.dest);
                            }

                            let expected = fs.readFileSync(expectedTsFileName, "utf-8");
                            assert(expected === result.dest);

                            let expectedSettingsFileName = expectedTsFileName.replace(/\.ts$/, ".json");

                            if (!fs.existsSync(expectedSettingsFileName)) {
                                fs.writeFileSync(expectedSettingsFileName, JSON.stringify(result.settings, null, 2));
                            }

                            let expectedSettings = lib.parseJSON(fs.readFileSync(expectedSettingsFileName, "utf-8"));
                            assert.deepEqual(expectedSettings, result.settings);

                            let tslintConfigName = path.dirname(fileName) + "/tslint.json";
                            if (!fs.existsSync(tslintConfigName)) {
                                return null;
                            }
                            if (fileName === "./test/fixture/tslint/indent/main.ts") {
                                // NOTE indent enforces consistent indentation levels (currently disabled).
                                return null;
                            }

                            return Promise.all([
                                checkByTslint(tslintConfigName, fileName, true),
                                checkByTslint(tslintConfigName, expectedTsFileName, false)
                            ]).then(() => null);
                        });
                });
            });

        it("verify unformatted file", () => {
            let fileName = "./test/fixture/tsfmt/a/main.ts";
            return lib
                .processFiles([fileName], {
                    dryRun: true,
                    replace: false,
                    verify: true,
                    tsconfig: true,
                    tsconfigFile: null,
                    tslint: true,
                    tslintFile: null,
                    editorconfig: true,
                    vscode: true,
                    tsfmt: true,
                    tsfmtFile: null,
                })
                .then(resultMap => {
                    assert(resultMap[fileName].error);
                    assert(resultMap[fileName].message === "./test/fixture/tsfmt/a/main.ts is not formatted\n");
                });
        });
    });

    describe("processStream function", () => {
        let fileName = "test/fixture/default/main.ts";
        it(fileName, () => {
            let input = new stream.Readable();
            input.push(`class Sample{getString():string{return "hi!";}}`);
            input.push(null);
            return lib
                .processStream(fileName, input, {
                    dryRun: true,
                    replace: false,
                    verify: false,
                    tsconfig: true,
                    tsconfigFile: null,
                    tslint: true,
                    tslintFile: null,
                    editorconfig: true,
                    vscode: true,
                    tsfmt: true,
                    tsfmtFile: null,
                })
                .then(result => {
                    assert(result !== null);
                    assert(result.error === false);
                    assert(result.dest === "class Sample { getString(): string { return \"hi!\"; } }");
                });
        });
    });

    describe("use specified config", () => {
        interface Matrix {
            name: string;
            settings: Partial<lib.Options>;
            targetFile: string;
        }
        const list: Matrix[] = [
            {
                name: "tsconfig.json",
                settings: {
                    tsconfigFile: "alt-tsconfig.json",
                },
                targetFile: "./test/fixture/specified-config/tsconfig/main.ts",
            },
            {
                name: "tslint.json",
                settings: {
                    tslintFile: "alt-tslint.json",
                },
                targetFile: "./test/fixture/specified-config/tslint/main.ts",
            },
            {
                name: "tsfmt.json",
                settings: {
                    tsfmtFile: "alt-tsfmt.json",
                },
                targetFile: "./test/fixture/specified-config/tsfmt/main.ts",
            },
        ];

        list.forEach(matrix => {
            it(`uses specified ${matrix.name} file`, () => {
                return lib
                    .processFiles([matrix.targetFile], Object.assign({}, {
                        dryRun: true,
                        replace: false,
                        verify: false,
                        tsconfig: true,
                        tsconfigFile: null,
                        tslint: true,
                        tslintFile: null,
                        editorconfig: true,
                        vscode: true,
                        tsfmt: true,
                        tsfmtFile: null,
                    }, matrix.settings))
                    .then(resultMap => {
                        let result = resultMap[matrix.targetFile];
                        assert(result !== null);
                        assert(result.error === false);

                        let expectedTsFileName = matrix.targetFile.replace(fixtureDir, expectedDir);

                        if (!fs.existsSync(expectedTsFileName)) {
                            mkdirp.sync(path.dirname(expectedTsFileName));
                            fs.writeFileSync(expectedTsFileName, result.dest);
                        }

                        let expected = fs.readFileSync(expectedTsFileName, "utf-8");
                        assert(expected === result.dest);

                        let expectedSettingsFileName = expectedTsFileName.replace(/\.ts$/, ".json");

                        if (!fs.existsSync(expectedSettingsFileName)) {
                            fs.writeFileSync(expectedSettingsFileName, JSON.stringify(result.settings, null, 2));
                        }

                        let expectedSettings = lib.parseJSON(fs.readFileSync(expectedSettingsFileName, "utf-8"));
                        assert.deepEqual(expectedSettings, result.settings);
                    });
            });
        });
    });

    describe("CLI test", () => {
        it("should reformat files specified at files in tsconfig.json", () => {
            return exec(path.resolve("./bin/tsfmt"), [], { cwd: path.resolve('./test/cli/files') }).then(result => {
                assert.equal(result.status, 0);
                assert.equal(result.stdout.trim(), `
class TestCLI {
    method() {

    }
}
`.trim().replace(/\n/g, "\r\n"));
            });
        });

        it("should reformat files specified at include, exclude in tsconfig.json", () => {
            return exec(path.resolve("./bin/tsfmt"), [], { cwd: path.resolve('./test/cli/includeExclude') }).then(result => {
                assert.equal(result.status, 0);
                assert.equal(result.stdout.trim(), `
export class TestCLI {
    method() {
    }
}
`.trim().replace(/\n/g, "\r\n"));
            });
        });
    });
});
