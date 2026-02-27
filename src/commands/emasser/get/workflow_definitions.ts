import { colorize } from 'json-colorizer';
import { Command, Flags } from '@oclif/core';
import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { WorkflowDefinitionsApi } from '@mitre/emass_client';
import { WorkflowDefinitionResponseGet } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { displayError, FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetWorkflowDefinitions extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'View all workflow schemas available on the eMASS instance';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [options]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET Workflow Definitions command' }),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetWorkflowDefinitions);
    const apiCxn = new ApiConnection();
    const getWorkflow = new WorkflowDefinitionsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    getWorkflow.getWorkflowDefinitions(flags.includeInactive, flags.registrationType).then((response: WorkflowDefinitionResponseGet) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error: unknown) => displayError(error, 'Workflow Definitions'));
  }
}
