import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig({
	md: {
		overridesEmbeddedScripts: {
			// The readme's example code imports this package by name, which only
			// resolves once dist has been built
			'import/no-unresolved': ['error', { ignore: ['^mdat-plugin-cli-help$'] }],
		},
	},
	ts: {
		overrides: {
			'depend/ban-dependencies': [
				'error',
				{
					allowed: ['execa', 'read-pkg'],
				},
			],
			// Conflicts with perfectionist...
			'ts/member-ordering': 'off',
			// 'ts/no-unsafe-type-assertion': 'off',
		},
	},
	type: 'lib',
})
