import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {CMMCAssessmentsApi} from '@mitre/emass_client'
import {CmmcResponseGet} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'
import {FlagOptions, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserGetCmmc extends Command {
  static usage = '<%= command.id %> [options]'

  static description = 'View Cybersecurity Maturity Model Certification (CMMC) Assessments'

  static examples = ['<%= config.bin %> <%= command.id %> --sinceDate <value>']

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET CMMC endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

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
