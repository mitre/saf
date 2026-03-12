import { ControlsApi } from '@mitre/emass_client';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetControls extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'Get system Security Control information for both the Implementation Plan and Risk Assessment';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s, --systemId] <value> [option]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET Controls command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetControls);
    const apiCxn = new ApiConnection();
    const getControls = new ControlsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    try {
      const response = await getControls.getSystemControls(flags.systemId, flags.acronyms);
      console.log(colorize(outputFormat(response)));
    } catch (error: unknown) {
      displayError(error, 'Controls');
    }
  }

  protected catch(error: unknown): Promise<void> {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get controls [-h or --help]';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
    return Promise.resolve();
  }
}
