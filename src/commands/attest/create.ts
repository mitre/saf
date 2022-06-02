import {Command, Flags} from '@oclif/core'
import {AdvanceDateFrequency, Attestation} from '@mitre/hdf-converters'
import fs from 'fs'
import AccurateSearch from 'accurate-search'
import { ExecJSON } from 'inspecjs'
import promptSync from 'prompt-sync'

const prompt = promptSync()

export default class CreateAttestations extends Command {
    static flags = {
        help: Flags.help({char: 'h'}),
        input: Flags.string({char: 'i', description: 'An input HDF file to aid in selecting controls'}),
        output: Flags.string({char: 'o', required: true, description: 'The output filename'}),
        type: Flags.string({char: 't', description: 'The output file type', default: 'json', options: ['json', 'xlsx', 'yml']}),
    }

    getStatus() {
        const validPassResponses = ['p', 'passed', 'pass']
        const validFailResponses = ['f', 'failed', 'fail', 'failure']
        while (true) {
            const input = prompt("Status ((p)assed/(f)ailed): ") || ''
            if (validPassResponses.includes(input.trim().toLowerCase())) {
                return 'passed'
            }
            if (validFailResponses.includes(input.trim().toLowerCase())) {
                return 'failed'
            }
        }
    }

    promptForAttestation(id: string): Attestation {
        return {
            control_id: id,
            explanation: prompt("Attestation explanation: ") || '',
            frequency: prompt(`Frequency (daily/every3days/weekly/every2weeks/monthly/quarterly/semiannually/annually): `) as unknown as AdvanceDateFrequency,
            status: this.getStatus(),
            updated: new Date().toISOString(),
            updated_by: prompt("Updated By: ") || ''
        }
    }

    async run() {
        const {flags} = await this.parse(CreateAttestations)
        
        const attestations: Attestation[] = []
        
        if (flags.input) {
            const evaluation = JSON.parse(fs.readFileSync(flags.input, 'utf-8')) as ExecJSON.Execution;
            let search = new AccurateSearch();
            let controls: Record<string, ExecJSON.Control> = {};
            evaluation.profiles.forEach((profile) => {
                profile.controls.forEach((control) => {
                    controls[control.id] = control;
                    search.addText(control.id, control.id + ': ' + (control.title || '') + ' ' + control.desc || '')
                })
            })
            while (true) {
                const input = prompt("Enter a control ID, search term, or 'q' if done: ")
                if (input.trim().toLowerCase() === 'q') {
                    break
                } else if (input in controls) {
                    const control = controls[input];
                    const attestation = this.promptForAttestation(control.id)
                    attestations.push(attestation)
                } else {
                    const ids = search.search(input).slice(0, 5);
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
                    attestations.push(this.promptForAttestation(input));
                }
            }
        }

        console.log(flags)

        if (flags.type == 'json') {
            fs.writeFileSync(flags.output, JSON.stringify(attestations, null, 2))
        }
    }
}