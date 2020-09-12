import * as ts from "typescript";

import { createDefaultFormatCodeSettings } from "./utils";

class LanguageServiceHost implements ts.LanguageServiceHost {
    files: ts.MapLike<ts.IScriptSnapshot> = {};
    addFile(fileName: string, text: string) {
        this.files[fileName] = ts.ScriptSnapshot.fromString(text);
    }

    // for ts.LanguageServiceHost

    getCompilationSettings = () => ts.getDefaultCompilerOptions();
    getScriptFileNames = () => Object.keys(this.files);
    getScriptVersion = (_fileName: string) => "0";
    getScriptSnapshot = (fileName: string) => this.files[fileName];
    getCurrentDirectory = () => process.cwd();
    getDefaultLibFileName = (options: ts.CompilerOptions) => ts.getDefaultLibFilePath(options);
}

export function format(fileName: string, text: string, options = createDefaultFormatCodeSettings()) {
    const host = new LanguageServiceHost();
    host.addFile(fileName, text);

    const languageService = ts.createLanguageService(host);
    const edits = languageService.getFormattingEditsForDocument(fileName, options);
    const [lastEnd, result] = edits
        .sort((a, b) => a.span.start - b.span.start)
        .reduce<[number, string]>(
            ([lastEnd, result], edit) =>
                [edit.span.start + edit.span.length, result + text.slice(lastEnd, edit.span.start) + edit.newText],
            [0, ""]);
    return result + text.slice(lastEnd);
}
