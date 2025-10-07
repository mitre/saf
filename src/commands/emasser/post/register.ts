import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {RegistrationApi} from '@mitre/emass_client'
import type {Register} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {displayError} from '../../../utils/emasser/utilities'

export default class EmasserPostRegister extends Command {
  static readonly usage = '<%= command.id %>'

  static readonly description = 'The Registration endpoint provides the ability to register a certificate & obtain an API-key'

  static readonly examples = ['<%= config.bin %> <%= command.id %>']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the Register (POST) a certificate & obtain the API-key'}),
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to return a Promise
  async run(): Promise<void> { // skipcq: JS-0105
    const apiCxn = new ApiConnection()
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    apiCxn.axiosInstances.defaults.headers.common = headers
    const registerAPI = new RegistrationApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    registerAPI.registerUser().then((response: Register) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'Register Certificate'))
  }
}
