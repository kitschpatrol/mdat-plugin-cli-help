<!-- title -->

# mdat-plugin-cli-help

<!-- /title -->

<!-- badges -->

[![NPM Package mdat-plugin-cli-help](https://img.shields.io/npm/v/mdat-plugin-cli-help.svg)](https://www.npmjs.com/package/mdat-plugin-cli-help)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit)
[![CI](https://github.com/kitschpatrol/mdat-plugin-cli-help/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/mdat-plugin-cli-help/actions/workflows/ci.yml)

<!-- /badges -->

<!-- short-description -->

**Mdat plugin to generate tabular help documentation for CLI tools in Markdown files.**

<!-- /short-description -->

## Overview

_**This is a plugin for the [mdat CLI tool](https://github.com/kitschpatrol/mdat), which is a simple Markdown templating system optimized for embedding dynamic content in repository readmes and the like.**_

This plugin automatically transforms a CLI command's `--help` output into nicely formatted Markdown tables.

The rule also recursively calls `--help` on any subcommands found for inclusion in the output.

Currently, the rule can parse help output in the format provided by [Commander](https://github.com/tj/commander.js)-, [Yargs](https://yargs.js.org)-, and [Meow](https://github.com/sindresorhus/meow)-based tools. If parsing fails, the rule will fall back to show the raw help output in a regular code block instead.

## Getting started

### Dependencies

We'll assume you have [mdat](https://github.com/kitschpatrol/mdat) installed either globally or in your local project.

### Installation

Install the plugin as a development dependency:

```bash
pnpm add -D mdat-plugin-cli-help
```

Register the plugin in your mdat config file, e.g. `mdat.config.ts`:

```ts
import { defineConfig } from 'mdat'
import cliHelp from 'mdat-plugin-cli-help'

export default defineConfig({
  ...cliHelp,
})
```

## Usage

Assuming you have an executable with a `--help` flag on your path or in your project's scope:

```markdown
<!-- cli-help({ command: "mdat", depth: 1 }) -->
```

Then run the `mdat` CLI command on your Markdown file to expand the rule and embed the tabular help output:

<!-- usage-example -->

````markdown
<!-- cli-help({ command: "mdat", depth: 1 }) -->

#### Commands

##### Command: `mdat`

Work with MDAT placeholder comments in Markdown files.

If no command is provided, `mdat expand` is run by default.

Usage:

```txt
mdat [command] [files..] [options]
```

| Positional Argument | Description                                                                                           | Type     |
| ------------------- | ----------------------------------------------------------------------------------------------------- | -------- |
| `files`             | Markdown file(s) with MDAT placeholder comments. If not provided, the closest readme.md file is used. | `string` |

| Command    | Argument                | Description                                                                                                         |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `expand`   | `[files..]` `[options]` | Expand MDAT placeholder comments. If no files are provided, the closest readme.md is expanded. _(Default command.)_ |
| `collapse` | `[files..]` `[options]` | Collapse MDAT placeholder comments. If no files are provided, the closest readme.md is collapsed.                   |
| `strip`    | `[files..]` `[options]` | Strip MDAT comments while preserving expanded content. If no files are provided, the closest readme.md is stripped. |
| `check`    | `[files..]` `[options]` | Check if MDAT placeholder comments are up to date. Exits with code 1 if any files have stale or unexpanded content. |
| `create`   | `[options]`             | Create a new Markdown file from a template.                                                                         |

| Option              | Description                                                                                                                   | Type      | Default                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------- |
| `--verbose`         | Enable verbose logging. All verbose logs are prefixed with their log level and are printed to stderr for ease of redirection. | `boolean` |                                                     |
| `--config`<br>`-c`  | Path(s) to additional mdat configuration files.                                                                               | `array`   |                                                     |
| `--output`<br>`-o`  | Output file directory.                                                                                                        | `string`  | Same directory as input file.                       |
| `--name`<br>`-n`    | Output file name.                                                                                                             | `string`  | Same name as input file. Overwrites the input file. |
| `--print`           | Print the expanded Markdown to stdout instead of saving to a file. Ignores `--output` and `--name` options.                   | `boolean` |                                                     |
| `--format`<br>`-f`  | Format the output with Prettier. Discovers Prettier config from the file path. Requires `prettier` as a peer dependency.      | `boolean` |                                                     |
| `--help`<br>`-h`    | Show help                                                                                                                     | `boolean` |                                                     |
| `--version`<br>`-v` | Show version number                                                                                                           | `boolean` |                                                     |

<!-- /cli-help -->
````

<!-- /usage-example -->

To generate help for a specific subcommand, pass `subcommand`. Whitespace-separated for nested paths:

```markdown
<!-- cli-help({ command: "mdat", subcommand: "check" }) -->
```

This invokes `mdat check --help`. Discovered sub-subcommands are appended to this path during recursion.

By default, the rule detects the help output format by trying each supported parser in turn. Pass `parser` to override detection:

```markdown
<!-- cli-help({ command: "mdat", parser: "yargs" }) -->
```

Valid values are `"auto"` (the default), `"commander"`, `"yargs"`, `"meow"`, and `"none"`. Naming a specific parser tries only that parser, and falls back to the raw help output in a code block (with a warning) if it doesn't match. `"none"` skips parsing entirely and always embeds the raw help output, which also means no subcommands are discovered for recursion.

The rule emits its own `#### Commands` section heading, with command and subcommand headings one level below it. The default level suits placement under a level-three "CLI" section, as in mdat's readme template:

```markdown
## Usage

### CLI

<!-- cli-help -->

#### Examples
```

Pass `headingLevel` to move the section heading, and `heading` to change its text:

```markdown
<!-- cli-help({ command: "mdat", headingLevel: 2, heading: "Command line" }) -->
```

Pass `heading: false` to leave the section heading out, which is what you want when you've written your own heading above the placeholder, or when several placeholders share one section:

```markdown
#### Commands

<!-- cli-help({ command: "mdat", subcommand: "expand", heading: false }) -->

<!-- cli-help({ command: "mdat", subcommand: "check", heading: false }) -->
```

Command and subcommand headings stay one level below `headingLevel` whether or not the section heading is shown.

The command is also aliased under the `<!-- cli -->` keyword.

This would have equivalent output to the above:

```markdown
<!-- cli({ command: "mdat", depth: 1 }) -->
```

If you embed the rule without any arguments, it will look for the binary file listed in the closest `package.json` file and run it with `--help`. This is what you want if you're documenting a package's CLI options in its readme.md file:

```markdown
<!-- cli-help -->
```

### Supported CLI frameworks

#### [Yargs](https://yargs.js.org)

Fully supported, including options, commands, positionals, choices, defaults, and type annotations.

The parser handles line-wrapped output by unwrapping continuation lines before parsing. However, when Yargs wraps command _arguments_ onto new lines at very narrow terminal widths (e.g. below \~70 columns), those wrapped argument lines are indistinguishable from new command rows and cannot be reliably unwrapped. In practice, this is rare.

For the most reliable parsing if you control the upstream project, configure your Yargs CLI to disable wrapping:

```ts
yargs(process.argv).wrap(process.stdout.isTTY ? Math.min(120, yargs.terminalWidth()) : 0)
```

This outputs unwrapped help text when piped, while preserving normal wrapping for interactive use.

#### [Commander](https://github.com/tj/commander.js)

Fully supported, including options, commands, arguments (positionals), and parenthesized defaults with optional environment variable annotations (e.g. `(default: "value", env: MY_VAR)`).

The parser handles line-wrapped output by unwrapping continuation lines before parsing. Commander's built-in `help` command is automatically filtered from subcommand recursion to avoid duplicate output.

#### [Meow](https://github.com/sindresorhus/meow)

Should be fully supported or nearly so.

## Development notes

Parsing arbitrary `--help` output is a bit tricky.

You're right to think that an LLM could make quick work of this kind of "fuzzy text to structured data" transcription. However, when this tool was originally developed in 2024, testing a language model approach yielded sub-par results, so I pursued a traditional lexer/parser approach instead. There is also the logistical overhead of providing a smart-enough model both locally and in CI, where this tool frequently runs; it's technically feasible, but unpleasant. While the current hand-tuned parsers are admittedly a brittle tangle, future versions may revisit the LLM approach.

In terms of prior art, the [jc](https://github.com/kellyjonbrazil/jc) project stands out as a heroic collection of CLI-tool output parsers, but does not currently implement help output parsing. It might be interesting to try to contribute mdat's help parsing implementations to jc.

Currently, the parser implementation lives in this repository because I really only use it in the context of my CLI tool readme files. In theory, it really belongs in a separate package.

## Maintainers

[kitschpatrol](https://github.com/kitschpatrol)

<!-- contributing -->

## Contributing

[Issues](https://github.com/kitschpatrol/mdat-plugin-cli-help/issues) are welcome and appreciated.

Please open an issue to discuss changes before submitting a pull request. Unsolicited PRs (especially AI-generated ones) are unlikely to be merged.

This repository uses [@kitschpatrol/shared-config](https://github.com/kitschpatrol/shared-config) (via its `ksc` CLI) for linting and formatting, plus [MDAT](https://github.com/kitschpatrol/mdat) for readme placeholder expansion.

<!-- /contributing -->

<!-- license -->

## License

[MIT](license.txt) © [Eric Mika](https://ericmika.com)

<!-- /license -->
