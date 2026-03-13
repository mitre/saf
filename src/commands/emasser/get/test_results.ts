import { TestResultsApi } from '@mitre/emass_client';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetTestResults extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'Get test results for a specific system defined by ID (systemId)';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s, --systemId] <value> [options]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET Test Results command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetTestResults);
    const apiCxn = new ApiConnection();
    const getTestResults = new TestResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    try {
      const response = await getTestResults.getSystemTestResults(flags.systemId, flags.controlAcronyms, flags.ccis, flags.latestOnly);
      console.log(colorize(outputFormat(response)));
    } catch (error: unknown) {
      displayError(error, 'Test Results');
    }
  }

  protected catch(error: unknown): Promise<void> {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get test_results [-h or --help]';
      this.warn('Invalid arguments\nTry this 👇:\n\t' + suggestions);
    }
    return Promise.resolve();
  }
}
