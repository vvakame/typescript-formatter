module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		ts: {
			options: {
				compile: true,                 // perform compilation. [true (default) | false]
				comments: false,               // same as !removeComments. [true | false (default)]
				target: 'es5',                 // target javascript language. [es3 (default) | es5]
				module: 'commonjs',            // target javascript module style. [amd (default) | commonjs]
				noImplicitAny: false,
				sourceMap: false,              // generate a source map for every output js file. [true (default) | false]
				sourceRoot: '',                // where to locate TypeScript files. [(default) '' == source ts location]
				mapRoot: '',                   // where to locate .map.js files. [(default) '' == generated js location.]
				declaration: false             // generate a declaration .d.ts file for every output js file. [true | false (default)]
			},
			clientMain: {
				src: ['lib/cli.ts']
			},
			clientTest: {
				src: ['tests/mainTest.ts']
			}
		},
		tslint: {
			options: {
				formatter: "prose",
				configuration: {
					// https://github.com/palantir/tslint#supported-rules
					"rules": {
						"bitwise": true,
						"classname": true,
						"curly": true,
						"debug": false,
						"dupkey": true,
						"eofline": true,
						"eqeqeq": true,
						"evil": true,
						"forin": false, // TODO 解消方法よくわからない
						// "indent": [false, 4], // WebStormのFormatterと相性が悪い
						"labelpos": true,
						"label-undefined": true,
						// "maxlen": [false, 140],
						"noarg": true,
						"noconsole": [false,
							"debug",
							"info",
							"time",
							"timeEnd",
							"trace"
						],
						"noconstruct": true,
						"nounreachable": false, // switch で怒られるので
						"noempty": false, // プロパティアクセス付き引数有りのコンストラクタまで怒られるので
						"oneline": [true,
							"check-open-brace",
							"check-catch",
							"check-else",
							"check-whitespace"
						],
						"quotemark": [true, "double"],
						"radix": false, // 10の基数指定するのめんどいので
						"semicolon": true,
						"sub": true,
						"trailing": true,
						"varname": false, // _hoge とかが許可されなくなるので…
						"whitespace": [false, // WebStormのFormatterと相性が悪い
							"check-branch",
							"check-decl",
							"check-operator",
							"check-separator" ,
							"check-type"
						]
					}
				}
			},
			files: {
				src: [
                    'lib/**/*.ts',
                    '!lib/**/*.d.ts',
                    'tests/**/*.ts',
                    '!tests/**/*.ts' // TODO
                ]
			}
		},
		tsd: {
			client: {
				options: {
					// execute a command
					command: 'reinstall',

					//optional: always get from HEAD
					latest: false,

					// optional: specify config file
					config: './tsd.json'
				}
			}
		},
		espower: {
			test: {
				files: [
					{
						expand: true,        // Enable dynamic expansion.
						cwd: 'tests/',        // Src matches are relative to this path.
						src: ['**/*.js'],    // Actual pattern(s) to match.
						dest: 'testEspowered/',  // Destination path prefix.
						ext: '.js'           // Dest filepaths will have this extension.
					}
				]
			}
		},
		clean: {
			tsd: {
				src: [
					// tsd installed
					"typings/"
				]
			},
			clientScript: {
				src: [
					// client
					'lib/*.js',
					// client test
					'tests/*.js'
				]
			}
		},
		mochaTest: {
			test: {
				options: {
					ui: 'bdd'
				},
				src: [
					'testEspowered/mainTest.js'
				]
			}
		}
	});

	grunt.registerTask(
		'setup',
		['clean:tsd', 'tsd']);

	grunt.registerTask(
		'default',
		['clean:clientScript', 'ts:clientMain', 'tslint']);

	grunt.registerTask(
		'test',
		['clean:clientScript', 'ts', 'tslint', 'espower', 'mochaTest']);

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
};
