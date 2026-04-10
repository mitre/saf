import { CloudResourceResultsApi } from '@mitre/emass_client';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

const CMD_HELP = 'saf emasser delete cloud_resources -h or --help';
export default class EmasserDeleteCloudResources extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'Remove one or multiple containers in a system identified by system Id';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-r,--resourceId] <resource-id> <resource-id> ...'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show help for the SAF CLI eMASSer DELETE Cloud Resources command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserDeleteCloudResources);
    const apiCxn = new ApiConnection();
    const cloudResource = new CloudResourceResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    const requestBodyArray = flags.resourceId.map(resourceId => ({ resourceId: resourceId.replace(',', '') }));

    // Call the API
    try {
      const response = await cloudResource.deleteCloudResources(flags.systemId, requestBodyArray);
      console.log(colorize(outputFormat(response, false)));
    } catch (error: unknown) {
      displayError(error, 'Cloud Resources');
    }
  }

  protected catch(err: Error & { exitCode?: number }): Promise<void> {
    // If error message is for missing flags, display what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \u001B[93m${CMD_HELP}\u001B[0m`));
    } else {
      this.warn(err);
    }
    return Promise.resolve();
  }
}
