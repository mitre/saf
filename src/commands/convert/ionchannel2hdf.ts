import {IonChannelAPIMapper, IonChannelMapper} from '@mitre/hdf-converters'
import {Command, Flags} from '@oclif/core'
import {checkSuffix, convertFullPathToFilename} from '../../utils/global'
import {createWinstonLogger} from '../../utils/logging'
import fs from 'fs'
import path from 'path'

export default class IonChannel2HDF extends Command {
  static usage = 'convert ionchannel2hdf -i, --input <ionchannel-results-json> -a, --apiKey -t, --team <team-name> -o, --output <output-folder> --raw -p, --project <project-name> -A, --allProjects (true/false)';

  static description =
    'Pull and translate SBOM data from Ion Channel into Heimdall Data Format';

  static flags = {
    help: Flags.help({char: 'h'}),
    input: Flags.string({
      char: 'i',
      description: 'Input IonChannel JSON file',
      multiple: true,
      exclusive: ['apiKey'],
    }),
    apiKey: Flags.string({
      char: 'a',
      description: 'API Key from Ion Channel user settings',
      dependsOn: ['teamName'],
    }),
    teamName: Flags.string({
      char: 't',
      description:
        'Your team name that contains the project(s) you would like to pull data from',
      dependsOn: ['apiKey'],
    }),
    output: Flags.string({
      char: 'o',
      required: true,
      description: 'Output JSON folder',
    }),
    raw: Flags.boolean({
      description: 'Output Ion Channel raw data',
      dependsOn: ['apiKey'],
    }),
    project: Flags.string({
      char: 'p',
      description: 'The name of the project(s) you would like to pull',
      multiple: true,
      dependsOn: ['apiKey'],
    }),
    allProjects: Flags.boolean({
      char: 'A',
      description: 'Pull all projects available within your team',
      dependsOn: ['apiKey'],
    }),
    logLevel: Flags.string({
      char: 'L',
      default: 'info',
      options: ['info', 'warn', 'debug', 'verbose'],
    }),
  };

  async run() {
    const {flags} = await this.parse(IonChannel2HDF)
    const logger = createWinstonLogger('IonChannel2HDF', flags.logLevel)

    if (!Array.isArray(flags.input) && !(flags.apiKey && flags.teamName)) {
      throw new Error('Please either provide a list of input files or set the api key and the team name.')
    }

    if (flags.apiKey && flags.teamName && flags.allProjects) {
      logger.debug('Creating Ion Channel API Client')
      const apiClient = new IonChannelAPIMapper(flags.apiKey)
      logger.debug(`Setting team to ${flags.teamName}`)
      await apiClient.setTeam(flags.teamName)
      logger.debug(`Set team to ID ${apiClient.teamId}`)

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
    } else if (flags.apiKey && flags.teamName && Array.isArray(flags.project)) {
      logger.debug('Creating Ion Channel API Client')
      const apiClient = new IonChannelAPIMapper(flags.apiKey)
      logger.debug(`Setting team to ${flags.teamName}`)
      await apiClient.setTeam(flags.teamName)
      logger.debug(`Set team to ID ${apiClient.teamId}`)

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
    } else if (Array.isArray(flags.input)) {
      logger.debug('Processing input files')
      fs.mkdirSync(flags.output)
      for (const filename of flags.input) {
        logger.debug(`Processing...${filename}`)
        fs.writeFileSync(
          path.join(
            flags.output,
            checkSuffix(convertFullPathToFilename(filename)),
          ),
          JSON.stringify(
            (new IonChannelMapper(fs.readFileSync(filename, 'utf8'))).toHdf(),
          ),
        )
      }
    } else {
      throw new TypeError('Please provide a list of input files, a list of projects, or use the --allProjects flag.')
    }
  }
}
