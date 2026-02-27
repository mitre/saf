import { colorize } from 'json-colorizer';
import { Command, Flags } from '@oclif/core';

import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { displayError, FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

import { HardwareBaselineApi } from '@mitre/emass_client';
import {
  HwBaselineResponseDelete,
  HwBaselineRequestDeleteBodyInner as HwDeleteBody,
} from '@mitre/emass_client/dist/api';

const CMD_HELP = 'saf emasser delete hardware_baseline -h or --help';
export default class EmasserDeleteHardwareBaseline extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'Remove one or many Hardware items in a system identified by system and hardware Id';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-a,--assetsHardwareId] <hardware-id> <hardware-id> ...'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show help for the SAF CLI eMASSer DELETE Hardware Baseline command' }),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserDeleteHardwareBaseline);
    const apiCxn = new ApiConnection();
    const delHwBaseline = new HardwareBaselineApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    const requestBodyArray: HwDeleteBody[] = [];
    flags.assetsHardwareId.forEach((hardwareId: string) => {
      requestBodyArray.push({ hardwareId: hardwareId }); // skipcq: JS-0240
    });

    // Call the endpoint
    delHwBaseline.deleteHwBaselineAssets(flags.systemId, requestBodyArray).then((response: HwBaselineResponseDelete) => {
      console.log(colorize(outputFormat(response, false)));
    }).catch((error: unknown) => displayError(error, 'Hardware Baseline'));
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
