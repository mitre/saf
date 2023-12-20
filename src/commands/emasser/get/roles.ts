import {SystemRolesApi} from '@mitre/emass_client'
import {SystemRolesCategoryResponse, SystemRolesResponse} from '@mitre/emass_client/dist/api'
import {Args, Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'roles'

export default class EmasserGetRoles extends Command {
  // Example: If the user uses the command (saf emasser get roles byCategory), args.name is set to byCategory
  static args = {
    all: Args.string({description: 'Retrieves all available system roles', name: 'all', required: false}),
    byCategory: Args.string({description: 'Retrieves role(s) - filtered by [options] params', name: 'byCategory', required: false}),
    name: Args.string({hidden: true, name: 'name', required: false}),
  }

  static description = getDescriptionForEndpoint(process.argv, endpoint)

  static examples = getExamplesForEndpoint(process.argv, endpoint)

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Roles endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  // NOTE: The way args are being implemented are mainly for the purposes of help clarity, there is, displays
  //       the available arguments with associate description.
  // Only args.name is used, there is, it contains the argument listed by the user.
  static usage = '<%= command.id %> [ARGUMENT] \n \x1B[93m NOTE: see EXAMPLES for argument case format\x1B[0m'

  async catch(error: any) { // skipcq: JS-0116
    if (error.message) {
      this.error(error)
    } else {
      const suggestions = 'get roles [-h or --help]\n\tget roles all\n\tget roles byCategory'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmasserGetRoles)
    const apiCxn = new ApiConnection()
    const getSystemRoles = new SystemRolesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    if (args.name === 'all') {
      // Order is important here
      getSystemRoles.getSystemRoles().then((response: SystemRolesResponse) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error:any) => console.error(colorize(outputError(error))))
    } else if (args.name === 'byCategory') {
      // Order is important here
      getSystemRoles.getSystemRolesByCategoryId(flags.roleCategory, flags.role, flags.policy, flags.includeDecommissioned).then((response: SystemRolesCategoryResponse) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error:any) => console.error(colorize(outputError(error))))
    } else {
      throw this.error
    }
  }
}
