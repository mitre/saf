import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import promptSync from 'prompt-sync'
import _ from 'lodash'
import {ChecklistMetadata, validateChecklistMetadata} from '@mitre/hdf-converters'

const prompt = promptSync()

// Ensures that no empty strings are passed into the metadata
function noEmpty(ask: string) : string | undefined {
  const response = prompt({ask})
  if (response)
    return response
  return undefined
}

function enforceInteger(ask: string) {
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
          name: noEmpty('What is the benchmark name? (Must match with profile name listed in HDF) '),
          title: noEmpty('What is the benchmark title? '),
          version: enforceInteger('What is the benchmark version? '),
          releasenumber: enforceInteger('What is the benchmark release number? '),
          releasedate: noEmpty('What is the benchmark release date (YYYY/MM/DD)? '),
          showCalendar: true,
        },
      ],
      marking: noEmpty('What is the marking? '),
      hostname: noEmpty('What is the asset hostname? '),
      hostip: noEmpty('What is the asset IP address? '),
      hostmac: noEmpty('What is the asset MAC address? '),
      hostfqdn: noEmpty('What is the asset FQDN? '),
      targetcomment: noEmpty('What are the target comments? '),
      role: noEmpty('What is the computing role? (None/Workstation/Member Server/Domain Controller) '),
      assettype: noEmpty('What is the asset type? (Computing/Non-Computing) '),
      techarea: noEmpty('What is the tech area? (Application Review/Boundary Security/CDS Admin Review/CDS Technical Review/Database Review/Domain Name System (DNS)/Exchange Server/Host Based System Security (HBSS)/Internal Network/Mobility/Releasable Networks (REL)/Releaseable Networks (REL)/Traditional Security/UNIX OS/VVOIP Review/Web Review/Windows OS/Other Review) '), // Yes, these typos really are how the enumerations are defined in STIG viewer's source code
      stigguid: noEmpty('What is the STIG ID? '),
      targetkey: noEmpty('What is the target key? '),
      webordatabase: String(prompt({ask: 'Is the target a web or database? (y/n) '}).toLowerCase() === 'y'),
      webdbsite: noEmpty('What is the Web or DB site? '),
      webdbinstance: noEmpty('What is the Web or DB instance? '),
      vulidmapping: noEmpty('Use gid or id for vuln number? (gid/id) '),
    }
    const validationResults = validateChecklistMetadata(cklMetadata as ChecklistMetadata)
    if (!validationResults.ok) {
      console.error(`Unable to generate checklist metadata:\n${validationResults.error.message}`)
      process.exit(1)
    }

    fs.writeFileSync(flags.output, JSON.stringify(cklMetadata))
  }
}
