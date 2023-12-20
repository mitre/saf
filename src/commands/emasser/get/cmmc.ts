import {CMMCAssessmentsApi} from '@mitre/emass_client'
import {CmmcResponseGet} from '@mitre/emass_client/dist/api'
import {Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserGetCmmc extends Command {
  static description = 'View Cybersecurity Maturity Model Certification (CMMC) Assessments'

  static examples = ['<%= config.bin %> <%= command.id %> --sinceDate <value>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET CMMC endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  static usage = '<%= command.id %> [options]'

  async run(): Promise<void> {
    const {flags} = await this.parse(EmasserGetCmmc)
    const apiCxn = new ApiConnection()
    const getCmmc = new CMMCAssessmentsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    // Order is important here
    getCmmc.getCmmcAssessments(flags.sinceDate).then((response: CmmcResponseGet) => {
      console.log(colorize(outputFormat(response)))
    }).catch((error:any) => console.error(colorize(outputError(error))))
  }
}
