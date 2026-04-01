import { getContextMetadata } from 'mdat'
import path from 'node:path'
import which from 'which'
import { isExecutable } from './is-executable'
import { log } from './log'

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

function firstOf<T>(value: T | T[] | undefined): T | undefined {
	if (value === undefined) return undefined
	return Array.isArray(value) ? value[0] : value
}

async function getFirstBinFromPackage(): Promise<string> {
	// See if there's a command defined in the package.json

	const { nodePackageJson } = await getContextMetadata()
	const nodePackage = firstOf(nodePackageJson)

	if (nodePackage?.source !== undefined && nodePackage.data.bin !== undefined) {
		const packageDirectory = path.dirname(nodePackage.source)
		const packageBin = nodePackage.data.bin

		const binPath =
			typeof packageBin === 'string'
				? path.resolve(packageDirectory, packageBin)
				: path.resolve(packageDirectory, String(Object.values(packageBin).at(0)))

		if (looksLikePath(binPath)) {
			log.debug(`Inferred <!-- cli-help --> command to run from package.json: ${binPath}`)
			return binPath
		}
	}

	throw new Error(
		`Could not infer which command to run for the <!-- cli-help --> rule. Please pass a "cliCommand" option to the expansion comment, e.g. <!-- cli-help({cliCommand: './dist/bin.js'}) -->`,
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

	const { nodePackageJson } = await getContextMetadata()
	const nodePackage = firstOf(nodePackageJson)
	const binObject = nodePackage?.data.bin

	if (binObject !== undefined && typeof binObject !== 'string') {
		// Check all bin entries and values for a match
		for (const [key, value] of Object.entries(binObject)) {
			if (key === commandName) {
				return value
			}
			if (path.normalize(value) === path.normalize(commandName)) {
				return value
			}
		}
	}

	return undefined
}
