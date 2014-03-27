/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/assert/assert.d.ts" />
/// <reference path="../typings/q/Q.d.ts" />

import assert = require("power-assert");
import Q = require("q");

// collision between node.d.ts to typescriptServices
var fs = require("fs");
var path = require("path");
var childProcess = require("child_process");

import lib = require("../lib/lib");

function collectFileName(dirName:string):string[] {
	var fileName:string[] = [];
	fs
		.readdirSync(dirName)
		.forEach(name=> {
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

function checkByTslint(configFileName:string, tsfileName:string, errorExpected:boolean):Q.IPromise<boolean> {
	var d = Q.defer<boolean>();
	var process = childProcess.spawn("./node_modules/.bin/tslint", ["-c", configFileName, "-f", tsfileName]);

	var stdout = '';
	process.stdout.on('data', (data:any) => {
		stdout += data.toString();
	});

	var stderr = '';
	process.stderr.on('data', (data:any) => {
		stderr += data.toString();
	});

	process.on("exit", (code:number) => {
		var success = !code; // 0 - exit with success
		var action:string;
		if (!errorExpected) {
			// expected error
			if (success) {
				action = "resolve";
				d.resolve(true);
			} else {
				action = "reject";
				d.reject(tsfileName + " must be a good code.\n" + stdout);
			}
		} else {
			// expected success
			if (success) {
				action = "reject";
				d.reject(tsfileName + " must be a bad code.");
			} else {
				action = "resolve";
				d.resolve(true);
			}
		}
		// console.log("\n", tsfileName, code, "success=" + success, "errorExpected=" + errorExpected, action, "stdout=" + stdout.length);
	});
	return d.promise;
}

describe("tsfmt test", () => {
	var fixtureDir = "./tests/fixture";
	var expectedDir = "./tests/expected";

	describe("processFiles function", () => {
		var fileNames = collectFileName(fixtureDir);
		fileNames
			.filter(fileName=> /\.ts$/.test(fileName))
			.forEach(fileName=> {
				it(fileName, (done) => {
					var resultMap = lib.processFiles([fileName], {
						dryRun: true,
						replace: false,
						tslint: true,
						editorconfig: true,
						tsfmt: true
					});
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
						done();
						return;
					}
					if (fileName === "./tests/fixture/tslint/indent/main.ts") {
						// NOTE indent enforces consistent indentation levels (currently disabled).
						done();
						return;
					}

					Q.all([
						checkByTslint(tslintConfigName, fileName, true),
						checkByTslint(tslintConfigName, expectedTsFileName, false)
					]).catch(errorMsg=> {
						assert(false, errorMsg);
					}).finally(() => {
						done();
					}).done();
				});
			});
	});
});
