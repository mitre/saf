import { CMMCAssessmentsApi } from '@mitre/emass_client';
import { Command, Flags } from '@oclif/core';
import { colorize } from 'json-colorizer';
import { ApiConnection } from '../../../utils/emasser/api_connection';
import { outputFormat } from '../../../utils/emasser/output_formatter';
import { displayError, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetCmmc extends Command {
  static readonly usage = '<%= command.id %> [FLAG]';

  static readonly description = 'View Cybersecurity Maturity Model Certification (CMMC) Assessments';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-d, --sinceDate] <value>'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET CMMC command' }),
    ...getFlagsForEndpoint(process.argv),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetCmmc);
    const apiCxn = new ApiConnection();
    const getCmmc = new CMMCAssessmentsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    try {
      const response = await getCmmc.getCmmcAssessments(flags.sinceDate);
      console.log(colorize(outputFormat(response)));
    } catch (error: unknown) {
      displayError(error, 'CMMC');
    }
  }

  protected catch(error: unknown): Promise<void> {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get cmmc [-h or --help]';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
    return Promise.resolve();
  }
}
