import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../emasscommands/apiConnection"
import { CMMCAssessmentsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../emasscommands/outputFormatter';
import { outputError } from '../../../emasscommands/outputError';
import { getFlagsForEndpoint } from '../../../emasscommands/utilities';

export default class EmasserGetCmmc extends Command {

  static usage = 'get cmmc [ARGUMENTS]'

  static description = 'View Cybersecurity Maturity Model Certification (CMMC) Assessments'

  static examples = ['emasser get cmmc --sinceDate <value>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the get CMMC endpoint'}),
    ...getFlagsForEndpoint(process.argv) as any,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetCmmc)
    const apiCxn = new ApiConnection();
    const getCmmc = new CMMCAssessmentsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);
    
    // Order is important here
    getCmmc.getCmmcAssessments(flags.sinceDate).then((data:any) => {
      console.log(colorize(outputFormat(data.data)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
  }
}
