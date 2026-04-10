import { CACApi } from '@mitre/emass_client';
import type { CacGet as CAC } from '@mitre/emass_client/dist/api';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

const CMD_HELP = 'saf emasser post cac -h or --help';
export default class EmasserPostCac extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'Add a Control Approval Chain (CAC) items in a system';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-s,--systemId] [-a,--controlAcronym] [options]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the POST CAC command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserPostCac);
    const apiCxn = new ApiConnection();
    const addCac = new CACApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    const requestBodyArray: CAC[] = [
      {
        controlAcronym: flags.controlAcronym,
        comments: flags.comments,
      },
    ];

    try {
      const response = await addCac.addSystemCac(flags.systemId, requestBodyArray);
      console.log(colorize(outputFormat(response, false)));
    } catch (error: unknown) {
      displayError(error, 'CAC');
    }
  }

  protected catch(err: Error & { exitCode?: number }): Promise<void> {
    // If error message is for missing flags, display what fields are required, otherwise show the error
    if (err.message.includes('See more help with --help')) {
      this.warn(err.message.replace('with --help', `with: \u001B[93m${CMD_HELP}\u001B[0m`));
    } else {
      this.warn(err);
    }
    return Promise.resolve();
  }
}
