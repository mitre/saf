import { IonChannelAPIMapper, IonChannelMapper } from '@mitre/hdf-converters';
import { Flags } from '@oclif/core';
import {
  basename,
  checkInput,
  checkSuffix,
} from '../../utils/global';
import { createWinstonLogger } from '../../utils/logging';
import fs from 'fs';
import path from 'path';
import { BaseCommand } from '../../utils/oclif/baseCommand';

export default class IonChannel2HDF extends BaseCommand<typeof IonChannel2HDF> {
  static readonly usage
    = 'convert ionchannel2hdf -o <hdf-output-folder> [-h] (-i <ionchannel-json>... | -a <api-key> -t <team-name> [--raw ] [-p <project>...] [-A ]) [-L info|warn|debug|verbose]';

  static readonly description
    = 'Pull and translate SBOM data from Ion Channel into Heimdall Data Format';

  static readonly examples = [
    {
      description: '\u001B[93mUsing Input IonChannel JSON file\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -o output-folder-name -i ion-channel-file.json',
    },
    {
      description: '\u001B[93mUsing IonChannel API Key (pull one project)\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -o output-folder-name -a ion-channel-apikey -t team-name -p project-name-to-pull --raw',
    },
    {
      description: '\u001B[93mUsing IonChannel API Key (pull all project)\u001B[0m',
      command: '<%= config.bin %> <%= command.id %> -o output-folder-name -a ion-channel-apikey -t team-name -A --raw',
    },

  ];

  static readonly flags = {
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
  };

  async run() {
    const { flags } = await this.parse(IonChannel2HDF);
    const logger = createWinstonLogger('IonChannel2HDF', flags.logLevel);

    if (!Array.isArray(flags.input) && !(flags.apiKey && flags.teamName)) {
      throw new Error(
        'Please either provide a list of input files or set the api key and the team name.',
      );
    }

    if (flags.apiKey && flags.teamName && flags.allProjects) {
      logger.debug('Creating Ion Channel API Client');
      const apiClient = new IonChannelAPIMapper(flags.apiKey);
      logger.debug(`Setting team to ${flags.teamName}`);
      await apiClient.setTeam(flags.teamName);
      logger.debug(`Set team to ID ${apiClient.teamId}`);

      fs.mkdirSync(flags.output);
      const availableProjects = await apiClient.getProjects();
      for (const project of availableProjects) {
        logger.info(`Pulling findings from ${project.name}`);
        apiClient.projectId = project.id;
        apiClient.analysisId = project.analysis_summary.analysis_id;
        let filename = '';
        let json = {};
        if (flags.raw) {
          filename = project.name + '_raw.json';
          json = await apiClient.getAnalysis().then(({ analysis }) => analysis);
        } else {
          filename = project.name + '.json';
          json = await apiClient.toHdf();
        }

        fs.writeFileSync(
          path.join(flags.output, basename(filename)),
          JSON.stringify(json, null, 2),
        );
      }
    } else if (flags.apiKey && flags.teamName && Array.isArray(flags.project)) {
      logger.debug('Creating Ion Channel API Client');
      const apiClient = new IonChannelAPIMapper(flags.apiKey);
      logger.debug(`Setting team to ${flags.teamName}`);
      await apiClient.setTeam(flags.teamName);
      logger.debug(`Set team to ID ${apiClient.teamId}`);

      fs.mkdirSync(flags.output);
      for (const projectName of flags.project) {
        logger.info(`Pulling findings from ${projectName}`);
        await apiClient.setProject(projectName);
        logger.debug(`Set project ID ${apiClient.projectId}`);
        let filename = '';
        let json = {};
        if (flags.raw) {
          filename = projectName + '_raw.json';
          json = await apiClient.getAnalysis().then(({ analysis }) => analysis);
        } else {
          filename = projectName + '.json';
          json = await apiClient.toHdf();
        }

        fs.writeFileSync(
          path.join(flags.output, basename(filename)),
          JSON.stringify(json, null, 2),
        );
      }
    } else if (Array.isArray(flags.input)) {
      logger.debug('Processing input files');
      fs.mkdirSync(flags.output);
      for (const filename of flags.input) {
        // Check for correct input type
        const data = fs.readFileSync(filename, 'utf8');
        checkInput(
          { data: data, filename: filename }, // skipcq: JS-0240
          'ionchannel',
          'IonChannel JSON',
        );

        logger.debug(`Processing...${filename}`);
        fs.writeFileSync(
          path.join(
            flags.output,
            checkSuffix(basename(filename)),
          ),
          JSON.stringify(new IonChannelMapper(data).toHdf()),
        );
      }
    } else {
      throw new TypeError(
        'Please provide a list of input files, a list of projects, or use the --allProjects flag.',
      );
    }
  }
}
