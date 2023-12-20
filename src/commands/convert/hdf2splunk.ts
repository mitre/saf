import {FromHDFToSplunkMapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'

import {convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class HDF2Splunk extends Command {
  static description = 'Translate and upload a Heimdall Data Format JSON file into a Splunk server'

  static examples = ['saf convert hdf2splunk -i rhel7-results.json -H 127.0.0.1 -u admin -p Valid_password! -I hdf', 'saf convert hdf2splunk -i rhel7-results.json -H 127.0.0.1 -t your.splunk.token -I hdf']

  static flags = {
    help: Flags.help({char: 'h'}),
    host: Flags.string({char: 'H', description: 'Splunk Hostname or IP', required: true}),
    index: Flags.string({char: 'I', description: 'Splunk index to import HDF data into', required: true}),
    input: Flags.string({char: 'i', description: 'Input HDF file', required: true}),
    logLevel: Flags.string({char: 'L', default: 'info', options: ['info', 'warn', 'debug', 'verbose'], required: false}),
    password: Flags.string({char: 'p', description: 'Your Splunk password', exclusive: ['token'], required: false}),
    port: Flags.integer({char: 'P', default: 8089, description: 'Splunk management port (also known as the Universal Forwarder port)', required: false}),
    scheme: Flags.string({char: 's', default: 'https', description: 'HTTP Scheme used for communication with splunk', options: ['http', 'https'], required: false}),
    token: Flags.string({char: 't', description: 'Your Splunk API Token', exclusive: ['username', 'password'], required: false}),
    username: Flags.string({char: 'u', description: 'Your Splunk username', exclusive: ['token'], required: false}),
  }

  static usage = 'convert hdf2splunk -i <hdf-scan-results-json> -H <host> -I <index> [-h] [-P <port>] [-s http|https] [-u <username> | -t <token>] [-p <password>] [-L info|warn|debug|verbose]'

  async run() {
    const {flags} = await this.parse(HDF2Splunk)
    const logger = createWinstonLogger('hdf2splunk', flags.logLevel)

    if (!(flags.username && flags.password) && !flags.token) {
      logger.error('Please provide either a Username and Password or a Splunk token')
      throw new Error('Please provide either a Username and Password or a Splunk token')
    }

    logger.warn('Please ensure the necessary configuration changes for your Splunk server have been configured to prevent data loss. See https://github.com/mitre/saf/wiki/Splunk-Configuration')
    const inputFile = JSON.parse(fs.readFileSync(flags.input, 'utf8'))
    logger.info(`Input File "${convertFullPathToFilename(flags.input)}": ${getHDFSummary(inputFile)}`)
    await new FromHDFToSplunkMapper(inputFile, logger).toSplunk({
      host: flags.host,
      index: flags.index,
      password: flags.password,
      port: flags.port,
      scheme: flags.scheme as 'http' | 'https',  // Types as defined by flags
      sessionKey: flags.token,
      username: flags.username,
    }, convertFullPathToFilename(flags.input))
  }
}
