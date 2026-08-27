import type { ParserName, ProgramInfo } from './parsers/index'
import { log } from './log'
import parsers from './parsers/index'

/**
 * Tries to parse a help string into an object.
 *
 * By default (`'auto'`), works through a process of trial and error with the
 * available parsers, since there's generally no way to know which framework was
 * used to generate a particular CLI tool without inspecting the output for
 * particular formatting patterns. Pass a specific parser name to try only that
 * parser.
 */
export function helpStringToObject(
	helpString: string,
	parser: 'auto' | ParserName = 'auto',
): ProgramInfo | undefined {
	if (parser !== 'auto') {
		log.debug(`Trying to parse help string with ${parser} parser...`)

		try {
			return parsers[parser](helpString)
		} catch (error) {
			log.warn(
				`Requested parser "${parser}" did not match, falling back to raw help output: ${String(error)}`,
			)
			return undefined
		}
	}

	for (const [parserName, helpStringToObjectFunction] of Object.entries(parsers)) {
		log.debug(`Trying to parse help string with ${parserName} parser...`)

		try {
			return helpStringToObjectFunction(helpString)
		} catch (error) {
			if (error instanceof Error) {
				log.debug(`Parser "${parserName}" did not match: ${String(error)}`)
			}

			// Try next parser
			continue
		}
	}

	log.debug('Could not parse help string with any parser')
	return undefined
}
