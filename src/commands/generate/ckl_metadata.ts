import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import promptSync from 'prompt-sync'
import {Assettype, ChecklistMetadata, Role, Techarea, validateChecklistMetadata} from '@mitre/hdf-converters'
import path from 'path'

const prompt = promptSync()

// Ensures that no empty strings are passed into the metadata
// by returning undefined instead
function enforceNonEmptyString(ask: string) : string | undefined {
  const response = prompt({ask})
  if (response)
    return response
  return undefined
}

function enforceInteger(ask: string): number {
  let response = prompt({ask})
  let intRep: number
  while (true) {
    intRep = Number.parseInt(response, 10)
    const floatRep = Number.parseFloat(response)
    if (intRep === floatRep && intRep >= 0 && !Number.isNaN(intRep))
      break
    console.log(`${response} is not a valid non-negative integer. Please try again`)
    response = prompt({ask})
  }

  return intRep
}

function enforceEnum(ask: string, options: string[]): string | undefined {
  // format prompt to show valid options (removes empty string options)
  ask = `${ask} (${options.filter(Boolean).join('/')}) `
  let response = prompt({ask})
  while (true) {
    if (options.includes(response))
      break
    if (!response)
      return
    console.log(`${response} is not a valid option. Spelling and letter casing matters. Please try again.`)
    response = prompt({ask})
  }

  return response
}

export default class GenerateCKLMetadata extends Command {
  static usage = 'generate ckl_metadata -o <json-file> [-h]'

  static description = 'Generate a checklist metadata template for "saf convert hdf2ckl"'

  static examples = ['saf generate ckl_metadata -o rhel_metadata.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    output: Flags.string({char: 'o', required: true, description: 'Output JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(GenerateCKLMetadata)
    console.log('Please fill in the following fields to the best of your ability, if you do not have a value, please leave the field empty.')
    const cklMetadata = {
      profiles: [
        {
          name: enforceNonEmptyString('What is the benchmark name? (Must match with profile name listed in HDF) '),
          title: enforceNonEmptyString('What is the benchmark title? '),
          version: enforceInteger('What is the benchmark version? '),
          releasenumber: enforceInteger('What is the benchmark release number? '),
          releasedate: enforceNonEmptyString('What is the benchmark release date (YYYY/MM/DD)? '),
          showCalendar: true,
        },
      ],
      marking: enforceNonEmptyString('What is the marking? '),
      hostname: enforceNonEmptyString('What is the asset hostname? '),
      hostip: enforceNonEmptyString('What is the asset IP address? '),
      hostmac: enforceNonEmptyString('What is the asset MAC address? '),
      hostfqdn: enforceNonEmptyString('What is the asset FQDN? '),
      targetcomment: enforceNonEmptyString('What are the target comments? '),
      role: enforceEnum('What is the computing role?', Object.values(Role)),
      assettype: enforceEnum('What is the asset type?', Object.values(Assettype)),
      // Resulting techarea options have typos. Yes, these typos really are how the enumerations are defined in STIG viewer's source code
      techarea: enforceEnum('What is the tech area? ', Object.values(Techarea)),
      stigguid: enforceNonEmptyString('What is the STIG ID? '),
      targetkey: enforceNonEmptyString('What is the target key? '),
      webordatabase: String(enforceEnum('Is the target a web or database?', ['y', 'n']) === 'y'),
      webdbsite: enforceNonEmptyString('What is the Web or DB site? '),
      webdbinstance: enforceNonEmptyString('What is the Web or DB instance? '),
      vulidmapping: enforceEnum('Use gid or id for vuln number?', ['gid', 'id']),
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
