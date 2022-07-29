import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { TestResultsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';

export default class EmasserGetTestResults extends Command {

  static usage = 'get test_results [options]'

  static description = 'Get test results for a specific system defined by ID (systemId)'

  static examples = ['emasser get test_results --systemId <value>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the get system endpoint'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetTestResults)
    const apiCxn = new ApiConnection();
    const getTestResults = new TestResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // Order is important here
    getTestResults.getSystemTestResults(flags.systemId,flags.controlAcronyms,flags.ccis,flags.latestOnly).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}

