import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {SonarQubeResults as Mapper} from '@mitre/hdf-converters'

function checkSuffix(input: string) {
  if (input.endsWith('.json')) {
    return input
  }
  return `${input}.json`
}

export default class SonarQubeMapper extends Command {
  static usage = 'sonarqube -n <sonar_project_key> -u <http://your.sonar.instance:9000> --auth <your-sonar-api-key> -o <hdf-scan-results-json>'

  static description = 'Pull SonarQube vulnerabilities for the specified project name from an API and convert into a Heimdall Data Format JSON file'

  static examples = ['saf convert:sonarqube -n sonar_project_key -u http://sonar:9000 --auth YOUR_API_KEY -o scan_results.json']

  static flags = {
    help: flags.help({char: 'h'}),
    auth: flags.string({char: 'a', required: true}),
    projectKey: flags.string({char: 'n', required: true}),
    url: flags.string({char: 'u', required: true}),
    output: flags.string({char: 'o', required: true}),
  }

  async run() {
    const {flags} = this.parse(SonarQubeMapper)
    const converter = new Mapper(flags.url, flags.projectKey, flags.auth)
    fs.writeFileSync(checkSuffix(flags.output), JSON.stringify(await converter.toHdf()))
  }
}
