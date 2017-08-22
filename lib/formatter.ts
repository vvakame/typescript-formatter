import * as ts from "typescript";

import { createDefaultFormatCodeSettings } from "./utils";

class LanguageServiceHost implements ts.LanguageServiceHost {
    files: { [fileName: string]: ts.IScriptSnapshot; } = {};
    addFile(fileName: string, text: string) {
        this.files[fileName] = ts.ScriptSnapshot.fromString(text);
    }

    // for ts.LanguageServiceHost

    getCompilationSettings = () => ts.getDefaultCompilerOptions();
    getScriptFileNames = () => Object.keys(this.files);
    getScriptVersion = (_fileName: string) => "1";
    getScriptSnapshot = (fileName: string) => this.files[fileName];
    getCurrentDirectory = () => process.cwd();
    getDefaultLibFileName = (_options: ts.CompilerOptions) => "lib";
}

export function format(fileName: string, text: string, options = createDefaultFormatCodeSettings()) {
    const host = new LanguageServiceHost();
    host.addFile(fileName, text);

    const languageService = ts.createLanguageService(host, ts.createDocumentRegistry());
    const edits = languageService.getFormattingEditsForDocument(fileName, options);
    edits
        .sort((a, b) => a.span.start - b.span.start)
        .reverse()
        .forEach(edit => {
            const head = text.slice(0, edit.span.start);
            const tail = text.slice(edit.span.start + edit.span.length);
            text = `${head}${edit.newText}${tail}`;
        });

    return text;
}
