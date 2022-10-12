import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { ControlsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetControls extends Command {

  static usage = 'get controls [options]'

  static description = 'Get system Security Control information for both the Implementation Plan and Risk Assessment'

  static examples = ['emasser get controls --systemId <value> [option]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Controls endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetControls)
    const apiCxn = new ApiConnection();
    const getControls = new ControlsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // Order is important here
    getControls.getSystemControls(flags.systemId,flags.acronyms).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}