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
  static usage = 'zap_mapper -j, --json=JSON -n, --name=NAME -o, --output=OUTPUT'

  static description = '\n\n' + fs.readFileSync('./help/zap_mapper.md', {encoding: 'utf-8'}).split('Examples:\n')[0]

  static examples = [fs.readFileSync('./help/zap_mapper.md', {encoding: 'utf-8'}).split('Examples:\n')[1]]

  static flags = {
    help: flags.help({char: 'h'}),
    json: flags.string({char: 'j', required: true}),
    name: flags.string({char: 'n', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(ZapMapper)

    const converter = new Mapper(fs.readFileSync(flags.json, {encoding: 'utf-8'}), flags.name)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
