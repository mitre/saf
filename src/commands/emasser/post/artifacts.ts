import colorize from 'json-colorizer'
import {Zip} from 'zip-lib'
import {Command, Flags} from '@oclif/core'
import {ArtifactsApi} from '@mitre/emass_client'
import {ArtifactsResponsePutPost} from '@mitre/emass_client/dist/api'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'
import {outputError} from '../../../utils/emasser/outputError'
import fs, {ReadStream} from 'fs'
import os from 'os'
import path from 'path'

export default class EmasserPostArtifacts extends Command {
  static usage = '<%= command.id %> [options]'

  static description = 'Uploads [FILES] to the given [SYSTEM_ID] as artifacts'

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-i,--input] [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) artifact file(s) to a system'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostArtifacts)
    const apiCxn = new ApiConnection()
    const artifactApi = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    // Create the archive object, add all files
    const archiver = new Zip()
    flags.input.forEach((inputFile: string) => {
      if (fs.existsSync(inputFile)) {
        archiver.addFile(inputFile)
      }
    })

    // Generate zip file
    const zipper = path.join(os.tmpdir(), 'zipper.zip')
    await archiver.archive(zipper)
    const fileStream: ReadStream = fs.createReadStream(zipper)

    artifactApi.addArtifactsBySystemId(flags.systemId, fileStream, String(flags.isTemplate), flags.type, flags.category).then((response: ArtifactsResponsePutPost) => {
      console.log(colorize(outputFormat(response, false)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
