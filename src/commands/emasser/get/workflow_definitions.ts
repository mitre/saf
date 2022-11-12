import colorize from 'json-colorizer';
import { Command, Flags } from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { WorkflowDefinitionsApi } from '@mitre/emass_client';
import { WorkflowDefinitionResponseGet } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetWorkflowDefinitions extends Command {
  static usage = '<%= command.id %> [options]'

  static description = 'View all workflow schemas available on the eMASS instance'

  static examples = ['<%= config.bin %> <%= command.id %> [options]']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Workflow Definitions endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetWorkflowDefinitions)
    const apiCxn = new ApiConnection();
    const getWorkflow = new WorkflowDefinitionsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // Order is important here
    getWorkflow.getWorkflowDefinitions(flags.includeInactive,flags.registrationType).then((response: WorkflowDefinitionResponseGet) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}
