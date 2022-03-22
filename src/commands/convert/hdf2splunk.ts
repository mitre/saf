import {Command, Flags} from '@oclif/core'
import {FromHDFToSplunkMapper} from '@mitre/hdf-converters'
import {convertFullPathToFilename} from '../../utils/global'
import fs from 'fs'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class HDF2Splunk extends Command {
  static usage = 'hdf2splunk -i, --input=FILE -H, --host -P, --port -p, --protocol -t, --token -i, --index'

  static description = 'Translate and upload a Heimdall Data Format JSON file into a Splunk server via its HTTP Event Collector'

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    host: Flags.string({char: 'H', required: true, description: 'Splunk Hostname or IP'}),
    port: Flags.integer({char: 'P', required: false, description: 'Splunk management port (also known as the Universal Forwarder port)', default: 8089}),
    scheme: Flags.string({char: 's', required: false, description: 'HTTP Scheme used for communication with splunk', default: 'https', options: ['http', 'https']}),
    username: Flags.string({char: 'u', required: true, description: 'Your Splunk username'}),
    password: Flags.string({char: 'p', required: true, description: 'Your Splunk password'}),
    token: Flags.string({char: 't', required: true, description: 'Your Splunk API Token'}),
    index: Flags.string({char: 'I', required: true, description: 'Splunk index to import HDF data into'}),
    logLevel: Flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  static examples = ['saf convert:hdf2splunk -i rhel7-results.json -H 127.0.0.1 -u admin -p Valid_password! -I hdf']

  async run() {
    const {flags} = await this.parse(HDF2Splunk)
    const logger = createWinstonLogger('hdf2splunk', flags.logLevel)
    logger.warn('Please ensure the necessary configuration changes for your Splunk server have been configured to prevent data loss. See https://github.com/mitre/saf/wiki/Splunk-Configuration')
    const inputFile = JSON.parse(fs.readFileSync(flags.input, 'utf-8'))
    logger.info(`Input File "${convertFullPathToFilename(flags.input)}": ${getHDFSummary(inputFile)}`)
    new FromHDFToSplunkMapper(inputFile, logger).toSplunk({
      host: flags.host,
      port: flags.port,
      scheme: flags.scheme as 'http' | 'https',  // Types as defined by flags
      username: flags.username,
      password: flags.password,
      sessionKey: flags.token,
      index: flags.index,
    }, convertFullPathToFilename(flags.input))
  }
}
