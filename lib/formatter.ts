import * as ts from "typescript";
import { createDefaultFormatCodeSettings } from "./utils";

// from https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API#pretty-printer-using-the-ls-formatter

// Note: this uses ts.formatting which is part of the typescript 1.4 package but is not currently
//       exposed in the public typescript.d.ts. The typings should be exposed in the next release.
export default function format(fileName: string, text: string, options = createDefaultFormatCodeSettings()) {

    // Parse the source text
    let sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);

    // Get the formatting edits on the input sources
    let edits = (ts as any).formatting.formatDocument(sourceFile, getRuleProvider(options), options);

    // Apply the edits on the input code
    return applyEdits(text, edits);

    function getRuleProvider(settings: ts.FormatCodeSettings) {
        // Share this between multiple formatters using the same options.
        // This represents the bulk of the space the formatter uses.
        let ruleProvider = new (ts as any).formatting.RulesProvider();
        ruleProvider.ensureUpToDate(settings);
        return ruleProvider;
    }

    function applyEdits(text: string, edits: ts.TextChange[]): string {
        // Apply edits in reverse on the existing text
        let result = text;
        for (let i = edits.length - 1; i >= 0; i--) {
            let change = edits[i];
            let head = result.slice(0, change.span.start);
            let tail = result.slice(change.span.start + change.span.length);
            result = head + change.newText + tail;
        }
        return result;
    }
}
