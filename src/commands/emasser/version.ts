import { Command } from '@oclif/core';
import { name, version } from '@mitre/emass_client/package.json';

export default class EmasserGetVersion extends Command {
  static summary = 'Display the eMASS API specification version the CLI implements.';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  run(): Promise<void> {
    console.log('\u001B[93m', name + ': ' + version, '\u001B[0m');
    return Promise.resolve();
  }
}
