import {TestResultsApi} from '@mitre/emass_client'
import {TestResultsGet as TestResult,
  TestResultsResponsePost} from '@mitre/emass_client/dist/api'
import {Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserPostTestResults extends Command {
  static description = "Add test results for a system's Assessment Procedures (CCIs) which determine Security Control compliance"

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-c,--cci] [-b,--testedBy] [-t,--testDate] [-d,--description] [-S,--complianceStatus]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) test results to a system\'s Assessment Procedures (CCIs)'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  static usage = '<%= command.id %> [options]'

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostTestResults)
    const apiCxn = new ApiConnection()
    const addTestResults = new TestResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: TestResult[] = []
    requestBodyArray.push({
      cci: flags.cci,
      complianceStatus: flags.complianceStatus,
      description: flags.description,
      testDate: Number.parseFloat(flags.testDate),
      testedBy: flags.testedBy,
    })

    addTestResults.addTestResultsBySystemId(flags.systemId, requestBodyArray).then((response: TestResultsResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
