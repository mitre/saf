import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { StaticCodeScansApi } from '@mitre/emass_client';
import { StaticCodeResponsePost } from '@mitre/emass_client/dist/api';
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';
import { outputError } from '../../../emasscommands/outputError';

export default class EmasserPostStaticCodeScan extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = "Add scan_findings in a system which determine Security Control compliance"

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-a, --applicationName] [-v, --version] [-c, --codeCheckName] [-s, --scanDate] [-i, --cweId] [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) static code scans '}),
    ...getFlagsForEndpoint(process.argv) as any,
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostStaticCodeScan)
    const apiCxn = new ApiConnection();
    const addStaticCodeScan = new StaticCodeScansApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    let requestBodyArray: object[] = [];
    requestBodyArray.push({
      control_acronym: flags.control_acronym,
      comments: flags.comments
    });

    addStaticCodeScan.addStaticCodeScansBySystemId(flags.systemId, flags.staticCodeRequestPostBody).then((data:any) => {
      console.log(colorize(outputFormat(outputFormat(data.data))));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}