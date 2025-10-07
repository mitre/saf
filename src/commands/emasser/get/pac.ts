import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {PACApi} from '@mitre/emass_client'
import type {PacResponseGet} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserGetPac extends Command {
  static readonly usage = '<%= command.id %> [FLAG]'

  static readonly description = 'View one or many Package Approval Chain (PAC) in a system specified system ID'

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s, --systemId] <value>']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the GET PAC command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetPac)
    const apiCxn = new ApiConnection()
    const getPac = new PACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    // Order is important here
    getPac.getSystemPac(flags.systemId).then((response: PacResponseGet) => {
      console.log(colorize(outputFormat(response)))
    }).catch((error: unknown) => displayError(error, 'PAC'))
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message)
    } else {
      const suggestions = 'get pac [-h or --help]'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }
}
