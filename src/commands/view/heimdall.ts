import {Command, flags} from '@oclif/command'
// eslint-disable-next-line node/no-extraneous-import
import {getInstalledPathSync} from 'get-installed-path'
import express from 'express'
import fs from 'fs'
import path from 'path'
import open from 'open'

export default class Heimdall extends Command {
  static aliases = ['heimdall']

  static usage = 'view:heimdall -p, --port=PORT <filename>'

  static description = 'Run an instance of Heimdall Lite to visualize your Data'

  static flags = {
    help: flags.help({char: 'h'}),
    port: flags.integer({char: 'p', required: false, default: 3000}),
    files: flags.string({char: 'f', required: false, multiple: true}),
    noOpenBrowser: flags.boolean({char: 'n', required: false, default: false})
  }

  async run() {
    const {flags, args} = this.parse(Heimdall)
    let parsedJSONs: Record<string, any>[] = []

    // Is the defined port valid?
    if (Number.isNaN(flags.port) || flags.port < 1 || flags.port >= 65536) {
      console.error(`Error: ${flags.port} is not a valid port.`)
      return
    }

    // If we were passed a file, does it exist? Can it convert to JSON correctly?
    if (flags.files && flags.files.length > 0) {
      if (!flags.files.every(file => fs.statSync(file).isFile())) {
        console.log('An option passed as a file was not a file')
        return
      }
      parsedJSONs = flags.files.map(file => {
        return {filename: path.parse(file).base, data: fs.readFileSync(file, 'utf-8')}
      })
    }

    // Provide Heimdall with a path to grab our Data from
    const predefinedLoadJSON = (req: Record<string, any>, res: Record<string, any>, next: () => void) => {
      if (req.originalUrl.toLowerCase() === '/dynamic/predefinedload.json' && flags.files) {
        return res.json(parsedJSONs)
      }
      next()
    }

    flags.files ? console.log(`Serving Heimdall at http://localhost:${flags.port}/?predefinedLoad=true`) : console.log(`Serving Heimdall at http://localhost:${flags.port}`)
    if(!flags.noOpenBrowser) {
      flags.files ? open('http://localhost:3000/?predefinedLoad=true') : open('http://localhost:3000/')
    }
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
