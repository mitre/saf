import {POAMApi} from '@mitre/emass_client'
import {PoamResponseGetPoams, PoamResponseGetSystems} from '@mitre/emass_client/dist/api'
import {Args, Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'poams'

export default class EmasserGetPoams extends Command {
  // Example: If the user uses the command (saf emasser get poams byPoamId), args.name is set to byPoamId
  static args = {
    byPoamId: Args.string({description: 'Retrieves Poams for specified system and poam ID', name: 'byPoamId', required: false}),
    forSystem: Args.string({description: 'Retrieves Poams for specified system ID', name: 'forSystem', required: false}),
    name: Args.string({hidden: true, name: 'name', required: false}),
  }

  static description = getDescriptionForEndpoint(process.argv, endpoint)

  static examples = getExamplesForEndpoint(process.argv, endpoint)

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET POA&Ms endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  // NOTE: The way args are being implemented are mainly for the purposes of help clarity, there is, displays
  //       the available arguments with associate description.
  // Only args.name is used, there is, it contains the argument listed by the user.
  static usage = '<%= command.id %> [ARGUMENT] \n \x1B[93m NOTE: see EXAMPLES for argument case format\x1B[0m'

  async catch(error: any) { // skipcq: JS-0116
    if (error.message) {
      this.error(error)
    } else {
      const suggestions = 'get poams [-h or --help]\n\tget poams forSystem\n\tget poams byPoamId'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmasserGetPoams)
    const apiCxn = new ApiConnection()
    const getPoams = new POAMApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    if (args.name === 'forSystem') {
      // Order is important here
      getPoams.getSystemPoams(flags.systemId, flags.scheduledCompletionDateStart, flags.scheduledCompletionDateEnd, flags.controlAcronyms, flags.ccis, flags.systemOnly).then((response: PoamResponseGetSystems) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error:any) => console.error(colorize(outputError(error))))
    } else if (args.name === 'byPoamId') {
      // Order is important here
      getPoams.getSystemPoamsByPoamId(flags.systemId, flags.poamId).then((response: PoamResponseGetPoams) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error:any) => console.error(colorize(outputError(error))))
    } else {
      throw this.error
    }
  }
}
