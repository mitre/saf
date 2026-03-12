import { SystemsApi } from '@mitre/emass_client';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetSystem extends Command {
  static readonly usage = '<%= command.id %> [FLAG]';

  static readonly description = 'Get system information for a specific system defined by ID (systemId)';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s, --systemId] <value> [options]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET System command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetSystem);
    const apiCxn = new ApiConnection();
    const getSystems = new SystemsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    try {
      const response = await getSystems.getSystem(flags.systemId, flags.includePackage, flags.policy);
      console.log(colorize(outputFormat(response)));
    } catch (error: unknown) {
      displayError(error, 'Systems');
    }
  }

  protected catch(error: unknown): Promise<void> {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get system [-h or --help]';
      this.warn('Invalid arguments\nTry this 👇:\n\t' + suggestions);
    }
    return Promise.resolve();
  }
}
