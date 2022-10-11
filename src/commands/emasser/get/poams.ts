import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { POAMApi } from '@mitre/emass_client';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { getDescriptionForEndpoint, getExamplesForEndpoint, getFlagsForEndpoint } from '../../../utils/emasser/utilities';


export default class EmasserGetPoams extends Command {

  static usage = 'get poams [ARGUMENTS]'

  static description = getDescriptionForEndpoint(process.argv, 'poams');

  static examples = getExamplesForEndpoint(process.argv); 

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET POA&Ms endpoint'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }

  static args = [
    {name: "forSystem", description: 'Retrieves Poams for specified system ID', required: false},
    {name: "byPoamId", description: 'Retrieves Poams for specified system and poam ID', required: false},
  ]

  async run(): Promise<void> {

    const {args, flags} = await this.parse(EmasserGetPoams)
    const apiCxn = new ApiConnection();
    const getPoams = new POAMApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    if (args.forSystem === 'forSystem') {
      // Order is important here
      getPoams.getSystemPoams(flags.systemId,flags.scheduledCompletionDateStart,flags.scheduledCompletionDateEnd,flags.controlAcronyms,flags.ccis,flags.systemOnly).then((data:any) => {
        console.log(colorize(outputFormat(data.data)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.forSystem === 'byPoamId') {
      // Order is important here
      getPoams.getSystemPoamsByPoamId(flags.systemId,flags.poamId).then((data:any) => {
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
      let suggestions = 'get poams [-h or --help]\n\tget poams forSystem\n\tget poams byPoamId';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
  }
}
