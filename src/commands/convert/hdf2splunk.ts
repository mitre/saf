import {Command, flags} from '@oclif/command'
import {FromHDFToSplunkMapper} from '@mitre/hdf-converters'
import {convertFullPathToFilename} from '../../utils/global'
import fs from 'fs'

export default class HDF2Splunk extends Command {
  static usage = 'hdf2splunk -i, --input=FILE -H, --host -P, --port -p, --protocol -t, --token -i, --index'

  static description = 'Translate and upload a Heimdall Data Format JSON file into a Splunk server via its HTTP Event Collector'

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF file'}),
    host: flags.string({char: 'H', required: true, description: 'Splunk Hostname or IP'}),
    port: flags.integer({char: 'P', required: false, description: 'Splunk management port (also known as the Universal Forwarder port)', default: 8089}),
    scheme: flags.string({char: 's', required: false, description: 'HTTP Scheme used for communication with splunk', default: 'https', options: ['http', 'https']}),
    username: flags.string({char: 'u', required: true, description: 'Your Splunk username'}),
    password: flags.string({char: 'p', required: true, description: 'Your Splunk password'}),
    index: flags.string({char: 'I', required: true, description: 'Splunk index to import HDF data into'}),
  }

  static examples = ['saf convert:hdf2splunk -i rhel7-results.json -H 127.0.0.1 -u admin -p Valid_password! -I hdf']

  async run() {
    const {flags} = this.parse(HDF2Splunk)
    const inputFile = JSON.parse(fs.readFileSync(flags.input, 'utf-8'))
    const guid = new FromHDFToSplunkMapper(inputFile).toSplunk({
      host: flags.host,
      port: flags.port,
      scheme: flags.scheme as 'http' | 'https',  // Types as defined by flags
      username: flags.username,
      password: flags.password,
      index: flags.index,
      insecure: true, // The Splunk SDK's requestOptions somehow broke on release of the mapper, this will be fixed in mitre/heimdall2#2675
    }, convertFullPathToFilename(flags.input))
  }
}
