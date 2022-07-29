import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { WorkflowDefinitionsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';

export default class EmasserGetWorkflowDefinitions extends Command {

  static usage = 'get workflow_definitions [options]'

  static description = 'Get system information for a specific system defined by ID (systeId)'

  static examples = ['emasser get workflow_definitions [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the get system endpoint'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetWorkflowDefinitions)
    const apiCxn = new ApiConnection();
    const getWorkflow = new WorkflowDefinitionsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // Order is important here
    getWorkflow.getWorkflowDefinitions(flags.includeInactive,flags.registrationType).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}

