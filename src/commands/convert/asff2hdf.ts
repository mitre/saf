import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ASFFResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import _ from 'lodash'
import path from 'path'

export default class ASFF2HDF extends Command {
  static usage =
    'convert asff2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json-folder>';

  static description =
    'Translate a AWS Security Finding Format JSON into a Heimdall Data Format JSON file(s)';

  static examples = [
    'saf convert asff2hdf -i asff-findings.json -o output-folder-name',
    'saf convert asff2hdf -i asff-findings.json --securityhub <standard-1-json> ... --securityhub <standard-n-json> -o output-folder-name',
  ];

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({
      char: 'i',
      required: true,
      description: 'Input ASFF JSON file',
    }),
    securityhub: Flags.string({
      required: false,
      multiple: true,
      description:
        'Additional input files to provide context that an ASFF file needs such as the CIS AWS Foundations or AWS Foundational Security Best Practices documents (in ASFF compliant JSON form)',
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON folder',
    }),
  };

  async run() {
    const {flags} = await this.parse(ASFF2HDF)
    let securityhub
    if (flags.securityhub) {
      securityhub = flags.securityhub.map(file =>
        fs.readFileSync(file, 'utf-8'),
      )
    }

    const converter = new Mapper(
      fs.readFileSync(flags.input, 'utf-8'),
      securityhub,
    )
    const results = converter.toHdf()

    fs.mkdirSync(flags.output)
    _.forOwn(results, (result, filename) => {
      fs.writeFileSync(
        path.join(flags.output, checkSuffix(filename)),
        JSON.stringify(result),
      )
    })
  }
}
