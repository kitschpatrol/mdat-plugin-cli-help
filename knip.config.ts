import { knipConfig } from '@kitschpatrol/knip-config'

export default knipConfig({
	entry: [
		'test/assets/cli.js',
		'test/assets/fixtures/meow-cli.js',
		'test/assets/fixtures/yargs-cli.js',
		'test/assets/fixtures/yargs-wrapped-cli.js',
		'test/assets/fixtures/commander-cli.js',
	],
	ignoreDependencies: [
		'@kitschpatrol/chagent', // Typically invoked through bumpp's --execute argument, which Knip doesn't parse
	],
})
