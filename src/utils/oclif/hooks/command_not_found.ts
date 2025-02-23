import {Hook} from '@oclif/core'

const commandNotFound: Hook<'command_not_found'> = async (opts: { id: string }) => { // skipcq: JS-0116
  console.error(`\x1B[91m» Command "${opts.id}" not found.\x1B[0m`)
  console.error(`\x1B[93m→ Please use "${opts.id.split(':')[0]} [-h or --help]" to see the list of available commands.\x1B[0m`)
  process.exit(1)
}

export default commandNotFound
