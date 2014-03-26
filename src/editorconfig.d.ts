declare module "editorconfig" {
	export module EditorConfig {
		export interface IFileInfo {
			indent_style?: string;
			indent_size?: number;
			tab_width?: number;
			end_of_line?: string;
			charset?: string;
			trim_trailing_whitespace?: string;
			insert_final_newline?: string;
			root?: string;
		}

		export interface IParseOptions {
			/* config file name. default: .editorconfig */
			config: string;
			version: any; // string or Version
		}
	}

	export function parseFromFiles(filepath:string, files:any[], options?:EditorConfig.IParseOptions):EditorConfig.IFileInfo;

	export function parse(filepath:string, options?:EditorConfig.IParseOptions):EditorConfig.IFileInfo;
}
