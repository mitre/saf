import colorize from 'json-colorizer';
import { Command, Flags } from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { CACApi } from '@mitre/emass_client';
import { CacResponseGet } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetCac extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = 'View one or many Control Approval Chain (CAC) in a system specified system ID'

  static examples = ['<%= config.bin %> <%= command.id %> --systemId <value>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET CAC endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetCac)
    const apiCxn = new ApiConnection();
    const getCac = new CACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // Order is important here
    getCac.getSystemCac(flags.systemId,flags.controlAcronyms).then((response: CacResponseGet) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}
