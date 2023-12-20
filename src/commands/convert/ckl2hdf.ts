import {ChecklistResults as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'

import {checkInput, checkSuffix} from '../../utils/global'

export default class CKL2HDF extends Command {
  static description = 'Translate a Checklist XML file into a Heimdall Data Format JSON file'

  static examples = ['saf convert ckl2hdf -i ckl_results.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Input Checklist XML File', required: true}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON File', required: true}),
    'with-raw': Flags.boolean({char: 'w', description: 'Include raw input file in HDF JSON file', required: false}),
  }

  static usage = 'convert ckl2hdf -i <ckl-xml> -o <hdf-scan-results-json> [-h] [-s] [-w]'

  async run() {
    const {flags} = await this.parse(CKL2HDF)

    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data, filename: flags.input}, 'checklist', 'DISA Checklist')

    const converter = new Mapper(data, flags['with-raw'])
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
