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
      'saf supplement tags write -i hdf.json -f tags.json -o new-hdf.json -c "V-000001',
    ]

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, description: 'An input HDF or profile file'}),
      tagsFile: Flags.string({char: 'f', exclusive: ['tagsFile'], description: 'An input tags-data file (can contain JSON that matches structure of tags in input file(HDF or profile)); this flag or `tagsData` must be provided'}),
      tagsData: Flags.string({char: 'd', exclusive: ['tagsData'], description: 'Input tags-data (can contain JSON that matches structure of tags in input file(HDF or profile)); this flag or `tagsFile` must be provided'}),
      output: Flags.string({char: 'o', description: 'An output file that matches structure of input file (otherwise the input file is overwritten)'}),
      controls: Flags.string({char: 'c', description: 'The id of the control whose tags will be extracted', multiple: true}),
    }

    async run() {
      const {flags} = await this.parse(WriteTags)

      const input: ExecJSON.Execution | ProfileJSON.Profile = JSON.parse(fs.readFileSync(flags.input, 'utf8'))

      const output: string = flags.output || flags.input

      let tags: ExecJSON.Control[][] | ProfileJSON.Control[] | string
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

      const overwriteTags = (profile: ExecJSON.Profile | ProfileJSON.Profile, tags: ExecJSON.Control[] | ProfileJSON.Control[]) => {
        // Filter our controls
        const filteredControls = (profile.controls as Array<ExecJSON.Control | ProfileJSON.Control>)?.filter(control => flags.controls ?  flags.controls.includes(control.id) : true)
        // Check shape
        if (filteredControls.length !== tags.length) {
          throw new TypeError('Structure of tags data is invalid')
        }

        // Overwrite tags
        for (const [index, control] of filteredControls.entries()) {
          control.tags = tags[index]
        }
      }

      if (Object.hasOwn(input, 'profiles')) {
        for (const [i, profile] of (input as ExecJSON.Execution).profiles.entries()) {
          overwriteTags(profile, tags[i] as ExecJSON.Control[])
        }
      } else {
        overwriteTags((input as ProfileJSON.Profile), (tags as ProfileJSON.Control[]))
      }

      fs.writeFileSync(output, JSON.stringify(input, null, 2))
      console.log('Tags successfully overwritten')
    }
}

