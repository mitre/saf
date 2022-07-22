import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { POAMApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getDescriptionForEndpoint, getExamplesForEndpoint, getFlagsForEndpoint } from '../../../emasscommands/utilities';


export default class EmasserGetPoams extends Command {

  static usage = 'get poams [ARGUMENT]'

  static description = getDescriptionForEndpoint(process.argv);

  static examples = getExamplesForEndpoint(process.argv); 

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the get poams endpoint'}),
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
      //getSystemPoams(systemId: number, scheduledCompletionDateStart?: string, scheduledCompletionDateEnd?: string, controlAcronyms?: string, ccis?: string, systemOnly?: boolean
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
    let suggestions = 'get poams [-h or --help]\n\tget poams forSystem\n\tget poams byPoamId';
    this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
  }
}

// By system ID


// By poamId
// getSystemPoamsByPoamId(systemId: number, poamId: number