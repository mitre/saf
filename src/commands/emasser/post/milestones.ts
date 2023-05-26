import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {MilestonesApi} from '@mitre/emass_client'
import {MilestoneResponsePost} from '@mitre/emass_client/dist/api'
import {MilestonesGet as Milestones} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'
import {outputError} from '../../../utils/emasser/outputError'

export default class EmasserPostMilestones extends Command {
  static usage = '<%= command.id %> [options]'

  static description = 'Add milestones to one or many POA&M items in a system'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-p,--poamId] [-d,--description] [-c,--scheduledCompletionDate]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) milestones to one or many POA&M items in a system'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostMilestones)
    const apiCxn = new ApiConnection()
    const addMilestone = new MilestonesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Milestones[] = []
    requestBodyArray.push({
      description: flags.description,
      scheduledCompletionDate: flags.scheduledCompletionDate,
    })

    addMilestone.addMilestoneBySystemIdAndPoamId(flags.systemId, flags.poamId, requestBodyArray).then((response: MilestoneResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
