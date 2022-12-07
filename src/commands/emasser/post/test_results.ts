import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {TestResultsApi} from '@mitre/emass_client'
import {TestResultsResponsePost} from '@mitre/emass_client/dist/api'
import {TestResultsGet as TestResult} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'
import {outputError} from '../../../utils/emasser/outputError'

export default class EmasserPostTestResults extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = "Add test results for a system's Assessment Procedures (CCIs) which determine Security Control compliance"

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-c,--cci] [-b,--testedBy] [-t,--testDate] [-d,--description] [-S,--complianceStatus]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) test results to a system\'s Assessment Procedures (CCIs)'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostTestResults)
    const apiCxn = new ApiConnection()
    const addTestResults = new TestResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: TestResult[] = []
    requestBodyArray.push({
      cci: flags.cci,
      testedBy: flags.testedBy,
      testDate: Number.parseFloat(flags.testDate),
      description: flags.description,
      complianceStatus: flags.complianceStatus,
    })

    addTestResults.addTestResultsBySystemId(flags.systemId, requestBodyArray).then((response: TestResultsResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
