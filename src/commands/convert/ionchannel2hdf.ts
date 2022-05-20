import {IonChannelAPIMapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import {createWinstonLogger} from '../../utils/logging'
import fs from 'fs'
import path from 'path'

export default class IonChannel2HDF extends Command {
  static usage = 'convert ionchannel2hdf -a, --apiKey -t, --team <team-name> -o, --output <output-folder> --raw -p, --project <project-name> -A, --allProjects (true/false)';

  static description =
    'Pull and translate SBOM data from Ion Channel into Heimdall Data Format';

  static flags = {
    help: Flags.help({char: 'h'}),
    apiKey: Flags.string({
      char: 'a',
      description: 'API Key from Ion Channel user settings',
      required: true,
    }),
    teamName: Flags.string({
      char: 't',
      description:
        'Your team name that contains the project(s) you would like to pull data from',
      required: true,
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output HDF JSON folder',
    }),
    raw: Flags.boolean({description: 'Output IonChannel raw data'}),
    project: Flags.string({
      char: 'p',
      description: 'The name of the project(s) you would like to pull',
      multiple: true,
    }),
    allProjects: Flags.boolean({
      char: 'A',
      description: 'Pull all projects available within your team',
    }),
    logLevel: Flags.string({
      char: 'L',
      required: false,
      default: 'info',
      options: ['info', 'warn', 'debug', 'verbose'],
    }),
  };

  async run() {
    const {flags} = await this.parse(IonChannel2HDF)
    const logger = createWinstonLogger('IonChannel2HDF', flags.logLevel)

    logger.debug('Creating Ion Channel API Client')
    const apiClient = new IonChannelAPIMapper(flags.apiKey)
    logger.debug(`Setting team to ${flags.teamName}`)
    await apiClient.setTeam(flags.teamName)
    logger.debug(`Set team to ID ${apiClient.teamId}`)
    if (flags.allProjects) {
      fs.mkdirSync(flags.output)
      const availableProjects = await apiClient.getProjects()
      for (const project of availableProjects) {
        logger.info(`Pulling findings from ${project.name}`)
        apiClient.projectId = project.id
        apiClient.analysisId = project.analysis_summary.analysis_id
        let filename = ''
        let json = {}
        if (flags.raw) {
          filename = project.name + '_raw.json'
          json = await apiClient.getAnalysis().then(({analysis}) => analysis)
        } else {
          filename = project.name + '.json'
          json = await apiClient.toHdf()
        }

        fs.writeFileSync(path.join(flags.output, filename), JSON.stringify(json))
      }
    } else if (Array.isArray(flags.project)) {
      fs.mkdirSync(flags.output)
      for (const projectName of flags.project) {
        logger.info(`Pulling findings from ${projectName}`)
        await apiClient.setProject(projectName)
        logger.debug(`Set project ID ${apiClient.projectId}`)
        let filename = ''
        let json = {}
        if (flags.raw) {
          filename = projectName + '_raw.json'
          json = await apiClient.getAnalysis().then(({analysis}) => analysis)
        } else {
          filename = projectName + '.json'
          json = await apiClient.toHdf()
        }

        fs.writeFileSync(path.join(flags.output, filename), JSON.stringify(json))
      }
    } else {
      throw new TypeError('Please provide either list of projects or use --allProjects')
    }
  }
}
