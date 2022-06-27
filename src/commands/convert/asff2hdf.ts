<<<<<<< HEAD
import BaseCommand from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
import fs from 'fs'
import {ASFFMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'

export default class ASFF2HDF extends BaseCommand {
  static usage = 'convert:asff2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json>'
=======
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ASFFResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'
import _ from 'lodash'
import path from 'path'

export default class ASFF2HDF extends Command {
  static usage =
    'convert asff2hdf -i <asff-finding-json> [--securityhub <standard-1-json> ... <standard-n-json>] -o <hdf-scan-results-json-folder>';
>>>>>>> main

  static description =
    'Translate a AWS Security Finding Format JSON into a Heimdall Data Format JSON file(s)';

  static examples = [
    'saf convert asff2hdf -i asff-findings.json -o output-folder-name',
    'saf convert asff2hdf -i asff-findings.json --securityhub <standard-1-json> ... --securityhub <standard-n-json> -o output-folder-name',
  ];

  static flags = {
<<<<<<< HEAD
    ...BaseCommand.flags,
    securityhub: flags.string({required: false, multiple: true}),
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof ASFF2HDF.flags>

    let securityhub
    if (flags.securityhub) {
      this.logger.verbose('Reading ASFF standards')
      securityhub = flags.securityhub.map((file: fs.PathOrFileDescriptor) => fs.readFileSync(file, 'utf-8'))
    }

    // Read Data
    this.logger.verbose(`Reading ASFF file: ${flags.input}`)
    const inputDataText = fs.readFileSync(flags.input, 'utf-8')

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(inputDataText, securityhub)
    this.logger.info('Starting conversion from ASFF to HDF')
    const converted = converter.toHdf()

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
=======
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
        fs.readFileSync(file, 'utf8'),
      )
    }

    const converter = new Mapper(
      fs.readFileSync(flags.input, 'utf8'),
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
>>>>>>> main
  }
}
