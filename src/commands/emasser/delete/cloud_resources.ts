import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {displayError, FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {CloudResourceResultsApi} from '@mitre/emass_client'
import {
  CloudResourcesDeleteBodyInner,
  CloudResourcesPostDelete,
} from '@mitre/emass_client/dist/api'

const CMD_HELP = 'saf emasser delete cloud_resources -h or --help'
export default class EmasserDeleteCloudResources extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]'

  static readonly description = 'Remove one or multiple containers in a system identified by system Id'

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-r,--resourceId] <resource-id> <resource-id> ...']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show help for the SAF CLI eMASSer DELETE Cloud Resources command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserDeleteCloudResources)
    const apiCxn = new ApiConnection()
    const cloudResource = new CloudResourceResultsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Array<CloudResourcesDeleteBodyInner> = []
    flags.resourceId.forEach((resourceId: string) => {
      requestBodyArray.push({resourceId: resourceId.replace(',', '')})
    })

    // Call the API
    cloudResource.deleteCloudResources(flags.systemId, requestBodyArray).then((response: CloudResourcesPostDelete) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'Cloud Resources'))
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
