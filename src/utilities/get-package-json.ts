// More or less vendored from mdat...

import type { NormalizedPackageJson } from 'read-pkg'
import { loadConfig } from 'mdat'
import path from 'node:path'
import { readPackage } from 'read-pkg'
let packageJson: NormalizedPackageJson | undefined

/**
 * Convenience function for rules
 * Load as package json only as needed, memoize
 * Rules could call this themselves, but this is more convenient and efficient
 * @throws {Error} If no package.json is found
 */
export async function getPackageJson(): Promise<NormalizedPackageJson> {
	const { packageFile } = await loadConfig()
	if (packageFile === undefined) {
		throw new Error('No packageFile found or set in config')
	}

	packageJson ??= await readPackage({ cwd: path.dirname(packageFile) })

	return packageJson
}
