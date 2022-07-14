import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import promptSync from 'prompt-sync'
import _ from 'lodash'

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
    console.log("Please fill in the following fields to the best of your ability, if you don't have a value, please leave the field empty.")
    const cklMetadata = {
      benchmark: {
        title: prompt({ask: 'What is the benchmark title? '}) || null,
        version: prompt({ask: 'What is the benchmark version? '}) || null,
        plaintext: prompt({ask: 'What is the notes for release info? '}) || null,
      },
      stigid: prompt({ask: 'What is the STIG ID? '}) || null,
      role: prompt({ask: 'What is the computing role? (None/Workstation/Member Server/Domain Controller) '}) || null,
      type: _.capitalize(prompt({ask: 'What is the asset type? (Computing/Non-Computing) '})) || null,
      hostname: prompt({ask: 'What is the asset hostname? '}) || null,
      ip: prompt({ask: 'What is the asset IP address? '}) || null,
      mac: prompt({ask: 'What is the asset MAC address? '}) || null,
      tech_area: prompt({ask: 'What is the tech area? (Application Review/Boundary Security/CDS Admin Review/CDS Technical Review/Database Review/Domain Name System (DNS)/Exchange Server/Host Based System Security (HBSS)/Internal Network/Mobility/Releasable Networks (REL)/Releaseable Networks (REL)/Traditional Security/UNIX OS/VVOIP Review/Web Review/Windows OS/Other Review) '}) || null, // Yes, these typos really are how the enumerations are defined in STIG viewer's source code
      target_key: prompt({ask: 'What is the target key? '}) || null,
      web_or_database: prompt({ask: 'Is the target a web or database? (y/n) '}).toLowerCase() === 'y',
      web_db_site: prompt({ask: 'What is the Web or DB site? '}) || null,
      web_db_instance: prompt({ask: 'What is the Web or DB instance? '}) || null,
    }
    fs.writeFileSync(flags.output, JSON.stringify(cklMetadata))
  }
}
