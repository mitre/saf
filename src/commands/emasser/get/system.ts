import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { SystemsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';
import { SystemResponse } from '@mitre/emass_client/dist/api';

export default class EmasserGetSystem extends Command {

  static usage = 'get system [ARGUMENTS]'

  static description = 'Get system information for a specific system defined by ID (systeId)'

  static examples = ['emasser get system --systemId <value>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET System endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetSystem)
    const apiCxn = new ApiConnection();
    const getSystems = new SystemsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    getSystems.getSystem(flags.systemId,flags.includePackage,flags.policy).then((response: SystemResponse) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}

