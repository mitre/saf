import colorize from 'json-colorizer'
import {Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {SystemRolesApi} from '@mitre/emass_client'
import {SystemRolesResponse, SystemRolesCategoryResponse} from '@mitre/emass_client/dist/api'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'
import {FlagOptions,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'roles'

export default class EmasserGetRoles extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]'

  static description = getDescriptionForEndpoint(process.argv, endpoint);

  static examples = getExamplesForEndpoint(process.argv, endpoint);

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Roles endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  static args = [
    {name: 'all', description: 'Retrieves all available system roles', required: false},
    {name: 'byCategory', description: 'Retrieves role(s) - filtered by [options] params', required: false},
  ]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmasserGetRoles)
    const apiCxn = new ApiConnection()
    const getSystemRoles = new SystemRolesApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    if (args.all === 'all') {
      // Order is important here
      getSystemRoles.getSystemRoles().then((response: SystemRolesResponse) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error:any) => console.error(colorize(outputError(error))))
    } else if (args.all === 'byCategory') {
      // Order is important here
      getSystemRoles.getSystemRolesByCategoryId(flags.roleCategory, flags.role, flags.policy, flags.includeDecommissioned).then((response: SystemRolesCategoryResponse) => {
        console.log(colorize(outputFormat(response)))
      }).catch((error:any) => console.error(colorize(outputError(error))))
    } else {
      throw this.error
    }
  }

  async catch(error: any) { // skipcq: JS-0116
    if (error.message) {
      this.error(error)
    } else {
      const suggestions = 'get roles [-h or --help]\n\tget roles all\n\tget roles byCategory'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }
}
