import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {SnykResults as Mapper} from '@mitre/hdf-converters'
import _ from 'lodash'
import {checkSuffix} from '../../utils/global'

export default class Snyk2HDF extends Command {
  static usage = 'convert snyk2hdf -i, --input=JSON -o, --output=OUTPUT'

  static description = 'Translate a Snyk results JSON file into a Heimdall Data Format JSON file\nA separate HDF JSON is generated for each project reported in the Snyk Report.'

  static examples = ['saf convert snyk2hdf -i snyk_results.json -o output-file-prefix']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Snyk2HDF)
    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'))
    const result = converter.toHdf()
    if (Array.isArray(result)) {
      for (const element of result) {
        fs.writeFileSync(`${flags.output.replace(/.json/gi, '')}-${_.get(element, 'platform.target_id')}.json`, JSON.stringify(element))
      }
    } else {
      fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(result))
    }
  }
}
