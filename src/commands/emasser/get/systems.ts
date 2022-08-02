import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { SystemsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities' ;

export default class EmasserGetSystems extends Command {

  static usage = 'get systems [ARGUMENTS]'

  static description = 'Get available systems filter on provided options'

  static examples = ['emasser get systems --includePackage --registrationType --ditprId --coamsId --policy --includeDitprMetrics --includeDecommissioned --reportsForScorecard']
  
  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the get Systems endpoint'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetSystems)
    const apiCxn = new ApiConnection();
    const getSystems = new SystemsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
  
    // Order is important here
    getSystems.getSystems(flags.includePackage,flags.registrationType,flags.ditprId,flags.coamsId,
      flags.policy,flags.includeDitprMetrics,flags.includeDecommissioned,flags.reportsForScorecard).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}