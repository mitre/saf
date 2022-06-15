import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ASFFResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import _ from 'lodash'
import path from 'path'

export default class Trivy2HDF extends Command {
  static usage = 'convert trivy2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json>'

  static description = 'Translate a Trivy-derived AWS Security Finding Format results from concatenated JSON blobs into a Heimdall Data Format JSON file'

  static examples = ['saf convert trivy2hdf -i trivy-asff.json -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Trivy2HDF)
    // comes as an _asff.json file which is basically the array of findings but without the surrounding object; however, could also be properly formed asff since it depends on the template used
    let input = fs.readFileSync(flags.input, 'utf8').trim()
    if (Array.isArray(JSON.parse(input))) {
      input = `{"Findings": ${fs.readFileSync(flags.input, 'utf8').trim()}}`
    }

    const converter = new Mapper(input)
    const results = converter.toHdf()

    if (Object.keys(results).length > 1) {
      _.forOwn(results, (result, filename) => {
        fs.writeFileSync(
          path.join(flags.output, checkSuffix(filename)),
          JSON.stringify(result),
        )
      })
    } else {
      _.forOwn(results, result => {
        fs.writeFileSync(
          path.join(flags.output),
          JSON.stringify(result),
        )
      })
    }
  }
}

