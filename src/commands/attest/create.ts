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

const prompt = promptSync()

export default class CreateAttestations extends Command {
    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', description: 'An input HDF file to aid in selecting controls'}),
      output: Flags.string({char: 'o', required: true, description: 'The output filename'}),
      format: Flags.string({char: 't', description: 'The output file type', default: 'json', options: ['json', 'xlsx', 'yml']}),
    }

    getStatus(): 'passed' | 'failed' {
      const validPassResponses = new Set(['p', 'passed', 'pass'])
      const validFailResponses = new Set(['f', 'failed', 'fail', 'failure'])
      while (true) {
        const input = prompt('Status ((p)assed/(f)ailed): ') || ''
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
        explanation: prompt('Attestation explanation: ') || '',
        frequency: prompt('Frequency (1d/3d/1wk/2wk/1m/3m/6m/1y/custom): '),
        status: this.getStatus(),
        updated: new Date().toISOString(),
        updated_by: prompt('Updated By: ') || '',
      }
    }

    async run() {
      const {flags} = await this.parse(CreateAttestations)

      const attestations: Attestation[] = []

      if (flags.input) {
        const evaluation = JSON.parse(fs.readFileSync(flags.input, 'utf-8')) as ExecJSON.Execution
        const search = new AccurateSearch()
        const controls: Record<string, ExecJSON.Control> = {}
        evaluation.profiles.forEach(profile => {
          profile.controls.forEach(control => {
            controls[control.id] = control
            search.addText(control.id, control.id + ': ' + (control.title || '') + ' ' + control.desc || '')
          })
        })
        while (true) {
          const input = prompt("Enter a control ID, search term, or 'q' if done: ")
          if (input.trim().toLowerCase() === 'q') {
            break
          } else if (input in controls) {
            const control = controls[input]
            const attestation = this.promptForAttestation(control.id)
            attestations.push(attestation)
          } else {
            const ids = search.search(input).slice(0, 5)
            ids.forEach((id: string) => {
              const control = controls[id]
              console.log(`\t${control.id}: ${control.title?.replace(/\n/g, '').replace(/\s\s+/g, ' ')}`)
            })
          }
        }
      } else {
        while (true) {
          const input = prompt("Enter a control ID or 'q' if done: ")
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
          const sheet = workBook.sheet(0)
          // The current row we are on
          let currentRow = 2
          attestations.forEach(attestation => {
            sheet.cell(`A${currentRow}`).value(attestation.control_id)
            sheet.cell(`B${currentRow}`).value(attestation.explanation)
            sheet.cell(`C${currentRow}`).value(attestation.frequency)
            sheet.cell(`D${currentRow}`).value(attestation.status)
            sheet.cell(`E${currentRow}`).value(attestation.updated)
            sheet.cell(`F${currentRow}`).value(attestation.updated_by)
            currentRow++
          })
          return workBook.toFileAsync(flags.output)
        })

        break
      }

      case 'yaml':
      case 'yml': {
        fs.writeFileSync(flags.output, yaml.stringify(attestations))

        break
      }
      // No default
      }
    }
}
