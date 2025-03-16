import {Command, Flags} from '@oclif/core'
import express, {Request, Response, NextFunction} from 'express'
import fs from 'fs'
import path from 'path'
import {dynamicImport} from 'tsimportlib'
import {getInstalledPath} from '../../utils/global'

export default class Heimdall extends Command {
  static readonly aliases = ['heimdall']

  static readonly usage = '<%= command.id %> [-h] [-p <port>] [-f <file>] [-n]'

  static readonly description = 'Run an instance of Heimdall Lite to visualize your data'

  static readonly examples = ['<%= config.bin %> <%= command.id %> -p 8080']

  static readonly flags = {
    port: Flags.integer({char: 'p', required: false, default: 3000, description: 'Port To Expose Heimdall On (Default 3000)'}),
    files: Flags.string({char: 'f', required: false, multiple: true, description: 'File(s) to display in Heimdall'}),
    noOpenBrowser: Flags.boolean({char: 'n', required: false, default: false, description: 'Do not open the default browser automatically'}),
  }

  async run() {
    // NOTE: The npm open package is native ESM and no longer provides a CommonJS export
    // The SAF CLI is a CommonJS project and needs to dynamic import the open package
    // Doing a normal dynamic import in typescript doesn't work because typescript will
    // still translate the import into a require.  This library works around that issue
    // by preventing that translation from occurring.
    const openDynamicImport = await dynamicImport('open', module)
    const open = openDynamicImport.default

    const {flags} = await this.parse(Heimdall)
    let parsedJSONs: Record<string, unknown>[] = []

    // Is the defined port valid?
    if (Number.isNaN(flags.port) || flags.port < 1 || flags.port >= 65536) {
      console.error(`Error: ${flags.port} is not a valid port.`)
      return
    }

    // If we were passed a file, does it exist? Can it convert to JSON correctly?
    if (flags.files && flags.files.length > 0) {
      if (!flags.files.every((file: string) => fs.statSync(file).isFile())) {
        console.log('An option passed as a file was not a file')
        return
      }

      parsedJSONs = flags.files.map((file: string) => {
        return {filename: path.parse(file).base, data: fs.readFileSync(file, 'utf8')}
      })
    }

    // Provide Heimdall with a path to grab our Data from
    // (Express expects middleware functions with this specific signature)
    // We explicitly Type the Return Value as void | Response, to preclude
    // TypeScript from inferring a Response<any, Record<string, any>> | undefined
    const predefinedLoadJSON = (req: Request, res: Response, next: NextFunction): void => {
      if (req.originalUrl.toLowerCase() === '/dynamic/predefinedload.json' && flags.files) {
        res.json(parsedJSONs)
        return
      }

      next()
    }

    if (flags.files) {
      console.log(`Serving Heimdall at http://localhost:${flags.port}/?predefinedLoad=true`)
    } else {
      console.log(`Serving Heimdall at http://localhost:${flags.port}`)
    }

    // Open the browser
    if (!flags.noOpenBrowser) {
      if (flags.port && flags.files) {
        open(`http://localhost:${flags.port}/?predefinedLoad=true`)
      } else if (flags.port && !flags.files) {
        open(`http://localhost:${flags.port}/`)
      } else if (!flags.port && flags.files) {
        open('http://localhost:3000/?predefinedLoad=true')
      } else {
        open('http://localhost:3000/')
      }
    }

    const installedPath = getInstalledPath('@mitre/saf')

    express()
      .use(predefinedLoadJSON)
      .use(express.static(path.join(installedPath, 'node_modules/@mitre/heimdall-lite/dist')))
      .listen(flags.port, () => {
        console.log(`Server running on port ${flags.port}`)
      })
  }
}
