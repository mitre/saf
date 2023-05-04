import {Command, Flags} from '@oclif/core'
import {ExecJSON, ProfileJSON} from 'inspecjs'
import fs from 'fs'

export default class WriteTags extends Command {
    static usage = 'supplement tags write -i <input-hdf-or-profile-json> (-f <input-tags-json> | -d <tags-json>) [-o <output-hdf-json>]'

    static description = 'Overwrite the `tags` attribute in a given Heimdall Data Format or InSpec Profile JSON file and overwrite original file or optionally write it to a new file'

    static summary = 'Tags data can be either a Heimdall Data Format or InSpec Profile JSON file. See sample ideas at https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60tags%60,-%60target%60)'

    static examples = [
      'saf supplement tags write -i hdf.json -d \'[[{"a": 5}]]\'',
      'saf supplement tags write -i hdf.json -f tags.json -o new-hdf.json',
    ]

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, description: 'An input HDF or profile file'}),
      tagsFile: Flags.string({char: 'f', exclusive: ['tagsData'], description: 'An input tags-data file (can contain JSON that matches structure of tags in input file(HDF or profile)); this flag or `tagsData` must be provided'}),
      tagsData: Flags.string({char: 'd', exclusive: ['tagsFile'], description: 'Input tags-data (can contain JSON that matches structure of tags in input file(HDF or profile)); this flag or `tagsFile` must be provided'}),
      output: Flags.string({char: 'o', description: 'An output file that matches structure of input file (otherwise the input file is overwritten)'}),
    }

    async run() {
      const {flags} = await this.parse(WriteTags)

      const input: ExecJSON.Execution | ProfileJSON.Profile = JSON.parse(fs.readFileSync(flags.input, 'utf8'))

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

      if (Object.hasOwn(input, 'profiles')) {
        if (Object.keys((input as ExecJSON.Execution).profiles).length !== Object.keys(tags).length) {
          throw new TypeError('Structure of tags data is invalid')
        }

        for (const profile of (input as ExecJSON.Execution).profiles) {
          for (const control of profile.controls) {
            const matchingTag = tags[0].find((tag: { gid: string }) => tag.gid === control.id)
            if (matchingTag !== undefined) {
              control.tags = matchingTag
            }
          }
        }
      } else {
        if (Object.keys((input as ProfileJSON.Profile).controls).length !== Object.keys(tags).length) {
          throw new TypeError('Structure of tags data is invalid')
        }

        for (const control of (input as ProfileJSON.Profile).controls) {
          const matchingTag = tags[0].find((tag: { gid: string }) => tag.gid === control.id)
          if (matchingTag !== undefined) {
            control.tags = matchingTag
          }
        }
      }

      fs.writeFileSync(output, JSON.stringify(input, null, 2))
      console.log('Tags successfully overwritten')
    }
}
