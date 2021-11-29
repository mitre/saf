import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {ScoutsuiteMapper as Mapper} from '@mitre/hdf-converters'

function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }
  return `${input}.json`
}

export default class ScoutsuiteMapper extends Command {
  static usage = 'scoutsuite_mapper -j, --javascript=SCOUTSUITE-RESULTS-JS -o, --output=OUTPUT'

  static description = '\n\n' + fs.readFileSync('./help/scoutsuite_mapper.md', {encoding: 'utf-8'}).split('Examples:\n')[0]

  static examples = [fs.readFileSync('./help/scoutsuite_mapper.md', {encoding: 'utf-8'}).split('Examples:\n')[1]]

  static flags = {
    help: flags.help({char: 'h'}),
    javascript: flags.string({char: 'j', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(ScoutsuiteMapper)

    const converter = new Mapper(fs.readFileSync(flags.javascript, {encoding: 'utf-8'}))
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(converter.toHdf()))
  }
}
