import { RegistrationApi } from '@mitre/emass_client';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError } from '../../../utils/emasser/utilities';

export default class EmasserPostRegister extends Command {
  static readonly usage = '<%= command.id %>';

  static readonly description = 'The Registration endpoint provides the ability to register a certificate & obtain an API-key';

  static readonly examples = ['<%= config.bin %> <%= command.id %>'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the Register (POST) a certificate & obtain the API-key' }),
  };

  async run(): Promise<void> {
    const apiCxn = new ApiConnection();
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    apiCxn.axiosInstances.defaults.headers.common = headers;
    const registerAPI = new RegistrationApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    try {
      const response = await registerAPI.registerUser();
      console.log(colorize(outputFormat(response, false)));
    } catch (error: unknown) {
      displayError(error, 'Register Certificate');
    }

    return;
  }
}
