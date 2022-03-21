import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {NessusResults as Mapper} from '@mitre/hdf-converters'
import _ from 'lodash'
import {checkSuffix} from '../../utils/global'

export default class Nessus2HDF extends Command {
  static usage = 'convet:nessus2hdf -i, --input=XML -o, --output=OUTPUT'

  static description = "Translate a Nessus XML results file into a Heimdall Data Format JSON file\nThe current iteration maps all plugin families except 'Policy Compliance'\nA separate HDF JSON is generated for each host reported in the Nessus Report."

  static examples = ['saf convert:nessus2hdf -i nessus_results.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Nessus2HDF)

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf-8'))
    const result = converter.toHdf()
    if (Array.isArray(result)) {
      for (const element of result) {
        fs.writeFileSync(`${flags.output.replace(/.json/gi, '')}-${_.get(element, 'platform.target_id')}.json`, JSON.stringify(element))
      }
    } else {
      fs.writeFileSync(`${checkSuffix(flags.output)}`, JSON.stringify(result))
    }
  }
}
