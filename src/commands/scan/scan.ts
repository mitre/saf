import {Command, Flags} from '@oclif/core'

export default class Scan extends Command {
  static aliases = ['scan']

  static description = 'Visit https://saf.mitre.org/#/validate to explore and run inspec profiles'

  static flags = {
    help: Flags.help({char: 'h'}),
  }

  async run() {
    console.log('Visit https://saf.mitre.org/#/validate to explore and run inspec profiles')
  }
}

