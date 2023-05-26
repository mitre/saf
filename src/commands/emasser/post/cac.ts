import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {CACApi} from '@mitre/emass_client'
import {CacResponsePost} from '@mitre/emass_client/dist/api'
import {CacGet as CAC} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'
import {outputError} from '../../../utils/emasser/outputError'

export default class EmasserPostCac extends Command {
  static usage = '<%= command.id %> [options]'

  static description = 'Add a Control Approval Chain (CAC) items in a system'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-a,--controlAcronym] [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) control to second stage of CAC'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostCac)
    const apiCxn = new ApiConnection()
    const addCac = new CACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: CAC[] = []
    requestBodyArray.push({
      controlAcronym: flags.controlAcronym,
      comments: flags.comments,
    })

    addCac.addSystemCac(flags.systemId, requestBodyArray).then((response: CacResponsePost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
