import { mdatConfig } from '@kitschpatrol/mdat-config'
import { expandString } from 'mdat'
import cliHelpPlugin from './src'

const USAGE_EXAMPLE_COMMENT = '<!-- cli-help({ command: "mdat", depth: 1 }) -->'

export default mdatConfig({
	...cliHelpPlugin,
	// Renders the readme's usage example from the installed mdat CLI's actual
	// help output, so the example tracks mdat releases
	async 'usage-example'() {
		const expanded = await expandString(USAGE_EXAMPLE_COMMENT, cliHelpPlugin)
		const fatalMessage = expanded.messages.find((message) => message.fatal)
		if (fatalMessage) {
			throw new Error(`Could not expand the usage example: ${fatalMessage.reason}`)
		}

		return `\`\`\`\`markdown\n${expanded.toString().trim()}\n\`\`\`\``
	},
})
