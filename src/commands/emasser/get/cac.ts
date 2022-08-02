import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { CACApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';

export default class EmasserGetCac extends Command {

  static usage = 'get cac [ARGUMENTS]'

  static description = 'View one or many Control Approval Chain (CAC) in a system specified system ID'

  static examples = ['emasser get cac --systemId <value>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET CAC endpoint'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetCac)
    const apiCxn = new ApiConnection();
    const getCac = new CACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // Order is important here
    getCac.getSystemCac(flags.systemId,flags.controlAcronyms).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}
