import colorize from 'json-colorizer';
import { Command, Flags } from "@oclif/core"
import { StaticCodeScansApi } from '@mitre/emass_client';
import { StaticCodeRequestPostBody, StaticCodeResponsePost } from '@mitre/emass_client/dist/api';
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';
import { outputError } from '../../../utils/emasser/outputError';

export default class EmasserPostStaticCodeScan extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = "Add scan_findings in a system which determine Security Control compliance"

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-a, --applicationName] [-v, --version] [-c, --codeCheckName] [-s, --scanDate] [-i, --cweId] [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) static code scans '}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostStaticCodeScan)
    const apiCxn = new ApiConnection();
    const addStaticCodeScan = new StaticCodeScansApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    let requestBodyArray: StaticCodeRequestPostBody = {};


    


    addStaticCodeScan.addStaticCodeScansBySystemId(flags.systemId, flags.staticCodeRequestPostBody).then((response: StaticCodeResponsePost) => {
      console.log(colorize(outputFormat(response, false)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}