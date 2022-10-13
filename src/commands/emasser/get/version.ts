import { Command } from "@oclif/core";
import { name, version } from '@mitre/emass_client/package.json';

export default class EmasserGetVersion extends Command {
  async run(): Promise<void> {
   console.log(name+': '+version)
  }
}