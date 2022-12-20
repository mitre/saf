import {Command} from '@oclif/core'
import {name, version} from '@mitre/emass_client/package.json'

export default class EmasserGetVersion extends Command {
  static summary = 'Display the eMASS API specification version the CLI implements.'

  static examples = ['<%= config.bin %> <%= command.id %>']

  async run(): Promise<void> { // skipcq: JS-0116, JS-0105
    console.log('\x1B[93m', name + ': ' + version, '\x1B[0m')
  }
}
