import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {NessusResults as Mapper} from '@mitre/hdf-converters'
import _ from 'lodash'

function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input.split('.json')[0]
  }
  return input
}

export default class NessusMapper extends Command {
  static usage = 'nessus -i, --input=XML -o, --output_prefix=OUTPUT_PREFIX'

  static description = fs.readFileSync('./help/normalize/nessus.md', {encoding: 'utf-8'}).split('Examples:\n')[0]

  static examples = [fs.readFileSync('./help/normalize/nessus.md', {encoding: 'utf-8'}).split('Examples:\n')[1]]

  static flags = {
    help: flags.help({char: 'h'}),
    input: flags.string({char: 'i', required: true}),
    output_prefix: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(NessusMapper)

    const converter = new Mapper(fs.readFileSync(flags.input, {encoding: 'utf-8'}))
    const result = converter.toHdf()
    if (Array.isArray(result)) {
      for (const element of result) {
        fs.writeFileSync(`${checkSuffix(flags.output_prefix)}-${_.get(element, 'platform.target_id')}.json`, JSON.stringify(element))
      }
    } else {
      fs.writeFileSync(`${checkSuffix(flags.output_prefix)}.json`, JSON.stringify(result))
    }
  }
}
