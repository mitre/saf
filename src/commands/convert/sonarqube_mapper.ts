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
  static usage = 'sonarqube_mapper -n <sonar_project_key> -u <http://your.sonar.instance:9000> --auth <your-sonar-api-key> -o <hdf-scan-results-json>'

  static description = fs.readFileSync('./help/sonarqube_mapper.md', {encoding: 'utf-8'}).split('Examples:\n')[0]

  static examples = [fs.readFileSync('./help/sonarqube_mapper.md', {encoding: 'utf-8'}).split('Examples:\n')[1]]

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
