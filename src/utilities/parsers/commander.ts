// Regrettable use of any in this file due to untyped data from the Chevrotain parser.

/* eslint-disable ts/no-unsafe-assignment */
/* eslint-disable ts/no-unsafe-argument */
/* eslint-disable ts/no-unsafe-call */
/* eslint-disable ts/no-unsafe-return */
/* eslint-disable ts/no-explicit-any */
/* eslint-disable ts/no-unsafe-member-access */

/* eslint-disable new-cap */
/* eslint-disable ts/naming-convention */

import { createToken, CstParser, Lexer } from 'chevrotain'
import type { Command, Option, Positional, ProgramInfo } from './index'
import { getCommandParts } from './index'

// Lexer ----------------------------------------------------------------------

// Token patterns must not use the `v` flag: Chevrotain's regexp-to-ast library
// can't parse it, which breaks lexer optimizations and line-break detection.
/* eslint-disable require-unicode-regexp */

const flag = createToken({ name: 'flag', pattern: /--[\w-]+/ })
const alias = createToken({ name: 'alias', pattern: /-[A-Z]/i })
const comma = createToken({
	group: Lexer.SKIPPED,
	name: 'comma',
	pattern: /,/,
})
const word = createToken({ name: 'word', pattern: /\S+/ })
const argument = createToken({ name: 'argument', pattern: /<\S+>|\[\S+\]/ })

// Commander uses parenthesized defaults: (default: "value")
// May also contain env info: (default: value, env: VAR_NAME)
const defaultInfoParens = createToken({
	name: 'defaultInfoParens',
	pattern: /\(default:\s.+?\)/,
})

const whitespace = createToken({
	group: Lexer.SKIPPED,
	name: 'whiteSpace',
	pattern: /\s/,
})

// Commander format starts with "Usage: " — skip it and stay in DEFAULT_MODE
const usagePrefix = createToken({
	group: Lexer.SKIPPED,
	name: 'usagePrefix',
	pattern: /Usage:\s/,
})

const startProgramDescription = createToken({
	group: Lexer.SKIPPED,
	name: 'startProgramDescription',
	pattern: /\n\n/,
	push_mode: 'PROGRAM_DESCRIPTION_MODE',
})

const programDescription = createToken({
	name: 'programDescription',
	pattern: /.+/,
})

const endProgramDescription = createToken({
	group: Lexer.SKIPPED,
	name: 'endProgramDescription',
	pattern: /\n\n/,
	pop_mode: true,
})

const startArgumentsSection = createToken({
	name: 'startArgumentsSection',
	pattern: /Arguments:\n/,
	push_mode: 'SECTION_MODE',
})

const startOptionsSection = createToken({
	name: 'startOptionsSection',
	pattern: /Options:\n/,
	push_mode: 'SECTION_MODE',
})

const startCommandsSection = createToken({
	name: 'startCommandsSection',
	pattern: /Commands:\n/,
	push_mode: 'SECTION_MODE',
})

const startRow = createToken({
	name: 'startRow',
	pattern: / {2,}/,
	push_mode: 'ROW_MODE',
})

// Description that stops before (default: ...) or before more tokens — non-terminal
const rowDescription = createToken({
	name: 'rowDescription',
	pattern: / {2}\w.+? {2}/,
})

// Terminal description — consumes rest of line, but stops before (default: ...)
const rowDescriptionTerminal = createToken({
	name: 'rowDescriptionTerminal',
	pattern: / {2}\w[^(\n]+(?=\(default:)| {2}\w.+/,
})

const endRow = createToken({
	group: Lexer.SKIPPED,
	name: 'endRow',
	pattern: /\n/,
	pop_mode: true,
})

const endSection = createToken({
	group: Lexer.SKIPPED,
	name: 'endSection',
	pattern: /\n+/,
	pop_mode: true,
})

/* eslint-enable require-unicode-regexp */

// Create lexer
const lexer = new Lexer({
	defaultMode: 'DEFAULT_MODE',
	modes: {
		DEFAULT_MODE: [
			startArgumentsSection,
			startOptionsSection,
			startCommandsSection,
			usagePrefix,
			startProgramDescription,
			argument,
			word,
			whitespace,
		],
		PROGRAM_DESCRIPTION_MODE: [endProgramDescription, programDescription],
		ROW_MODE: [
			endRow,
			comma,
			defaultInfoParens,
			rowDescription,
			rowDescriptionTerminal,
			flag,
			alias,
			argument,
			word,
			whitespace,
		],
		SECTION_MODE: [startRow, endSection],
	},
})

const allTokens = [
	flag,
	alias,
	comma,
	word,
	argument,
	defaultInfoParens,
	whitespace,
	usagePrefix,
	startProgramDescription,
	programDescription,
	endProgramDescription,
	startArgumentsSection,
	startOptionsSection,
	startCommandsSection,
	startRow,
	rowDescription,
	rowDescriptionTerminal,
	endRow,
	endSection,
]

// Parser ---------------------------------------------------------------------

// Create parser
class CliParser extends CstParser {
	private readonly sectionRow = this.RULE('sectionRow', () => {
		this.CONSUME(startRow)

		this.MANY(() => {
			this.OR([
				{ ALT: () => this.CONSUME(argument) },
				{ ALT: () => this.CONSUME(alias) },
				{ ALT: () => this.CONSUME(flag) },
				{ ALT: () => this.CONSUME(rowDescription, { LABEL: 'description' }) },
				{ ALT: () => this.CONSUME(rowDescriptionTerminal, { LABEL: 'description' }) },
				{ ALT: () => this.CONSUME(defaultInfoParens) },
				{ ALT: () => this.CONSUME(word, { LABEL: 'commandName' }) },
			])
		})
	})

	private readonly argumentsSection = this.RULE('argumentsSection', () => {
		this.CONSUME(startArgumentsSection)
		this.MANY3(() => {
			this.SUBRULE3(this.sectionRow)
		})
	})

	private readonly commandsSection = this.RULE('commandsSection', () => {
		this.CONSUME(startCommandsSection)
		this.MANY1(() => {
			this.SUBRULE1(this.sectionRow)
		})
	})

	private readonly optionsSection = this.RULE('optionsSection', () => {
		this.CONSUME(startOptionsSection)
		this.MANY2(() => {
			this.SUBRULE2(this.sectionRow)
		})
	})

	public programHelp = this.RULE('programHelp', () => {
		this.AT_LEAST_ONE(() => {
			this.CONSUME(word, { LABEL: 'commandName' })
		})
		this.MANY1(() => {
			this.CONSUME(argument)
		})
		this.OPTION(() => {
			this.CONSUME(programDescription, { LABEL: 'description' })
		})
		this.OPTION1(() => {
			this.SUBRULE(this.argumentsSection)
		})
		this.OPTION2(() => {
			this.SUBRULE(this.optionsSection)
		})
		this.OPTION3(() => {
			this.SUBRULE(this.commandsSection)
		})
	})

	constructor() {
		super(allTokens)
		this.performSelfAnalysis()
	}
}

const parser = new CliParser()

// Objectifying Visitor -------------------------------------------------------

class CliHelpToObjectVisitor extends parser.getBaseCstVisitorConstructor() {
	constructor() {
		super()
		this.validateVisitor()
	}

	argumentsSection(context: any): Positional[] {
		return context.sectionRow.map((entry: any) => {
			const row = this.visit(entry)
			// Commander's Arguments: rows use word (commandName label) for the arg name
			return {
				arguments: row.commandName === undefined ? undefined : [row.commandName],
				defaultValue: row.defaultValue,
				description: row.description,
			}
		})
	}

	commandsSection(context: any): Command[] {
		return context.sectionRow.map((entry: any) => this.visit(entry))
	}

	optionsSection(context: any): Option[] {
		return context.sectionRow.map((entry: any) => this.visit(entry))
	}

	programHelp(context: any): ProgramInfo {
		// "commandName" includes everything up to the final command
		const { command: commandName, subcommand: subcommandName } = getCommandParts(
			this.getString(context.commandName),
		)

		return {
			arguments: this.getArray(context.argument),
			commandName,
			commands:
				context.commandsSection === undefined ? undefined : this.visit(context.commandsSection),
			description: this.getString(context.description),
			options:
				context.optionsSection === undefined ? undefined : this.visit(context.optionsSection),
			positionals:
				context.argumentsSection === undefined ? undefined : this.visit(context.argumentsSection),
			subcommandName,
		}
	}

	sectionRow(context: any): Command | Option {
		return {
			aliases: this.getArray(context.alias),
			arguments: this.getArray(context.argument),
			commandName: this.getString(context.commandName),
			defaultValue: this.cleanDefault(this.getString(context.defaultInfoParens)),
			description: this.trimDescription(this.getString(context.description)),
			flags: this.getArray(context.flag),
		}
	}

	// Helpers

	/**
	 * Clean a Commander default value: strip `(default: ...)` wrapper, env info,
	 * and quotes.
	 */
	private cleanDefault(text: string | undefined): string | undefined {
		if (text === undefined) {
			return undefined
		}

		let cleaned = text
			.replaceAll(/^\(default:\s*/gv, '')
			.replaceAll(/\)$/gv, '')
			.trim()

		// Strip env info suffix if present: ", env: VAR_NAME"
		cleaned = cleaned.replaceAll(/,\s*env:\s*\S+$/gv, '').trim()

		// Strip surrounding quotes
		cleaned = cleaned.replaceAll(/^["']|["']$/gv, '')

		return cleaned === '' ? undefined : cleaned
	}

	private getArray(context: any): any[] | undefined {
		if (context === undefined) {
			return undefined
		}

		return context.map((entry: any) => entry.image)
	}

	private getString(context: any): string | undefined {
		if (context === undefined) {
			return undefined
		}

		return context.map((entry: any) => entry.image).join(' ')
	}

	/**
	 * Trim leading/trailing whitespace from description text.
	 */
	private trimDescription(text: string | undefined): string | undefined {
		if (text === undefined) {
			return undefined
		}

		const trimmed = text.trim()
		return trimmed === '' ? undefined : trimmed
	}
}

const visitor = new CliHelpToObjectVisitor()

/**
 * Converts an unstructured help string emitted from a CLI tool built with the
 * `Commander` CLI library and turn it into a structured POJO describing the
 * command.
 */
export function helpStringToObject(helpString: string): ProgramInfo {
	// Commander help output always starts with "Usage:"
	if (!helpString.trimStart().startsWith('Usage:')) {
		throw new Error('Not a Commander-format help string (must start with "Usage:")')
	}

	// Pre-process: unwrap continuation lines before lexing.
	// Commander wraps long descriptions/defaults across multiple lines, indenting
	// continuation lines to align with the description column (4+ spaces).
	const unwrapped = unwrapContinuationLines(helpString)

	// Lex
	const lexingResult = lexer.tokenize(unwrapped)
	if (lexingResult.errors.length > 0) {
		throw new Error(
			`Errors lexing CLI command: ${JSON.stringify(lexingResult.errors, undefined, 2)}`,
		)
	}

	// Parse
	parser.input = lexingResult.tokens
	const cst = parser.programHelp()
	if (parser.errors.length > 0) {
		throw new Error(
			`Errors parsing CLI command help text: ${JSON.stringify(parser.errors, undefined, 2)}`,
		)
	}

	// Visit + Objectify
	let programInfo: ProgramInfo | undefined
	try {
		programInfo = visitor.visit(cst) as ProgramInfo
	} catch (error) {
		if (error instanceof Error) {
			throw new TypeError(`Errors visiting CLI command help text: ${String(error)}`, {
				cause: error,
			})
		}
	}

	if (programInfo === undefined) {
		throw new Error('Could not parse help string')
	}

	// Post-processing: filter out empty commands (e.g. from trailing whitespace in help output)
	// and populate parentCommandName for recursive subcommand support.
	// Commander's commands section omits the parent prefix (just "greet <name>" not
	// "test-cli greet <name>"), so we infer it from the top-level command name.
	if (programInfo.commands) {
		programInfo.commands = programInfo.commands.filter(
			(command) => command.commandName !== undefined || command.description !== undefined,
		)

		// Filter out Commander's built-in "help" command — recursing into it
		// re-outputs the top-level help, causing duplicate content.
		programInfo.commands = programInfo.commands.filter((command) => command.commandName !== 'help')

		for (const command of programInfo.commands) {
			if (
				command.commandName !== undefined &&
				command.commandName !== '' &&
				(command.parentCommandName === undefined || command.parentCommandName === '')
			) {
				command.parentCommandName = programInfo.commandName
			}
		}

		if (programInfo.commands.length === 0) {
			programInfo.commands = undefined
		}
	}

	return programInfo
}

/**
 * Join continuation lines in Commander help output before lexing.
 *
 * Commander wraps long descriptions and default values across multiple lines,
 * indenting continuation lines to align with the description start column
 * (typically 30+ spaces). The lexer's ROW_MODE exits on newline, so we must
 * unwrap these before tokenizing.
 *
 * Detection: a continuation line has 4+ leading spaces and does NOT start a new
 * row (which would be exactly 2 spaces + a non-space character).
 */
const continuationLinePattern = /^ {4,}/v
const newRowPattern = /^ {2}\S/v

function unwrapContinuationLines(helpString: string): string {
	const lines = helpString.split('\n')
	const result: string[] = []

	for (const line of lines) {
		if (
			result.length > 0 &&
			line.length > 0 &&
			continuationLinePattern.test(line) &&
			!newRowPattern.test(line)
		) {
			// Append continuation text to the previous line
			result[result.length - 1] += ' ' + line.trim()
		} else {
			result.push(line)
		}
	}

	return result.join('\n')
}
