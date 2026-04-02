/* eslint-disable unicorn/no-array-reduce */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { bench, describe } from 'vitest'
import { helpObjectToMarkdown } from '../src/utilities/help-object-to-markdown'
import { helpStringToObject } from '../src/utilities/help-string-to-object'

const importMetaDirname = path.dirname(fileURLToPath(import.meta.url))

// ---------------------------------------------------------------------------
// Load real-world fixtures
// ---------------------------------------------------------------------------

const helpSamplesSupported = fs
	.readdirSync(`${importMetaDirname}/assets/help-supported`)
	.filter((file) => file.endsWith('.txt'))
	.reduce<Record<string, string>>((acc, file) => {
		const name = path.basename(file, '.txt')
		const content = fs.readFileSync(`${importMetaDirname}/assets/help-supported/${file}`, 'utf8')
		return { ...acc, [name]: content }
	}, {})

// Pre-parse objects for markdown-generation benchmarks
const helpObjectsSupported = Object.fromEntries(
	Object.entries(helpSamplesSupported)
		.map(([name, text]) => {
			const object = helpStringToObject(text)
			return object ? ([name, object] as const) : undefined
		})
		.filter((entry) => entry !== undefined),
)

// ---------------------------------------------------------------------------
// Synthetic fixtures — stress-test with larger inputs
// ---------------------------------------------------------------------------

/** Generate a Yargs-style help string with `n` options and `m` commands. */
function generateYargsHelp(optionCount: number, commandCount: number): string {
	const lines: string[] = ['synth-cli <files..> [options]', '', 'A synthetic CLI for benchmarking.']

	if (commandCount > 0) {
		lines.push('', 'Commands:')
		for (let i = 0; i < commandCount; i++) {
			lines.push(`  synth-cli cmd-${i} <arg>  Run command number ${i}.`)
		}
	}

	lines.push('', 'Options:')
	for (let i = 0; i < optionCount; i++) {
		const flagName = `option-${i.toString().padStart(3, '0')}`
		lines.push(`      --${flagName}  Description for ${flagName}.  [string] [default: value-${i}]`)
	}

	lines.push(
		`  -h, --help     Show help  [boolean]`,
		`  -v, --version  Show version number  [boolean]`,
	)

	return lines.join('\n')
}

const syntheticSmall = generateYargsHelp(10, 3)
const syntheticMedium = generateYargsHelp(50, 10)
const syntheticLarge = generateYargsHelp(200, 30)

const syntheticSmallObject = helpStringToObject(syntheticSmall)!
const syntheticMediumObject = helpStringToObject(syntheticMedium)!
const syntheticLargeObject = helpStringToObject(syntheticLarge)!

// ---------------------------------------------------------------------------
// Benchmarks — parsing (helpStringToObject)
// ---------------------------------------------------------------------------

describe('parse: real-world fixtures', () => {
	for (const [name, helpText] of Object.entries(helpSamplesSupported)) {
		bench(`helpStringToObject — ${name}`, () => {
			helpStringToObject(helpText)
		})
	}
})

describe('parse: synthetic fixtures (scaling)', () => {
	bench('helpStringToObject — 10 opts, 3 cmds', () => {
		helpStringToObject(syntheticSmall)
	})

	bench('helpStringToObject — 50 opts, 10 cmds', () => {
		helpStringToObject(syntheticMedium)
	})

	bench('helpStringToObject — 200 opts, 30 cmds', () => {
		helpStringToObject(syntheticLarge)
	})
})

// ---------------------------------------------------------------------------
// Benchmarks — markdown generation (helpObjectToMarkdown)
// ---------------------------------------------------------------------------

describe('markdown: real-world fixtures', () => {
	for (const [name, object] of Object.entries(helpObjectsSupported)) {
		bench(`helpObjectToMarkdown — ${name}`, () => {
			helpObjectToMarkdown(object)
		})
	}
})

describe('markdown: synthetic fixtures (scaling)', () => {
	bench('helpObjectToMarkdown — 10 opts, 3 cmds', () => {
		helpObjectToMarkdown(syntheticSmallObject)
	})

	bench('helpObjectToMarkdown — 50 opts, 10 cmds', () => {
		helpObjectToMarkdown(syntheticMediumObject)
	})

	bench('helpObjectToMarkdown — 200 opts, 30 cmds', () => {
		helpObjectToMarkdown(syntheticLargeObject)
	})
})

// ---------------------------------------------------------------------------
// Benchmarks — full pipeline (parse + markdown)
// ---------------------------------------------------------------------------

describe('full pipeline: real-world fixtures', () => {
	for (const [name, helpText] of Object.entries(helpSamplesSupported)) {
		bench(`parse + markdown — ${name}`, () => {
			const object = helpStringToObject(helpText)
			if (object) {
				helpObjectToMarkdown(object)
			}
		})
	}
})

describe('full pipeline: synthetic fixtures (scaling)', () => {
	bench('parse + markdown — 10 opts, 3 cmds', () => {
		const object = helpStringToObject(syntheticSmall)
		if (object) helpObjectToMarkdown(object)
	})

	bench('parse + markdown — 50 opts, 10 cmds', () => {
		const object = helpStringToObject(syntheticMedium)
		if (object) helpObjectToMarkdown(object)
	})

	bench('parse + markdown — 200 opts, 30 cmds', () => {
		const object = helpStringToObject(syntheticLarge)
		if (object) helpObjectToMarkdown(object)
	})
})
