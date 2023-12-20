import {ArtifactsApi} from '@mitre/emass_client'
import {ArtifactsRequestDeleteBodyInner as ArtifactDeleteBody,
  ArtifactsResponseDel} from '@mitre/emass_client/dist/api'
import {Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserDeleteArtifacts extends Command {
  static description = 'Remove one or many artifacts in a system identified by system Id'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-F,--fileName]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the DELETE POA&M endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  static usage = '<%= command.id %> [options]'

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserDeleteArtifacts)
    const apiCxn = new ApiConnection()
    const delArtifact = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: ArtifactDeleteBody[] = []
    flags.fileName.forEach((filename: string) => {
      requestBodyArray.push({filename: filename.replace(',', '')})
    })

    delArtifact.deleteArtifact(flags.systemId, requestBodyArray).then((response: ArtifactsResponseDel) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
