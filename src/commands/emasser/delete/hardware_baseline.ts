import { HardwareBaselineApi } from '@mitre/emass_client';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

const CMD_HELP = 'saf emasser delete hardware_baseline -h or --help';
export default class EmasserDeleteHardwareBaseline extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'Remove one or many Hardware items in a system identified by system and hardware Id';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-a,--assetsHardwareId] <hardware-id> <hardware-id> ...'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show help for the SAF CLI eMASSer DELETE Hardware Baseline command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserDeleteHardwareBaseline);
    const apiCxn = new ApiConnection();
    const delHwBaseline = new HardwareBaselineApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    const requestBodyArray = flags.assetsHardwareId.map(hardwareId => ({ hardwareId }));

    // Call the endpoint
    try {
      const response = await delHwBaseline.deleteHwBaselineAssets(flags.systemId, requestBodyArray);
      console.log(colorize(outputFormat(response, false)));
    } catch (error: unknown) {
      displayError(error, 'Hardware Baseline');
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
