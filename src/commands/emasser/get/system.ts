import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { SystemsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';

export default class EmassGetSystem extends Command {

  static usage = 'get system --systemId <value>'

  static description = 'Get system information for a specific system defined by ID'

  static examples = ['emasser get system --systemId 34']


  static flags = {
    help: Flags.help({char: 'h'}),
    systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
  }

  static args = [{name: "systemId - System ID - required: true"}]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmassGetSystem)
    const apiCxn = new ApiConnection();
    const getSystems = new SystemsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
  
    getSystems.getSystem(flags.systemId).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(error));
  }
}