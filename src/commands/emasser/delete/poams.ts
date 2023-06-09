import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {outputError} from '../../../utils/emasser/outputError'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {POAMApi} from '@mitre/emass_client'
import {PoamResponseDelete,
  PoamRequestDeleteBodyInner as PoamDeleteBody} from '@mitre/emass_client/dist/api'

export default class EmasserDeletePoams extends Command {
  static usage = '<%= command.id %> [options]';

  static description = 'Remove one or many POA&M items in a system identified by system and poam Id';

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-P,--poamsId]'];

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the DELETE POA&M endpoint'}),
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

    delPoam.deletePoam(flags.systemId, requestBodyArray).then((response: PoamResponseDelete) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
