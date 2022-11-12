import colorize from 'json-colorizer';
import { Command, Flags } from "@oclif/core"
import { ArtifactsApi } from '@mitre/emass_client';
import { ArtifactsResponseDel } from '@mitre/emass_client/dist/api';
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { ArtifactsRequestDeleteBodyInner as ArtifactDeleteBody } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserDeleteArtifacts extends Command {

  static usage = '<%= command.id %> [ARGUMENTS]';

  static description = 'Remove one or many artifacts in a system identified by system Id';

  static examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-F,--fileName]']; 

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the DELETE POA&M endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserDeleteArtifacts)
    const apiCxn = new ApiConnection();
    const delArtifact = new ArtifactsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    let requestBodyArray: ArtifactDeleteBody[] = [];
    flags.fileName.forEach(function(filename: string) {
      requestBodyArray.push({filename: filename});
    })

    delArtifact.deleteArtifact(flags.systemId,requestBodyArray).then((response: ArtifactsResponseDel) => {
      console.log(colorize(outputFormat(response, false)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}