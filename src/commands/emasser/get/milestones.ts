import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { MilestonesApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getDescriptionForEndpoint, getExamplesForEndpoint, getFlagsForEndpoint } from '../../../emasscommands/utilities';

export default class EmasserGetMilestones extends Command {

  static usage = 'get milestones [ARGUMENTS]'

  static description = getDescriptionForEndpoint(process.argv, 'milestones');

  static examples = getExamplesForEndpoint(process.argv); 

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Milestones endpoint'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }

  static args = [
    {name: "byPoamId", description: 'Retrieves milestone(s) for specified system and poam Id', required: false},
    {name: "byMilestoneId", description: 'Retrieves milestone(s) for specified system, poam, and milestone Id', required: false},
  ]

  async run(): Promise<void> {

    const {args, flags} = await this.parse(EmasserGetMilestones)
    const apiCxn = new ApiConnection();
    const getMilestones = new MilestonesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    if (args.byPoamId === 'byPoamId') {
      // Order is important here
      getMilestones.getSystemMilestonesByPoamId(flags.systemId,flags.poamId,flags.scheduledCompletionDateStart,flags.scheduledCompletionDateEnd).then((data:any) => {
        console.log(colorize(outputFormat(data.data)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.byPoamId === 'byMilestoneId') {
      // Order is important here
      getMilestones.getSystemMilestonesByPoamIdAndMilestoneId(flags.systemId,flags.poamId,flags.milestoneId).then((data:any) => {
        console.log(colorize(outputFormat(data.data)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else {
      throw this.error;
    }
  }
  
  async catch(error: any) {
    if (error.message) {
      this.error(error)
    } else {
      let suggestions = 'get milestones [-h or --help]\n\tget milestones byPoamId\n\tget milestones byMilestoneId';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
  }
}