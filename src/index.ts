import { defineConfig } from 'mdat'
import { z } from 'zod'
import { getHelpMarkdown } from './utilities/get-help-markdown'
import { inferCommand } from './utilities/infer-command'
export { setLogger } from './utilities/log'

const WHITESPACE_REGEX = /\s+/

const cliHelpRule = defineConfig({
	cli: {
		async content(options?, _context?) {
			const validOptions = z
				.object({
					command: z.string().optional(),
					depth: z.number().optional(),
					helpFlag: z.string().optional(),
					subcommand: z.string().optional(),
				})
				.strict()
				.optional()
				.parse(options)
			const resolvedCommand = await inferCommand(validOptions?.command)
			const subcommands = validOptions?.subcommand?.split(WHITESPACE_REGEX).filter(Boolean) ?? []
			return getHelpMarkdown(
				resolvedCommand,
				validOptions?.helpFlag,
				validOptions?.depth,
				subcommands,
			)
		},
	},
})

export default defineConfig({ cli: cliHelpRule.cli, 'cli-help': cliHelpRule.cli })
