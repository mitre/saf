import { colorize } from 'json-colorizer';
import { Command, Flags } from '@oclif/core';

import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { displayError, FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

import { MilestonesApi } from '@mitre/emass_client';
import { MilestoneResponsePost,
  MilestonesGet as Milestones } from '@mitre/emass_client/dist/api';

const CMD_HELP = 'saf emasser post milestones -h or --help';
export default class EmasserPostMilestones extends Command {
  static readonly usage = '<%= command.id %> -s <value> -p <value> -d <description> -c <completion-date>';

  static readonly description = 'Add milestones to one or many POA&M items in a system\n'
    + 'Milestones provide specific information about the status\n'
    + 'of processes used to mitigate risks and weakness findings.\n';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-p,--poamId] [-d,--description] [-c,--scheduledCompletionDate]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the POST Milestones command' }),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserPostMilestones);
    const apiCxn = new ApiConnection();
    const addMilestone = new MilestonesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    const requestBodyArray: Milestones[] = [
      {
        description: flags.description,
        scheduledCompletionDate: Number.parseFloat(flags.scheduledCompletionDate),
      },
    ];

    // Call the endpoint
    addMilestone.addMilestoneBySystemIdAndPoamId(flags.systemId, flags.poamId, requestBodyArray).then((response: MilestoneResponsePost) => {
      console.log(colorize(outputFormat(response, false)));
    }).catch((error: unknown) => displayError(error, 'Milestones'));
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
