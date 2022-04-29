import {IonChannelAPIMapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import {createWinstonLogger} from '../../utils/logging'
import fs from 'fs'
import path from 'path'

export default class ION2HDF extends Command {
  static usage = 'convert ion2hdf -a, --apiKey -t, --team <team-name> -o, --output <output-folder> -p, --project <project-name> -A, --allProjects (true/false)';

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
    const {flags} = await this.parse(ION2HDF)
    const logger = createWinstonLogger('Ion2HDF', flags.logLevel)

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
        fs.writeFileSync(path.join(flags.output, project.name + '.json'), JSON.stringify(await apiClient.toHdf()))
      }
    } else if (Array.isArray(flags.project)) {
      fs.mkdirSync(flags.output)
      for (const projectName of flags.project) {
        logger.info(`Pulling findings from ${projectName}`)
        await apiClient.setProject(projectName)
        logger.debug(`Set project ID ${apiClient.projectId}`)
        fs.writeFileSync(path.join(flags.output, projectName + '.json'), JSON.stringify(await apiClient.toHdf()))
      }
    } else {
      throw new TypeError('Please provide either list of projects or use --allProjects')
    }
  }
}
