import {Command, Flags} from '@oclif/core'
import {ExecJSON} from 'inspecjs'
import {readFileURI, writeFileURI} from '../../../utils/io'

export default class WritePassthrough extends Command {
    static usage = 'supplement passthrough write -i <input-hdf-json> (-f <input-passthrough-json> | -d <passthrough-json>) [-o <output-hdf-json>]'

    static summary = 'Overwrite the `passthrough` attribute in a given HDF file with the provided `passthrough` JSON data'

    static description = 'Passthrough data can be any context/structure. See sample ideas at https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60passthrough%60,-%60target%60)'

    static examples = [
      'saf supplement passthrough write -i hdf.json -d \'{"a": 5}\'',
      'saf supplement passthrough write -i hdf.json -f passthrough.json -o new-hdf.json',
    ]

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, description: 'An input Heimdall Data Format file'}),
      passthroughFile: Flags.string({char: 'f', exclusive: ['passthroughData'], description: 'An input passthrough-data file (can contain any valid JSON); this flag or `passthroughData` must be provided'}),
      passthroughData: Flags.string({char: 'd', exclusive: ['passthroughFile'], description: 'Input passthrough-data (can be any valid JSON); this flag or `passthroughFile` must be provided'}),
      output: Flags.string({char: 'o', description: 'An output Heimdall Data Format JSON file (otherwise the input file is overwritten)'}),
    }

    async run() {
      const {flags} = await this.parse(WritePassthrough)

      const input: ExecJSON.Execution & {passthrough?: unknown} = JSON.parse(await readFileURI(flags.input, 'utf8'))
      const output: string = flags.output || flags.input

      let passthrough: unknown
      if (flags.passthroughFile) {
        try {
          passthrough = JSON.parse(await readFileURI(flags.passthroughFile, 'utf8'))
        } catch (error: unknown) {
          throw new Error(`Couldn't parse passthrough data: ${error}`)
        }
      } else if (flags.passthroughData) {
        try {
          passthrough = JSON.parse(flags.passthroughData)
        } catch {
          passthrough = flags.passthroughData
        }
      } else {
        throw new Error('One out of passthroughFile or passthroughData must be passed')
      }

      input.passthrough = passthrough

      await writeFileURI(output, JSON.stringify(input, null, 2))
    }
}
