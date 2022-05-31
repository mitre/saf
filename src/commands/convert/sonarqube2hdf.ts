import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {SonarQubeResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Sonarqube2HDF extends Command {
  static usage = 'convert sonarqube2hdf -n <sonar_project_key> -u <http://your.sonar.instance:9000> --auth <your-sonar-api-key> -b <target_branch> -o <hdf-scan-results-json>'

  static description = 'Pull SonarQube vulnerabilities for the specified project name and optional branch name from an API and convert into a Heimdall Data Format JSON file'

  static examples = ['saf convert sonarqube2hdf -n sonar_project_key -u http://sonar:9000 --auth YOUR_API_KEY -b my_branch -o scan_results.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    auth: Flags.string({char: 'a', required: true}),
    projectKey: Flags.string({char: 'n', required: true}),
    url: Flags.string({char: 'u', required: true}),
    branch: Flags.string({char: 'b', required: false}),
    output: Flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = await this.parse(Sonarqube2HDF)
    const converter = new Mapper(flags.url, flags.projectKey, flags.auth, flags.branch)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(await converter.toHdf()))
  }
}
