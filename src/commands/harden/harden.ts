import {Command, Flags} from '@oclif/core'

export default class Harden extends Command {
  static aliases = ['harden']

  static description = 'Visit https://saf.mitre.org/#/harden to explore and run hardening scripts'

  static flags = {
    help: Flags.help({char: 'h'}),
  }

  async run() {
    console.log('Visit https://saf.mitre.org/#/harden to explore and run hardening scripts')
  }
}
