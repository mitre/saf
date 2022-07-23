import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { TestResultsApi } from '@mitre/emass_client';
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';
import { outputError } from '../../../emasscommands/outputError';


export default class EmasserPostTestResults extends Command {

  static usage = 'post test_results <Required Values>'

  static description = "Add test results for a system's Assessment Procedures (CCIs) which determine Security Control compliance"

  static examples = ['emasser post test_results --systemId --cci --testedBy --testDate --description --complianceStatus']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) test results to a system\'s Assessment Procedures (CCIs)'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostTestResults)
    const apiCxn = new ApiConnection();
    const addTestResults = new TestResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    let requestBodyArray: object[] = [];
    requestBodyArray.push({
      cci: flags.cci,
      testedBy: flags.testedBy,
      testDate: parseFloat(flags.testDate),
      description: flags.description,
      complianceStatus: flags.complianceStatus
    });


    addTestResults.addTestResultsBySystemId(flags.systemId, requestBodyArray).then((data:any) => {
      console.log(colorize(outputFormat(outputFormat(data.data))));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}