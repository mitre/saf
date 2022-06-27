<<<<<<< HEAD
import BaseCommand, {omitFlags} from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
=======
import {Command, Flags} from '@oclif/core'
>>>>>>> main
import {FromHDFToSplunkMapper} from '@mitre/hdf-converters'
import {convertFullPathToFilename} from '../../utils/global'
import fs from 'fs'
import _ from 'lodash'
import {getHDFSummary} from '../../utils/logging'

export default class HDF2Splunk extends BaseCommand {
  static usage = 'hdf2splunk -i, --input=FILE -H, --host -P, --port -p, --protocol -t, --token -i, --index'

  static description = 'Translate and upload a Heimdall Data Format JSON file into a Splunk server'

  static flags = {
<<<<<<< HEAD
    ...omitFlags(['output']),
    host: flags.string({char: 'H', required: true, description: 'Splunk Hostname or IP'}),
    port: flags.integer({char: 'P', required: false, description: 'Splunk management port (also known as the Universal Forwarder port)', default: 8089}),
    scheme: flags.string({char: 's', required: false, description: 'HTTP Scheme used for communication with splunk', default: 'https', options: ['http', 'https']}),
    username: flags.string({char: 'u', required: true, description: 'Your Splunk username'}),
    password: flags.string({char: 'p', required: true, description: 'Your Splunk password'}),
    index: flags.string({char: 'I', required: true, description: 'Splunk index to import HDF data into'}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
=======
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    host: Flags.string({char: 'H', required: true, description: 'Splunk Hostname or IP'}),
    port: Flags.integer({char: 'P', required: false, description: 'Splunk management port (also known as the Universal Forwarder port)', default: 8089}),
    scheme: Flags.string({char: 's', required: false, description: 'HTTP Scheme used for communication with splunk', default: 'https', options: ['http', 'https']}),
    username: Flags.string({char: 'u', required: false, description: 'Your Splunk username', exclusive: ['token']}),
    password: Flags.string({char: 'p', required: false, description: 'Your Splunk password', exclusive: ['token']}),
    token: Flags.string({char: 't', required: false, description: 'Your Splunk API Token', exclusive: ['username', 'password']}),
    index: Flags.string({char: 'I', required: true, description: 'Splunk index to import HDF data into'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
>>>>>>> main
  }

  static examples = ['saf convert hdf2splunk -i rhel7-results.json -H 127.0.0.1 -u admin -p Valid_password! -I hdf', 'saf convert hdf2splunk -i rhel7-results.json -H 127.0.0.1 -t your.splunk.token -I hdf']

  async run() {
<<<<<<< HEAD
    const flags = this.parsedFlags as OutputFlags<typeof HDF2Splunk.flags>
    this.logger.warn('Please ensure the necessary configuration changes for your Splunk server have been configured to prevent data loss. See https://github.com/mitre/saf/wiki/Splunk-Configuration')

    // Read data
    this.logger.verbose(`Reading HDF file: ${flags.input}`)
    const inputFile = JSON.parse(fs.readFileSync(flags.input, 'utf-8'))
    this.logger.info(`Input File "${convertFullPathToFilename(flags.input)}": ${getHDFSummary(inputFile)}`)
    const guid = await new FromHDFToSplunkMapper(inputFile, this.logger).toSplunk({
=======
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
>>>>>>> main
      host: flags.host,
      port: flags.port,
      scheme: flags.scheme as 'http' | 'https',  // Types as defined by flags
      username: flags.username,
      password: flags.password,
      sessionKey: flags.token,
      index: flags.index,
    }, convertFullPathToFilename(flags.input))

    this.logger.info(`Uploaded into splunk successfully, to find this data search for:\n\n\t meta.guid="${guid}"`)
  }
}
