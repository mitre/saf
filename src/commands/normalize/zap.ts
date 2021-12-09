import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {ZapMapper as Mapper} from '@mitre/hdf-converters'

function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }
  return `${input}.json`
}

export default class ZapMapper extends Command {
  static usage = 'zap -i, --input=JSON -n, --name=NAME -o, --output=OUTPUT'

  static description = fs.readFileSync('./help/normalize/zap.md', {encoding: 'utf-8'})

  static examples = [fs.readFileSync('./help/normalize/zap.md', {encoding: 'utf-8'}).split('Examples:\n')[1]]

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    name: flags.string({char: 'n', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(ZapMapper)

    const converter = new Mapper(fs.readFileSync(flags.input, {encoding: 'utf-8'}), flags.name)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
