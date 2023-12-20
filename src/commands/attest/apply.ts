import {Attestation, addAttestationToHDF, parseXLSXAttestations} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {ExecJSON} from 'inspecjs'
import _ from 'lodash'
import path from 'path'
import yaml from 'yaml'

import {convertFullPathToFilename} from '../../utils/global'

export default class ApplyAttestation extends Command {
  static description = 'Apply one or more attestation files to one or more HDF results sets'

  static examples = [
    'saf attest apply -i hdf.json attestation.json -o new-hdf.json',
    'saf attest apply -i hdf1.json hdf2.json attestation.xlsx -o outputDir',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({char: 'i', description: 'Your input HDF and Attestation file(s)', multiple: true, required: true}),
    output: Flags.string({char: 'o', description: 'Output file or folder (for multiple executions)', required: true}),
  }

  static usage = 'attest apply -i <input-hdf-json>... <attestation>... -o <output-hdf-path>'

  async run() {
    const {flags} = await this.parse(ApplyAttestation)

    const attestations: Attestation[] = []
    const executions: Record<string, ExecJSON.Execution> = {}

    for (const inputFile of flags.input) {
      let inputData
      try {
        inputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
        if (Array.isArray(inputData) && inputData.length > 0 && _.get(inputData, '[0].control_id')) {
          // We have an attestations JSON
          attestations.push(...inputData)
        } else if (Array.isArray(_.get(inputData, 'plugins.inspec-reporter-json-hdf.attestations'))) {
          // We have a legacy Inspec Tools attestations file
          attestations.push(..._.get(inputData, 'plugins.inspec-reporter-json-hdf.attestations'))
        } else if ('profiles' in inputData) {
          // We have an execution file
          executions[convertFullPathToFilename(inputFile)] = inputData
        } else {
          // Unknown file
          console.error(`Unknown input file: ${inputFile}`)
          process.exit(1)
        }
      } catch {
        inputData = fs.readFileSync(inputFile, 'utf8')
        if (inputFile.toLowerCase().endsWith('xlsx')) {
          // We have a spreadsheet
          attestations.push(...(await parseXLSXAttestations(fs.readFileSync(inputFile, null))))
        } else if (inputFile.toLowerCase().endsWith('yml') || inputFile.toLowerCase().endsWith('yaml')) {
          // We have a YAML
          attestations.push(...yaml.parse(inputData))
        } else {
          throw new Error(`Unknown input file: ${inputFile}`)
        }
      }
    }

    if (Object.entries(executions).length > 1 && !fs.existsSync(flags.output)) {
      fs.mkdirSync(flags.output)
    }

    if (Object.keys(executions).length === 0) {
      throw new Error('Please provide at least one HDF file')
    }

    for (const [originalFilename, execution] of Object.entries(executions)) {
      const applied = addAttestationToHDF(execution, attestations)
      if (Object.entries(executions).length <= 1) {
        fs.writeFileSync(flags.output, JSON.stringify(applied, null, 2))
      } else {
        fs.writeFileSync(path.join(flags.output, originalFilename), JSON.stringify(applied, null, 2))
      }
    }
  }
}
