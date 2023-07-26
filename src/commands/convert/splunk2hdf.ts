import {Command, Flags} from '@oclif/core'
import {SplunkMapper} from '@mitre/hdf-converters/lib/src/splunk-mapper'
import {table} from 'table'
import {createWinstonLogger} from '../../utils/logging'
import _ from 'lodash'
import path from 'path'
import {createFolderIfNotExists, writeFileURI} from '../../utils/io'

export default class Splunk2HDF extends Command {
  static usage = 'splunk2hdf -H <host> -I <index> [-h] [-P <port>] [-s http|https] (-u <username> -p <password> | -t <token>) [-L info|warn|debug|verbose] [-i <filename/GUID> -o <hdf-output-folder>]'

  static description = 'Pull HDF data from your Splunk instance back into an HDF file'

  static flags = {
    help: Flags.help({char: 'h'}),
    host: Flags.string({char: 'H', required: true, description: 'Splunk Hostname or IP'}),
    port: Flags.integer({char: 'P', required: false, description: 'Splunk management port (also known as the Universal Forwarder port)', default: 8089}),
    scheme: Flags.string({char: 's', required: false, description: 'HTTP Scheme used for communication with splunk', default: 'https', options: ['http', 'https']}),
    username: Flags.string({char: 'u', required: false, description: 'Your Splunk username', exclusive: ['token']}),
    password: Flags.string({char: 'p', required: false, description: 'Your Splunk password', exclusive: ['token']}),
    token: Flags.string({char: 't', required: false, description: 'Your Splunk API Token', exclusive: ['username', 'password']}),
    index: Flags.string({char: 'I', required: true, description: 'Splunk index to query HDF data from'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
    input: Flags.string({char: 'i', multiple: true, required: false, description: 'GUID(s) or Filename(s) of files from Splunk to convert'}),
    output: Flags.string({char: 'o', required: false, description: 'Output HDF JSON Folder'}),
  }

  static examples = ['saf convert splunk2hdf -H 127.0.0.1 -u admin -p Valid_password! -I hdf -i some-file-in-your-splunk-instance.json -i yBNxQsE1mi4f3mkjtpap5YxNTttpeG -o output-folder']

  async searchExecutions(mapper: SplunkMapper, filename: string, index?: string) {
    return mapper.queryData(`search index="${index || '*'}" meta.filename="${filename || '*'}" meta.subtype="header" | head 100`)
  }

  async run() {
    const {flags} = await this.parse(Splunk2HDF)
    const logger = createWinstonLogger('splunk2hdf', flags.logLevel)

    if (!(flags.username && flags.password) && !flags.token) {
      logger.error('Please provide either a Username and Password or a Splunk token')
      throw new Error('Please provide either a Username and Password or a Splunk token')
    }

    const mapper = new SplunkMapper({
      host: flags.host,
      port: flags.port,
      scheme: flags.scheme as 'http' | 'https',  // Types as defined by flags
      username: flags.username,
      password: flags.password,
      sessionKey: flags.token,
      index: flags.index,
    }, logger)

    if (flags.input && flags.output) {
      const outputFolder = flags.output?.replace('.json', '') || 'asff-output'
      await createFolderIfNotExists(outputFolder)
      flags.input.forEach(async (input: string) => {
        // If we have a GUID
        if (/^(\w){30}$/.test(input)) {
          const hdf = await mapper.toHdf(input)
          // Rename example.json -> example-p9dwG2kdSoHsYdyF2dMytUmljgOHD5.json and put into the outputFolder
          await writeFileURI(
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
            await writeFileURI(
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
}
