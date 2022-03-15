import BaseCommand, {omitFlags} from '../../utils/base-command'
import {OutputFlags} from '@oclif/parser'
import {flags} from '@oclif/command'
import fs from 'fs'
import {SonarQubeResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {getHDFSummary} from '../../utils/logging'
import _ from 'lodash'

export default class Sonarqube2HDF extends BaseCommand {
  static usage = 'convert:sonarqube2hdf -n <sonar_project_key> -u <http://your.sonar.instance:9000> --auth <your-sonar-api-key> -o <hdf-scan-results-json>'

  static description = 'Pull SonarQube vulnerabilities for the specified project name from an API and convert into a Heimdall Data Format JSON file'

  static examples = ['saf convert:sonarqube2hdf -n sonar_project_key -u http://sonar:9000 --auth YOUR_API_KEY -o scan_results.json']

  static flags = {
    ...omitFlags(['input']),
    auth: flags.string({char: 'a', required: true}),
    projectKey: flags.string({char: 'n', required: true}),
    url: flags.string({char: 'u', required: true}),
  }

  async run() {
    const flags = this.parsedFlags as OutputFlags<typeof Sonarqube2HDF.flags>

    this.logger.verbose(`Reading Data from SonarQube Project: ${flags.projectKey}`)
    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    this.logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(flags.url, flags.projectKey, flags.auth)
    this.logger.info('Starting conversion from SonarQube to HDF')
    const converted = await converter.toHdf()

    // Write to file
    this.logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    this.logger.verbose(`HDF successfully written to ${fileName}`)
  }
}
