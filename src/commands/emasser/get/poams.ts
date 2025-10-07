import {colorize} from 'json-colorizer'
import {Args, Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {POAMApi} from '@mitre/emass_client'
import type {PoamResponseGetSystems, PoamResponseGetPoams} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'poams'

export default class EmasserGetPoams extends Command {
  static readonly usage = '<%= command.id %> [ARGUMENT] [FLAGS]\n\x1B[93m NOTE: see EXAMPLES for argument case format\x1B[0m'

  static readonly description = getDescriptionForEndpoint(process.argv, endpoint)

  static readonly examples = getExamplesForEndpoint(process.argv, endpoint)

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the GET POA&Ms command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  // NOTE: The way args are being implemented are mainly for the purposes of help clarity, there is, displays
  //       the available arguments with associate description.
  // Only args.name is used, there is, it contains the argument listed by the user.
  // Example: If the user uses the command (saf emasser get poams byPoamId), args.name is set to byPoamId
  static readonly args = {
    name: Args.string({name: 'name', required: false, hidden: true}),
    forSystem: Args.string({name: 'forSystem', description: 'Retrieves Poams for specified system ID', required: false}),
    byPoamId: Args.string({name: 'byPoamId', description: 'Retrieves Poams for specified system and poam ID', required: false}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmasserGetPoams)
    const apiCxn = new ApiConnection()
    const getPoams = new POAMApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    if (args.name === 'forSystem') {
      // Order is important here
      getPoams.getSystemPoams(flags.systemId, flags.scheduledCompletionDateStart, flags.scheduledCompletionDateEnd, flags.controlAcronyms, flags.ccis, flags.systemOnly).then((response: PoamResponseGetSystems) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error: unknown) => displayError(error, 'POA&Ms'))
    } else if (args.name === 'byPoamId') {
      // Order is important here
      getPoams.getSystemPoamsByPoamId(flags.systemId, flags.poamId).then((response: PoamResponseGetPoams) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error: unknown) => displayError(error, 'POA&Ms'))
    } else {
      throw this.error
    }
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message)
    } else {
      const suggestions = 'get poams [-h or --help]\n\tget poams forSystem\n\tget poams byPoamId'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }
}
