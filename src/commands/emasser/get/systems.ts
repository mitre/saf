import {SystemsApi} from '@mitre/emass_client'
import {SystemsResponse} from '@mitre/emass_client/dist/api'
import {Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserGetSystems extends Command {
  static description = 'Get available systems filter on provided options'

  static examples = ['<%= config.bin %> <%= command.id %> [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Systems endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  static usage = '<%= command.id %> [options]'

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetSystems)
    const apiCxn = new ApiConnection()
    const getSystems = new SystemsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    // Order is important here
    getSystems.getSystems(flags.includePackage, flags.registrationType, flags.ditprId, flags.coamsId, flags.policy, flags.includeDitprMetrics, flags.includeDecommissioned, flags.reportsForScorecard).then((response: SystemsResponse) => {
      console.log(colorize(outputFormat(response)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
