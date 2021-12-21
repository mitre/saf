import {Command, flags} from '@oclif/command'
import express from 'express'
import path from 'path'

export default class Heimdall extends Command {
  static aliases = ['view']

  static usage = 'view -p, --port=PORT'

  static description = 'Run an instance of Heimdall Lite to visualize your Data'

  static flags = {
    help: flags.help({char: 'h'}),
    port: flags.integer({char: 'p', required: false, default: 3000}),
  }

  async run() {
    const {flags} = this.parse(Heimdall)
    if (Number.isNaN(flags.port) || flags.port < 1 || flags.port >= 65536) {
      console.error(`Error: ${flags.port} is not a valid port.`)
      return
    }
    console.log(`Serving Heimdall at http://localhost:${flags.port}`)
    express()
    .use(express.static(path.join('./node_modules/@mitre/heimdall-lite/dist')))
    .listen(flags.port)
  }
}
