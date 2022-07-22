import _ from 'lodash'
import {Flags} from "@oclif/core"
import * as emasser from '@mitre/emass_client'

interface CliArgs {
  requestType: string;
  endpoint: string;
  argument: string;
}

export function getFlagsForEndpoint(argv: string[]) {
  let args: CliArgs = getArgs(argv);

  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post'))
  const requestType = argv[requestTypeIndex]
  const endpoint = argv[requestTypeIndex + 1]
  const argument = argv[requestTypeIndex + 2]

  if (requestType === 'get') {
    if (endpoint === 'system') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        includePackage: Flags.boolean({char: "i", description: "Boolean - include system packages", required: false}),
        policy: Flags.string({char: "p", description: "Filter on policy", required: false, options: ['diacap','rmf','reporting']}),
      }
    } else if (endpoint === 'systems') {
      return {
        registrationType: Flags.string({char: "r", description: "Filter on registration type", 
        options: ['assessAndAuthorize','assessOnly','guest','regular','functional','cloudServiceProvider','commonControlProvider'], required: false}),
        ditprId: Flags.string({description: "DoD Information Technology (IT) Portfolio Repository (DITPR) string Id", required: false}),
        coamsId: Flags.string({char: "c", description: "Cyber Operational Attributes Management System (COAMS) string Id", required: false}),
        policy: Flags.string({char: "p", description: "Filter on policy", required: false, options: ['diacap','rmf','reporting']}),
    
        includePackage: Flags.boolean({char: "i", description: "Boolean - include system packages", required: false}),
        includeDitprMetrics: Flags.boolean({char: "m", description: "Boolean - include DoD Information Technology metrics", required: false}),
        includeDecommissioned: Flags.boolean({char: "d", description: "Boolean - include decommissioned systems", required: false}),
        reportsForScorecard: Flags.boolean({char: "s", description: "Boolean - include score card", required: false}),
      }
    } else if (endpoint === 'roles'&& argument === 'byCategory') {
      return {
        roleCategory: Flags.string({char: "c", description: "Filter on role category", options: ['CAC','PAC','Other'], required: true}),
        role: Flags.string({char: "r", description: "Filter on role type", 
        options: ['AO','Auditor','Artifact Manager','C&A Team', 'IAO','ISSO', 'PM/IAM', 'SCA', 'User Rep', 'Validator'], required: true}),
        policy: Flags.string({char: "p", description: "Filter on policy", options: ['diacap','rmf','reporting'], required: false}),
        includeDecommissioned: Flags.boolean({char: "d", description: "Boolean - include decommissioned systems", required: false}),
      }
    }
  }
  return {}
}

export function getDescriptionForEndpoint(argv: string[]): string {
  let args: CliArgs = getArgs(argv);

  if (args.requestType === 'get') {
    if (args.endpoint === 'system') {

    } else if (args.endpoint === 'roles') {
      if (args.argument === 'all') {
        return 'Retrieve all available system roles';
      } else if (args.argument === 'byCategory') {
        return 'Retrieve system roles filter by options';
      } else {
        return 'Retrieve all available system roles, or filter by options';
      }
    }
  }
  return '';
}

export function getExamplesForEndpoint(argv: string[]): string[] {
  let args: CliArgs = getArgs(argv);

  if (args.requestType === 'get' && args.endpoint === 'roles') {
    if (args.argument === 'all') {
      return ['emasser get roles all'];
    } else if (args.argument === 'byCategory') {
      return ['emasser get roles byCategory --roleCategory=<value> --role=<value> [options]'];
    } else {
      return ['emasser get roles all', 'emasser get roles byCategory --roleCategory=<value> --role=<value> [options]'];
    }
  }
  return [''];
}

// Supporting Functions
function getArgs(argv: string[]): CliArgs {
  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post'))
  return {
    requestType: argv[requestTypeIndex],
    endpoint: argv[requestTypeIndex + 1],
    argument: argv[requestTypeIndex + 2],
  }
}