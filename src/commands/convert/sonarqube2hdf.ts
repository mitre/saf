import {SonarQubeResults as Mapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import fs from 'fs'

import {checkSuffix} from '../../utils/global'

export default class Sonarqube2HDF extends Command {
  static description = 'Pull SonarQube vulnerabilities for the specified project name and optional branch or pull/merge request ID name from an API and convert into a Heimdall Data Format JSON file'

  static examples = ['saf convert sonarqube2hdf -n sonar_project_key -u http://sonar:9000 --auth abcdefg -p 123 -o scan_results.json']

  static flags = {
    auth: Flags.string({char: 'a', description: 'SonarQube API Key', required: true}),
    branch: Flags.string({char: 'b', description: 'Requires Sonarqube Developer Edition or above', exclusive: ['pullRequestID'], required: false}),
    help: Flags.help({char: 'h'}),
    output: Flags.string({char: 'o', description: 'Output HDF JSON File', required: true}),
    projectKey: Flags.string({char: 'n', description: 'SonarQube Project Key', required: true}),
    pullRequestID: Flags.string({char: 'p', description: 'Requires Sonarqube Developer Edition or above', exclusive: ['branch'], required: false}),
    url: Flags.string({char: 'u', description: 'SonarQube Base URL (excluding \'/api\')', required: true}),
  }

  static usage = 'convert sonarqube2hdf -n <sonar-project-key> -u <http://your.sonar.instance:9000> -a <your-sonar-api-key> [ -b <target-branch> | -p <pull-request-id> ] -o <hdf-scan-results-json>'

  async run() {
    const {flags} = await this.parse(Sonarqube2HDF)
    const converter = new Mapper(flags.url, flags.projectKey, flags.auth, flags.branch, flags.pullRequestID)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(await converter.toHdf()))
  }
}
