import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { WorkflowInstancesApi } from '@mitre/emass_client';
import { WorkflowInstancesResponseGet,
  WorkflowInstanceResponseGet } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, 
  getDescriptionForEndpoint, 
  getExamplesForEndpoint, 
  getFlagsForEndpoint } from '../../../utils/emasser/utilities';

const endpoint = 'workflow_instances';

export default class EmasserGetWorkflowInstances extends Command {
  static usage = 'get workflow_instances [ARGUMENT]';

  static description = getDescriptionForEndpoint(process.argv, endpoint);

  static examples = getExamplesForEndpoint(process.argv); 

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Workflow Instances endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }

  static args = [
    {name: "name", required: false, hidden: true},
    {name: "all", description: 'Retrieves all workflow instances in a site', required: false},
    {name: "byInstanceId", description: 'Retrieves workflow(s) instance by ID', required: false},
  ]

  async run(): Promise<void> {

    const {args, flags} = await this.parse(EmasserGetWorkflowInstances)
    const apiCxn = new ApiConnection();
    const getWorkflowInstances = new WorkflowInstancesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    if (args.name === 'all') {
      // Order is important here
      getWorkflowInstances.getSystemWorkflowInstances(flags.includeComments,flags.pageIndex,flags.sinceDate,flags.status).then((response: WorkflowInstancesResponseGet) => {
        console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'byInstanceId') {
      // Order is important here
      getWorkflowInstances.getSystemWorkflowInstancesByWorkflowInstanceId(flags.workflowInstanceId).then((response: WorkflowInstanceResponseGet) => {
        console.log(colorize(outputFormat(response)));
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