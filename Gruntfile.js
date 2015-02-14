module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		opt: {
			client: {
				"tsMain": "lib",
				"tsTest": "test",

				"jsMainOut": "lib",
				"jsTestOut": "test"
			}
		},

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
				src: ['<%= opt.client.tsMain %>/cli.ts']
			},
			clientTest: {
				src: ['<%= opt.client.tsTest %>/indexSpec.ts']
			}
		},
		tslint: {
			options: {
				configuration: grunt.file.readJSON("_tslint.json")
			},
			files: {
				src: [
					'<%= opt.client.tsMain %>/**/*.ts',
					'!<%= opt.client.tsMain %>/**/*.d.ts',
					'<%= opt.client.tsTest %>/**/*.ts',
					'!<%= opt.client.tsTest %>/**/*.ts' // TODO
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
		clean: {
			typings: {
				src: [
					"typings/"
				]
			},
			clientScript: {
				src: [
					// client
					'<%= opt.client.tsMain %>/*.js',
					'<%= opt.client.tsMain %>/*.js.map',
					// client test
					'<%= opt.client.tsTest %>/*.js',
					'<%= opt.client.tsTest %>/*.js.map'
				]
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					timeout: 20000,
					require: [
						function () {
							require('espower-loader')({
								cwd: process.cwd() + '/' + grunt.config.get("opt.client.jsTestOut"),
								pattern: '**/*.js'
							});
						},
						function () {
							assert = require('power-assert');
						}
					]
				},
				src: [
					'<%= opt.client.jsTestOut %>/**/*Spec.js'
				]
			}
		},
		changelog: {
			options: {
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
		['clean:clientScript', 'ts', 'tslint', 'mochaTest']);

	require('load-grunt-tasks')(grunt);
};
