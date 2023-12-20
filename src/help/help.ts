import _ from 'lodash'
/* eslint-disable unicorn/import-style */
import * as util from 'util' // skipcq: JS-C1003 - util does not expose itself as an ES Module.
/* eslint-enable unicorn/import-style */
import {Command, Help} from '@oclif/core'

/*
  Override the showCommandHelp (called directly for single-command CLIs) method defined in the oclif Help class.
  This is done to modify how the arguments are displayed (uppercase), which obscures how to use
  the arguments, as some are named in lowercase or camelCase format. The override method implemented here only affects help
  calls for commands that provide arguments.

  To prevent this override from being used, remove the filepath of this help class in oclif's config in package.json.
  The help is defined in the package.json "oclif" section:
    "oclif": {
      "helpClass": "./lib/help/help"
      ...
    }

  How does it work:
    1 - When the showCommandHelp is called, we store the arguments (if provided) into a Map object with key
        of the argument name in uppercase and the value as the argument name in its natural format.
    2 - Next, we call a modified log method with the generated Map object
    3 - The modified log method replaces the formatted ARGUMENTS list with its natural format.

  For additional information, reference the oclif Help Classes (https://oclif.io/docs/help_classes)
*/
export default class MyHelpClass extends Help {
  public async showCommandHelp(command: Command.Loadable): Promise<void> { // skipcq: JS-0116
    const name = command.id
    const depth = name.split(':').length

    const subTopics = this.sortedTopics.filter(t => t.name.startsWith(name + ':') && t.name.split(':').length === depth + 1)
    const subCommands = this.sortedCommands.filter(c => c.id.startsWith(name + ':') && c.id.split(':').length === depth + 1)

    const summary = this.summary(command)
    if (summary) {
      this.log(summary + '\n')
    }

    const hasArgs = _.has(command.args, 'name')
    if (hasArgs) {
      const argNamesMap = new Map<string, string>()
      _.forOwn(command.args, function (value, key) { // skipcq: JS-0241
        if (key !== 'name') {
          const argName = _.get(command.args[key], 'name')
          argNamesMap.set(argName.toUpperCase(), argName)
        }
      })
      this.logModify(argNamesMap, this.formatCommand(command))
    } else {
      this.log(this.formatCommand(command))
    }

    this.log('')

    if (subTopics.length > 0) {
      this.log(this.formatTopics(subTopics))
      this.log('')
    }

    if (subCommands.length > 0) {
      const aliases:string[] = []
      const uniqueSubCommands: Command.Loadable[] = subCommands.filter(p => {
        aliases.push(...p.aliases)
        return !aliases.includes(p.id)
      })
      this.log(this.formatCommands(uniqueSubCommands))
      this.log('')
    }
  }

  protected logModify(argNamesMap: Map<string, string>, ...args: string[]): void {
    // Iterate over the argNamesMap using object destructuring
    // Replace the uppercase values with its natural format value
    for (const [key, value] of argNamesMap) {
      args[0] = args[0].replace(key, value)
    }

    stdout.write(util.format.apply(this, args) + '\n') // skipcq: JS-0357
  }

  protected log(...args: string[]): void {
    stdout.write(util.format.apply(this, args) + '\n') // skipcq: JS-0357
  }
}

/**
 * A wrapper around process.stdout and process.stderr that allows us to mock out the streams for testing.
 */
class Stream {
  public channel: 'stdout' | 'stderr'

  constructor(channel: 'stdout' | 'stderr') {
    this.channel = channel
  }

  public write(data: string): boolean {
    return process[this.channel].write(data)
  }
}
export const stdout = new Stream('stdout')
export const stderr = new Stream('stderr')
