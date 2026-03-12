import { PACApi } from '@mitre/emass_client';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetPac extends Command {
  static readonly usage = '<%= command.id %> [FLAG]';

  static readonly description = 'View one or many Package Approval Chain (PAC) in a system specified system ID';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s, --systemId] <value>'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET PAC command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetPac);
    const apiCxn = new ApiConnection();
    const getPac = new PACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    try {
      const response = await getPac.getSystemPac(flags.systemId);
      console.log(colorize(outputFormat(response)));
    } catch (error: unknown) {
      displayError(error, 'PAC');
    }
  }

  protected catch(error: unknown): Promise<void> {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get pac [-h or --help]';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
    return Promise.resolve();
  }
}
