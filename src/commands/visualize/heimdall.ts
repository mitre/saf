import {Command, flags} from '@oclif/command'
import express from 'express'
import path from 'path'

export default class Heimdall extends Command {
  static usage = 'visualize -p, --port=PORT'

  static description = 'Run an instance of Heimdall Lite to visualize your Data'

  static flags = {
    help: flags.help({char: 'h'}),
    port: flags.integer({char: 'p', required: false, default: 3000}),
  }

  async run() {
    const {flags} = this.parse(Heimdall)
    // eslint-disable-next-line no-console
    console.log(`Serving Heimdall on port ${flags.port}`)
    express()
    .use(express.static(path.join('./node_modules/@mitre/heimdall-lite/dist')))
    .listen(flags.port)
  }
}
