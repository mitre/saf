import { ContainerScanResultsApi } from '@mitre/emass_client';
import type {
  ContainerResourcesDeleteBodyInner,
  ContainersResourcesPostDelete,
} from '@mitre/emass_client/dist/api';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint, type FlagOptions } from '../../../utils/emasser/utilities';

const CMD_HELP = 'saf emasser delete container_scans -h or --help';
export default class EmasserContainerScans extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'Remove one or multiple containers in a system identified by system Id';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-c,--containerId] <container-id> <container-id> ...'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show help for the SAF CLI eMASSer DELETE Container Scans command' }),
    ...getFlagsForEndpoint(process.argv), // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserContainerScans);
    const apiCxn = new ApiConnection();
    const containerScan = new ContainerScanResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    const requestBodyArray: ContainerResourcesDeleteBodyInner[] = [];
    flags.containerId.forEach((containerId: string) => {
      requestBodyArray.push({ containerId: containerId.replace(',', '') });
    });

    // Call the API
    containerScan.deleteContainerSans(flags.systemId, requestBodyArray).then((response: ContainersResourcesPostDelete) => {
      console.log(colorize(outputFormat(response, false)));
    }).catch((error: unknown) => displayError(error, 'Container Scans'));
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to return a Promise
  protected async catch(err: Error & { exitCode?: number }): Promise<void> {
    // If error message is for missing flags, display
    // what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \u001B[93m${CMD_HELP}\u001B[0m`));
    } else {
      this.warn(err);
    }
  }
}
