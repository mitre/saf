import {Flags} from '@oclif/core'
import type {ExecJSON} from 'inspecjs'
import fs from 'fs'
import {BaseCommand} from '../../../utils/oclif/baseCommand'

export default class ReadPassthrough extends BaseCommand<typeof ReadPassthrough> {
  static readonly usage = '<%= command.id %> -i <hdf-json> [-o <passthrough-json>]'

  static readonly description = 'Read the `passthrough` attribute in a given Heimdall Data Format JSON file and send it to stdout or write it to a file'

  static readonly examples = ['<%= config.bin %> <%= command.id %> -i hdf.json -o passthrough.json']

  static readonly flags = {
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
      process.stdout.write(JSON.stringify(passthrough, null, 2))
    }
  }
}
