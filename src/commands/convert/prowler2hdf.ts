import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ASFFResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import _ from 'lodash'
import path from 'path'

export default class Prowler2HDF extends Command {
  static usage = 'convert prowler2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json>'

  static description = 'Translate a Prowler-derived AWS Security Finding Format results from concatenated JSON blobs into a Heimdall Data Format JSON file'

  static examples = ['saf convert prowler2hdf -i prowler-asff.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Prowler2HDF)
    const converter = new Mapper(fs.readFileSync(flags.input, 'utf8'))
    const results = converter.toHdf()

    // Create output folder if not exists
    if (!fs.existsSync(flags.output)) {
      fs.mkdirSync(flags.output)
    }

    _.forOwn(results, (result, filename) => {
      fs.writeFileSync(
        path.join(flags.output, checkSuffix(filename)),
        JSON.stringify(result),
      )
    })
  }
}

