import type { Rule } from 'mdat'
import { defineConfig } from 'mdat'
import { z } from 'zod'
import { getHelpMarkdown } from './utilities/get-help-markdown'
import { inferCommand } from './utilities/infer-command'
export { setLogger } from './utilities/log'

const WHITESPACE_REGEX = /\s+/v
const DEFAULT_HEADING = 'Commands'
const DEFAULT_HEADING_LEVEL = 4
const MAX_HEADING_LEVEL = 6

const cliHelpRule: Rule = {
	async content(options?, _context?) {
		const validOptions = z
			.object({
				command: z.string().optional(),
				depth: z.number().optional(),
				heading: z.union([z.boolean(), z.string().trim().min(1)]).optional(),
				headingLevel: z.number().int().min(1).max(MAX_HEADING_LEVEL).optional(),
				helpFlag: z.string().optional(),
				parser: z.enum(['auto', 'commander', 'meow', 'none', 'yargs']).optional(),
				subcommand: z.string().optional(),
			})
			.strict()
			.optional()
			.parse(options)
		const resolvedCommand = await inferCommand(validOptions?.command)
		const subcommands = validOptions?.subcommand?.split(WHITESPACE_REGEX).filter(Boolean) ?? []
		const heading = validOptions?.heading ?? true
		const headingLevel = validOptions?.headingLevel ?? DEFAULT_HEADING_LEVEL

		// Command headings sit one level below the section heading, whether or not
		// the section heading is shown
		const helpMarkdown = await getHelpMarkdown(
			resolvedCommand,
			validOptions?.helpFlag,
			validOptions?.depth,
			subcommands,
			validOptions?.parser,
			Math.min(headingLevel + 1, MAX_HEADING_LEVEL),
		)

		if (heading === false) {
			return helpMarkdown
		}

		const headingText = heading === true ? DEFAULT_HEADING : heading
		return `${'#'.repeat(headingLevel)} ${headingText}\n\n${helpMarkdown}`
	},
}

export default defineConfig({ cli: cliHelpRule, 'cli-help': cliHelpRule })
