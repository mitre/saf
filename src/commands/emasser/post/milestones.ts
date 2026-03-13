import { MilestonesApi } from '@mitre/emass_client';
import type { MilestonesGet as Milestones } from '@mitre/emass_client/dist/api';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

const CMD_HELP = 'saf emasser post milestones -h or --help';
export default class EmasserPostMilestones extends Command {
  static readonly usage = '<%= command.id %> -s <value> -p <value> -d <description> -c <completion-date>';

  static readonly description = 'Add milestones to one or many POA&M items in a system\n'
    + 'Milestones provide specific information about the status\n'
    + 'of processes used to mitigate risks and weakness findings.\n';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-p,--poamId] [-d,--description] [-c,--scheduledCompletionDate]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the POST Milestones command' }),
    ...getFlagsForEndpoint(process.argv),
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
    try {
      const response = await addMilestone.addMilestoneBySystemIdAndPoamId(flags.systemId, flags.poamId, requestBodyArray);
      console.log(colorize(outputFormat(response, false)));
    } catch (error: unknown) {
      displayError(error, 'Milestones');
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
