import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {MilestonesApi} from '@mitre/emass_client'
import type {MilestoneResponsePut,
  MilestonesGet as Milestones} from '@mitre/emass_client/dist/api'

const CMD_HELP = 'saf emasser put milestones -h or --help'
export default class EmasserPutMilestones extends Command {
  static readonly usage = '<%= command.id %> [options]'

  static readonly description = 'Update milestone(s) for specified system, poam, and milestone Id'

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-p,--poamId] [-m,--milestoneId] [-d,--description] [-c,--scheduledCompletionDate]']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the PUT Milestones command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPutMilestones)
    const apiCxn = new ApiConnection()
    const putMilestones = new MilestonesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Milestones[] = []
    requestBodyArray.push({
      milestoneId: flags.milestoneId,
      description: flags.description,
      scheduledCompletionDate: Number.parseFloat(flags.scheduledCompletionDate),
    })

    // Call API endpoint
    putMilestones.updateMilestoneBySystemIdAndPoamId(flags.systemId, flags.poamId, requestBodyArray).then((response: MilestoneResponsePut) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'Milestones'))
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to return a Promise
  protected async catch(err: Error & {exitCode?: number}): Promise<void> {
    // If error message is for missing flags, display
    // what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \x1B[93m${CMD_HELP}\x1B[0m`))
    } else {
      this.warn(err)
    }
  }
}
