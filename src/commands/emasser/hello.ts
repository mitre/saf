import { Command } from '@oclif/core';
import { name, version } from '@mitre/emass_client/package.json';
import os from 'os';

export default class EmasserSayHello extends Command {
  static readonly hidden = true;

  run(): Promise<void> {
    const users = ['rookie', 'greenhorn', 'novice', 'expert', 'oracle', 'maestro'];
    let user = users[Math.floor(Math.random() * 6)];
    try {
      user = os.userInfo().username;
    } finally {
      console.log('\u001B[96m', `Hello ${user} - enjoy using ${name} ${version}!`, '\u001B[0m');
    }
    return Promise.resolve();
  }
}
