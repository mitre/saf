import {Command, Flags} from '@oclif/core'
import {ExecJSON} from 'inspecjs'
import fs from 'fs'

export default class ReadPassthrough extends Command {
    static usage = 'supplement passthrough read -i <hdf-json> [-o <passthrough-json>]'

    static description = 'Read the `passthrough` attribute in a given Heimdall Data Format JSON file and send it to stdout or write it to a file'

    static examples = ['saf supplement passthrough read -i hdf.json -o passthrough.json']

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, description: 'An input HDF file'}),
      output: Flags.string({char: 'o', description: 'An output `passthrough` JSON file (otherwise the data is sent to stdout)'}),
    }

    async run() {
      const {flags} = await this.parse(ReadPassthrough)

      const input: ExecJSON.Execution & {passthrough?: unknown} = JSON.parse(fs.readFileSync(flags.input, 'utf8'))

      const passthrough = input.passthrough || {}

      if (flags.output) {
        fs.writeFileSync(flags.output, JSON.stringify(passthrough, null, 2))
      } else {
        console.log(JSON.stringify(passthrough, null, 2))
      }
    }
}
