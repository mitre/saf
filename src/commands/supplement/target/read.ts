import {Command, Flags} from '@oclif/core'
import {ExecJSON} from 'inspecjs'
import fs from 'fs'
import { readFileURI } from '../../../utils/io'

export default class ReadTarget extends Command {
    static usage = 'supplement target read -i <hdf-json> [-o <target-json>]'

    static description = 'Read the `target` attribute in a given Heimdall Data Format JSON file and send it to stdout or write it to a file'

    static examples = ['saf supplement target read -i hdf.json -o target.json']

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, description: 'An input HDF file'}),
      output: Flags.string({char: 'o', description: 'An output `target` JSON file (otherwise the data is sent to stdout)'}),
    }

    async run() {
      const {flags} = await this.parse(ReadTarget)

      const input: ExecJSON.Execution & {target?: unknown} = JSON.parse(await readFileURI(flags.input, 'utf8'))

      const target = input.target || {}

      if (flags.output) {
        fs.writeFileSync(flags.output, JSON.stringify(target, null, 2))
      } else {
        process.stdout.write(JSON.stringify(target, null, 2))
      }
    }
}
