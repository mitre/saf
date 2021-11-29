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
  static usage = 'nikto_mapper -j, --json=JSON -o, --output=OUTPUT'

  static description = '\n\n' + fs.readFileSync('./help/nikto_mapper.md', {encoding: 'utf-8'}).split('Examples:\n')[0]

  static examples = [fs.readFileSync('./help/nikto_mapper.md', {encoding: 'utf-8'}).split('Examples:\n')[1]]

  static flags = {
    help: flags.help({char: 'h'}),
    json: flags.string({char: 'j', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(NiktoMapper)

    const converter = new Mapper(fs.readFileSync(flags.json, {encoding: 'utf-8'}))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
