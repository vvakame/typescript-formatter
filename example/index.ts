import tsfmt = require("typescript-formatter");

tsfmt
.processFiles(["./index.ts"], {
	dryRun: true,
replace: false,
verify: false,
	tslint: true,
editorconfig: true,
	tsfmt: true
})
	.then(result =>{
		console.log(result["./index.ts"].dest);
});
