import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import promptSync from 'prompt-sync'

const prompt = promptSync()

export default class GenerateInSpecMetadata extends Command {
  static usage = 'generate inspec_metadata -o <json-file>'

  static description = 'Generate an InSpec metadata template for "saf convert *2inspec_stub"'

  static examples = ['saf generate inspec_metadata -o ms_sql_baseline_metadata.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    output: Flags.string({char: 'o', required: true, description: 'Output JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(GenerateInSpecMetadata)
    console.log("Please fill in the following fields to the best of your ability, if you do not have a value, please leave the field empty.")
    const inspecMetadata = {
      maintainer: prompt({ask: 'Who is the maintainer? '}) || null,
      copyright: prompt({ask: 'Who is the copyright holder? '}) || null,
      copyright_email: prompt({ask: 'What is the email of the copyright holder? '}) || null,
      license: prompt({ask: 'What is the license of the profile? '}),
      version: prompt({ask: 'What is the version of the profile? '}),
    }
    fs.writeFileSync(flags.output, JSON.stringify(inspecMetadata))
  }
}
