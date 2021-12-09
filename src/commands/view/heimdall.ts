import {Command, flags} from '@oclif/command'
import express from 'express'
import path from 'path'

export default class Heimdall extends Command {
  static usage = 'view -p, --port=PORT'

  static description = 'Run an instance of Heimdall Lite to visualize your Data'

  static flags = {
    help: flags.help({char: 'h'}),
    port: flags.integer({char: 'p', required: false, default: 3000}),
  }

  async run() {
    const {flags} = this.parse(Heimdall)
    console.log(`Serving Heimdall on port ${flags.port}`)
    if (Number.isNaN(flags.port) || flags.port < 1 || flags.port >= 65536) {
      console.error(`Error: ${process.argv[2]} is not a valid port.`)
      return
    }
    express()
    .use(express.static(path.join('./node_modules/@mitre/heimdall-lite/dist')))
    .listen(flags.port)
  }
}
