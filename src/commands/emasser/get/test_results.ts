import { colorize } from 'json-colorizer';
import { Command, Flags } from '@oclif/core';
import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { TestResultsApi } from '@mitre/emass_client';
import { TestResultsResponseGet } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { displayError, FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetTestResults extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'Get test results for a specific system defined by ID (systemId)';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s, --systemId] <value> [options]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET Test Results command' }),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetTestResults);
    const apiCxn = new ApiConnection();
    const getTestResults = new TestResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    getTestResults.getSystemTestResults(flags.systemId, flags.controlAcronyms, flags.ccis, flags.latestOnly).then((response: TestResultsResponseGet) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error: unknown) => displayError(error, 'Test Results'));
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get test_results [-h or --help]';
      this.warn('Invalid arguments\nTry this 👇:\n\t' + suggestions);
    }
  }
}
