import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import promptSync from 'prompt-sync'
import _ from 'lodash'
import {validateChecklistMetadata} from '@mitre/hdf-converters'

const prompt = promptSync()

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
      benchmark: {
        title: prompt({ask: 'What is the benchmark title? '}),
        version: prompt({ask: 'What is the benchmark version? '}),
        releasenumber: prompt({ask: 'What is the benchmark release number? '}),
        releasedate: prompt({ask: 'What is the benchmark release date? '}),
      },
      marking: prompt({ask: 'What is the marking? '}),
      hostname: prompt({ask: 'What is the asset hostname? '}),
      hostip: prompt({ask: 'What is the asset IP address? '}),
      hostmac: prompt({ask: 'What is the asset MAC address? '}),
      hostfqdn: prompt({ask: 'What is the asset FQDN? '}),
      targetcomment: prompt({ask: 'What are the target comments? '}),
      role: prompt({ask: 'What is the computing role? (None/Workstation/Member Server/Domain Controller) '}),
      assettype: _.capitalize(prompt({ask: 'What is the asset type? (Computing/Non-Computing) '})),
      techarea: prompt({ask: 'What is the tech area? (Application Review/Boundary Security/CDS Admin Review/CDS Technical Review/Database Review/Domain Name System (DNS)/Exchange Server/Host Based System Security (HBSS)/Internal Network/Mobility/Releasable Networks (REL)/Releaseable Networks (REL)/Traditional Security/UNIX OS/VVOIP Review/Web Review/Windows OS/Other Review) '}), // Yes, these typos really are how the enumerations are defined in STIG viewer's source code
      stigguid: prompt({ask: 'What is the STIG ID? '}),
      targetkey: prompt({ask: 'What is the target key? '}),
      webordatabase: prompt({ask: 'Is the target a web or database? (y/n) '}).toLowerCase() === 'y',
      webdbsite: prompt({ask: 'What is the Web or DB site? '}),
      webdbinstance: prompt({ask: 'What is the Web or DB instance? '}),
    }
    const validationResults = validateChecklistMetadata(cklMetadata)
    if (validationResults.isError) {
      console.error(`Unable to generate checklist metadata:\n${validationResults.message}`)
      process.exit(1)
    }

    fs.writeFileSync(flags.output, JSON.stringify(cklMetadata))
  }
}
