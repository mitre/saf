import {colorize} from 'json-colorizer'
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

const CMD_HELP = 'saf emasser post artifacts -h or --help'
export default class EmasserPostArtifacts extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\x1B[93m NOTE: see EXAMPLES for command options\x1B[0m'

  static readonly description = 'Uploads a single or multiple artifacts to a system.\n' +
    'The single file can be an individual artifact or a .zip\n' +
    'file containing multiple artifacts. If multiple files are\n' +
    'provided they are archived into a zip file and sent as bulk.'

  static readonly examples = [
    {
      description: 'Add a single artifact file',
      command: '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--fileName] <path-to-file> [FLAGS]',
    },
    {
      description: 'Add multiple artifact files',
      command: '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--fileName] <path-to-file1> <path-to-file2> ... [FLAGS]',
    },
    {
      description: 'Add bulk artifact file (.zip)',
      command: '<%= config.bin %> <%= command.id %> [-s,--systemId] [-f,--fileName] <path-to-zip-file> [FLAGS]',
    },
  ]

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the POST Artifacts command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostArtifacts)
    const apiCxn = new ApiConnection()
    const artifactApi = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    // Check if we have a single file, could be a zip file
    if (flags.fileName.length === 1 || flags.fileName[0].endsWith('.zip')) {
      if (fs.existsSync(flags.fileName[0])) {
        const isBulk = Boolean(flags.fileName[0].endsWith('.zip'))
        const fileStream: ReadStream = fs.createReadStream(flags.fileName[0])

        artifactApi.addArtifactsBySystemId(
          flags.systemId, fileStream, isBulk, flags.isTemplate, flags.type, flags.category).then(
          (response: ArtifactsResponsePutPost) => {
            console.log(colorize(outputFormat(response, false)))
          }).catch((error: any) => console.error(colorize(outputError(error))))
      }  else {
        console.error('\x1B[91m» Artifact file not found:', flags.fileName[0], '\x1B[0m')
      }

    // Multiple files, create a zip file
    } else {
      // Create the archive object, add all files
      const archiver = new Zip()
      flags.fileName.forEach((inputFile: string) => {
        if (fs.existsSync(inputFile)) {
          archiver.addFile(inputFile)
        } else {
          console.error('\x1B[91m» Artifact file not found:', inputFile, '\x1B[0m')
          process.exit(1)
        }
      })

      // Generate zip file
      const zipper = path.join(os.tmpdir(), 'zipper.zip')
      await archiver.archive(zipper)
      const fileStream: ReadStream = fs.createReadStream(zipper)

      artifactApi.addArtifactsBySystemId(flags.systemId, fileStream, true, flags.isTemplate, flags.type, flags.category).then((response: ArtifactsResponsePutPost) => {
        console.log(colorize(outputFormat(response, false)))
      }).catch((error:any) => console.error(colorize(outputError(error))))
    }
  }

  protected async catch(err: Error & {exitCode?: number}): Promise<any> { // skipcq: JS-0116
    // If error message is for missing flags, display
    // what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \x1B[93m${CMD_HELP}\x1B[0m`))
    } else {
      this.warn(err)
    }
  }
}
