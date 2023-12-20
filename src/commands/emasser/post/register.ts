import {RegistrationApi} from '@mitre/emass_client'
import {Register} from '@mitre/emass_client/dist/api'
import {Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'

export default class EmasserPostRegister extends Command {
  static description = 'The Registration endpoint provides the ability to register a certificate & obtain an API-key'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Register a certificate & obtain the API-key - The certificate is provided in the environment configuration file (.env)'}),
  }

  static usage = '<%= command.id %>'

  async run(): Promise<void> { // skipcq: JS-0116, JS-0105
    const apiCxn = new ApiConnection()
    const registerAPI = new RegistrationApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    registerAPI.registerUser().then((response: Register) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
