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
			default: {
				tsconfig: {
					tsconfig: "./tsconfig.json",
					updateFiles:false
				}
			}
		},
		tsconfig: {
			main: {
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
		conventionalChangelog: {
			options: {
				changelogOpts: {
					// conventional-changelog options go here
					preset: "angular"
			 },
			 context: {
					// context goes here
			 },
			 gitRawCommitsOpts: {
					// git-raw-commits options go here
			 },
			 parserOpts: {
					// conventional-commits-parser options go here
			 },
			 writerOpts: {
					// conventional-changelog-writer options go here
			 }
			},
			release: {
				src: "CHANGELOG.md"
			}
		}
	});

	grunt.registerTask(
		'setup',
		['clean:typings', 'dtsm']);

	grunt.registerTask(
		'default',
		['clean:clientScript', 'tsconfig', 'ts', 'tslint']);

	grunt.registerTask(
		'test',
		['default', 'mochaTest']);

	require('load-grunt-tasks')(grunt);
};
