import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import {FortifyMapper as Mapper} from '@mitre/hdf-converters'

function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }
  return `${input}.json`
}

export default class FortifyMapper extends Command {
  static usage = 'fortify_mappers -f, --fvdl=FVDL -o, --output=OUTPUT'

  static description = fs.readFileSync('./help/fortify_mapper.md', {encoding: 'utf-8'}).split('Examples:\n')[0]

  static examples = [fs.readFileSync('./help/fortify_mapper.md', {encoding: 'utf-8'}).split('Examples:\n')[1]]

  static flags = {
    help: flags.help({char: 'h'}),
    fvdl: flags.string({char: 'f', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(FortifyMapper)

    const converter = new Mapper(fs.readFileSync(flags.fvdl, {encoding: 'utf-8'}))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
