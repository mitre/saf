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

  static description = fs.readFileSync('./help/convert/asff.md', {encoding: 'utf-8'}).split('Examples:\n')[0]

  static examples = [fs.readFileSync('./help/convert/asff.md', {encoding: 'utf-8'}).split('Examples:\n')[1]]

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
