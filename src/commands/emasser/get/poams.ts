import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {POAMApi} from '@mitre/emass_client'
import {PoamResponseGetSystems, PoamResponseGetPoams} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'
import {FlagOptions,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'poams'

export default class EmasserGetPoams extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = getDescriptionForEndpoint(process.argv, endpoint);

  static examples = getExamplesForEndpoint(process.argv, endpoint);

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET POA&Ms endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  static args = [
    {name: 'name', required: false, hidden: true},
    {name: 'forSystem', description: 'Retrieves Poams for specified system ID', required: false},
    {name: 'byPoamId', description: 'Retrieves Poams for specified system and poam ID', required: false},
  ]

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

  async catch(error: any) { // skipcq: JS-0116
    if (error.message) {
      this.error(error)
    } else {
      const suggestions = 'get poams [-h or --help]\n\tget poams forSystem\n\tget poams byPoamId'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }
}
