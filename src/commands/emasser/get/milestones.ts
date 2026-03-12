import { MilestonesApi } from '@mitre/emass_client';
import { Args, Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import {
  displayError,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint,
} from '../../../utils/emasser/utilities';

const endpoint = 'milestones';

export default class EmasserGetMilestones extends Command {
  static readonly usage = '<%= command.id %> [ARGUMENT] [FLAGS] \n \u001B[93m NOTE: see EXAMPLES for argument case format\u001B[0m';

  static readonly description = getDescriptionForEndpoint(process.argv, endpoint);

  static readonly examples = getExamplesForEndpoint(process.argv, endpoint);

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET Milestones command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  // NOTE: The way args are being implemented are mainly for the purposes of help clarity, there is, displays
  //       the available arguments with associate description.
  // Only args.name is used, there is, it contains the argument listed by the user.
  // Example: If the user uses the command (saf emasser get milestones byPoamId), args.name is set to byPoamId
  static readonly args = {
    name: Args.string({ name: 'name', required: false, hidden: true }),
    byPoamId: Args.string({ name: 'byPoamId', description: 'Retrieves milestone(s) for specified system and poam Id', required: false }),
    byMilestoneId: Args.string({ name: 'byMilestoneId', description: 'Retrieves milestone(s) for specified system, poam, and milestone Id', required: false }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(EmasserGetMilestones);
    const apiCxn = new ApiConnection();
    const getMilestones = new MilestonesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    if (args.name === 'byPoamId') {
      // Order is important here
      try {
        const response = await getMilestones.getSystemMilestonesByPoamId(flags.systemId, flags.poamId, flags.scheduledCompletionDateStart, flags.scheduledCompletionDateEnd);
        console.log(colorize(outputFormat(response)));
      } catch (error: unknown) {
        displayError(error, 'Milestones');
      }
    } else if (args.name === 'byMilestoneId') {
      // Order is important here
      try {
        const response = await getMilestones.getSystemMilestonesByPoamIdAndMilestoneId(flags.systemId, flags.poamId, flags.milestoneId);
        console.log(colorize(outputFormat(response)));
      } catch (error: unknown) {
        displayError(error, 'Milestones');
      }
    } else {
      throw new Error(`Unexpected argument: ${args.name}`);
    }
  }

  protected catch(error: unknown): Promise<void> {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get milestones [-h or --help]\n\tget milestones byPoamId\n\tget milestones byMilestoneId';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
    return Promise.resolve();
  }
}
