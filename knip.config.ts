import { knipConfig } from '@kitschpatrol/knip-config'

export default knipConfig({
	entry: ['test/assets/cli.js'],
	ignoreDependencies: ['type-fest'],
})
