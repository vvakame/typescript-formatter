import * as ts from "typescript";

import * as expand from "glob-expand";

import * as fs from "fs";
import * as path from "path";

export function createDefaultFormatCodeSettings(): ts.FormatCodeSettings {

    return {
        indentSize: 4,
        tabSize: 4,
        indentStyle: ts.IndentStyle.Smart,
        newLineCharacter: "\r\n",
        convertTabsToSpaces: true,
        insertSpaceAfterCommaDelimiter: true,
        insertSpaceAfterSemicolonInForStatements: true,
        insertSpaceBeforeAndAfterBinaryOperators: true,
        insertSpaceAfterKeywordsInControlFlowStatements: true,
        insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
        insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
        placeOpenBraceOnNewLineForFunctions: false,
        placeOpenBraceOnNewLineForControlBlocks: false,
    };
}

export function getConfigFileName(baseDir: string, configFileName: string): string | null {

    let configFilePath = path.resolve(baseDir, configFileName);
    if (fs.existsSync(configFilePath)) {
        return configFilePath;
    }

    if (baseDir.length === path.dirname(baseDir).length) {
        return null;
    }

    return getConfigFileName(path.resolve(baseDir, "../"), configFileName);
}

export function readFilesFromTsconfig(configPath: string): string[] {

    interface TsConfigJSON {
        files?: string[];
        filesGlob?: string[];
        include?: string[];
        exclude?: string[];
    }

    let tsconfigDir = path.dirname(configPath);
    let tsconfig: TsConfigJSON = parseJSON(fs.readFileSync(configPath, "utf-8"));
    if (tsconfig.files && (tsconfig.include || tsconfig.exclude)) {
        return tsconfig.files.concat(tsMatchFiles(tsconfig.exclude || [], tsconfig.include || []));
    } else if (tsconfig.files) {
        let files: string[] = tsconfig.files;
        return files.map(filePath => path.resolve(tsconfigDir, filePath));
    } else if (tsconfig.filesGlob) {
        return expand({ filter: "isFile", cwd: tsconfigDir }, tsconfig.filesGlob);
    } else if (tsconfig.include || tsconfig.exclude) {
        return tsMatchFiles(tsconfig.exclude || [], tsconfig.include || []);
    } else {
        return tsMatchFiles([], []);
    }

    function tsMatchFiles(excludes: string[], includes: string[]) {
        interface TsMatchFiles {
            (path: string, extensions: string[], excludes: string[], includes: string[], useCaseSensitiveFileNames: boolean, currentDirectory: string, getFileSystemEntries: (path: string) => TsFileSystemEntries): string[];
        }
        interface TsFileSystemEntries {
            files: string[];
            directories: string[];
        }

        let f: TsMatchFiles = (ts as any).matchFiles;
        if (!f) {
            throw new Error("ts.matchFiles is not exists. typescript@^2.0.0 required");
        }
        return f(tsconfigDir, [".ts", ".tsx"], excludes, includes, true, tsconfigDir, dirPath => {
            let stat = fs.statSync(dirPath);
            if (stat.isDirectory()) {
                let result: TsFileSystemEntries = { files: [], directories: [] };
                let dirEntries = fs.readdirSync(dirPath);
                dirEntries.forEach(entry => {
                    let stat = fs.statSync(path.join(dirPath, entry));
                    if (stat.isDirectory()) {
                        result.directories.push(entry);
                    } else if (stat.isFile()) {
                        result.files.push(entry);
                    }
                });
                return result;
            }
            return { files: [], directories: [] };
        });
    }
}

export function parseJSON(jsonText: string): any {
    let result = ts.parseConfigFileTextToJson("tmp.json", jsonText);
    if (result.error) {
        throw new Error("JSON parse error");
    }

    return result.config;
}
