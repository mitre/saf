import {Command, Flags} from '@oclif/core'
import fs from 'fs'
import {SonarQubeResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix} from '../../utils/global'

export default class Sonarqube2HDF extends Command {
  static usage = 'convert sonarqube2hdf -n <sonar-project-key> -u <http://your.sonar.instance:9000> -a <your-sonar-api-key> [ -b <target-branch> | -p <pull-request-id> ] -o <hdf-scan-results-json>'

  static description = 'Pull SonarQube vulnerabilities for the specified project name and optional branch or pull/merge request ID name from an API and convert into a Heimdall Data Format JSON file'

  static examples = ['saf convert sonarqube2hdf -n sonar_project_key -u http://sonar:9000 --auth abcdefg -p 123 -o scan_results.json']

  static flags = {
    help: Flags.help({char: 'h'}),
    auth: Flags.string({char: 'a', required: true, description: 'SonarQube API Key'}),
    projectKey: Flags.string({char: 'n', required: true, description: 'SonarQube Project Key'}),
    url: Flags.string({char: 'u', required: true, description: 'SonarQube Base URL (excluding \'/api\')'}),
    branch: Flags.string({char: 'b', required: false, exclusive: ['pullRequestID'], description: 'Requires Sonarqube Developer Edition or above'}),
    pullRequestID: Flags.string({char: 'p', required: false, exclusive: ['branch'], description: 'Requires Sonarqube Developer Edition or above'}),
    output: Flags.string({char: 'o', required: true, description: 'Output HDF JSON File'}),
  }

  async run() {
    const {flags} = await this.parse(Sonarqube2HDF)
    const converter = new Mapper(flags.url, flags.projectKey, flags.auth, flags.branch, flags.pullRequestID)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(await converter.toHdf()))
  }
}
