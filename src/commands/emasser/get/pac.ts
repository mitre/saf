import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {PACApi} from '@mitre/emass_client'
import {PacResponseGet} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

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
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }

  async catch(error: any) { // skipcq: JS-0116
    if (error.message) {
      this.warn(error.message)
    } else {
      const suggestions = 'get pac [-h or --help]'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }
}
