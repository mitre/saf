import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {RegistrationApi} from '@mitre/emass_client'
import {Register} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'

export default class EmasserPostRegister extends Command {
  static readonly usage = '<%= command.id %>'

  static readonly description = 'The Registration endpoint provides the ability to register a certificate & obtain an API-key'

  static readonly examples = ['<%= config.bin %> <%= command.id %>']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Register a certificate & obtain the API-key - The certificate is provided in the environment configuration file (.env)'}),
  }

  async run(): Promise<void> { // skipcq: JS-0116, JS-0105
    const apiCxn = new ApiConnection()
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    apiCxn.axiosInstances.defaults.headers.common = headers
    const registerAPI = new RegistrationApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    registerAPI.registerUser().then((response: Register) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: any) => {
      console.error(colorize(outputError(error)).red)
    })
  }
}
