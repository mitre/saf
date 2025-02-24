import {Hook} from '@oclif/core'

/**
 * Hook that is triggered when an "oclif" command is not found.
 *
 * @param opts - The options object containing the command ID.
 * @param opts.id - The ID of the command that was not found.
 *
 * @returns A promise that logs (outputs) an error message and exits the
 *          process with a status code of 1.
 *
 * @example
 * Invoking a non existing command like:
 *   $ saf emasser puts
 * It will result in oclif calling the command_not_found hook (this hook)
 * because there isn't a puts command, the command is put.
 *
 * However, it the command is:
 *   $ saf emasser puts -h
 * This hook is not called
 */
const commandNotFound: Hook<'command_not_found'> = async (opts: { id: string }) => { // skipcq: JS-0116
  console.error(`\x1B[91m» Command "${opts.id}" not found.\x1B[0m`)
  console.error(`\x1B[93m→ Please use "${opts.id.split(':')[0]} [-h or --help]" to see the list of available commands.\x1B[0m`)
  process.exit(1)
}

export default commandNotFound
