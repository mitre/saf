import {Command, Flags} from '@oclif/core'
import {ExecJSON} from 'inspecjs'
import fs from 'fs'

export default class WriteTarget extends Command {
    static usage = 'supplement target write -i <input-hdf-json> (-f <input-target-json> | -d <target-json>) [-o <output-hdf-json>]'

    static description = 'Overwrite the `target` attribute in a given Heimdall Data Format JSON file with the provided `target` JSON data'

    static examples = ['saf supplement target write -i hdf.json -d \'{"a": 5}\'']

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, description: 'An input Heimdall Data Format file'}),
      targetFile: Flags.string({char: 'f', exclusive: ['targetData'], description: 'An input target-data file (can contain any valid JSON); this flag or `targetData` must be provided'}),
      targetData: Flags.string({char: 'd', exclusive: ['targetFile'], description: 'Input target-data (can be any valid JSON); this flag or `targetFile` must be provided'}),
      output: Flags.string({char: 'o', description: 'An output Heimdall Data Format JSON file (otherwise the input file is overwritten)'}),
    }

    async run() {
      const {flags} = await this.parse(WriteTarget)

      const input: ExecJSON.Execution & {target?: unknown} = JSON.parse(fs.readFileSync(flags.input, 'utf8'))
      const output: string = flags.output || flags.input

      let target: unknown
      if (flags.targetFile) {
        try {
          target = JSON.parse(fs.readFileSync(flags.targetFile, 'utf8'))
        } catch (error: unknown) {
          throw new Error(`Couldn't parse target data: ${error}`)
        }
      } else if (flags.targetData) {
        try {
          target = JSON.parse(flags.targetData)
        } catch {
          target = flags.targetData
        }
      } else {
        throw new Error('One out of targetFile or targetData must be passed')
      }

      input.target = target

      fs.writeFileSync(output, JSON.stringify(input, null, 2))
    }
}
