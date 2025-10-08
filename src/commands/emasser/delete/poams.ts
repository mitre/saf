import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {POAMApi} from '@mitre/emass_client'
import type {
  PoamResponsePostPutDelete,
  PoamRequestDeleteBodyInner as PoamDeleteBody,
} from '@mitre/emass_client/dist/api'

const CMD_HELP = 'saf emasser delete poams -h or --help'
export default class EmasserDeletePoams extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]'

  static readonly description = 'Remove one or many POA&M items in a system identified by system and poam Id'

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-p,--poamsId] <poam-id> <poam-id> ...']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show help for the SAF CLI eMASSer DELETE POA&Ms command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserDeletePoams)
    const apiCxn = new ApiConnection()
    const delPoam = new POAMApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: PoamDeleteBody[] = []
    flags.poamsId.forEach((poamId: number) => {
      requestBodyArray.push({poamId: poamId}) // skipcq: JS-0240
    })

    // Call the endpoint
    delPoam.deletePoam(flags.systemId, requestBodyArray).then((response: PoamResponsePostPutDelete) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'POA&Ms'))
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
