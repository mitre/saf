import BaseCommand, {omitFlags} from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
import {FromHDFToSplunkMapper} from '@mitre/hdf-converters'
import {convertFullPathToFilename} from '../../utils/global'
import fs from 'fs'
import _ from 'lodash'
import {getHDFSummary} from '../../utils/logging'

export default class HDF2Splunk extends BaseCommand {
  static usage = 'hdf2splunk -i, --input=FILE -H, --host -P, --port -p, --protocol -t, --token -i, --index'

  static description = 'Translate and upload a Heimdall Data Format JSON file into a Splunk server via its HTTP Event Collector'

  static flags = {
    ...omitFlags(['output']),
    host: flags.string({char: 'H', required: true, description: 'Splunk Hostname or IP'}),
    port: flags.integer({char: 'P', required: false, description: 'Splunk management port (also known as the Universal Forwarder port)', default: 8089}),
    scheme: flags.string({char: 's', required: false, description: 'HTTP Scheme used for communication with splunk', default: 'https', options: ['http', 'https']}),
    username: flags.string({char: 'u', required: true, description: 'Your Splunk username'}),
    password: flags.string({char: 'p', required: true, description: 'Your Splunk password'}),
    index: flags.string({char: 'I', required: true, description: 'Splunk index to import HDF data into'}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  static examples = ['saf convert:hdf2splunk -i rhel7-results.json -H 127.0.0.1 -u admin -p Valid_password! -I hdf']

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof HDF2Splunk.flags>
    this.logger.warn('Please ensure the necessary configuration changes for your Splunk server have been configured to prevent data loss. See https://github.com/mitre/saf/wiki/Splunk-Configuration')

    // Read data
    this.logger.verbose(`Reading HDF file: ${flags.input}`)
    const inputFile = JSON.parse(fs.readFileSync(flags.input, 'utf-8'))
    this.logger.info(`Input File "${convertFullPathToFilename(flags.input)}": ${getHDFSummary(inputFile)}`)
    const guid = await new FromHDFToSplunkMapper(inputFile, this.logger).toSplunk({
      host: flags.host,
      port: flags.port,
      scheme: flags.scheme as 'http' | 'https',  // Types as defined by flags
      username: flags.username,
      password: flags.password,
      index: flags.index,
      insecure: true, // The Splunk SDK's requestOptions somehow broke on release of the mapper, this will be fixed in mitre/heimdall2#2675
    }, convertFullPathToFilename(flags.input))

    this.logger.info(`Uploaded into splunk successfully, to find this data search for:\n\n\t meta.guid="${guid}"`)
  }
}
