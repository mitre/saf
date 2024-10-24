import {Flags} from '@oclif/core'
import fs from 'fs'
import promptSync from 'prompt-sync'
import {Assettype, ChecklistMetadata, Role, Techarea, validateChecklistMetadata} from '@mitre/hdf-converters'
import path from 'path'
import {BaseCommand} from '../../utils/oclif/baseCommand'

const prompt = promptSync()

// Ensures that no empty strings are passed into the metadata
// by returning undefined instead
function enforceNonEmptyString(ask: string) : string | null {
  const response = prompt({ask})
  if (response)
    return response
  return null
}

function enforceInteger(ask: string): number | null {
  let response = prompt({ask})
  let intRep = Number.parseInt(response, 10)
  let floatRep = Number.parseFloat(response)
  while (!(intRep === floatRep && intRep >= 0 && !Number.isNaN(intRep))) {
    if (!response)
      return null
    console.log(`${response} is not a valid non-negative integer. Please try again`)
    response = prompt({ask})
    intRep = Number.parseInt(response, 10)
    floatRep = Number.parseFloat(response)
  }

  return intRep
}

function enforceEnum(ask: string, options: string[]): string | null {
  // format prompt to show valid options (removes empty string options)
  ask = `${ask} (${options.filter(Boolean).join('/')}) `
  let response = prompt({ask})
  while (!options.includes(response)) {
    if (!response)
      return null
    console.log(`${response} is not a valid option. Spelling and letter casing matters. Please try again.`)
    response = prompt({ask})
  }

  return response
}

export default class GenerateCKLMetadata extends BaseCommand<typeof GenerateCKLMetadata> {
  static readonly usage = '<%= command.id %> -o <json-file> [-h]'

  static readonly description = 'Generate a checklist metadata template for "saf convert hdf2ckl"'

  static readonly examples = ['<%= config.bin %> <%= command.id %> -o rhel_metadata.json']

  static readonly flags = {
    output: Flags.string({char: 'o', required: true, description: 'Output JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(GenerateCKLMetadata)
    console.log('Please fill in the following fields to the best of your ability, if you do not have a value, please leave the field empty.')
    const cklMetadata = {
      profiles: [
        {
          name: enforceNonEmptyString('What is the benchmark name? (Must match with profile name listed in HDF) ') || undefined,
          title: enforceNonEmptyString('What is the benchmark title? ') || undefined,
          version: enforceInteger('What is the benchmark version? ') || undefined,
          releasenumber: enforceInteger('What is the benchmark release number? ') || undefined,
          releasedate: enforceNonEmptyString('What is the benchmark release date (YYYY/MM/DD)? ') || undefined,
          showCalendar: true,
        },
      ],
      marking: enforceNonEmptyString('What is the marking? ') || undefined,
      hostname: enforceNonEmptyString('What is the asset hostname? ') || undefined,
      hostip: enforceNonEmptyString('What is the asset IP address? ') || undefined,
      hostmac: enforceNonEmptyString('What is the asset MAC address? ') || undefined,
      hostfqdn: enforceNonEmptyString('What is the asset FQDN? ') || undefined,
      targetcomment: enforceNonEmptyString('What are the target comments? ') || undefined,
      role: enforceEnum('What is the computing role?', Object.values(Role)) || undefined,
      assettype: enforceEnum('What is the asset type?', Object.values(Assettype)) || undefined,
      // Resulting techarea options have typos. Yes, these typos really are how the enumerations are defined in STIG viewer's source code
      techarea: enforceEnum('What is the tech area? ', Object.values(Techarea)) || undefined,
      stigguid: enforceNonEmptyString('What is the STIG ID? ') || undefined,
      targetkey: enforceNonEmptyString('What is the target key? ') || undefined,
      webordatabase: String(enforceEnum('Is the target a web or database?', ['y', 'n']) === 'y'),
      webdbsite: enforceNonEmptyString('What is the Web or DB site? ') || undefined,
      webdbinstance: enforceNonEmptyString('What is the Web or DB instance? ') || undefined,
      vulidmapping: enforceEnum('Use gid or id for vuln number?', ['gid', 'id']) || undefined,
    }
    const validationResults = validateChecklistMetadata(cklMetadata as ChecklistMetadata)
    if (validationResults.ok) {
      fs.writeFileSync(flags.output, JSON.stringify(cklMetadata, null, 2))
      console.log(`Checklist metadata file written at: ${path.resolve(flags.output)}`)
    } else {
      console.error(`Unable to generate checklist metadata:\n${validationResults.error.message}`)
    }
  }
}
