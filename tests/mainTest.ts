/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/assert/assert.d.ts" />

import assert = require('power-assert');

// collision between node.d.ts to typescriptServices
var fs = require("fs");

import lib = require("../src/lib");

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

describe("tsfmt test", () => {
	var fixtureDir = "./tests/fixture";
	var expectedDir = "./tests/expected";

	describe("processFiles function", ()=> {
		var fileNames = collectFileName(fixtureDir);
		fileNames
			.filter(fileName=> /\.ts$/.test(fileName))
			.forEach(fileName=> {
				it(fileName, ()=> {
					console.log("test " + fileName);
					var resultMap = lib.processFiles({dryRun: true}, [fileName]);
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
				});
			});
	});
});
