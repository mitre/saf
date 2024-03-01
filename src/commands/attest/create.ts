import {Command, Flags} from '@oclif/core'
import {Attestation} from '@mitre/hdf-converters'
import fs from 'fs'
import AccurateSearch from 'accurate-search'
import XlsxPopulate from 'xlsx-populate'
import {ExecJSON} from 'inspecjs'
import promptSync from 'prompt-sync'
import {default as files} from '../../resources/files.json'
import {dataURLtoU8Array} from '../../utils/global'
import yaml from 'yaml'

const MAX_SEARCH_RESULTS = 5
const prompt = promptSync()

export default class CreateAttestations extends Command {
    static usage = 'attest create -o <attestation-file> [-i <hdf-json> -t <json | xlsx | yml | yaml>]'

    static description = 'Create attestation files for use with `saf attest apply`'

    static examples = [
      'saf attest create -o attestation.json -i hdf.json',
      'saf attest create -o attestation.xlsx -t xlsx',
    ]

    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', description: '(optional) An input HDF file to search for controls'}),
      output: Flags.string({char: 'o', required: true, description: 'The output filename'}),
      format: Flags.string({char: 't', description: '(optional) The output file type', default: 'json', options: ['json', 'xlsx', 'yml', 'yaml']}),
    }

    promptForever(promptValue: string): string { // skipcq: JS-0105
      while (true) {
        const ret = prompt(promptValue)
        if (ret.trim() !== '') {
          return ret
        }
      }
    }

    getStatus(): 'passed' | 'failed' { // skipcq: JS-0105
      const validPassResponses = new Set(['p', 'passed', 'pass'])
      const validFailResponses = new Set(['f', 'failed', 'fail', 'failure'])
      while (true) {
        const input = prompt('Enter status ((p)assed/(f)ailed): ') || ''
        if (validPassResponses.has(input.trim().toLowerCase())) {
          return 'passed'
        }

        if (validFailResponses.has(input.trim().toLowerCase())) {
          return 'failed'
        }
      }
    }

    promptForAttestation(id: string): Attestation {
      return {
        control_id: id,
        explanation: this.promptForever('Attestation explanation: '),
        frequency: this.promptForever('Frequency (1d/3d/1wk/2wk/1m/3m/6m/1y/1.5y/custom): Frequency (valid values = annually, semiannually, quarterly, monthly, every2weeks, fortnightly, weekly, every3days, daily, or custom (e.g., 1d, 3d, 1wk, 2wk, 1m, 3m, 6m, 1y, 1.5y, etc.'),
        status: this.getStatus(),
        updated: new Date().toISOString(),
        updated_by: this.promptForever('Updated By: '),
      }
    }

    async run() {
      const {flags} = await this.parse(CreateAttestations)

      const attestations: Attestation[] = []

      if (flags.input) {
        const evaluation = JSON.parse(fs.readFileSync(flags.input, 'utf8')) as ExecJSON.Execution
        const search = new AccurateSearch()
        const controls: Record<string, ExecJSON.Control> = {}
        for (const profile of evaluation.profiles) {
          for (const control of profile.controls) {
            controls[control.id] = control
            search.addText(control.id, `${control.id}: ${control.title || ''} ${control.desc || ''}`)
          }
        }

        while (true) {
          const input = prompt("Enter a control ID, search for a control, or enter 'q' to exit: ")
          if (input.trim().toLowerCase() === 'q') {
            break
          } else if (input in controls) {
            attestations.push(this.promptForAttestation(controls[input].id))
          } else {
            const ids = search.search(input).slice(0, MAX_SEARCH_RESULTS)
            for (const id of ids) {
              const control = controls[id]
              console.log(`\t${control.id}: ${control.title?.replaceAll('\n', '').replaceAll(/\s\s+/g, ' ')}`)
            }
          }
        }
      } else {
        while (true) {
          const input = prompt("Enter a control ID or enter 'q' to exit: ")
          if (input.trim().toLowerCase() === 'q') {
            break
          } else {
            attestations.push(this.promptForAttestation(input))
          }
        }
      }

      switch (flags.format) {
        case 'json': {
          fs.writeFileSync(flags.output, JSON.stringify(attestations, null, 2))
          break
        }

        case 'xlsx': {
          XlsxPopulate.fromDataAsync(dataURLtoU8Array(files.AttestationTemplate.data)).then((workBook: any) => {
            const sheet = workBook.sheet(0) // Attestations worksheet
            let currentRow = 2
            for (const attestation of attestations) {
              sheet.cell(`A${currentRow}`).value(attestation.control_id)
              sheet.cell(`B${currentRow}`).value(attestation.explanation)
              sheet.cell(`C${currentRow}`).value(attestation.frequency)
              sheet.cell(`D${currentRow}`).value(attestation.status)
              sheet.cell(`E${currentRow}`).value(attestation.updated)
              sheet.cell(`F${currentRow}`).value(attestation.updated_by)
              currentRow++
            }

            return workBook.toFileAsync(flags.output)
          })
          break
        }

        case 'yaml':
        case 'yml': {
          fs.writeFileSync(flags.output, yaml.stringify(attestations))
          break
        }

        default: {
          throw new Error('Invalid file output type')
        }
      }
    }
}
