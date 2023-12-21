import {TestApi} from '@mitre/emass_client'
import {Test} from '@mitre/emass_client/dist/api'
import {Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'

export default class EmasserGetTestConnection extends Command {
  static description = 'Test if eMASS url is set to a correct host'

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Test connection to configured eMASS URL'}),
  }

  static usage = '<%= command.id %>'

  async run(): Promise<void> { // skipcq: JS-0105, JS-0116
    const apiCxn = new ApiConnection()
    const getTestApi = new TestApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    getTestApi.testConnection().then((response: Test) => {
      console.log(colorize(outputFormat(response)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
