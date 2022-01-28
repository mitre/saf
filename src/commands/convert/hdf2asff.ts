import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import {FromHdfToAsffMapper as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, sliceIntoChunks} from '../../utils/global'
import path from 'path'

export default class HDF2ASFF extends Command {
  static usage = 'convert:hdf2asff -i, --input=HDF-JSON -o, --output=ASFF-JSON'

  static description = 'Translate a Heimdall Data Format JSON file into AWS Security Findings Format JSON file(s)'

  static examples = ['saf convert:hdf2asff -i rhel7.scan.json -a 123456789 -r us-east-1 -t rhel7_example_host -o rhel7.asff.json']

  static flags = {
    help: flags.help({char: 'h'}),
    accountId: flags.string({char: 'a', required: true, description: 'AWS Account ID'}),
    region: flags.string({char: 'r', required: true, description: 'SecurityHub Region'}),
    input: flags.string({char: 'i', required: true, description: 'Input HDF JSON File'}),
    target: flags.string({char: 't', required: true, description: 'Unique name for target to track findings across time'}),
    output: flags.string({char: 'o', required: true, description: 'Output ASFF JSON Folder'}),
  }

  async run() {
    const {flags} = this.parse(HDF2ASFF)

    const converter = new Mapper(JSON.parse(fs.readFileSync(flags.input, {encoding: 'utf-8'})), {
      awsAccountId: flags.accountId,
      region: flags.region,
      target: flags.target,
      input: flags.input,
    })
    const convertedSlices = sliceIntoChunks(converter.toAsff(), 100)
    const outputFolder = flags.output.replace('.json', '')
    fs.mkdirSync(outputFolder)
    if (convertedSlices.length === 1) {
      const outfilePath = path.join(outputFolder, checkSuffix(flags.output))
      fs.writeFileSync(outfilePath, JSON.stringify(convertedSlices[0]))
    } else {
      convertedSlices.forEach((slice, index) => {
        const outfilePath = path.join(outputFolder, `${checkSuffix(flags.output).replace('.json', '')}.p${index}.json`)
        fs.writeFileSync(outfilePath, JSON.stringify(slice))
      })
    }
  }
}
