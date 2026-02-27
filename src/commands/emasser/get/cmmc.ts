import { colorize } from 'json-colorizer';
import { Command, Flags } from '@oclif/core';
import { ApiConnection } from '../../../utils/emasser/apiConnection';
import { CMMCAssessmentsApi } from '@mitre/emass_client';
import { CmmcResponseGet } from '@mitre/emass_client/dist/api';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { displayError, FlagOptions, getFlagsForEndpoint } from '../../../utils/emasser/utilities';

export default class EmasserGetCmmc extends Command {
  static readonly usage = '<%= command.id %> [FLAG]';

  static readonly description = 'View Cybersecurity Maturity Model Certification (CMMC) Assessments';

  static readonly examples = ['<%= config.bin %> <%= command.id %> [-d, --sinceDate] <value>'];

  static readonly flags = {
    help: Flags.help({ char: 'h', description: 'Show eMASSer CLI help for the GET CMMC command' }),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(EmasserGetCmmc);
    const apiCxn = new ApiConnection();
    const getCmmc = new CMMCAssessmentsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    // Order is important here
    getCmmc.getCmmcAssessments(flags.sinceDate).then((response: CmmcResponseGet) => {
      console.log(colorize(outputFormat(response)));
    }).catch((error: unknown) => displayError(error, 'CMMC'));
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message);
    } else {
      const suggestions = 'get cmmc [-h or --help]';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
  }
}
