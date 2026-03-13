import { WorkflowDefinitionsApi } from '@mitre/emass_client';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetWorkflowDefinitions extends Command {
  static readonly usage = '<%= command.id %> [FLAGS]';

  static readonly description = 'View all workflow schemas available on the eMASS instance';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [options]'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET Workflow Definitions command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetWorkflowDefinitions);
    const apiCxn = new ApiConnection();
    const getWorkflow = new WorkflowDefinitionsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    try {
      const response = await getWorkflow.getWorkflowDefinitions(flags.includeInactive, flags.registrationType);
      console.log(colorize(outputFormat(response)));
    } catch (error: unknown) {
      displayError(error, 'Workflow Definitions');
    }
  }
}
