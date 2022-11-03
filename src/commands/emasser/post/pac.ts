import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { PACApi } from '@mitre/emass_client';
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';
import { outputError } from '../../../emasscommands/outputError';


export default class EmasserPostPac extends Command {

  static usage = 'post pac <Required Values>'

  static description = "Add pac in a system which determine Security Control compliance"

  static examples = ['emasser post pac --systemId --workflow --name --comments']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) test PAC '}),
    ...getFlagsForEndpoint(process.argv) as any,
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostPac)
    const apiCxn = new ApiConnection();
    const addPac = new PACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    let requestBodyArray: object[] = [];
    requestBodyArray.push({
      name: flags.name,
      workflow: flags.workflow,
      comments: flags.comments
    });

    addPac.addSystemPac(flags.systemId, requestBodyArray).then((data:any) => {
      console.log(colorize(outputFormat(outputFormat(data.data))));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}