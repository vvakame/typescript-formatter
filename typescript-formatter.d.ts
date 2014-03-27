declare module "typescript-formatter" {
    interface IOptions {
        // default false
        dryRun?: boolean;
        // default false
        verbose?: boolean;
        // default false
        replace: boolean;
        // default true
        tslint: boolean;
        // default true
        editorconfig: boolean;
        // default true
        tsfmt: boolean;
    }
    interface IResultMap {
        [fileName: string]: IResult;
    }
    interface IResult {
        fileName: string;
        options: TypeScript.Services.FormatCodeOptions;
        src: string;
        dest: string;
    }

    function processFiles(files: string[], opts: IOptions): IResultMap;

    module TypeScript.Services {
        class EditorOptions {
            public IndentSize: number;
            public TabSize: number;
            public NewLineCharacter: string;
            public ConvertTabsToSpaces: boolean;
            static clone(objectToClone: EditorOptions): EditorOptions;
        }
        class FormatCodeOptions extends EditorOptions {
            public InsertSpaceAfterCommaDelimiter: boolean;
            public InsertSpaceAfterSemicolonInForStatements: boolean;
            public InsertSpaceBeforeAndAfterBinaryOperators: boolean;
            public InsertSpaceAfterKeywordsInControlFlowStatements: boolean;
            public InsertSpaceAfterFunctionKeywordForAnonymousFunctions: boolean;
            public InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: boolean;
            public PlaceOpenBraceOnNewLineForFunctions: boolean;
            public PlaceOpenBraceOnNewLineForControlBlocks: boolean;
            static clone(objectToClone: FormatCodeOptions): FormatCodeOptions;
        }
    }
}
