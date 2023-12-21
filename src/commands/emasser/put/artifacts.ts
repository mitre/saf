import {ArtifactsApi} from '@mitre/emass_client'
import {ArtifactsResponsePutPost} from '@mitre/emass_client/dist/api'
import {Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer' // skipcq: JS-R1000
import {ArtifactsGet as Artifacts} from '@mitre/emass_client/dist/api' // skipcq: JS-R1000
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserPutArtifacts extends Command {
  static description = 'Updates artifacts for a system with provided entries'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--filename] [--isTemplate,--no-isTemplate] [-t,--type] [-g--category] [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Put (update) one or many artifacts in a system'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  static usage = '<%= command.id %> [options]'

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPutArtifacts)
    const apiCxn = new ApiConnection()
    const artifactApi = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    const requestBodyArray: Artifacts[] = []
    requestBodyArray.push({
      category: flags.category,
      ccis: flags.ccis,
      controls: flags.controls,
      // Optional arguments
      description: flags.description,
      expirationDate: Number.parseFloat(flags.expirationDate),
      filename: flags.filename,
      isTemplate: flags.isTemplate,
      lastReviewedDate: Number.parseFloat(flags.lastReviewDate),
      referencePageNumber: flags.referencePageNumber,
      type: flags.type,
    })

    artifactApi.updateArtifactBySystemId(flags.systemId, requestBodyArray).then((response: ArtifactsResponsePutPost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
