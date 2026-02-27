import { colorize } from 'json-colorizer';
import { Command, Flags } from '@oclif/core';
import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { CACApi } from '@mitre/emass_client';
import { CacResponseGet } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { displayError, FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetCac extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'View one or many Control Approval Chain (CAC) in a system specified system ID';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s, --systemId] <value>'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET CAC command' }),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetCac);
    const apiCxn = new ApiConnection();
    const getCac = new CACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    getCac.getSystemCac(flags.systemId, flags.controlAcronyms).then((response: CacResponseGet) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error: unknown) => displayError(error, 'CAC'));
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get cac [-h or --help]';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
  }
}
