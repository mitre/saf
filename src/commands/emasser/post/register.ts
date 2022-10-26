import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { RegistrationApi } from '@mitre/emass_client';
import { Register } from '@mitre/emass_client/dist/api';
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';

export default class EmasserPostRegister extends Command {
  static usage = '<%= command.id %>'

  static description = "The Registration endpoint provides the ability to register a certificate & obtain an API-key"

  static examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Register a certificate & obtain an API-key'}),
  }
  
  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserPostRegister)
    const apiCxn = new ApiConnection();
    const registerAPI = new RegistrationApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    registerAPI.registerUser().then((response: Register) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}