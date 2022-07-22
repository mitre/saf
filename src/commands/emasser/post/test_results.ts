import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { SystemsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';

export default class EmasserPostTestResults extends Command {

  static usage = 'post test_results --cci=CCI --complianceStatus=COMPLIANCESTATUS --description=DESCRIPTION --systemId=N --testDate=N --testedBy=TESTEDBY'

  static description = "Add test results for a system's Assessment Procedures (CCIs) which determine Security Control compliance"

  static examples = ['emasser post testResults --systemId 34']


  static flags = {
    help: Flags.help({char: 'h'}),
    systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
    cci: Flags.string({char: "c", description: "The system CCI string numerical value", required: true}),
    testedBy: Flags.integer({char: "t", description: "The date test was conducted, Unix time format", required: true}),
    description: Flags.string({char: "d", description: "The description of test result. 4000 Characters", required: true}),
    complianceStatus: Flags.integer({char: "c", description: "The system CCI string numerical value", required: true}),
  }

  static args = [{name: "systemId - System ID - required: true"}]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmasserPostTestResults)
    const apiCxn = new ApiConnection();
    const getSystems = new SystemsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
  
    getSystems.getSystem(flags.systemId).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(error));
  }
}