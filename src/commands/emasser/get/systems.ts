import { colorize } from 'json-colorizer';
import { Command, Flags } from '@oclif/core';
import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { getFlagsForEndpoint, FlagOptions, displayError } from '../../../utils/emasser/utilities';
import { SystemsApi } from '@mitre/emass_client';
import { SystemsResponse } from '@mitre/emass_client/dist/api';

export default class EmasserGetSystems extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'Get available systems filter on provided options';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [options]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET Systems command' }),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetSystems);
    const apiCxn = new ApiConnection();
    const getSystems = new SystemsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    getSystems.getSystems(

      flags.includePackage, flags.registrationType, flags.ditprId, flags.coamsId,
      flags.policy, flags.includeDitprMetrics, flags.includeDecommissioned, flags.reportsForScorecard,
    ).then((response: SystemsResponse) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error: unknown) => displayError(error, 'Systems'));
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get systems [-h or --help]';
      this.warn('Invalid arguments\nTry this 👇:\n\t' + suggestions);
    }
  }
}
