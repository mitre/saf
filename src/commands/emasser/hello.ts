import {Command} from '@oclif/core'
import {name, version} from '@mitre/emass_client/package.json'
import os from 'os'

export default class EmasserSayHello extends Command {
  static hidden = true

  async run(): Promise<void> { // skipcq: JS-0116, JS-0105
    try {
      const user = os.userInfo()
      console.log('\x1B[96m', 'Hello ' + user.username + ' - enjoy using ' + name + ' ' + version + '!', '\x1B[0m')
    } catch {
      console.log('\x1B[96m', 'Hello rookie - enjoy using ' + name + ' ' + version + '!', '\x1B[0m')
    }
  }
}
