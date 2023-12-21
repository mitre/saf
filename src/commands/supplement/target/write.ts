import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ExecJSON} from 'inspecjs'

export default class WriteTarget extends Command {
  static description = 'Target data can be any context/structure. See sample ideas at https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60passthrough%60,-%60target%60)'

  static examples = [
    'saf supplement target write -i hdf.json -d \'{"a": 5}\'',
    'saf supplement target write -i hdf.json -f target.json -o new-hdf.json',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'An input Heimdall Data Format file', required: true}),
    output: Flags.string({char: 'o', description: 'An output Heimdall Data Format JSON file (otherwise the input file is overwritten)'}),
    targetData: Flags.string({char: 'd', description: 'Input target-data (can be any valid JSON); this flag or `targetFile` must be provided', exclusive: ['targetFile']}),
    targetFile: Flags.string({char: 'f', description: 'An input target-data file (can contain any valid JSON); this flag or `targetData` must be provided', exclusive: ['targetData']}),
  }

  static summary = 'Overwrite the `target` attribute in a given HDF file with the provided `target` JSON data'

  static usage = 'supplement target write -i <input-hdf-json> (-f <input-target-json> | -d <target-json>) [-o <output-hdf-json>]'

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
