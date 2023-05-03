import {Command, Flags} from '@oclif/core'
import {ExecJSON} from 'inspecjs'
import fs from 'fs'

export default class WriteTags extends Command {
    static usage = 'supplement tags write -i <input-hdf-json> (-f <input-tags-json> | -d <tags-json>) [-o <output-hdf-json>]'

    static summary = 'Overwrite the `tags` attribute in a given HDF file with the provided `tags` JSON data'

    static description = 'Tags data can be any context/structure. See sample ideas at https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60tags%60,-%60target%60)'

    static examples = [
      'saf supplement tags write -i hdf.json -d \'{"a": 5}\'',
      'saf supplement tags write -i hdf.json -f tags.json -o new-hdf.json',
    ]

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, description: 'An input Heimdall Data Format file'}),
      tagsFile: Flags.string({char: 'f', exclusive: ['tagsData'], description: 'An input tags-data file (can contain any valid JSON); this flag or `tagsData` must be provided'}),
      tagsData: Flags.string({char: 'd', exclusive: ['tagsFile'], description: 'Input tags-data (can be any valid JSON); this flag or `tagsFile` must be provided'}),
      output: Flags.string({char: 'o', description: 'An output Heimdall Data Format JSON file (otherwise the input file is overwritten)'}),
    }

    async run() {
      const {flags} = await this.parse(WriteTags)

      const input: ExecJSON.Execution & {tags?: unknown} = JSON.parse(fs.readFileSync(flags.input, 'utf8'))
      const output: string = flags.output || flags.input

      let tags: any
      if (flags.tagsFile) {
        try {
          tags = JSON.parse(fs.readFileSync(flags.tagsFile, 'utf8'))
        } catch (error: unknown) {
          throw new Error(`Couldn't parse tags data: ${error}`)
        }
      } else if (flags.tagsData) {
        try {
          tags = JSON.parse(flags.tagsData)
        } catch {
          tags = flags.tagsData
        }
      } else {
        throw new Error('One out of tagsFile or tagsData must be passed')
      }

      // Check for num of keys and type of objects
      if (Object.keys(input.profiles[0].controls).length !== Object.keys(tags[0]).length || typeof input.profiles[0].controls !== typeof tags[0]) {
        throw new TypeError('Structure of tags data is invalid')
      }

      // Overwrite tags
      input.profiles[0].controls.forEach(control => {
        const matchingTag = tags[0].find((tag: { gid: string }) => tag.gid === control.id)
        if (matchingTag !== undefined) {
          control.tags = matchingTag
        }
      })

      fs.writeFileSync(output, JSON.stringify(input, null, 2))
      console.log('Tags successfully overwritten')
    }
}
