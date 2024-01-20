import {Command, Flags} from '@oclif/core'
import express from 'express'
import fs from 'fs'
import path from 'path'
import {dynamicImport} from 'tsimportlib'
import {getInstalledPath} from '../../utils/global'
import * as http from 'http'

/**
 * The Heimdall class extends the Command class and provides functionality
 * for running an instance of Heimdall Lite to visualize data.
 */
export default class Heimdall extends Command {
  /**
   * The aliases for the command.
   */
  static aliases = ['heimdall']

  /**
   * The usage string for the command.
   */
  static usage = 'view heimdall [-h] [-p <port>] [-f <file>] [-n]'

  /**
   * The description of the command.
   */
  static description = 'Run an instance of Heimdall Lite to visualize your data'

  /**
   * Examples of how to use the command.
   */
  static examples = ['saf view heimdall -p 8080']

  /**
   * The flags that can be used with the command.
   */
  static flags = {
    help: Flags.help({char: 'h'}),
    port: Flags.integer({char: 'p', required: false, default: 3000, description: 'Port To Expose Heimdall On (Default 3000)'}),
    files: Flags.string({char: 'f', required: false, multiple: true, description: 'File(s) to display in Heimdall'}),
    noOpenBrowser: Flags.boolean({char: 'n', required: false, default: false, description: 'Do not open the default browser automatically'}),
  }

  async run() {
    const open = await this.getOpenFunction()
    const {flags} = await this.parse(Heimdall)

    if (!this.isPortValid(flags.port)) {
      console.error(`Error: ${flags.port} is not a valid port.`)
      return
    }

    let parsedJSONs: Record<string, any>[] = []
    if (flags.files && flags.files.length > 0) {
      const fileReadResult = this.readFiles(flags.files)
      if (fileReadResult.error) {
        console.log(fileReadResult.error)
        return
      }

      // Initialize parsedJSONs as an empty array if fileReadResult.parsedJSONs is undefined
      parsedJSONs = fileReadResult.parsedJSONs || []
    }

    // Pass an empty array if flags.files is undefined
    const predefinedLoadJSON = this.getPredefinedLoadJSONFunction(flags.files || [], parsedJSONs)

    this.logServerAddress(flags)
    this.openBrowser(flags, open)
    this.startServer(flags.port, predefinedLoadJSON)
  }

  /**
   * Dynamically imports the 'open' module and returns the default export.
   * @returns The default export of the 'open' module, or null if the import fails.
   * @throws {Error} When the 'open' module fails to import.
   */
  private async getOpenFunction() {
    try {
      // eslint-disable-next-line unicorn/prefer-module
      const openDynamicImport = await dynamicImport('open', {filename: __filename})
      return openDynamicImport.default
    } catch (error) {
      console.error(`Failed to import 'open' module: ${error}`)
      return null
    }
  }

  /**
   * Checks if the provided port is a valid number between 1 and 65535.
   * @param port The port number to validate.
   * @returns True if the port is valid, false otherwise.
   */
  private isPortValid(port: number) {
    return !(Number.isNaN(port) || port < 1 || port >= 65536)
  }

  /**
   * Reads the provided files and returns their contents as an array of objects.
   * Each object contains the filename and the file data.
   * @param files The files to read.
   * @returns An object containing an array of parsed JSONs if successful, or an error message if not.
   */
  private readFiles(files: string[]) {
    if (!files.every((file: string) => fs.statSync(file).isFile())) {
      return {error: 'An option passed as a file was not a file'}
    }

    const parsedJSONs = files.map((file: string) => {
      return {filename: path.parse(file).base, data: fs.readFileSync(file, 'utf8')}
    })

    return {parsedJSONs}
  }

  /**
   * Returns a middleware function for Express that serves a predefined JSON file.
   * @param files The files to serve.
   * @param parsedJSONs The parsed JSON data to serve.
   * @returns An Express middleware function.
   */
  private getPredefinedLoadJSONFunction(files: string[], parsedJSONs: Record<string, any>[]) {
    return (req: Record<string, any>, res: Record<string, any>, next: () => void) => {
      if (req.originalUrl.toLowerCase() === '/dynamic/predefinedload.json') {
        return res.json(parsedJSONs)
      }

      next()
    }
  }

  /**
   * Logs the server address to the console.
   * @param flags The command flags.
   * @returns void
   */
  private logServerAddress(flags: any): void {
    const address = `Serving Heimdall at http://localhost:${flags.port}${flags.files ? '/?predefinedLoad=true' : ''}`
    console.log(address)
  }

  /**
   * Opens the server URL in the default browser, unless the noOpenBrowser flag is set.
   * @param flags The command flags.
   * @param open The function to open the URL.
   * @returns void
   */
  private openBrowser(flags: any, open: any): void {
    if (!flags.noOpenBrowser) {
      const url = `http://localhost:${flags.port}${flags.files ? '/?predefinedLoad=true' : ''}`
      open(url)
    }
  }

  /**
   * Starts the Express server on the specified port.
   * @param port The port to start the server on.
   * @param predefinedLoadJSON The middleware function to serve the predefined JSON file.
   * @returns void
   */
  private startServer(port: number, predefinedLoadJSON: any): http.Server {
    const install_base = getInstalledPath('@mitre/saf')
    const server = express()
      .use(predefinedLoadJSON)
      .use(express.static(path.join(install_base, 'node_modules/@mitre/heimdall-lite/dist')))
      .use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err.stack)
        res.status(500).send('Something broke!')
      })
      .listen(port)

    return server
  }
}
