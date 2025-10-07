import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {MilestonesApi} from '@mitre/emass_client'
import type {
  MilestonesPutPostDelete,
  MilestonesRequestDeleteBodyInner as MilestoneDeleteBody,
} from '@mitre/emass_client/dist/api'

const CMD_HELP = 'saf emasser delete milestones -h or --help'
export default class EmasserDeleteMilestones extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]'

  static readonly description = 'Remove milestones in a system for one or many POA&M items identified by system, poam, and milestone Id'

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-p,--poamId] [-m,--milestonesId] <milestone-id> <milestone-id> ...']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show help for the SAF CLI eMASSer DELETE Milestones command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserDeleteMilestones)
    const apiCxn = new ApiConnection()
    const delMilestones = new MilestonesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: MilestoneDeleteBody[] = []
    flags.milestonesId.forEach((milestoneId: number) => {
      requestBodyArray.push({milestoneId: milestoneId}) // skipcq: JS-0240
    })

    // Call API endpoint
    delMilestones.deleteMilestone(flags.systemId, flags.poamId, requestBodyArray).then((response: MilestonesPutPostDelete) => {
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
