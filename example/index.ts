/// <reference path="../typescript-formatter.d.ts" />

import tsfmt = require("typescript-formatter");

var result = tsfmt.processFiles(["./index.ts"], {
	dryRun: true,
replace: false,
	tslint: true,
editorconfig: true,
	tsfmt: true
});

console.log(result["./index.ts"].dest);
