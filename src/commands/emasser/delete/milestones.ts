import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {MilestonesApi} from '@mitre/emass_client'
import {MilestonesPutPostDelete} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {MilestonesRequestDeleteBodyInner as MilestoneDeleteBody} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserDeleteMilestones extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]';

  static description = 'Remove milestones in a system for one or many POA&M items identified by system, poam, and milestone Id';

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-p,--poamId] [-M,--milestonesId]'];

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the DELETE Milestones endpoint'}),
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

    delMilestones.deleteMilestone(flags.systemId, flags.poamId, requestBodyArray).then((response: MilestonesPutPostDelete) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
