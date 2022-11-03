import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { CloudResourcesApi } from '@mitre/emass_client';
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';
import { outputError } from '../../../emasscommands/outputError';


export default class EmasserPostCloudResource extends Command {

  static usage = 'post cac <Required Values>'

  static description = "Add cac in a system which determine Security Control compliance"

  static examples = ['emasser post cac --systemId --controlAcronym --comments']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) test CAC '}),
    ...getFlagsForEndpoint(process.argv) as any,
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostCloudResource)
    const apiCxn = new ApiConnection();
    const addCac = new CloudResourcesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    let requestBodyArray: object[] = [];
    requestBodyArray.push({
      control_acronym: flags.control_acronym,
      comments: flags.comments
    });

    addCac.addCloudResourcesBySystemId(flags.systemId, requestBodyArray).then((data:any) => {
      console.log(colorize(outputFormat(outputFormat(data.data))));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}