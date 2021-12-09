import {Command, flags} from '@oclif/command'

export default class Scan extends Command {
  static aliases = ['validate']

  static description = 'Visit https://saf.mitre.org/#/validate to explore and run inspec profiles'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    console.log('Visit https://saf.mitre.org/#/validate to explore and run inspec profiles')
  }
}

