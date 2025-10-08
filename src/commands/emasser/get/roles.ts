import {colorize} from 'json-colorizer'
import {Args, Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {SystemRolesApi} from '@mitre/emass_client'
import type {SystemRolesResponse, SystemRolesCategoryResponse} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {FlagOptions} from '../../../utils/emasser/utilities'
import {displayError,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'roles'

export default class EmasserGetRoles extends Command {
  static readonly usage = '<%= command.id %> [ARGUMENT] [FLAGS]\n \x1B[93m NOTE: see EXAMPLES for argument case format\x1B[0m'

  static readonly description = getDescriptionForEndpoint(process.argv, endpoint)

  static readonly examples = getExamplesForEndpoint(process.argv, endpoint)

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the GET Roles command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  // NOTE: The way args are being implemented are mainly for the purposes of help clarity, there is, displays
  //       the available arguments with associate description.
  // Only args.name is used, there is, it contains the argument listed by the user.
  // Example: If the user uses the command (saf emasser get roles byCategory), args.name is set to byCategory
  static readonly args = {
    name: Args.string({name: 'name', required: false, hidden: true}),
    all: Args.string({name: 'all', description: 'Retrieves all available system roles', required: false}),
    byCategory: Args.string({name: 'byCategory', description: 'Retrieves role(s) - filtered by [options] params', required: false}),
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmasserGetRoles)
    const apiCxn = new ApiConnection()
    const getSystemRoles = new SystemRolesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    if (args.name === 'all') {
      // Order is important here
      getSystemRoles.getSystemRoles().then((response: SystemRolesResponse) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error: unknown) => displayError(error, 'Roles'))
    } else if (args.name === 'byCategory') {
      // Order is important here
      getSystemRoles.getSystemRolesByCategoryId(flags.roleCategory, flags.role, flags.policy, flags.includeDecommissioned).then((response: SystemRolesCategoryResponse) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error: unknown) => displayError(error, 'Roles'))
    } else {
      throw this.error
    }
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message)
    } else {
      const suggestions = 'get roles [-h or --help]\n\tget roles all\n\tget roles byCategory'
      this.warn('Invalid arguments\nTry this 👇:\n\t' + suggestions)
    }
  }
}
