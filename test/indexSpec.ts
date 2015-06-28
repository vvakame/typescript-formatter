/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/power-assert/power-assert.d.ts" />

require("es6-promise").polyfill();

import assert = require("power-assert");

import fs = require("fs");
import path = require("path");
import childProcess = require("child_process");
import stream = require("stream");

import lib = require("../lib/index");

function collectFileName(dirName:string):string[] {
	var fileName:string[] = [];
	fs
		.readdirSync(dirName)
		.forEach((name:string)=> {
			var newName = dirName + "/" + name;
			var stats = fs.statSync(newName);
			if (stats.isDirectory()) {
				fileName = fileName.concat(collectFileName(newName));
			} else if (stats.isFile()) {
				fileName.push(newName);
			}
		});
	return fileName;
}

function checkByTslint(configFileName:string, tsfileName:string, errorExpected:boolean):Promise<boolean> {
	var process = childProcess.spawn("./node_modules/.bin/tslint", ["-c", configFileName, "-f", tsfileName]);

	var stdout = '';
	process.stdout.on('data', (data:any) => {
		stdout += data.toString();
	});

	var stderr = '';
	process.stderr.on('data', (data:any) => {
		stderr += data.toString();
	});

	return new Promise((resolve, reject)=> {
		process.on("exit", (code:number) => {
			var success = !code; // 0 - exit with success
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
	var fixtureDir = "./test/fixture";
	var expectedDir = "./test/expected";

	describe("processFiles function", () => {
		var fileNames = collectFileName(fixtureDir);
		fileNames
			.filter(fileName=> /\.ts$/.test(fileName))
			.forEach(fileName=> {
				var ignoreList = [
					"./test/fixture/editorconfig/space/main.ts", // TypeScript ignore indentSize: 8
					"./test/fixture/tsfmt/a/main.ts", // TypeScript ignore indentSize: 1
					"./test/fixture/tslint/indent/main.ts" // TypeScript ignore indentSize: 6
				];
				if (ignoreList.indexOf(fileName) !== -1) {
					it.skip(fileName, ()=> {
						false;
					});
					return;
				}
				it(fileName, () => {
					return lib
						.processFiles([fileName], {
							dryRun: true,
							replace: false,
							tslint: true,
							editorconfig: true,
							tsfmt: true
						})
						.then(resultMap => {
							var result = resultMap[fileName];
							assert(result !== null);

							var expectedTsFileName = fileName.replace(fixtureDir, expectedDir);
							// console.log(fileName, expectedFileName);

							if (!fs.existsSync(expectedTsFileName)) {
								fs.writeFileSync(expectedTsFileName, result.dest);
							}

							var expected = fs.readFileSync(expectedTsFileName, "utf-8");
							assert(expected === result.dest);

							var expectedOptionsFileName = expectedTsFileName.replace(/\.ts$/, ".json");

							if (!fs.existsSync(expectedOptionsFileName)) {
								fs.writeFileSync(expectedOptionsFileName, JSON.stringify(result.options, null, 2));
							}

							var expectedOptions = JSON.parse(fs.readFileSync(expectedOptionsFileName, "utf-8"));
							assert.deepEqual(expectedOptions, result.options);

							var tslintConfigName = path.dirname(fileName) + "/tslint.json";
							if (!fs.existsSync(tslintConfigName)) {
								return;
							}
							if (fileName === "./test/fixture/tslint/indent/main.ts") {
								// NOTE indent enforces consistent indentation levels (currently disabled).
								return;
							}

							return Promise.all([
								checkByTslint(tslintConfigName, fileName, true),
								checkByTslint(tslintConfigName, expectedTsFileName, false)
							]);
						});
				});
			});
	});


	describe("processStream function", () => {
		var fileName = "test/fixture/default/main.ts";
		it(fileName, () => {
			var input = new stream.Readable();
			input.push(`class Sample{getString():string{return "hi!";}}`);
			input.push(null);
			return lib
				.processStream(fileName, input, {
					dryRun: true,
					replace: false,
					tslint: true,
					editorconfig: true,
					tsfmt: true
				})
				.then(result=> {
					assert(result !== null);
					assert(result.dest === `class Sample { getString(): string { return "hi!"; } }`);
				});
		});
	});
});
