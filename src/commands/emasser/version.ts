import {name, version} from '@mitre/emass_client/package.json'
import {Command} from '@oclif/core'

export default class EmasserGetVersion extends Command {
  static examples = ['<%= config.bin %> <%= command.id %>']

  static summary = 'Display the eMASS API specification version the CLI implements.'

  async run(): Promise<void> { // skipcq: JS-0116, JS-0105
    console.log('\x1B[93m', name + ': ' + version, '\x1B[0m')
  }
}
