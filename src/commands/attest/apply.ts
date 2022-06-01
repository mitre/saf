import {Command, Flags} from '@oclif/core'
import {ExecJSON} from 'inspecjs'
import {addAttestationToHDF, Attestation, parseXLSXAttestations} from '@mitre/hdf-converters'
import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import {convertFullPathToFilename} from '../../utils/global'

export default class ApplyAttestation extends Command {
    static flags = {
      help: Flags.help({char: 'h'}),
      input: Flags.string({char: 'i', required: true, multiple: true, description: 'Your input HDF and Attestation file(s)'}),
      output: Flags.string({char: 'o', required: true, description: 'Output file or folder (for multiple executions)'}),
    }

    async run() {
      const {flags} = await this.parse(ApplyAttestation)

      const attestations: Attestation[] = []
      const executions: Record<string, ExecJSON.Execution> = {}

      for (const inputFile of flags.input) {
        let inputData
        try {
          inputData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'))
          // Do we have an attestations JSON?
          if (Array.isArray(inputData) && inputData.length > 0 && _.get(inputData, '[0].control_id')) {
            attestations.push(...inputData)
          } else if ('profiles' in inputData) {
            // Maybe an execution
            executions[convertFullPathToFilename(inputFile)] = inputData
          } else {
            throw new Error(`Unknown input file: ${inputFile}`)
          }
        } catch {
          // Do we have a spreadsheet?
          if (inputFile.toLowerCase().endsWith('xlsx')) {
            attestations.push(...(await parseXLSXAttestations(fs.readFileSync(inputFile, null))))
          } else {
            throw new Error(`Unknown input file: ${inputFile}`)
          }
        }
      }

      if (Object.entries(executions).length > 1) {
        fs.mkdirSync(flags.output)
      }

      Object.entries(executions).forEach(([originalFilename, execution]) => {
        const applied = addAttestationToHDF(execution, attestations)
        if (Object.entries(executions).length <= 1) {
          fs.writeFileSync(flags.output, JSON.stringify(applied, null, 2))
        } else {
          fs.writeFileSync(path.join(flags.output, originalFilename), JSON.stringify(applied, null, 2))
        }
      })
    }
}
