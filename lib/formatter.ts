"use strict";

import * as ts from "typescript";
import { createDefaultFormatCodeOptions } from "./utils";

// from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#pretty-printer-using-the-ls-formatter

// Note: this uses ts.formatting which is part of the typescript 1.4 package but is not currently
//       exposed in the public typescript.d.ts. The typings should be exposed in the next release.
export default function format(fileName: string, text: string, options = createDefaultFormatCodeOptions()) {
    "use strict";

    // Parse the source text
    let sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, (<any>/* backward compat for typescript-1.4.1 */"0"));
    fixupParentReferences(sourceFile);

    // Get the formatting edits on the input sources
    let edits = (<any>ts).formatting.formatDocument(sourceFile, getRuleProvider(options), options);

    // Apply the edits on the input code
    return applyEdits(text, edits);

    function getRuleProvider(options: ts.FormatCodeOptions) {
        // Share this between multiple formatters using the same options.
        // This represents the bulk of the space the formatter uses.
        let ruleProvider = new (<any>ts).formatting.RulesProvider();
        ruleProvider.ensureUpToDate(options);
        return ruleProvider;
    }

    function applyEdits(text: string, edits: ts.TextChange[]): string {
        // Apply edits in reverse on the existing text
        let result = text;
        for (let i = edits.length - 1; i >= 0; i--) {
            let change = edits[i];
            let head: string;
            if (typeof change.span.start === "number") {
                head = result.slice(0, change.span.start);
            } else {
                // backward compat for typescript-1.4.1
                head = result.slice(0, (<any>change.span.start)());
            }
            let tail: string;
            if (typeof change.span.start === "number") {
                tail = result.slice(change.span.start + change.span.length);
            } else {
                // backward compat for typescript-1.4.1
                tail = result.slice((<any>change.span.start)() + (<any>change.span.length)());
            }
            result = head + change.newText + tail;
        }
        return result;
    }
}

function fixupParentReferences(sourceFile: ts.SourceFile) {
    "use strict";

    let parent: ts.Node = sourceFile;

    function walk(n: ts.Node): void {
        n.parent = parent;

        let saveParent = parent;
        parent = n;
        ts.forEachChild(n, walk);
        parent = saveParent;
    }

    ts.forEachChild(sourceFile, walk);
}
