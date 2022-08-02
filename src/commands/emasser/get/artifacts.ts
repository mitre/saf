import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { ArtifactsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getDescriptionForEndpoint, getExamplesForEndpoint, getFlagsForEndpoint } from '../../../emasscommands/utilities';

export default class EmasserGetArtifacts extends Command {

  static usage = 'get artifacts [ARGUMENTS]'

  static description = getDescriptionForEndpoint(process.argv, 'artifacts');

  static examples = getExamplesForEndpoint(process.argv); 

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the get Artifacts endpoint'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }

  static args = [
    {name: "forSystem", description: 'Retrieves available milestones for provided system (Id)', required: false},
    {name: "export", description: 'Exports the milestone(s) for provided system (Id) and file name', required: false},
  ]

  async run(): Promise<void> {

    const {args, flags} = await this.parse(EmasserGetArtifacts)
    const apiCxn = new ApiConnection();
    const getArtifacts = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    if (args.all === 'forSystem') {
        getArtifacts.getSystemArtifacts(flags.systemId,flags.filename,flags.controlAcronyms,flags.ccis,flags.systemOnly).then((data:any) => {
        console.log(colorize(outputFormat(data.data)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.all === 'export') {
      // Order is important here
      getArtifacts.getSystemArtifactsExport(flags.systemId,flags.filename,flags.compress).then((data:any) => {
        console.log(colorize(outputFormat(data.data)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else {
      throw this.error;
    }
  }
  async catch(error: any) {
    let suggestions = 'get artifacts [-h or --help]\n\tget artifacts forSystem\n\tget artifacts export';
    this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
  }
}