import {Command, Flags} from '@oclif/core'
import {ExecJSON, ProfileJSON} from 'inspecjs'
import fs from 'fs'
import csvParse from 'csv-parse'

export default class WriteTags extends Command {
    static usage = 'supplement tags extend -i <input-hdf-or-profile-json> (-f <input-tags-json> | -d <tags-json>) [-o <output-hdf-json>]'

    static description = 'Extends the `tags` attribute in a given Heimdall Data Format or InSpec Profile JSON file and overwrite original file or optionally output it to a new file'

    static summary = 'Tags data can be either be a CSV file or JSON data. See sample ideas at https://github.com/mitre/saf/wiki/Supplement-HDF-files-with-additional-information-(ex.-%60tags%60,-%60target%60)'

    static examples = [
      'saf supplement tags extend -i hdf.json -d \'[[{"a": 5}]]\'',
      'saf supplement tags extend -i hdf.json -f tags.csv -o new-hdf.json',
      'saf supplement tags extend -i hdf.json -f tags.csv -o new-hdf.json -c "V-000001',
    ]

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, description: 'An input HDF or profile file'}),
      tagsFile: Flags.string({char: 'f', exclusive: ['tagsData'], description: 'An input tags-data file (can contain CSV file)); this flag or `tagsData` must be provided'}),
      tagsData: Flags.string({char: 'd', exclusive: ['tagsFile'], description: 'Input tags-data (can contain JSON that matches structure of tags in input file(HDF or profile)); this flag or `tagsFile` must be provided'}),
      output: Flags.string({char: 'o', description: 'An output file that matches structure of input file (otherwise the input file is overwritten)'}),
      controls: Flags.string({char: 'c', description: 'The id of the control whose tags will be extracted', multiple: true}),
    }

    async run() {
      const {flags} = await this.parse(WriteTags)

      const input: ExecJSON.Execution | ProfileJSON.Profile = JSON.parse(fs.readFileSync(flags.input, 'utf8'))

      const output: string = flags.output || flags.input

      let CCItags: object | string
      if (flags.tagsFile) {
        try {
          const fileContent = fs.readFileSync(flags.tagsFile, 'utf8')
          csvParse(fileContent, {columns: true, delimiter: ','}, (err, output) => {
            if (err) {
              throw new Error(`CSV parse error ${err}`)
            }

            CCItags = JSON.parse(JSON.stringify(output))
            processParsedData(CCItags)
          })
        } catch (error: unknown) {
          throw new Error(`Couldn't parse tags data: ${error}`)
        }
      } else if (flags.tagsData) {
        try {
          CCItags = JSON.parse(flags.tagsData)
        } catch {
          CCItags = flags.tagsData
        }

        processParsedData(CCItags)
      } else {
        throw new Error('One out of tagsFile or tagsData must be passed')
      }

      const extendTags = (profile: ExecJSON.Profile | ProfileJSON.Profile, CCItags: []) => {
        // Filter our controls
        const filteredControls = (profile.controls as Array<ExecJSON.Control | ProfileJSON.Control>)?.filter(control => flags.controls ?  flags.controls.includes(control.id) : true)
        for (const tag of filteredControls.map(control => control.tags)) {
          if (tag.cci) {
            const cms_ars5_ce: string[] = []
            for (const cci of tag.cci) {
              const matchingTag = CCItags.find((currTag: { cci: any }) => currTag.cci.replace(/\s/g, '').includes(cci))
              if (matchingTag && matchingTag['cms-ars5-ce'] !== '') {
                cms_ars5_ce.push(matchingTag['cms-ars5-ce'])
              }
            }

            if (cms_ars5_ce.length !== 0)
              tag.cms_ars5_ce = cms_ars5_ce
          }
        }
      }

      function processParsedData(CCItags: any) {
        if (Object.hasOwn(input, 'profiles')) {
          for (const [i, profile] of (input as ExecJSON.Execution).profiles.entries()) {
            extendTags(profile, CCItags)
          }
        } else {
          extendTags((input as ProfileJSON.Profile), CCItags)
        }

        fs.writeFileSync(output, JSON.stringify(input, null, 2))
        console.log('Tags successfully extended')
      }
    }
}
