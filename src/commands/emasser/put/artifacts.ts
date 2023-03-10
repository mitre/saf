import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ArtifactsApi} from '@mitre/emass_client'
import {ArtifactsResponsePutPost} from '@mitre/emass_client/dist/api'
import {ArtifactsGet as Artifacts} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'
import {outputError} from '../../../utils/emasser/outputError'

export default class EmasserPutArtifacts extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = 'Updates artifacts for a system with provided entries'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--filename] [--isTemplate,--no-isTemplate] [-t,--type] [-g--category] [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Put (update) one or many artifacts in a system'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPutArtifacts)
    const apiCxn = new ApiConnection()
    const artifactApi = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Artifacts[] = []
    requestBodyArray.push({
      filename: flags.filename,
      isTemplate: flags.isTemplate,
      type: flags.type,
      category: flags.category,
      // Optional arguments
      description: flags.description,
      refPageNumber: flags.refPageNumber,
      ccis: flags.ccis,
      controls: flags.controls,
      artifactExpirationDate: Number.parseFloat(flags.artifactExpirationDate),
      lastReviewedDate: Number.parseFloat(flags.lastReviewDate),
    })

    artifactApi.updateArtifactBySystemId(flags.systemId, requestBodyArray).then((response: ArtifactsResponsePutPost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
