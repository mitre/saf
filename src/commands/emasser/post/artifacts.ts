import colorize from 'json-colorizer';
import { Zip } from 'zip-lib';
import { Command, Flags } from "@oclif/core"
import { ArtifactsApi } from '@mitre/emass_client';
import { ArtifactsResponsePutPost } from '@mitre/emass_client/dist/api';
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';
import { outputError } from '../../../utils/emasser/outputError';
import FormData from 'form-data';
import * as fs from 'fs';
import os from 'os';
import path from 'path';

export default class EmasserPostArtifacts extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = "Uploads [FILES] to the given [SYSTEM_ID] as artifacts"

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-i,--input] [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Post (add) artifact file(s) to a system'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostArtifacts)
    const apiCxn = new ApiConnection();
    const artifactApi = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    const form = new FormData();

    const archiver = new Zip();
    flags.input.forEach((inputFile: string) => {
      if (fs.existsSync(inputFile)) {
        archiver.addFile(inputFile);
      }
    });

    let zipper = path.join(os.tmpdir(), 'zipper.zip');

    // Generate zip file.
    await archiver.archive(zipper).then(function () {
      form.append('zipper', fs.createReadStream(zipper),'zipper.zip');
    }, function (err: any) {
      console.log(err);
    });

    let optionObj: {[key: string]: any} = {};
    optionObj.headers = form.getHeaders();

    artifactApi.addArtifactsBySystemId(flags.systemId, form, String(flags.isTemplate), flags.type, flags.category, optionObj).then((response: ArtifactsResponsePutPost) => {
      console.log(colorize(outputFormat(response, false)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}