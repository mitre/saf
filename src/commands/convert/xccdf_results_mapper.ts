import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {XCCDFResultsMapper as Mapper} from '@mitre/hdf-converters'

function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }
  return `${input}.json`
}

export default class XCCDFResultsMapper extends Command {
  static usage = 'xccdf_results_mapper -x, --xml=XML -o, --output=OUTPUT'

  static description = fs.readFileSync('./help/xccdf_results_mapper.md', {encoding: 'utf-8'})

  static flags = {
    help: flags.help({char: 'h'}),
    xml: flags.string({char: 'x', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(XCCDFResultsMapper)

    const converter = new Mapper(fs.readFileSync(flags.xml, {encoding: 'utf-8'}))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
