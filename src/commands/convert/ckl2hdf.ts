import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ChecklistResults as Mapper} from '@mitre/hdf-converters'
import {checkInput, checkSuffix} from '../../utils/global'

export default class CKL2HDF extends Command {
  static usage = 'convert ckl2hdf -i <ckl-xml> -o <hdf-scan-results-json> [-h] [-s] [-w]'

  static description = 'Translate a Checklist XML file into a Heimdall Data Format JSON file'

  static examples = ['saf convert ckl2hdf -i ckl_results.xml -o output-hdf-name.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', required: true, description: 'Input Checklist XML File'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
    split: Flags.boolean({char: 's', required: false, description: 'Split Multiple iSTiG Objects into Multiple HDF Files'}),
    wrapper: Flags.boolean({char: 'w', required: false, description: 'Create a Wrapper Profile if Multiple iSTiG Objects are Present'})
  }

  async run() {
    const {flags} = await this.parse(CKL2HDF)

    // Check for correct input type
    const data = fs.readFileSync(flags.input, 'utf8')
    checkInput({data: data, filename: flags.input}, 'checklist', 'DISA Checklist')

    // check if multiple iSTiG objects

    const converter = new Mapper(data)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
