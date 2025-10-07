import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {SoftwareBaselineApi} from '@mitre/emass_client'
import type {
  SwBaselineResponseDelete,
  SwBaselineRequestDeleteBodyInner as SwDeleteBody,
} from '@mitre/emass_client/dist/api'

const CMD_HELP = 'saf emasser delete software_baseline -h or --help'
export default class EmasserDeleteSoftwareBaseline extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]'

  static readonly description = 'Remove one or many Software items in a system identified by system and software Id'

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-a,--assetsSoftwareId] <software-id> <software-id> ...']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show help for the SAF CLI eMASSer DELETE Software Baseline command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserDeleteSoftwareBaseline)
    const apiCxn = new ApiConnection()
    const delSwBaseline = new SoftwareBaselineApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: SwDeleteBody[] = []
    flags.assetsSoftwareId.forEach((softwareId: string) => {
      requestBodyArray.push({softwareId: softwareId}) // skipcq: JS-0240
    })

    // Call the endpoint
    delSwBaseline.deleteSwBaselineAssets(flags.systemId, requestBodyArray).then((response: SwBaselineResponseDelete) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'Software Baseline'))
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
