import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { MilestonesApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getDescriptionForEndpoint, getExamplesForEndpoint, getFlagsForEndpoint } from '../../../emasscommands/utilities';

export default class EmasserGetMilestones extends Command {

  static usage = 'get milestones [ARGUMENT]'

  static description = getDescriptionForEndpoint(process.argv);

  static examples = getExamplesForEndpoint(process.argv); 

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the get roles endpoint'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }

  static args = [
    {name: "all", description: 'Retrieves all available system roles', required: false},
    {name: "byCategory", description: 'Retrieves role(s) - filtered by [options] params', required: false},
  ]

  async run(): Promise<void> {

    const {args, flags} = await this.parse(EmasserGetMilestones)
    const apiCxn = new ApiConnection();
    const getMilestones = new MilestonesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    if (args.all === 'all') {
        getMilestones.getSystemMilestonesByPoamId(flags.systemId,flags.poamId,flags.scheduledCompletionDateStart,flags.scheduledCompletionDateEnd).then((data:any) => {
        console.log(colorize(outputFormat(data.data)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.all === 'byCategory') {
      // Order is important here
      getMilestones.getSystemMilestonesByPoamIdAndMilestoneId(flags.systemId,flags.poamId,flags.milestoneId).then((data:any) => {
        console.log(colorize(outputFormat(data.data)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else {
      throw this.error;
    }
  }
  async catch(error: any) {
    let suggestions = 'get roles [-h or --help]\n\tget roles all\n\tget roles byCategory';
    this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
  }
}