import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {SnykResults as Mapper} from '@mitre/hdf-converters'
import _ from 'lodash'
import {checkSuffix} from '../../utils/global'

export default class Snyk2HDF extends Command {
  static usage = 'convert:snyk2hdf -i, --input=JSON -o, --output_prefix=OUTPUT_PREFIX'

  static description = 'Translate a Snyk results JSON file into a Heimdall Data Format JSON file\nA separate HDF JSON is generated for each project reported in the Snyk Report.'

  static examples = ['saf convert:snyk2hdf -i snyk_results.json -o output-file-prefix']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output_prefix: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(Snyk2HDF)
    const converter = new Mapper(fs.readFileSync(flags.input, 'utf-8'))
    const result = converter.toHdf()
    if (Array.isArray(result)) {
      for (const element of result) {
        fs.writeFileSync(`${checkSuffix(flags.output_prefix)}-${_.get(element, 'platform.target_id')}.json`, JSON.stringify(element))
      }
    } else {
      fs.writeFileSync(`${checkSuffix(flags.output_prefix)}.json`, JSON.stringify(result))
    }
  }
}
