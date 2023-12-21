import {PACApi} from '@mitre/emass_client'
import {PacGet as PAC,
  PacResponsePost} from '@mitre/emass_client/dist/api'
import {Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserPostPac extends Command {
  static description = 'Add new Package Approval Chain (PAC) workflow(s) for a system'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-w,--workflow] [-n,--name] [-c,--comments]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) a Package Approval Chain (PAC) item in a system'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  static usage = '<%= command.id %> [options]'

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostPac)
    const apiCxn = new ApiConnection()
    const addPac = new PACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: PAC[] = []
    requestBodyArray.push({
      comments: flags.comments,
      name: flags.name,
      workflow: flags.workflow,
    })

    addPac.addSystemPac(flags.systemId, requestBodyArray).then((response: PacResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
