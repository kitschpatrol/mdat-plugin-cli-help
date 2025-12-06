import path from 'node:path'
import { log } from 'remark-mdat'
import which from 'which'
import { getPackageJson } from './get-package-json'
import { isExecutable } from './is-executable'

/**
 * Accommodate missing or sloppy cli help command input
 * @param cliCommand - Can be nothing, a command name on the path like `git`, or a path to an executable like `./bin/cli.js`
 * @returns The path to a verified executable
 * @throws {Error} If nothing can be inferred or resolved
 */
export async function inferCommand(cliCommand: string | undefined): Promise<string> {
	cliCommand ??= await getFirstBinFromPackage()
	return ensureExecutable(cliCommand)
}

async function getFirstBinFromPackage(): Promise<string> {
	// See if there's a command defined in the package.json
	const { packageJson, packagePath } = await getPackageJson()
	const packageDirectory = path.dirname(packagePath)

	if (packageJson.bin) {
		const binPath =
			typeof packageJson.bin === 'string'
				? path.resolve(packageDirectory, packageJson.bin)
				: path.resolve(packageDirectory, String(Object.values(packageJson.bin).at(0)))

		if (looksLikePath(binPath)) {
			log.info(`Inferred <!-- cli-help --> command to run from package.json: ${binPath}`)
			return binPath
		}
	}

	throw new Error(
		`Could not infer which command to run for the <!-- cli-help --> rule. Please pass a "cliCommand" option to the expansion comment, e.g. <!-- cli-help {cliCommand: './dist/bin.js'} -->`,
	)
}

function looksLikePath(maybePath: string): boolean {
	const parsed = path.parse(maybePath)
	return parsed.root !== '' || parsed.dir !== ''
}

async function ensureExecutable(filePath: string): Promise<string> {
	// In case a something on the path is passed
	// `which` returns null, but we convert that to undefined
	let resolvedPath: string | undefined = path.isAbsolute(filePath)
		? filePath
		: ((await which(filePath, { nothrow: true })) ?? undefined)

	// Check package.json for a package-local path if it's not on the path
	resolvedPath ??= (await getCommandPathFromPackage(filePath)) ?? undefined

	if (resolvedPath !== undefined && (await isExecutable(resolvedPath))) {
		return resolvedPath
	}

	throw new Error(`The cli-help rule noticed that "${resolvedPath}" is not executable.`)
}

// If we pass e.g. 'mdat', but it's not installed globally, we can try to look up
// its local path from package.json
async function getCommandPathFromPackage(commandName: string): Promise<string | undefined> {
	// Redundant package lookup, but it's cached and this is more atomic
	const { packageJson } = await getPackageJson()

	// Check all bin entries and values for a match
	for (const [key, value] of Object.entries(packageJson.bin ?? {})) {
		if (key === commandName) {
			return value
		}
		if (path.normalize(value) === path.normalize(commandName)) {
			return value
		}
	}

	return undefined
}
