import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {MilestonesApi} from '@mitre/emass_client'
import {MilestoneResponseGet, MilestoneResponseGetMilestone} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'
import {FlagOptions,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'milestones'

export default class EmasserGetMilestones extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = getDescriptionForEndpoint(process.argv, endpoint);

  static examples = getExamplesForEndpoint(process.argv, endpoint);

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Milestones endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  static args = [
    {name: 'name', required: false, hidden: true},
    {name: 'byPoamId', description: 'Retrieves milestone(s) for specified system and poam Id', required: false},
    {name: 'byMilestoneId', description: 'Retrieves milestone(s) for specified system, poam, and milestone Id', required: false},
  ]

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

  async catch(error: any) { // skipcq: JS-0116
    if (error.message) {
      this.error(error)
    } else {
      const suggestions = 'get milestones [-h or --help]\n\tget milestones byPoamId\n\tget milestones byMilestoneId'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }
}
