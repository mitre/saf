import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {NiktoMapper as Mapper} from '@mitre/hdf-converters'

function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }
  return `${input}.json`
}

export default class NiktoMapper extends Command {
  static usage = 'nikto -i, --input=JSON -o, --output=OUTPUT'

  static description = fs.readFileSync('./help/convert/nikto.md', {encoding: 'utf-8'}).split('Examples:\n')[0]

  static examples = [fs.readFileSync('./help/convert/nikto.md', {encoding: 'utf-8'}).split('Examples:\n')[1]]

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(NiktoMapper)

    const converter = new Mapper(fs.readFileSync(flags.input, {encoding: 'utf-8'}))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
