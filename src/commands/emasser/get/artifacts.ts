import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { ArtifactsApi, ArtifactsExportApi } from '@mitre/emass_client';
import { ArtifactsResponseGet } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, 
  getDescriptionForEndpoint, 
  getExamplesForEndpoint, 
  getFlagsForEndpoint } from '../../../utils/emasser/utilities';

const endpoint = 'artifacts';

export default class EmasserGetArtifacts extends Command {

  static usage = 'get artifacts [ARGUMENTS]';
  static description = getDescriptionForEndpoint(process.argv, endpoint);
  //static description = getDescriptionForEndpoint(process.argv);
  static examples = getExamplesForEndpoint(process.argv);
  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Artifacts endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  };
  static strict = true;
  static args = [
    {name: "name", required: false, hidden: true},
    {name: "forSystem", description: 'Retrieves available milestones for provided system (Id)', required: false},
    {name: "export", description: 'Exports the milestone(s) for provided system (Id) and file name', required: false},
  ];

  async run(): Promise<void> {

    const {args, flags} = await this.parse(EmasserGetArtifacts)
    const apiCxn = new ApiConnection();

    if (args.name === 'forSystem') {
      const getArtifacts = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
      // Order is important here
      getArtifacts.getSystemArtifacts(flags.systemId,flags.filename,flags.controlAcronyms,flags.ccis,flags.systemOnly).then((response: ArtifactsResponseGet) => {
        console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'export') {
      const getArtifactsExport = new ArtifactsExportApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
      // Order is important here
      getArtifactsExport.getSystemArtifactsExport(flags.systemId,flags.filename,flags.compress).then((response: any) => {
        if (typeof response.data === 'string') {
          console.log(response.data);
        } else {
          console.log(JSON.stringify(response.data, null,2));
        }
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else {
      throw this.error;
    }
  }
  
  async catch(error: any) {
    if (error.message) {
      this.error(error)
    } else {
      let suggestions = 'get artifacts [-h or --help]\n\tget artifacts forSystem\n\tget artifacts export';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
  }
}