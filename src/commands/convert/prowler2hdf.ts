import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ASFFResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import _ from 'lodash'
import path from 'path'

export default class Prowler2HDF extends Command {
  static usage = 'convert prowler2hdf -i <prowler-finding-json> -o <hdf-output-folder>'

  static description = 'Translate a Prowler-derived AWS Security Finding Format results from concatenated JSON blobs into a Heimdall Data Format JSON file'

  static examples = ['saf convert prowler2hdf -i prowler-asff.json -o output-folder']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Prowler ASFF JSON file'}),
    output: Flags.string({char: 'o', required: true, description: 'Output folder'}),
  }

  async run() {
    const {flags} = await this.parse(Prowler2HDF)
    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'))
    const results = converter.toHdf()

    _.forOwn(results, (result, filename) => {
      fs.writeFileSync(
        path.join(flags.output, checkSuffix(filename)),
        JSON.stringify(result),
      )
    })
  }
}

