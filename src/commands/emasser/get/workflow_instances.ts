import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { WorkflowInstancesApi } from '@mitre/emass_client';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, 
  getDescriptionForEndpoint, 
  getExamplesForEndpoint, 
  getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetWorkflowInstances extends Command {

  static usage = 'get workflow_instances [ARGUMENT]'

  static description = getDescriptionForEndpoint(process.argv, 'workflow_instances');

  static examples = getExamplesForEndpoint(process.argv); 

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Workflow Instances endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }

  static args = [
    {name: "all", description: 'Retrieves all workflow instances in a site', required: false},
    {name: "'byInstanceId", description: 'Retrieves workflow(s) instance by ID', required: false},
  ]

  async run(): Promise<void> {

    const {args, flags} = await this.parse(EmasserGetWorkflowInstances)
    const apiCxn = new ApiConnection();
    const getWorkflowInstances = new WorkflowInstancesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    if (args.all === 'all') {
      // Order is important here
      getWorkflowInstances.getSystemWorkflowInstances(flags.includeComments,flags.pageIndex,flags.sinceDate,flags.status).then((data:any) => {
        console.log(colorize(outputFormat(data.data)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.all === 'byInstanceId') {
      // Order is important here
      getWorkflowInstances.getSystemWorkflowInstancesByWorkflowInstanceId(flags.workflowInstanceId).then((data:any) => {
        console.log(colorize(outputFormat(data.data)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else {
      throw this.error;
    }
  }

  async catch(error: any) {
    if (error.message) {
      this.error(error)
    } else {
      let suggestions = 'get workflow_instances [-h or --help]\n\tget workflow_instances all\n\tget workflow_instances byInstanceId';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
  }
}