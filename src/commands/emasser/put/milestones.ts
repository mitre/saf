import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {MilestonesApi} from '@mitre/emass_client'
import {MilestoneResponsePut} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {MilestonesGet as Milestones} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserPutMilestones extends Command {
  static usage = '<%= command.id %> [options]';

  static description = 'Update milestone(s) for specified system, poam, and milestone Id';

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-p,--poamId] [-m,--milestoneId] [-d,--description] [-c,--scheduledCompletionDate]'];

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the PUT Milestones endpoint'}),
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

    putMilestones.updateMilestoneBySystemIdAndPoamId(flags.systemId, flags.poamId, requestBodyArray).then((response: MilestoneResponsePut) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
