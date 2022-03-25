import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ASFFMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class ASFF2HDF extends Command {
  static usage = 'convert asff2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json>'

  static description = 'Translate a AWS Security Finding Format JSON into a Heimdall Data Format JSON file'

  static examples = ['saf convert asff2hdf -i asff-findings.json -o output-file-name.json',
    'saf convert asff2hdf -i asff-findings.json --sh <standard-1-json> ... <standard-n-json> -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true}),
    securityhub: Flags.string({required: false, multiple: true}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(ASFF2HDF)
    let securityhub
    if (flags.securityhub) {
      securityhub = flags.securityhub.map(file => fs.readFileSync(file, 'utf-8'))
    }

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf-8'), securityhub)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
