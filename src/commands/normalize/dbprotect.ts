import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {DBProtectMapper as Mapper} from '@mitre/hdf-converters'

function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }
  return `${input}.json`
}

export default class DBProtectMapper extends Command {
  static usage = 'dbprotect -x, --xml=XML -o, --output=OUTPUT'

  static description = fs.readFileSync('./help/convert/dbprotect.md', {encoding: 'utf-8'}).split('Examples:\n')[0]

  static examples = [fs.readFileSync('./help/convert/dbprotect.md', {encoding: 'utf-8'}).split('Examples:\n')[1]]

  static flags = {
    help: flags.help({char: 'h'}),
    xml: flags.string({char: 'x', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(DBProtectMapper)

    const converter = new Mapper(fs.readFileSync(flags.xml, {encoding: 'utf-8'}))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
