import type { Rules } from 'mdat'
import { z } from 'zod'
import { getHelpMarkdown } from './utilities/get-help-markdown'
import { inferCommand } from './utilities/infer-command'

const cliHelpRule = {
	async content(options?) {
		const validOptions = z
			.object({
				cliCommand: z.string().optional(),
				depth: z.number().optional(),
				helpFlag: z.string().optional(),
			})
			.optional()
			.parse(options)
		const resolvedCommand = await inferCommand(validOptions?.cliCommand)
		return getHelpMarkdown(resolvedCommand, validOptions?.helpFlag, validOptions?.depth)
	},
} satisfies Rules[string]

export default {
	cli: cliHelpRule,
	'cli-help': cliHelpRule,
} satisfies Rules
