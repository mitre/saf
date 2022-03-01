import {Command, flags} from '@oclif/command'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import {ASFFResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class ASFF2HDF extends Command {
  static usage = 'convert:asff2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json-folder>'

  static description = 'Translate a AWS Security Finding Format JSON into Heimdall Data Format JSON file(s)'

  static examples = ['saf convert:asff2hdf -i asff-findings.json -o output-folder-name',
    'saf convert:asff2hdf -i asff-findings.json --securityhub <standard-1-json> ... --securityhub <standard-n-json> -o output-folder-name']

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true, description: 'Input ASFF JSON file'}),
    securityhub: flags.string({required: false, multiple: true, description: 'Additional input files to provide context that an ASFF file needs such as the CIS AWS Foundations or AWS Foundational Security Best Practices documents (in ASFF compliant JSON form)'}),
    output: flags.string({char: 'o', required: true, description: 'Output HDF JSON folder'}),
  }

  async run() {
    const {flags} = this.parse(ASFF2HDF)

    let securityhub: string[] | undefined
    if (flags.securityhub) {
      securityhub = flags.securityhub.map(file => fs.readFileSync(file, 'utf-8'))
    }

    const converter = new Mapper(fs.readFileSync(flags.input, 'utf-8'), securityhub)
    const results = converter.toHdf()

    fs.mkdirSync(flags.output)
    _.forOwn(results, (result, filename) => {
      fs.writeFileSync(path.join(flags.output, checkSuffix(filename)), JSON.stringify(result))
    })
  }
}
