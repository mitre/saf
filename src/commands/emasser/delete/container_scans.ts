import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {outputError} from '../../../utils/emasser/outputError'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {ContainerScanResultsApi} from '@mitre/emass_client'
import {
  ContainerResourcesDeleteBodyInner,
  ContainersResourcesPostDelete,
} from '@mitre/emass_client/dist/api'

const CMD_HELP = 'saf emasser delete container_scans -h or --help'
export default class EmasserContainerScans extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'Remove one or multiple containers in a system identified by system Id';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-c,--containerId] <container-id> <container-id> ...']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help to DELETE Containers endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserContainerScans)
    const apiCxn = new ApiConnection()
    const containerScan = new ContainerScanResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Array<ContainerResourcesDeleteBodyInner> = []
    flags.containerId.forEach((containerId: string) => {
      requestBodyArray.push({containerId: containerId.replace(',', '')})
    })

    // Call the API
    containerScan.deleteContainerSans(flags.systemId, requestBodyArray).then((response: ContainersResourcesPostDelete) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }

  protected async catch(err: Error & {exitCode?: number}): Promise<any> { // skipcq: JS-0116
    // If error message is for missing flags, display
    // what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \x1B[93m${CMD_HELP}\x1B[0m`))
    } else {
      this.warn(err)
    }
  }
}
