import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { StaticCodeScansApi } from '@mitre/emass_client';
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';
import { outputError } from '../../../emasscommands/outputError';


export default class EmasserPostStaticCodeScan extends Command {

  static usage = 'post scan_findings <Required Values>'

  static description = "Add scan_findings in a system which determine Security Control compliance"

  static examples = ['emasser post scan_findings  --systemId --applicationName --version --codeCheckName --scanDate --cweId']

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
      application_name: flags.application_name,
      version: flags.version
      code_check_name: flags.code_check_name
      scan_date: flags.scan_date
      cwe_id: flags.cwe_id
      count: flags.count
      raw_severity: flags.raw_severity
    });

    addStaticCodeScan.addStaticCodeScansBySystemId(flags.systemId, flags.staticCodeRequestPostBody).then((data:any) => {
      console.log(colorize(outputFormat(outputFormat(data.data))));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}