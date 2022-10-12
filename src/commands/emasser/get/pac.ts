import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { PACApi } from '@mitre/emass_client';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetPac extends Command {

  static usage = 'get pac [options]'

  static description = 'View one or many Package Approval Chain (PAC) in a system specified system ID'

  static examples = ['emasser get pac --systemId <value>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET PAC endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetPac)
    const apiCxn = new ApiConnection();
    const getPac = new PACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // Order is important here
    getPac.getSystemPac(flags.systemId).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}
