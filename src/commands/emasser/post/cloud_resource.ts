import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { CloudResourcesApi } from '@mitre/emass_client';
import { CloudResourcesResponsePost } from '@mitre/emass_client/dist/api';
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';
import { outputError } from '../../../emasscommands/outputError';

export default class EmasserPostCloudResource extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = "Add a cloud resource and their scan results in the assets module for a system"

  static examples = ['<%= config.bin %> <%= command.id %> [-s, --systemId] [-p, --provider] [-ri, --resourceId] [-rn, --resourceName] [-rt, --resourceType] [-cpd, --cspPolicyDefinitionId] [-ic, --isCompliant] [-inc, --is-not-Compliant] [-pdt, --policyDefinitionTitle] [-t, --text] [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) test CloudResources '}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
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