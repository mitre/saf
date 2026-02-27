import { Command, Flags } from '@oclif/core';

export default class Scan extends Command {
  static readonly aliases = ['scan'];

  static readonly description = 'Visit https://saf.mitre.org/#/validate to explore and run inspec profiles';

  static readonly flags = {
    help: Flags.help({ char: 'h' }),
  };

  async run() {
    console.log('\u001B[93mVisit https://saf.mitre.org/#/validate to explore and run inspec profiles\u001B[0m');
  }
}
