# TypeScript Formatter (tsfmt)

A TypeScript code formatter powered by TypeScript Compiler Service.



```bash
$ tsfmt

  Usage: tsfmt [options] <file ...>

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -r, --replace  Replace .ts file
```

## Installation

```npm install -g typescript-formatter```

## Usage

```bash
$ cat sample.ts
class Sample {hello(word="world"){return "Hello, "+word;}}
new Sample().hello("TypeScript");
```

```bash
# basic. read file, output to stdout.
$ tsfmt sample.ts
class Sample { hello(word= "world") { return "Hello, " + word; } }
new Sample().hello("TypeScript");
```

```bash
# replace. read file, and replace file.
$ tsfmt -r sample.ts
replaced sample.ts
$ cat sample.ts
class Sample { hello(word= "world") { return "Hello, " + word; } }
new Sample().hello("TypeScript");
```

## Future plan

* Support read format settings from tslint.json
* Support read format settings from .editorconfig
