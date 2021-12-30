import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {ASFFMapper as Mapper} from '@mitre/hdf-converters'

function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }
  return `${input}.json`
}

export default class ASFFMapper extends Command {
  static usage = 'asff -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json>'

  static description = 'Translate a AWS Security Finding Format JSON into a Heimdall Data Format JSON file'

  static examples = ['saf convert:asff -i asff-findings.json -o output-file-name.json',
    'saf convert:asff -i asff-findings.json --sh <standard-1-json> ... <standard-n-json> -o output-hdf-name.json']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    securityhub: flags.string({required: false, multiple: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(ASFFMapper)
    let securityhub
    if (flags.securityhub) {
      securityhub = flags.securityhub.map(file => fs.readFileSync(file, {encoding: 'utf-8'}))
    }
    const converter = new Mapper(fs.readFileSync(flags.input, {encoding: 'utf-8'}), securityhub)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
