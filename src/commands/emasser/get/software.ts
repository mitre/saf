import {colorize} from 'json-colorizer'
import {Args, Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {SoftwareBaselineApi} from '@mitre/emass_client'
import type {SwBaselineResponseGet} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError, getFlagsForEndpoint} from '../../../utils/emasser/utilities'

export default class EmasserGetSoftwareBaseline extends Command {
  static readonly usage = '<%= command.id %> [ARGUMENT] [FLAGS]\n \x1B[93m NOTE: see EXAMPLES for argument case format\x1B[0m'

  static readonly description = 'View all software baseline for a system available on the eMASS instance'

  static readonly examples = [
    {
      description: '\x1B[93mRetrieve baselines without pagination\x1B[0m',
      command: '<%= config.bin %> <%= command.id %> baseline [-s, --systemId] <value> [options]',
    },
    {
      description: '\x1B[93mRetrieve baselines with pagination\x1B[0m',
      command: '<%= config.bin %> <%= command.id %> baseline [-s, --systemId] <value> [-S, --pageSize]=<value> [-i, --pageIndex]=<value>',
    },
  ]

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the GET Software Baseline command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  // NOTE: The way args are being implemented are mainly for clarity purposes, there is, it displays
  //       the available arguments with associate description.
  // Only args.name is used, there is, it contains the argument listed by the user.
  // Example: If the user uses the command (saf emasser get software baseline), args.name is set to baseline
  static args = {
    name: Args.string({name: 'name', required: false, hidden: true}),
    baseline: Args.string({name: 'baseline', description: 'Retrieves all software baseline for a system', required: false}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmasserGetSoftwareBaseline)
    const apiCxn = new ApiConnection()
    const getHardwareBaseline = new SoftwareBaselineApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    if (args.name === 'baseline') {
      // Order is important here
      getHardwareBaseline.getSystemSwBaseline(flags.systemId, flags.pageIndex, flags.pageSize)
        .then((response: SwBaselineResponseGet) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Software'))
    } else {
      throw this.error
    }
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error)
    } else {
      const suggestions = 'get software [-h or --help]\n\tget software baseline'
      this.warn('Invalid arguments\nTry this 👇:\n\t' + suggestions)
    }
  }
}
