import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { TestResultsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';
import { TestResultsPost } from '@mitre/emass_client';
import { outputError } from '../../../emasscommands/outputError';
//import * as emasser from '@mitre/emass_client'

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
    
    var requestBodyArray = TestResultsPost;
    this.log('HERRRRRRRRRRE, cci is ', flags.cci)
this.log('requestBodyArray is ', requestBodyArray)
    requestBodyArray.cci = flags.cci;
    requestBodyArray.testedBy = flags.testedBy;
    requestBodyArray.testDate = flags.testDate;
    requestBodyArray.description = flags.description;
    requestBodyArray.complianceStatus = flags.complianceStatus;


    addTestResults.addTestResultsBySystemId(flags.systemId, requestBodyArray).then((data:any) => {
      console.log(colorize(outputFormat(outputFormat(data.data))));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}