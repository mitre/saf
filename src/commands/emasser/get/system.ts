import { colorize } from 'json-colorizer';
import { Command, Flags } from '@oclif/core';
import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { SystemsApi } from '@mitre/emass_client';
import { SystemResponse } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { displayError, FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetSystem extends Command {
  static readonly usage = '<%= command.id %> [FLAG]';

  static readonly description = 'Get system information for a specific system defined by ID (systemId)';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s, --systemId] <value> [options]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET System command' }),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetSystem);
    const apiCxn = new ApiConnection();
    const getSystems = new SystemsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    getSystems.getSystem(flags.systemId, flags.includePackage, flags.policy).then((response: SystemResponse) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error: unknown) => displayError(error, 'Systems'));
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get system [-h or --help]';
      this.warn('Invalid arguments\nTry this 👇:\n\t' + suggestions);
    }
  }
}
