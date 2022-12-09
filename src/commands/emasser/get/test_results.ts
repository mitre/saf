import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {TestResultsApi} from '@mitre/emass_client'
import {TestResultsResponseGet} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserGetTestResults extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = 'Get test results for a specific system defined by ID (systemId)'

  static examples = ['<%= config.bin %> <%= command.id %> --systemId <value> [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Test Results endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetTestResults)
    const apiCxn = new ApiConnection()
    const getTestResults = new TestResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    // Order is important here
    getTestResults.getSystemTestResults(flags.systemId, flags.controlAcronyms, flags.ccis, flags.latestOnly).then((response: TestResultsResponseGet) => {
      console.log(colorize(outputFormat(response)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
