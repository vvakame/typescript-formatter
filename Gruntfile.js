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

		exec: {
			tsc: "tsc -p ./"
		},
		tslint: {
			options: {
				configuration: "_tslint.json",
				fix: true
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
		clean: {
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
		'default',
		['clean:clientScript', 'exec:tsc', 'tslint']);

	grunt.registerTask(
		'test',
		['default', 'mochaTest']);

	require('load-grunt-tasks')(grunt);
};
