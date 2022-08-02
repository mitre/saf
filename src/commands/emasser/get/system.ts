import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { SystemsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';

export default class EmasserGetSystem extends Command {

  static usage = 'get system [ARGUMENTS]'

  static description = 'Get system information for a specific system defined by ID (systeId)'

  static examples = ['emasser get system --systemId <value>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET System endpoint'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetSystem)
    const apiCxn = new ApiConnection();
    const getSystems = new SystemsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // Order is important here
    getSystems.getSystem(flags.systemId,flags.includePackage,flags.policy).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}

