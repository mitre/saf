import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { TestApi } from '@mitre/emass_client';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { Test } from '@mitre/emass_client/dist/api';


export default class EmasserGetTestConnection extends Command {

  static usage = 'get test_connection'

  static description = 'Test if eMASS url is set to a correct host'

  static examples = ['emasser get test_connection']

  static flags = {
    help: Flags.help({char: 'h', description: 'Test connection to configured eMASS URL'}),
  }

  async run(): Promise<void> {
    const apiCxn = new ApiConnection();
    const getTestApi = new TestApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    getTestApi.testConnection().then((response: Test) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}