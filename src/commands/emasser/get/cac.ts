import { colorize } from 'json-colorizer';
import { CACApi } from '@mitre/emass_client';
import { Command, Flags } from '@oclif/core';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetCac extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'View one or many Control Approval Chain (CAC) in a system specified system ID';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s, --systemId] <value>'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET CAC command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetCac);
    const apiCxn = new ApiConnection();
    const getCac = new CACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    try {
      const response = await getCac.getSystemCac(flags.systemId, flags.controlAcronyms);
      console.log(colorize(outputFormat(response)));
    } catch (error: unknown) {
      displayError(error, 'CAC');
    }
  }

  protected catch(error: unknown): Promise<void> {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get cac [-h or --help]';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
    return Promise.resolve();
  }
}
