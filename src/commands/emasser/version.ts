import { Command, Flags } from '@oclif/core'
import { name, version } from '@mitre/emass_client/package.json';

export default class EmasserGetVersion extends Command {
  static flags = {
    help: Flags.help({char: 'h'}),
  }
  async run(): Promise<void> {
   console.log(name+': '+version)
  }
}