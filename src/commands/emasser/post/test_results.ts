import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {TestResultsApi} from '@mitre/emass_client'
import type {TestResultsResponsePost,
  TestResultsGet as TestResult} from '@mitre/emass_client/dist/api'

const CMD_HELP = 'saf emasser post test_results -h or --help'
export default class EmasserPostTestResults extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]'

  static readonly description = "Add test results for a system's Assessment Procedures which determine Security Control compliance\n"
    + 'See the FLAGS section for required fields and acceptable values'

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-a,--assessmentProcedure] [-b,--testedBy] [-t,--testDate] [-d,--description] [-S,--complianceStatus]']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the POST Test Results command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostTestResults)
    const apiCxn = new ApiConnection()
    const addTestResults = new TestResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: TestResult[] = []
    requestBodyArray.push({
      assessmentProcedure: flags.assessmentProcedure,
      testedBy: flags.testedBy,
      testDate: Number.parseFloat(flags.testDate),
      description: flags.description,
      complianceStatus: flags.complianceStatus,
    })

    addTestResults.addTestResultsBySystemId(flags.systemId, requestBodyArray).then((response: TestResultsResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'Test Results'))
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to return a Promise
  protected async catch(err: Error & {exitCode?: number}): Promise<void> {
    // If error message is for missing flags, display
    // what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \x1B[93m${CMD_HELP}\x1B[0m`))
    } else {
      this.warn(err)
    }
  }
}
