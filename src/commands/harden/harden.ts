import { Command, Flags } from '@oclif/core';

export default class Harden extends Command {
  static readonly aliases = ['harden'];

  static readonly description = 'Visit https://saf.mitre.org/#/harden to explore and run hardening scripts';

  static readonly flags = {
    help: Flags.help({ char: 'h' }),
  };

  async run() {
    console.log('\u001B[93mVisit https://saf.mitre.org/#/harden to explore and run hardening scripts\u001B[0m');
  }
}
