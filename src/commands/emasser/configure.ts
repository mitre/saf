import {Command, Flags} from '@oclif/core'
import {generateConfig} from '../../utils/emasser/generateConfig'

// https://www.sitepoint.com/javascript-command-line-interface-cli-node-js/
export default class EmasserBuildConfig extends Command {
  static flags = {
    help: Flags.help({char: 'h', description: 'Generate a configuration file (.env) for an eMASS instances'}),
  }

  async run(): Promise<void> { // skipcq: JS-0116, JS-0105
    generateConfig()
  }
}
