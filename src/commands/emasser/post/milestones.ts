import {colorize} from 'json-colorizer'
import {Command} from '@oclif/core'

import {outputError} from '../../../utils/emasser/outputError'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {MilestonesApi} from '@mitre/emass_client'
import {MilestoneResponsePost,
  MilestonesGet as Milestones} from '@mitre/emass_client/dist/api'

export default class EmasserPostMilestones extends Command {
  static usage = '<%= command.id %> -s <system-id> -p <poam-id> -d <description> -c <completion-date>'

  static description = 'Add milestones to one or many POA&M items in a system'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-p,--poamId] [-d,--description] [-c,--scheduledCompletionDate]']

  static flags = {
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

  protected async catch(err: Error & {exitCode?: number}): Promise<any> { // skipcq: JS-0116
    // If error message is for missing flags, display what fields
    // are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('--help', '\x1B[93m<cli-command> -h or --help\x1B[0m'))
    } else {
      this.warn(err)
    }
  }
}
