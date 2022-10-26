import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { MilestonesApi } from '@mitre/emass_client';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import {  FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserPutMilestones extends Command {

  static usage = '<%= command.id %> [ARGUMENTS]';

  static description = 'Update milestone(s) for specified system and poam Id';

  static examples = ['<%= config.bin %> <%= command.id %> --systemId <value> --poamId <value> --milestoneId <value> --description <value> [options]']; 

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the PUT Milestones endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPutMilestones)
    const apiCxn = new ApiConnection();
    const putMilestones = new MilestonesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    let requestBodyArray: object[] = [];
    requestBodyArray.push({
      milestoneId: flags.milestoneId,
      description: flags.description,
      scheduledCompletionDate: parseFloat(flags.scheduledCompletionDate),
    });

    putMilestones.addMilestoneBySystemIdAndPoamId(flags.systemId,flags.poamId,requestBodyArray).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}