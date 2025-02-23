import {Command} from '@oclif/core'
import {name, version} from '@mitre/emass_client/package.json'
import os from 'os'

export default class EmasserSayHello extends Command {
  static hidden = true

  async run(): Promise<void> { // skipcq: JS-0116, JS-0105
    const users = ['rookie', 'greenhorn', 'novice', 'expert', 'oracle', 'maestro']
    let user = users[Math.floor(Math.random() * 6)]
    try {
      user = os.userInfo().username
    } finally {
      console.log('\x1B[96m', `Hello ${user} - enjoy using ${name} ${version} !`, '\x1B[0m')
    }
  }
}
