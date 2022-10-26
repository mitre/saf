import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { PACApi } from '@mitre/emass_client';
import { PacResponseGet } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetPac extends Command {
  static usage = '<%= command.id %> [options]'

  static description = 'View one or many Package Approval Chain (PAC) in a system specified system ID'

  static examples = ['<%= config.bin %> <%= command.id %> --systemId <value>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET PAC endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetPac)
    const apiCxn = new ApiConnection();
    const getPac = new PACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // Order is important here
    getPac.getSystemPac(flags.systemId).then((response: PacResponseGet) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}
