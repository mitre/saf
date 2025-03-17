import {colorize} from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {displayError, FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {PACApi} from '@mitre/emass_client'
import {PacResponsePost,
  PacGet as PAC} from '@mitre/emass_client/dist/api'

const CMD_HELP = 'saf emasser post pac -h or --help'
export default class EmasserPostPac extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]'

  static readonly description = 'Add new Package Approval Chain (PAC) workflow(s) for a system'

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-w,--workflow] [-n,--name] [-c,--comments]']

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the POST Package Approval Chain (PAC) command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostPac)
    const apiCxn = new ApiConnection()
    const addPac = new PACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: PAC[] = []
    requestBodyArray.push({
      workflow: flags.workflow,
      name: flags.name,
      comments: flags.comments,
    })

    addPac.addSystemPac(flags.systemId, requestBodyArray).then((response: PacResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error: unknown) => displayError(error, 'PAC'))
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
