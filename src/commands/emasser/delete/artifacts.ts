import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'

import {outputError} from '../../../utils/emasser/outputError'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

import {ArtifactsApi} from '@mitre/emass_client'
import {ArtifactsResponseDel,
  ArtifactsRequestDeleteBodyInner as ArtifactDeleteBody} from '@mitre/emass_client/dist/api'

export default class EmasserDeleteArtifacts extends Command {
  static usage = '<%= command.id %> [options]';

  static description = 'Remove one or many artifacts in a system identified by system Id';

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-F,--fileName]'];

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the DELETE POA&M endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

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
