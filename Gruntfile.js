module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		ts: {
			options: {
				compile: true,                 // perform compilation. [true (default) | false]
				comments: true,                // same as !removeComments. [true | false (default)]
				target: 'es5',                 // target javascript language. [es3 (default) | es5]
				module: 'commonjs',            // target javascript module style. [amd (default) | commonjs]
				noImplicitAny: true,
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
				configuration: grunt.file.readJSON("_tslint.json")
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
		dtsm: {
			main: {
				options: {
					config: "dtsm.json"
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
			typings: {
				src: [
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
		['clean:typings', 'dtsm']);

	grunt.registerTask(
		'default',
		['clean:clientScript', 'ts:clientMain', 'tslint']);

	grunt.registerTask(
		'test',
		['clean:clientScript', 'ts', 'tslint', 'espower', 'mochaTest']);

	require('load-grunt-tasks')(grunt);
};
