import {MilestonesApi} from '@mitre/emass_client'
import {MilestoneResponseGet, MilestoneResponseGetMilestone} from '@mitre/emass_client/dist/api'
import {Args, Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'milestones'

export default class EmasserGetMilestones extends Command {
  // Example: If the user uses the command (saf emasser get milestones byPoamId), args.name is set to byPoamId
  static args = {
    byMilestoneId: Args.string({description: 'Retrieves milestone(s) for specified system, poam, and milestone Id', name: 'byMilestoneId', required: false}),
    byPoamId: Args.string({description: 'Retrieves milestone(s) for specified system and poam Id', name: 'byPoamId', required: false}),
    name: Args.string({hidden: true, name: 'name', required: false}),
  }

  static description = getDescriptionForEndpoint(process.argv, endpoint)

  static examples = getExamplesForEndpoint(process.argv, endpoint)

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Milestones endpoint'}),
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
      const suggestions = 'get milestones [-h or --help]\n\tget milestones byPoamId\n\tget milestones byMilestoneId'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmasserGetMilestones)
    const apiCxn = new ApiConnection()
    const getMilestones = new MilestonesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    if (args.name === 'byPoamId') {
      // Order is important here
      getMilestones.getSystemMilestonesByPoamId(flags.systemId, flags.poamId, flags.scheduledCompletionDateStart, flags.scheduledCompletionDateEnd).then((response: MilestoneResponseGet) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error:any) => console.error(colorize(outputError(error))))
    } else if (args.name === 'byMilestoneId') {
      // Order is important here
      getMilestones.getSystemMilestonesByPoamIdAndMilestoneId(flags.systemId, flags.poamId, flags.milestoneId).then((response: MilestoneResponseGetMilestone) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error:any) => console.error(colorize(outputError(error))))
    } else {
      throw this.error
    }
  }
}
