import {colorize} from 'json-colorizer'
import {Args, Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {MilestonesApi} from '@mitre/emass_client'
import {MilestoneResponseGet, MilestoneResponseGetMilestone} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {displayError, FlagOptions,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'milestones'

export default class EmasserGetMilestones extends Command {
  static readonly usage = '<%= command.id %> [ARGUMENT] [FLAGS] \n \x1B[93m NOTE: see EXAMPLES for argument case format\x1B[0m'

  static readonly description = getDescriptionForEndpoint(process.argv, endpoint)

  static readonly examples = getExamplesForEndpoint(process.argv, endpoint)

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the GET Milestones command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  // NOTE: The way args are being implemented are mainly for the purposes of help clarity, there is, displays
  //       the available arguments with associate description.
  // Only args.name is used, there is, it contains the argument listed by the user.
  // Example: If the user uses the command (saf emasser get milestones byPoamId), args.name is set to byPoamId
  static readonly args = {
    name: Args.string({name: 'name', required: false, hidden: true}),
    byPoamId: Args.string({name: 'byPoamId', description: 'Retrieves milestone(s) for specified system and poam Id', required: false}),
    byMilestoneId: Args.string({name: 'byMilestoneId', description: 'Retrieves milestone(s) for specified system, poam, and milestone Id', required: false}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmasserGetMilestones)
    const apiCxn = new ApiConnection()
    const getMilestones = new MilestonesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    if (args.name === 'byPoamId') {
      // Order is important here
      getMilestones.getSystemMilestonesByPoamId(flags.systemId, flags.poamId, flags.scheduledCompletionDateStart, flags.scheduledCompletionDateEnd).then((response: MilestoneResponseGet) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error: unknown) => displayError(error, 'Milestones'))
    } else if (args.name === 'byMilestoneId') {
      // Order is important here
      getMilestones.getSystemMilestonesByPoamIdAndMilestoneId(flags.systemId, flags.poamId, flags.milestoneId).then((response: MilestoneResponseGetMilestone) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error: unknown) => displayError(error, 'Milestones'))
    } else {
      throw this.error
    }
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message)
    } else {
      const suggestions = 'get milestones [-h or --help]\n\tget milestones byPoamId\n\tget milestones byMilestoneId'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }
}
