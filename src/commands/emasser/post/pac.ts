import colorize from 'json-colorizer';
import { Command, Flags } from "@oclif/core"
import { PACApi } from '@mitre/emass_client';
import { PacResponsePost } from '@mitre/emass_client/dist/api';
import { PacGet as PAC } from '@mitre/emass_client/dist/api';
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';
import { outputError } from '../../../utils/emasser/outputError';

export default class EmasserPostPac extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = "Initiate system workflow for review"

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-w,--workflow] [-n,--name] [-c,--comments]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) a Package Approval Chain (PAC) items in a system'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostPac)
    const apiCxn = new ApiConnection();
    const addPac = new PACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    let requestBodyArray: PAC[] = [];
    requestBodyArray.push({
      workflow: flags.workflow,
      name: flags.name,
      comments: flags.comments
    });

    addPac.addSystemPac(flags.systemId, requestBodyArray).then((response: PacResponsePost) => {
      console.log(colorize(outputFormat(response, false)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}