import { ArtifactsApi, ArtifactsExportApi } from '@mitre/emass_client';
import { Args, Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import _ from 'lodash';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { ApiConfig } from '../../../utils/emasser/api_config';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import {
  displayError,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint,
  saveFile,
} from '../../../utils/emasser/utilities';
import { getErrorMessage } from '../../../utils/global';

type ApiResponse = {
  config: {
    url: string;
  };
  data: string | object;
};

const endpoint = 'artifacts';

export default class EmasserGetArtifacts extends Command {
  static readonly usage = '<%= command.id %> [ARGUMENT] [FLAGS]\n \u001B[93m NOTE: see EXAMPLES for argument case format\u001B[0m';

  static readonly description = getDescriptionForEndpoint(process.argv, endpoint);

  static readonly examples = getExamplesForEndpoint(process.argv);

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET Artifacts command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  // NOTE: The way args are being implemented are mainly for the purposes of help clarity, there is, displays
  //       the available arguments with associate description.
  // Only args.name is used, there is, it contains the argument listed by the user.
  // Example: If the user uses the command (saf eMASSer get artifacts forSystem), args.name is set to forSystem
  static readonly args = {
    name: Args.string({ name: 'name', required: false, hidden: true }),
    forSystem: Args.string({ name: 'forSystem', description: 'Retrieves available milestones for provided system (Id)', required: false }),
    export: Args.string({ name: 'export', description: 'Exports the milestone(s) for provided system (Id) and file name', required: false }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(EmasserGetArtifacts);
    const apiCxn = new ApiConnection();

    if (args.name === 'forSystem') {
      const getArtifacts = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
      // Order is important here
      try {
        const response = await getArtifacts.getSystemArtifacts(flags.systemId, flags.filename, flags.controlAcronyms, flags.ccis, flags.systemOnly);
        console.log(colorize(outputFormat(response)));
      } catch (error: unknown) {
        displayError(error, 'Artifacts');
      }
    } else if (args.name === 'export') {
      const getArtifactsExport = new ArtifactsExportApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
      // Order is important here
      try {
        const response: ApiResponse = await getArtifactsExport.getSystemArtifactsExport(flags.systemId, flags.filename, flags.compress);
        const fileName = response.config.url.split('=')[1];
        // Zip and compress file data is of type of string output to download directory
        try {
          if (_.isString(response.data)) {
            const conf = new ApiConfig();
            console.log(`\u001B[33mOutput file: ${fileName} saved to directory: ${conf.downloadDir}\u001B[0m`);
            saveFile(conf.downloadDir, fileName, response.data);
          } else if (flags.printToStdOut) {
            console.log(colorize(JSON.stringify(response.data, null, 2)));
          } else {
            const conf = new ApiConfig();
            console.log(`\u001B[33mOutput file: ${fileName} saved to directory: ${conf.downloadDir}\u001B[0m`);
            saveFile(conf.downloadDir, fileName, JSON.stringify(response.data));
          }
        } catch (error: unknown) {
          console.error(`\u001B[31mSave File Error: ${getErrorMessage(error)}\u001B[0m`);
        }
      } catch (error: unknown) {
        displayError(error, 'Artifacts');
      }
    } else {
      throw new Error(`Unexpcted argument: ${args.name}`);
    }
  }

  protected catch(error: unknown): Promise<void> {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get artifacts [-h or --help]\n\tget artifacts forSystem\n\tget artifacts export';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
    return Promise.resolve();
  }
}
