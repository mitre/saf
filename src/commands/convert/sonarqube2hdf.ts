import {Command, flags} from '@oclif/command'
import fs from 'fs'
import {SonarQubeResults as Mapper} from '@mitre/hdf-converters'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger, getHDFSummary} from '../../utils/logging'

export default class Sonarqube2HDF extends Command {
  static usage = 'convert:sonarqube2hdf -n <sonar_project_key> -u <http://your.sonar.instance:9000> --auth <your-sonar-api-key> -o <hdf-scan-results-json>'

  static description = 'Pull SonarQube vulnerabilities for the specified project name from an API and convert into a Heimdall Data Format JSON file'

  static examples = ['saf convert:sonarqube2hdf -n sonar_project_key -u http://sonar:9000 --auth YOUR_API_KEY -o scan_results.json']

  static flags = {
    help: flags.help({char: 'h'}),
    auth: flags.string({char: 'a', required: true}),
    projectKey: flags.string({char: 'n', required: true}),
    url: flags.string({char: 'u', required: true}),
    output: flags.string({char: 'o', required: true}),
    logLevel: flags.string({char: 'L', required: false, default: 'info', options: ['info', 'warn', 'debug', 'verbose']}),
  }

  async run() {
    const {flags} = this.parse(Sonarqube2HDF)

    const logger = createWinstonLogger('SonarQube2HDF', flags.logLevel)

    logger.verbose(`Reading Data from SonarQube Project: ${flags.projectKey}`)

    // Strip Extra .json from output filename
    const fileName = checkSuffix(flags.output)
    logger.verbose(`Output Filename: ${fileName}`)

    // Convert the data
    const converter = new Mapper(flags.url, flags.projectKey, flags.auth)
    logger.info('Starting conversion from SonarQube to HDF')
    const converted = await converter.toHdf()

    // Write to file
    logger.info(`Output File "${convertFullPathToFilename(fileName)}": ${getHDFSummary(converted)}`)
    fs.writeFileSync(fileName, JSON.stringify(converted))
    logger.verbose(`Converted HDF successfully written to ${fileName}`)
  }
}
