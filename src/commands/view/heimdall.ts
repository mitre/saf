import {Command, flags} from '@oclif/command'
// eslint-disable-next-line node/no-extraneous-import
import {getInstalledPathSync} from 'get-installed-path'
import express from 'express'
import fs from 'fs'
import path from 'path'

export default class Heimdall extends Command {
  static aliases = ['heimdall']

  static usage = 'view:heimdall -p, --port=PORT'

  static description = 'Run an instance of Heimdall Lite to visualize your Data'

  static flags = {
    help: flags.help({char: 'h'}),
    port: flags.integer({char: 'p', required: false, default: 3000}),
    file: flags.string({char: 'f', required: false, multiple: true, hidden: true}), // Hidden until supported in Heimdall
  }

  async run() {
    const {flags} = this.parse(Heimdall)
    let parsedJSONs: Record<string, any>[] = []

    // Is the defined port valid?
    if (Number.isNaN(flags.port) || flags.port < 1 || flags.port >= 65536) {
      console.error(`Error: ${flags.port} is not a valid port.`)
      return
    }

    // If we were passed a file, does it exist? Can it convert to JSON correctly?
    if (flags.file && flags.file.length > 0) {
      if (!flags.file.every(file => fs.statSync(file).isFile())) {
        console.log('An option passed as a file was not a file')
        return
      }
      parsedJSONs = flags.file.map(file => {
        return {filename: file, data: JSON.parse(fs.readFileSync(file, 'utf-8'))}
      })
    }

    // Provide Heimdall with a path to grab our Data from
    const predefinedLoadJSON = (req: Record<string, any>, res: Record<string, any>, next: () => void) => {
      if (req.originalUrl.toLowerCase() === '/dynamic/predefinedload.json' && flags.file) {
        return res.json(parsedJSONs)
      }
      next()
    }

    flags.file ? console.log(`Serving Heimdall at http://localhost:${flags.port}/?predefinedLoad=true`) : console.log(`Serving Heimdall at http://localhost:${flags.port}`)
    let installedPath = ''
    try {
      installedPath = getInstalledPathSync('@mitre/saf')
    } catch {
      installedPath = '.'
    }

    express()
    .use(predefinedLoadJSON)
    .use(express.static(path.join(installedPath, 'node_modules/@mitre/heimdall-lite/dist')))
    .listen(flags.port)
  }
}
