import {SplunkMapper} from '@mitre/hdf-converters/lib/src/splunk-mapper'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import {table} from 'table'

import {createWinstonLogger} from '../../utils/logging'

export default class Splunk2HDF extends Command {
  static description = 'Pull HDF data from your Splunk instance back into an HDF file'

  static examples = ['saf convert splunk2hdf -H 127.0.0.1 -u admin -p Valid_password! -I hdf -i some-file-in-your-splunk-instance.json -i yBNxQsE1mi4f3mkjtpap5YxNTttpeG -o output-folder']

  static flags = {
    help: Flags.help({char: 'h'}),
    host: Flags.string({char: 'H', description: 'Splunk Hostname or IP', required: true}),
    index: Flags.string({char: 'I', description: 'Splunk index to query HDF data from', required: true}),
    input: Flags.string({char: 'i', description: 'GUID(s) or Filename(s) of files from Splunk to convert', multiple: true, required: false}),
    logLevel: Flags.string({char: 'L', default: 'info', options: ['info', 'warn', 'debug', 'verbose'], required: false}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON Folder', required: false}),
    password: Flags.string({char: 'p', description: 'Your Splunk password', exclusive: ['token'], required: false}),
    port: Flags.integer({char: 'P', default: 8089, description: 'Splunk management port (also known as the Universal Forwarder port)', required: false}),
    scheme: Flags.string({char: 's', default: 'https', description: 'HTTP Scheme used for communication with splunk', options: ['http', 'https'], required: false}),
    token: Flags.string({char: 't', description: 'Your Splunk API Token', exclusive: ['username', 'password'], required: false}),
    username: Flags.string({char: 'u', description: 'Your Splunk username', exclusive: ['token'], required: false}),
  }

  static usage = 'splunk2hdf -H <host> -I <index> [-h] [-P <port>] [-s http|https] (-u <username> -p <password> | -t <token>) [-L info|warn|debug|verbose] [-i <filename/GUID>... -o <hdf-output-folder>]'

  async run() {
    const {flags} = await this.parse(Splunk2HDF)
    const logger = createWinstonLogger('splunk2hdf', flags.logLevel)

    if (!(flags.username && flags.password) && !flags.token) {
      logger.error('Please provide either a Username and Password or a Splunk token')
      throw new Error('Please provide either a Username and Password or a Splunk token')
    }

    const mapper = new SplunkMapper({
      host: flags.host,
      index: flags.index,
      password: flags.password,
      port: flags.port,
      scheme: flags.scheme as 'http' | 'https',  // Types as defined by flags
      sessionKey: flags.token,
      username: flags.username,
    }, logger)

    if (flags.input && flags.output) {
      const outputFolder = flags.output?.replace('.json', '') || 'asff-output'
      fs.mkdirSync(outputFolder)
      flags.input.forEach(async (input: string) => {
        // If we have a GUID
        if (/^(\w){30}$/.test(input)) {
          const hdf = await mapper.toHdf(input)
          // Rename example.json -> example-p9dwG2kdSoHsYdyF2dMytUmljgOHD5.json and put into the outputFolder
          fs.writeFileSync(
            path.join(
              outputFolder,
              _.get(hdf, 'meta.filename', '').replace(/\.json$/, '') + _.get(hdf, 'meta.guid') + '.json',
            ),
            JSON.stringify(hdf, null, 2),
          )
        } else {
          // If we have a filename
          const executions = await this.searchExecutions(mapper, input)
          executions.forEach(async execution => {
            const hdf = await mapper.toHdf(_.get(execution, 'meta.guid'))
            fs.writeFileSync(
              path.join(
                outputFolder,
                _.get(hdf, 'meta.filename', '').replace(/\.json$/, '') + _.get(hdf, 'meta.guid') + '.json',
              ),
              JSON.stringify(hdf, null, 2),
            )
          })
        }
      })
    } else if (flags.input && !flags.output) {
      logger.error('Please provide an output HDF folder')
      throw new Error('Please provide an output HDF folder')
    } else {
      const availableExecutionsTable: string[][] = [
        ['File Name', 'GUID', 'Imported At'],
      ]

      const executionsAvailable = await this.searchExecutions(mapper, '*')

      executionsAvailable.forEach(execution => {
        availableExecutionsTable.push([_.get(execution, 'meta.filename') || '', _.get(execution, 'meta.guid') || '', _.get(execution, 'meta.parse_time') || ''])
      })

      if (availableExecutionsTable.length === 1) {
        logger.warn('No executions found in the provided Splunk instance')
      } else {
        console.log('No filename or GUID provided (-i), available executions are:')
        console.log(table(availableExecutionsTable))
      }
    }
  }

  async searchExecutions(mapper: SplunkMapper, filename: string, index?: string) {
    return mapper.queryData(`search index="${index || '*'}" meta.filename="${filename || '*'}" meta.subtype="header" | head 100`)
  }
}
