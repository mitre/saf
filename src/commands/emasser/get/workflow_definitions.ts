import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { WorkflowDefinitionsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetWorkflowDefinitions extends Command {

  static usage = 'get workflow_definitions [options]'

  static description = 'View all workflow schemas available on the eMASS instance'

  static examples = ['emasser get workflow_definitions [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Workflow Definitions endpoint'}),
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
