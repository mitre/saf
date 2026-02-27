import os from 'os';
import path from 'path';
import AdmZip from 'adm-zip';
import fs, { ReadStream } from 'fs';
import { colorize } from 'json-colorizer';
import { Command, Flags } from '@oclif/core';
import { ArtifactsApi } from '@mitre/emass_client';
import { ArtifactsResponsePutPost } from '@mitre/emass_client/dist/api';
import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { displayError, FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

const CMD_HELP = 'saf emasser post artifacts -h or --help';
export default class EmasserPostArtifacts extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]\n\u001B[93m NOTE: see EXAMPLES for command options\u001B[0m';

  static readonly description = 'Uploads a single or multiple artifacts to a system.\n'
    + 'The single file can be an individual artifact or a .zip\n'
    + 'file containing multiple artifacts. If multiple files are\n'
    + 'provided they are archived into a zip file and sent as bulk.';

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
  ];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the POST Artifacts command' }),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserPostArtifacts);
    const apiCxn = new ApiConnection();
    const artifactApi = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Check if we have a single file, could be a zip file
    if (flags.fileName.length === 1 || flags.fileName[0].endsWith('.zip')) {
      if (fs.existsSync(flags.fileName[0])) {
        const isBulk = Boolean(flags.fileName[0].endsWith('.zip'));
        const fileStream: ReadStream = fs.createReadStream(flags.fileName[0]);

        artifactApi.addArtifactsBySystemId(
          flags.systemId, fileStream, isBulk, flags.isTemplate, flags.type, flags.category).then(
          (response: ArtifactsResponsePutPost) => {
            console.log(colorize(outputFormat(response, false)));
          }).catch((error: unknown) => displayError(error, 'Artifacts'));
      } else {
        console.error('\u001B[91m» Artifact file not found:', flags.fileName[0], '\u001B[0m');
      }

    // Multiple files, create a zip file
    } else {
      // Create a new AdmZip instance
      const zip = new AdmZip();

      // Add all files to the zip archive
      flags.fileName.forEach((inputFile: string) => {
        if (fs.existsSync(inputFile)) {
          zip.addLocalFile(inputFile);
        } else {
          console.error('\u001B[91m» Artifact file not found:', inputFile, '\u001B[0m');
          process.exit(1);
        }
      });

      // Generate a temporary zip file in the system's temp directory
      const zipper = path.join(os.tmpdir(), 'zipper.zip');
      zip.writeZip(zipper); // Write the zip file to disk

      // Read the generated zip file as a stream
      const fileStream: fs.ReadStream = fs.createReadStream(zipper);

      artifactApi.addArtifactsBySystemId(flags.systemId, fileStream, true, flags.isTemplate, flags.type, flags.category).then((response: ArtifactsResponsePutPost) => {
        console.log(colorize(outputFormat(response, false)));
      }).catch((error: unknown) => displayError(error, 'Artifacts'));
    }
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to return a Promise
  protected async catch(err: Error & { exitCode?: number }): Promise<void> {
    // If error message is for missing flags, display
    // what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \u001B[93m${CMD_HELP}\u001B[0m`));
    } else {
      this.warn(err);
    }
  }
}
