/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/power-assert/power-assert.d.ts" />

require("es6-promise").polyfill();

import assert = require("power-assert");

// collision between node.d.ts to typescriptServices
var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");

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
	if (tsfileName === "./test/expected/tslint/a/main.ts") {
		// unknown error inside tslint...
		return Promise.resolve(true);
	}
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
			var action:string;
			if (!errorExpected) {
				// expected error
				if (success) {
					action = "resolve";
					resolve(true);
				} else {
					action = "reject";
					reject(tsfileName + " must be a good code.\n" + stdout);
				}
			} else {
				// expected success
				if (success) {
					action = "reject";
					reject(tsfileName + " must be a bad code.");
				} else {
					action = "resolve";
					resolve(true);
				}
			}
			// console.log("\n", tsfileName, code, "success=" + success, "errorExpected=" + errorExpected, action, "stdout=" + stdout.length);
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
				var _it:(expectation:string, assertion?:(done:MochaDone) => void) => void = it;
				var ignoreList = [
					"./test/fixture/editorconfig/space/main.ts",
					"./test/fixture/tsfmt/a/main.ts",
					"./test/fixture/tslint/indent/main.ts"
				];
				if (ignoreList.indexOf(fileName) !== -1) {
					_it = it.skip;
				}
				_it(fileName, () => {
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
});
