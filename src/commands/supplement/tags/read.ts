import {Command, Flags} from '@oclif/core'
import {ExecJSON, ProfileJSON} from 'inspecjs'
import fs from 'fs'

export default class ReadTags extends Command {
    static usage = 'supplement tags read -i <hdf-or-profile-json> [-o <tag-json>] [-c control-id ...]'

    static description = 'Read the `tags` attribute in a given Heimdall Data Format or InSpec Profile JSON file and send it to stdout or write it to a file'

    static examples = ['saf supplement tags read -i hdf.json -o tag.json']

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, description: 'An input HDF or profile file'}),
      output: Flags.string({char: 'o', description: 'An output `tags` JSON file (otherwise the data is sent to stdout)'}),
      controls: Flags.string({char: 'c', description: 'The id of the control whose tags will be extracted', multiple: true}),
    }

    async run() {
      const {flags} = await this.parse(ReadTags)

      const input: ExecJSON.Execution | ProfileJSON.Profile = JSON.parse(fs.readFileSync(flags.input, 'utf8'))

      const extractTags = (profile: ExecJSON.Profile | ProfileJSON.Profile) => profile.controls.map(control => control.tags)

      const tags = Object.hasOwn(input, 'profiles') ? (input as ExecJSON.Execution).profiles.map(profile => extractTags(profile)) : extractTags(input as ProfileJSON.Profile)

      if (flags.controls) {
        const filterTags: any[][] = tags.map(tags => tags.filter((tag: { gid: string }) => flags.controls?.includes(tag.gid)))
        if (flags.output) {
          fs.writeFileSync(flags.output, JSON.stringify(filterTags, null, 2))
        } else {
          process.stdout.write(JSON.stringify(filterTags, null, 2))
        }
      } else if (flags.output) {
        fs.writeFileSync(flags.output, JSON.stringify(tags, null, 2))
      } else {
        process.stdout.write(JSON.stringify(tags, null, 2))
      }
    }
}
