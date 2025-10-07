import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {TestApi} from '@mitre/emass_client'
import type {Test} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {displayError} from '../../../utils/emasser/utilities'

export default class EmasserGetTestConnection extends Command {
  static readonly usage = '<%= command.id %>'

  static readonly description = 'Test if eMASSer is properly configured to a valid eMASS URL\nUse the eMASSer CLI command "saf emasser configure" to generate or update an eMASS configuration file.'

  static readonly examples = ['<%= config.bin %> <%= command.id %>']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the GET Test Connection command'}),
  }

  async run(): Promise<void> { // skipcq: JS-0105, JS-0116
    const apiCxn = new ApiConnection()
    const getTestApi = new TestApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    getTestApi.testConnection().then((response: Test) => {
      console.log(colorize(outputFormat(response)))
    }).catch((error: unknown) => displayError(error, 'Test Connection'))
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message)
    } else {
      const suggestions = 'get test_connection [-h or --help]'
      this.warn('Invalid arguments\nTry this 👇:\n\t' + suggestions)
    }
  }
}
