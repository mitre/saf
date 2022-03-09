import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
import {FromHDFToSplunkMapper} from '@mitre/hdf-converters'
import {convertFullPathToFilename} from '../../utils/global'
import fs from 'fs'
import _ from 'lodash'

export default class HDF2Splunk extends BaseCommand {
  static usage = 'hdf2splunk -i, --input=FILE -H, --host -P, --port -p, --protocol -t, --token -i, --index'

  static description = 'Translate and upload a Heimdall Data Format JSON file into a Splunk server via its HTTP Event Collector'

  static flags = {
    ...BaseCommand.flags,
    ..._.omit(BaseCommand.flags, 'output'),
    input: flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    host: flags.string({char: 'H', required: true, description: 'Splunk Host'}),
    port: flags.integer({char: 'P', required: false, default: 8088}),
    protocol: flags.string({char: 'p', required: false, default: 'https'}),
    token: flags.string({char: 't', required: true, description: 'Your HTTP event collector token'}),
    index: flags.string({char: 'I', required: false, description: 'Splunk index to import data into (if none provided then Splunk-default will be used)'}),
  }

  static examples = ['saf convert:hdf2splunk -i rhel7-results.json -H 127.0.0.1 -P 8088 -t YOUR-HEC-TOKEN']

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof HDF2Splunk.flags>

    // Read data
    this.logger.verbose(`Reading HDF file: ${flags.input}`)
    const inputFile = JSON.parse(fs.readFileSync(flags.input, 'utf-8'))

    // Converting file and uploading to Splunk
    this.logger.info('Starting conversion from Splunk to HDF')
    const guid = await new FromHDFToSplunkMapper(inputFile).toSplunk({
      host: flags.host,
      port: flags.port,
      protocol: flags.protocol,
      token: flags.token,
      index: flags.index,
    }, convertFullPathToFilename(flags.input))

    this.logger.info(`Uploaded into splunk successfully, to find this data search for:\n\n\t meta.guid="${guid}"`)
  }
}
