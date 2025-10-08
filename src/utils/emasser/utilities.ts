/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Flags} from '@oclif/core'
import type {BooleanFlag, OptionFlag} from '@oclif/core/interfaces'
import fs from 'fs'
import path from 'path'
import {colorize} from 'json-colorizer'
import {outputError} from './outputError'

/**
 * Interface representing the command line arguments.
 *
 * @property {string} requestType - The type of request to be made.
 * @property {string} endpoint - The endpoint to which the request is directed.
 * @property {string} argument - Additional argument for the request.
 */
interface CliArgs {
  requestType: string
  endpoint: string
  argument: string
}

/**
 * Interface representing various flag options used in the application.
 * Property are listed here as optional but are set to required based
 * on what endpoint being supported (see getFlagsForEndpoint)
 */
export interface FlagOptions {
  systemId?: OptionFlag<number>
  poamId?: OptionFlag<number>
  poamsId?: OptionFlag<number[]>
  milestoneId?: OptionFlag<number>
  milestonesId?: OptionFlag<number[]>
  workflowInstanceId?: OptionFlag<number>
  pageIndex?: OptionFlag<number | undefined>
  includeComments?: BooleanFlag<boolean | undefined>
  includeDecommissionSystems?: BooleanFlag<boolean | undefined>
  excludeInherited?: BooleanFlag<boolean | undefined>
  includeInactive?: BooleanFlag<boolean | undefined>
  isTemplate?: BooleanFlag<boolean>
  includeDitprMetrics?: BooleanFlag<boolean | undefined>
  includeDecommissioned?: BooleanFlag<boolean | undefined>
  reportsForScorecard?: BooleanFlag<boolean | undefined>
  latestOnly?: BooleanFlag<boolean | undefined>
  systemOnly?: BooleanFlag<boolean | undefined>
  compress?: BooleanFlag<boolean | undefined>
  printToStdOut?: BooleanFlag<boolean | undefined>
  policy?: OptionFlag<string | undefined>
  registrationType?: OptionFlag<string | undefined>
  ditprId?: OptionFlag<string | undefined>
  coamsId?: OptionFlag<string | undefined>
  roleCategory?: OptionFlag<string>
  role?: OptionFlag<string>
  acronyms?: OptionFlag<string | undefined>
  controlAcronyms?: OptionFlag<string | undefined>
  assessmentProcedures?: OptionFlag<string | undefined>
  ccis?: OptionFlag<string | undefined>
  sinceDate?: OptionFlag<string | any>
  scheduledCompletionDateStart?: OptionFlag<string | undefined>
  scheduledCompletionDateEnd?: OptionFlag<string | undefined>
  filename?: OptionFlag<string | any>
  status?: OptionFlag<string | undefined>
  assessmentProcedure?: OptionFlag<string>
  testedBy?: OptionFlag<string>
  testDate?: OptionFlag<string>
  description?: OptionFlag<string | any>
  artifactDescription?: OptionFlag<string | any>
  complianceStatus?: OptionFlag<string | any>
  scheduledCompletionDate?: OptionFlag<string | any>
  orgId?: OptionFlag<number>
  pageSize?: OptionFlag<number | undefined>
  fileName?: OptionFlag<string[]>
  resourceId?: OptionFlag<string[]>
  containerId?: OptionFlag<string[]>
  assetsHardwareId?: OptionFlag<string[]>
  assetsSoftwareId?: OptionFlag<string[]>
  dataFile?: OptionFlag<string>
  type?: OptionFlag<string | any>
  category?: OptionFlag<string | any>
  refPageNumber?: OptionFlag<string | undefined>
  controls?: OptionFlag<string | undefined>
  signedDate?: OptionFlag<string | any>
  expirationDate?: OptionFlag<string | any>
  lastReviewDate?: OptionFlag<string | any>
  controlAcronym?: OptionFlag<string | any>
  comments?: OptionFlag<string | any>
  workflow?: OptionFlag<string | any>
  name?: OptionFlag<string | any>
}

/**
 * Parses command line arguments to extract the request type, endpoint, and additional argument.
 *
 * @param argv - An array of command line arguments.
 * @param endpointValue - An optional endpoint value to override the one in the command line arguments.
 * @returns An object containing the request type, endpoint, and additional argument.
 */
function getArgs(argv: string[], endpointValue?: string): CliArgs {
  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post' || arg === 'put' || arg === 'delete'))
  return {
    requestType: argv[requestTypeIndex],
    endpoint: endpointValue || argv[requestTypeIndex + 1],
    argument: argv[requestTypeIndex + 2],
  }
}

/**
 * Generates flag options for a given endpoint based on the provided command line arguments.
 *
 * @param argv - The command line arguments.
 * @returns An object containing the flag options for the specified endpoint.
 *
 * The function processes different request types (`get`, `post`, `put`, `delete`) and endpoints
 * to generate the appropriate flag options. Each endpoint has its own set of flags with specific
 * descriptions and requirements.
 *
 * Example usage:
 * ```typescript
 * const flags = getFlagsForEndpoint(['get', 'system']);
 * ```
 *
 * The returned `FlagOptions` object will vary based on the endpoint and request type.
 */
// skipcq: JS-R1005 - Ignore Function cyclomatic complexity high threshold
export function getFlagsForEndpoint(argv: string[]): FlagOptions { // skipcq: JS-0044
  const args: CliArgs = getArgs(argv)
  let flagObj: FlagOptions = {}

  switch (args.requestType) { // skipcq: JS-0047
    case 'get': {
      switch (args.endpoint) { // skipcq: JS-0047
        case 'system': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            policy: Flags.string({char: 'p', description: 'Filter on policy', required: false, options: ['diacap', 'rmf', 'reporting']}),
          }
          break
        }

        case 'systems': {
          flagObj = {
            registrationType: Flags.string({char: 'r', description: 'Filter on registration type',
              options: ['assessAndAuthorize', 'assessOnly', 'guest', 'regular', 'functional', 'cloudServiceProvider', 'commonControlProvider'], required: false}),
            ditprId: Flags.string({char: 't', description: 'DoD Information Technology (IT) Portfolio Repository (DITPR) string Id', required: false}),
            coamsId: Flags.string({char: 'c', description: 'Cyber Operational Attributes Management System (COAMS) string Id', required: false}),
            policy: Flags.string({char: 'p', description: 'Filter on policy', options: ['diacap', 'rmf', 'reporting'], required: false}),
            includeDitprMetrics: Flags.boolean({char: 'M', description: 'Boolean - include DoD Information Technology metrics', allowNo: true, required: false}),
            includeDecommissioned: Flags.boolean({char: 'D', description: 'Boolean - include decommissioned systems', allowNo: true, required: false}),
            reportsForScorecard: Flags.boolean({char: 'S', description: 'Boolean - include score card', allowNo: true, required: false}),
          }
          break
        }

        case 'roles': {
          if (args.argument === 'byCategory') {
            flagObj = {
              roleCategory: Flags.string({char: 'c', description: 'Filter on role category', options: ['CAC', 'PAC', 'Other'], required: true}),
              role: Flags.string({char: 'r', description: 'Accepts single value from options available at base system-roles endpoint e.g., SCA', required: true}),
              policy: Flags.string({char: 'p', description: 'Filter on policy', options: ['diacap', 'rmf', 'reporting'], required: false}),
            }
          }

          break
        }

        case 'controls': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            acronyms: Flags.string({char: 'A', description: 'The system acronym(s) e.g "AC-1, AC-2" - if not provided all controls for systemId are returned', required: false}),
          }
          break
        }

        case 'test_results': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            controlAcronyms: Flags.string({char: 'a', description: 'The system acronym(s) e.g "AC-1, AC-2"', required: false}),
            assessmentProcedures: Flags.string({char: 'p', description: 'The system Security Control Assessment Procedure e.g "AC-1.1,AC-1.2', required: false}),
            ccis: Flags.string({char: 'c', description: 'The system CCIS string numerical value', required: false}),
            latestOnly: Flags.boolean({char: 'L', description: 'Boolean - Filter on latest only', allowNo: true, required: false}),
          }
          break
        }

        case 'poams': {
          if (args.argument === 'forSystem') {
            flagObj = {
              systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
              scheduledCompletionDateStart: Flags.string({char: 'd', description: 'The scheduled completion start date', required: false}),
              scheduledCompletionDateEnd: Flags.string({char: 'e', description: 'The scheduled completion end date', required: false}),
              controlAcronyms: Flags.string({char: 'a', description: 'The system acronym(s) e.g "AC-1, AC-2"', required: false}),
              assessmentProcedures: Flags.string({char: 'p', description: 'The system Security Control Assessment Procedure e.g "AC-1.1,AC-1.2', required: false}),
              ccis: Flags.string({char: 'c', description: 'The system CCIS string numerical value', required: false}),
              systemOnly: Flags.boolean({char: 'Y', description: 'Boolean - Return only systems', allowNo: true, required: false}),
            }
          } else if (args.argument === 'byPoamId') {
            flagObj = {
              systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
              poamId: Flags.integer({char: 'p', description: 'The poam identification number', required: true}),
            }
          }

          break
        }

        case 'milestones': {
          if (args.argument === 'byPoamId') {
            flagObj = {
              systemId: Flags.integer({char: 's', description: 'Unique system identifier', required: true}),
              poamId: Flags.integer({char: 'p', description: 'Unique poam identifier', required: true}),
              scheduledCompletionDateStart: Flags.string({char: 't', description: 'Unix time format (e.g. 1499644800)', required: false}),
              scheduledCompletionDateEnd: Flags.string({char: 'c', description: 'Unix time format (e.g. 1499990400)', required: false}),
            }
          } else if (args.argument === 'byMilestoneId') {
            flagObj = {
              systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
              poamId: Flags.integer({char: 'p', description: 'The POAM identification number', required: true}),
              milestoneId: Flags.integer({char: 'm', description: 'Unique milestone identifier', required: true}),
            }
          }

          break
        }

        case 'artifacts': {
          if (args.argument === 'forSystem') {
            flagObj = {
              systemId: Flags.integer({char: 's', description: 'Unique system identifier', required: true}),
              filename: Flags.string({char: 'f', description: 'The artifact file name', required: false}),
              controlAcronyms: Flags.string({char: 'a', description: 'The system acronym(s) e.g "AC-1, AC-2"', required: false}),
              assessmentProcedures: Flags.string({char: 'p', description: 'The system Security Control Assessment Procedure e.g "AC-1.1,AC-1.2', required: false}),
              ccis: Flags.string({char: 'c', description: 'The system CCIS string numerical value', required: false}),
              systemOnly: Flags.boolean({char: 'y', description: 'Boolean - Return only systems', allowNo: true, required: false}),
            }
          } else if (args.argument === 'export') {
            flagObj = {
              systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
              filename: Flags.string({char: 'f', description: 'The artifact file name', required: true}),
              compress: Flags.boolean({char: 'C', description: 'Boolean - Compress true or false', allowNo: true, required: false}),
              printToStdOut: Flags.boolean({char: 'P', description: 'Boolean - Print to standard output', allowNo: true, required: false}),
            }
          }

          break
        }

        case 'cac': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            controlAcronyms: Flags.string({char: 'a', description: 'The system acronym(s) e.g "AC-1, AC-2"', required: false}),
          }
          break
        }

        case 'pac': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
          }
          break
        }

        case 'hardware':
        case 'software': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            pageIndex: Flags.integer({char: 'i', description: 'The index of the starting page (default first page 0)', required: false}),
            pageSize: Flags.integer({char: 'S', description: 'The number of entries per page (default 20000)', required: false}),
          }
          break
        }

        case 'workflow_definitions': {
          flagObj = {
            includeInactive: Flags.boolean({char: 'I', description: 'Boolean - Include inactive workflows', allowNo: true, required: false}),
            registrationType: Flags.string({char: 'r', description: 'The registration type - must be a valid type',
              options: ['assessAndAuthorize', 'assessOnly', 'guest', 'regular', 'functional', 'cloudServiceProvider', 'commonControlProvider'], required: false}),
          }
          break
        }

        case 'workflow_instances': {
          if (args.argument === 'all') {
            flagObj = {
              includeComments: Flags.boolean({char: 'C', description: 'Boolean - Include transition comments', allowNo: true, required: false}),
              includeDecommissionSystems: Flags.boolean({char: 'D', description: 'Boolean - Include decommissioned systems', allowNo: true, required: false}),
              pageIndex: Flags.integer({char: 'i', description: 'The page number to query (default first page 0)', required: false}),
              sinceDate: Flags.string({char: 'd', description: 'The Workflow Instance date. Unix date format', required: false}),
              status: Flags.string({char: 's', description: 'The Workflow status - must be a valid status. if not provided includes all systems', options: ['active', 'inactive', 'all'], required: false}),
            }
          } else if (args.argument === 'byInstanceId') {
            flagObj = {
              workflowInstanceId: Flags.integer({char: 'w', description: 'Unique workflow instance identifier', required: true}),
            }
          }

          break
        }

        case 'cmmc': {
          flagObj = {
            sinceDate: Flags.string({char: 'd', description: 'The CMMC date. Unix date format', required: true}),
          }
          break
        }

        case 'dashboards': {
          flagObj = {
            orgId: Flags.integer({char: 'o', description: 'The organization identification number', required: true}),
            excludeInherited: Flags.boolean({char: 'I', description: 'Boolean - exclude inherited data (default false)', allowNo: true, required: false, default: false}),
            pageIndex: Flags.integer({char: 'i', description: 'The index of the starting page (default first page 0)', required: false}),
            pageSize: Flags.integer({char: 's', description: 'The number of entries per page (default 20000)', required: false}),
          }
          break
        }
      }

      break
    }

    case 'post': {
      switch (args.endpoint) { // skipcq: JS-0047
        case 'test_results': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            assessmentProcedure: Flags.string({char: 'a', description: 'The Security Control Assessment Procedure being assessed', required: true}),
            testedBy: Flags.string({char: 'b', description: 'The person that conducted the test (Last Name, First)', required: true}),
            testDate: Flags.string({char: 't', description: 'The date test was conducted, Unix time format', required: true}),
            description: Flags.string({char: 'd', description: 'The description of test result. 4000 Characters', required: true}),
            complianceStatus: Flags.string({char: 'S', description: 'The compliance status of the test result',
              options: ['Compliant', 'Non-Compliant', 'Not Applicable'], required: true}),
          }
          break
        }

        case 'milestones': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            poamId: Flags.integer({char: 'p', description: 'The poam identification number', required: true}),
            description: Flags.string({char: 'd', description: 'The milestone description', required: true}),
            scheduledCompletionDate: Flags.string({char: 'c', description: 'The scheduled completion date - Unix time format', required: true}),
          }
          break
        }

        case 'artifacts': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            fileName: Flags.string({char: 'f', description: 'Artifact file(s) to post to the given system, can have multiple (space separated)', required: true, multiple: true}),
            isTemplate: Flags.boolean({char: 'T', description: 'Boolean - Indicates whether an artifact is a template.', allowNo: true, required: false, default: false}),
            type: Flags.string({char: 't', description: 'Various artifact file type are accepted (defined by the eMASS administrator)', required: false, default: 'Other'}),
            category: Flags.string({char: 'c', description: 'Various artifact category are accepted (defined by the eMASS administrator)', required: false, default: 'Evidence'}),
          }
          break
        }

        case 'cac': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            controlAcronym: Flags.string({char: 'a', description: 'The system acronym "AC-1, AC-2"', required: true}),
            comments: Flags.string({char: 'c', description: 'The control approval chain comments', required: false}),
          }
          break
        }

        case 'pac': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            workflow: Flags.string({char: 'w', description: 'The appropriate workflow',
              options: ['Assess and Authorize', 'Assess Only', 'Security Plan Approval'], required: true}),
            name: Flags.string({char: 'n', description: 'The control package name', required: true}),
            comments: Flags.string({char: 'c', description: 'The control approval chain comments', required: true}),
          }
          break
        }

        case 'poams':
        case 'hardware_baseline':
        case 'software_baseline':
        case 'cloud_resources':
        case 'static_code_scans':
        case 'container_scans': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            dataFile: Flags.string({char: 'f', description: 'A well formed JSON file containing the data to add. It can ba a single object or an array of objects.', required: true}),
          }
          break
        }
      }

      break
    }

    case 'put': {
      switch (args.endpoint) { // skipcq: JS-0047
        case 'milestones': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            poamId: Flags.integer({char: 'p', description: 'The poam identification number', required: true}),
            milestoneId: Flags.integer({char: 'm', description: 'Unique milestone identifier', required: true}),
            description: Flags.string({char: 'd', description: 'The milestone description', required: true}),
            scheduledCompletionDate: Flags.string({char: 'c', description: 'The scheduled completion date - Unix time format', required: false}),
          }
          break
        }

        case 'poams':
        case 'controls':
        case 'artifacts':
        case 'hardware_baseline':
        case 'software_baseline': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            dataFile: Flags.string({char: 'f', description: 'A well formed JSON file containing the data to be updated. It can ba a single object or an array of objects.', required: true}),
          }
          break
        }
      }

      break
    }

    case 'delete': {
      switch (args.endpoint) { // skipcq: JS-0047
        case 'artifacts': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            fileName: Flags.string({char: 'f', description: 'The artifact file name to remove, can have multiple (space separated)', required: true, multiple: true}),
          }
          break
        }

        case 'milestones': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            poamId: Flags.integer({char: 'p', description: 'The poam identification number', required: true}),
            milestonesId: Flags.integer({char: 'm', description: 'Unique milestone identifier, can have multiple (space separated)', required: true, multiple: true}),
          }
          break
        }

        case 'poams': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            poamsId: Flags.integer({char: 'p', description: 'Unique POA&M identification number, can have multiple (space separated)', required: true, multiple: true}),
          }
          break
        }

        case 'hardware_baseline': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            assetsHardwareId: Flags.string({char: 'a', description: 'Unique GUID identifying a specific hardware asset, can have multiple (space separated)', required: true, multiple: true}),
          }
          break
        }

        case 'software_baseline': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            assetsSoftwareId: Flags.string({char: 'a', description: 'Unique GUID identifying a specific software asset, can have multiple (space separated)', required: true, multiple: true}),
          }
          break
        }

        case 'cloud_resources': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            resourceId: Flags.string({char: 'r', description: 'Unique identifier/resource namespace for policy compliance result, can have multiple (space separated)', required: true, multiple: true}),
          }
          break
        }

        case 'container_scans': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            containerId: Flags.string({char: 'c', description: 'Unique identifier of the container, can have multiple (space separated)', required: true, multiple: true}),
          }
          break
        }
      }

      break
    }
  }

  return flagObj
}

/**
 * Retrieves a description for a given endpoint based on the provided arguments.
 *
 * @param argv - The command line arguments passed to the function.
 * @param endpoint - The endpoint for which the description is to be retrieved.
 * @returns A string description for the specified endpoint and arguments.
 */
// skipcq: JS-R1005 - Ignore Function cyclomatic complexity high threshold
export function getDescriptionForEndpoint(argv: string[], endpoint: string): string { // skipcq: JS-0044
  const args: CliArgs = getArgs(argv, endpoint)
  let description = ''

  if (args.requestType === 'get') {
    switch (args.endpoint) { // skipcq: JS-0047
      case 'roles': {
        switch (args.argument) {
          case 'all': {
            description = 'Retrieve all available system roles'
            break
          }

          case 'byCategory': {
            description = 'Retrieve system roles filter by options'
            break
          }

          default: {
            description = 'Retrieve all available system roles, or filter by options'
            break
          }
        }

        break
      }

      case 'poams': {
        switch (args.argument) {
          case 'forSystem': {
            description = 'Retrieves Poams for specified system ID'
            break
          }

          case 'byPoamId': {
            description = 'Retrieves Poams for specified system and poam ID'
            break
          }

          default: {
            description = 'Retrieve Poams for a system or system/poam Id combination'
            break
          }
        }

        break
      }

      case 'artifacts': {
        switch (args.argument) {
          case 'forSystem': {
            description = 'Retrieves one or many artifacts for a system specified by system ID'
            break
          }

          case 'export': {
            description = 'Retrieves an artifact file for selected system\n(file is sent to EMASSER_DOWNLOAD_DIR (defaults to eMASSerDownloads) if flag [-P, --printToStdOut] not provided)'
            break
          }

          default: {
            description = 'Retrieve artifacts for a system or system/filename combination'
            break
          }
        }

        break
      }

      case 'milestones': {
        switch (args.argument) {
          case 'byPoamId': {
            description = 'Retrieves milestone(s) for specified system and poam ID'
            break
          }

          case 'byMilestoneId': {
            description = 'Retrieve milestone(s) for specified system, poam, and milestone ID'
            break
          }

          default: {
            description = 'Retrieve milestones by system by systemID/poamID or systemID/poamID/milestoneID combination'
            break
          }
        }

        break
      }

      case 'workflow_instances': {
        switch (args.argument) {
          case 'all': {
            description = 'Retrieves all workflow instances'
            break
          }

          case 'byInstanceId': {
            description = 'Retrieves workflow instance by workflow Instance ID'
            break
          }

          default: {
            description = 'Retrieve all workflow instances or workflow instances noted by workflowInstanceID'
            break
          }
        }

        break
      }

      case 'dashboards': {
        switch (args.argument) {
          case 'status_details': {
            description = 'Get systems status detail dashboard information'
            break
          }

          case 'terms_conditions_summary': {
            description = 'Get systems terms/conditions summary dashboard information'
            break
          }

          case 'terms_conditions_details': {
            description = 'Get systems terms/conditions details dashboard information'
            break
          }

          case 'connectivity_ccsd_summary': {
            description = 'Get systems connectivity/CCSD summary dashboard information'
            break
          }

          case 'connectivity_ccsd_details': {
            description = 'Get systems connectivity/CCSD details dashboard information'
            break
          }

          case 'atc_iatc_details': {
            description = 'Get systems ATC/IATC details dashboard information'
            break
          }

          case 'questionnaire_summary': {
            description = 'Get systems questionnaire summary dashboard information'
            break
          }

          case 'questionnaire_details': {
            description = 'Get systems questionnaire details dashboard information'
            break
          }

          case 'workflows_history_summary': {
            description = 'Get systems workflow history summary dashboard information'
            break
          }

          case 'workflows_history_details': {
            description = 'Get systems workflow history details dashboard information'
            break
          }

          case 'workflows_history_stage_details': {
            description = 'Get systems workflow history stage details dashboard information'
            break
          }

          case 'control_compliance_summary': {
            description = 'Get systems control compliance summary dashboard information'
            break
          }

          case 'security_control_details': {
            description = 'Get systems security control details dashboard information'
            break
          }

          case 'assessment_procedures_details': {
            description = 'Get systems assessment procedures details dashboard information'
            break
          }

          case 'poam_summary': {
            description = 'Get enterprise systems POA&Ms summary dashboard information'
            break
          }

          case 'poam_details': {
            description = 'Get enterprise system POA&Ms details dashboard information'
            break
          }

          case 'artifacts_summary': {
            description = 'Get enterprise system artifacts summary dashboard information'
            break
          }

          case 'artifacts_details': {
            description = 'Get enterprise system artifacts details dashboard information'
            break
          }

          case 'hardware_summary': {
            description = 'Get system hardware baseline summary dashboard information'
            break
          }

          case 'hardware_details': {
            description = 'Get systems hardware baseline details dashboard information'
            break
          }

          case 'sensor_hardware_summary': {
            description = 'Get system sensor-based hardware summary dashboard information'
            break
          }

          case 'sensor_hardware_details': {
            description = 'Get system sensor-based hardware details dashboard information'
            break
          }

          case 'software_summary': {
            description = 'Get system software baseline summary dashboard information'
            break
          }

          case 'software_details': {
            description = 'Get systems software baseline details dashboard information'
            break
          }

          case 'sensor_software_summary': {
            description = 'Get system sensor-based software summary dashboard information'
            break
          }

          case 'sensor_software_details': {
            description = 'Get system sensor-based software details dashboard information'
            break
          }

          case 'sensor_software_counts': {
            description = 'Get system sensor-based software counts dashboard information'
            break
          }

          case 'critical_assets_summary': {
            description = 'Get system critical assets summary dashboard information'
            break
          }

          case 'vulnerability_summary': {
            description = 'Get system vulnerability summary dashboard information'
            break
          }

          case 'device_findings_summary': {
            description = 'Get system device findings summary dashboard information'
            break
          }

          case 'device_findings_details': {
            description = 'Get system device findings details dashboard information'
            break
          }

          case 'application_findings_summary': {
            description = 'Get system application findings summary dashboard information'
            break
          }

          case 'application_findings_details': {
            description = 'Get system application findings details dashboard information'
            break
          }

          case 'ports_protocols_summary': {
            description = 'Get system ports and protocols summary dashboard information'
            break
          }

          case 'ports_protocols_details': {
            description = 'Get system ports and protocols details dashboard information'
            break
          }

          case 'integration_status_summary': {
            description = 'Get system  CONMON integration status summary dashboard information'
            break
          }

          case 'associations_details': {
            description = 'Get system associations details dashboard information'
            break
          }

          case 'user_assignments_details': {
            description = 'Get user system assignments details dashboard information'
            break
          }

          case 'org_migration_status': {
            description = 'Get organization migration status summary dashboard information'
            break
          }

          case 'system_migration_status': {
            description = 'Get system migration status summary dashboard information'
            break
          }

          case 'fisma_metrics': {
            description = 'Get system FISMA metrics dashboard information'
            break
          }

          case 'coast_guard_fisma_metrics': {
            description = 'Get Coast Guard system FISMA metrics dashboard information'
            break
          }

          case 'privacy_summary': {
            description = 'Get user system privacy summary dashboard information'
            break
          }

          case 'fisma_saop_summary': {
            description = 'Get VA OMB-FISMA SAOP summary dashboard information'
            break
          }

          case 'va_icamp_tableau_poam_details': {
            description = 'Get VA system ICAMP Tableau POA&M details dashboard information'
            break
          }

          case 'va_aa_summary': {
            description = 'Get VA system A&A summary dashboard information'
            break
          }

          case 'va_a2_summary': {
            description = 'Get VA system A2.0 summary dashboard information'
            break
          }

          case 'va_pl_109_summary': {
            description = 'Get VA System P.L. 109 reporting summary dashboard information'
            break
          }

          case 'va_fisma_inventory_summary': {
            description = 'Get VA system FISMA inventory summary dashboard information'
            break
          }

          case 'va_fisma_inventory_crypto_summary': {
            description = 'Get VA system FISMA inventory crypto summary dashboard information'
            break
          }

          case 'va_threat_risk_summary': {
            description = 'Get VA threat risk summary dashboard information'
            break
          }

          case 'va_threat_source_details': {
            description = 'Get VA threat sources details dashboard information'
            break
          }

          case 'va_threat_architecture_details': {
            description = 'Get VA threat architecture details dashboard information'
            break
          }

          case 'cmmc_status_summary': {
            description = 'Get CMMC assessment status summary dashboard information'
            break
          }

          case 'cmmc_compliance_summary': {
            description = 'Get CMMC assessment requirements compliance summary dashboard information'
            break
          }

          case 'cmmc_security_requirements_details': {
            description = 'Get CMMC assessment security requirements details dashboard information'
            break
          }

          case 'cmmc_requirement_objectives_details': {
            description = 'Get CMMC assessment requirement objectives details dashboard information'
            break
          }

          default: {
            description = 'Retrieves a pre-defined dashboard by orgId'
            break
          }
        }

        break
      }
    }
  }

  return description
}

/**
 * Generates example command strings for a given endpoint and arguments.
 *
 * @param argv - The array of command-line arguments.
 * @param endpoint - The optional endpoint to generate examples for.
 * @returns An array of example command strings.
 */
// skipcq: JS-R1005 - Ignore Function cyclomatic complexity high threshold
export function getExamplesForEndpoint(argv: string[], endpoint?: string): string[] { // skipcq: JS-0044
  const args: CliArgs = getArgs(argv, endpoint)
  // <%= config.bin %> resolves to the executable name
  // <%= command.id %> resolves to the command name
  const baseCmd = '<%= config.bin %> <%= command.id %>'
  const exampleArray: string[] = []

  if (args.requestType === 'get') {
    switch (args.endpoint) { // skipcq: JS-0047
      case 'roles': {
        switch (args.argument) {
          case 'all': {
            exampleArray.push(`${baseCmd} roles all`)
            break
          }

          case 'byCategory': {
            exampleArray.push(`${baseCmd} byCategory [-c, --roleCategory] <value> [-r, --role] <value> [options]`)
            break
          }

          default: {
            exampleArray.push(`${baseCmd} all`, `${baseCmd} byCategory [-c, --roleCategory] <value> [-r, --role] <value> [options]`)
            break
          }
        }

        break
      }

      case 'poams': {
        switch (args.argument) {
          case 'forSystem': {
            exampleArray.push(`${baseCmd} forSystem [-s, --systemId] <value> [options]`)
            break
          }

          case 'byPoamId': {
            exampleArray.push(`${baseCmd} byPoamId [-s, --systemId] <value> [-p, --poamId] <value>`)
            break
          }

          default: {
            exampleArray.push(`${baseCmd} forSystem [-s, --systemId] <value> [options]`, `${baseCmd} byPoamId [-s, --systemId] <value> [-p, --poamId] <value>`)
            break
          }
        }

        break
      }

      case 'artifacts': {
        switch (args.argument) {
          case 'forSystem': {
            exampleArray.push(`${baseCmd} forSystem [-s, --systemId] <value> [options]`)
            break
          }

          case 'export': {
            exampleArray.push(`${baseCmd} export [-s, --systemId] <value> [-f, --filename] <value> [options]`)
            break
          }

          default: {
            exampleArray.push(
              `${baseCmd} forSystem [-s, --systemId] <value> [options]`,
              `${baseCmd} export [-s, --systemId] <value> [-f, --filename] <value> [options]`,
            )
            break
          }
        }

        break
      }

      case 'milestones': {
        switch (args.argument) {
          case 'byPoamId': {
            exampleArray.push(`${baseCmd} byPoamId [-s, --systemId] <value> [-p, --poamId] <value> [options]`)
            break
          }

          case 'byMilestoneId': {
            exampleArray.push(`${baseCmd} byMilestoneId [-s, --systemId] <value> [-p, --poamId] <value> [-m, --milestoneId] <value>`)
            break
          }

          default: {
            exampleArray.push(`${baseCmd} byPoamId [-s, --systemId] <value> [-p, --poamId] <value> [options]`, `${baseCmd} byMilestoneId [-s, --systemId] <value> [-p, --poamId] <value> [-m, --milestoneId] <value>`)
            break
          }
        }

        break
      }

      case 'workflow_instances': {
        switch (args.argument) {
          case 'all': {
            exampleArray.push(`${baseCmd} all [options]`)
            break
          }

          case 'byInstanceId': {
            exampleArray.push(`${baseCmd} byInstanceId [-w, --workflowInstanceId] <value>`)
            break
          }

          default: {
            exampleArray.push(`${baseCmd} all [options]`, `${baseCmd} byInstanceId [-w, --workflowInstanceId] <value>`)
            break
          }
        }

        break
      }

      case 'dashboards': {
        switch (args.argument) {
          case 'status_details': {
            exampleArray.push(`${baseCmd} status_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'terms_conditions_summary': {
            exampleArray.push(`${baseCmd} terms_conditions_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'terms_conditions_details': {
            exampleArray.push(`${baseCmd} terms_conditions_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'connectivity_ccsd_summary': {
            exampleArray.push(`${baseCmd} connectivity_ccsd_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'connectivity_ccsd_details': {
            exampleArray.push(`${baseCmd} connectivity_ccsd_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'atc_iatc_details': {
            exampleArray.push(`${baseCmd} atc_iatc_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'questionnaire_summary': {
            exampleArray.push(`${baseCmd} questionnaire_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'questionnaire_details': {
            exampleArray.push(`${baseCmd} questionnaire_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'workflows_history_summary': {
            exampleArray.push(`${baseCmd} workflows_history_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'workflows_history_details': {
            exampleArray.push(`${baseCmd} workflows_history_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'workflows_history_stage_details': {
            exampleArray.push(`${baseCmd} workflows_history_stage_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'control_compliance_summary': {
            exampleArray.push(`${baseCmd} control_compliance_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'security_control_details': {
            exampleArray.push(`${baseCmd} security_control_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'assessment_procedures_details': {
            exampleArray.push(`${baseCmd} assessment_procedures_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'poam_summary': {
            exampleArray.push(`${baseCmd} poam_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'poam_details': {
            exampleArray.push(`${baseCmd} poam_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'artifacts_summary': {
            exampleArray.push(`${baseCmd} artifacts_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'artifacts_details': {
            exampleArray.push(`${baseCmd} artifacts_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'hardware_summary': {
            exampleArray.push(`${baseCmd} hardware_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'hardware_details': {
            exampleArray.push(`${baseCmd} hardware_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'sensor_hardware_summary': {
            exampleArray.push(`${baseCmd} sensor_hardware_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'sensor_hardware_details': {
            exampleArray.push(`${baseCmd} sensor_hardware_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'software_summary': {
            exampleArray.push(`${baseCmd} software_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'software_details': {
            exampleArray.push(`${baseCmd} software_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'sensor_software_summary': {
            exampleArray.push(`${baseCmd} sensor_software_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'sensor_software_details': {
            exampleArray.push(`${baseCmd} sensor_software_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'sensor_software_counts': {
            exampleArray.push(`${baseCmd} sensor_software_counts [-o, --orgId] <value> [options]`)
            break
          }

          case 'critical_assets_summary': {
            exampleArray.push(`${baseCmd} critical_assets_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'vulnerability_summary': {
            exampleArray.push(`${baseCmd} vulnerability_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'device_findings_summary': {
            exampleArray.push(`${baseCmd} device_findings_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'device_findings_details': {
            exampleArray.push(`${baseCmd} device_findings_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'application_findings_summary': {
            exampleArray.push(`${baseCmd} application_findings_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'application_findings_details': {
            exampleArray.push(`${baseCmd} application_findings_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'ports_protocols_summary': {
            exampleArray.push(`${baseCmd} ports_protocols_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'ports_protocols_details': {
            exampleArray.push(`${baseCmd} ports_protocols_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'integration_status_summary': {
            exampleArray.push(`${baseCmd} integration_status_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'associations_details': {
            exampleArray.push(`${baseCmd} associations_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'user_assignments_details': {
            exampleArray.push(`${baseCmd} user_assignments_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'org_migration_status': {
            exampleArray.push(`${baseCmd} org_migration_status [-o, --orgId] <value> [options]`)
            break
          }

          case 'system_migration_status': {
            exampleArray.push(`${baseCmd} system_migration_status [-o, --orgId] <value> [options]`)
            break
          }

          case 'fisma_metrics': {
            exampleArray.push(`${baseCmd} fisma_metrics [-o, --orgId] <value> [options]`)
            break
          }

          case 'coast_guard_fisma_metrics': {
            exampleArray.push(`${baseCmd} coast_guard_fisma_metrics [-o, --orgId] <value> [options]`)
            break
          }

          case 'privacy_summary': {
            exampleArray.push(`${baseCmd} privacy_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'fisma_saop_summary': {
            exampleArray.push(`${baseCmd} fisma_saop_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'va_icamp_tableau_poam_details': {
            exampleArray.push(`${baseCmd} va_icamp_tableau_poam_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'va_aa_summary': {
            exampleArray.push(`${baseCmd} va_aa_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'va_a2_summary': {
            exampleArray.push(`${baseCmd} va_a2_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'va_pl_109_summary': {
            exampleArray.push(`${baseCmd} va_pl_109_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'va_fisma_inventory_summary': {
            exampleArray.push(`${baseCmd} va_fisma_inventory_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'va_fisma_inventory_crypto_summary': {
            exampleArray.push(`${baseCmd} va_fisma_inventory_crypto_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'va_threat_risk_summary': {
            exampleArray.push(`${baseCmd} va_threat_risk_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'va_threat_source_details': {
            exampleArray.push(`${baseCmd} va_threat_source_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'va_threat_architecture_details': {
            exampleArray.push(`${baseCmd} va_threat_architecture_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'cmmc_status_summary': {
            exampleArray.push(`${baseCmd} cmmc_status_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'cmmc_compliance_summary': {
            exampleArray.push(`${baseCmd} cmmc_compliance_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'cmmc_security_requirements_details': {
            exampleArray.push(`${baseCmd} cmmc_security_requirements_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'cmmc_requirement_objectives_details': {
            exampleArray.push(`${baseCmd} cmmc_requirement_objectives_details [-o, --orgId] <value> [options]`)
            break
          }

          default: {
            exampleArray.push(`${baseCmd} [dashboard name] [-o, --orgId] <value> [options]`)
            break
          }
        }

        break
      }
    }
  }

  return exampleArray
}

/**
 * Retrieves JSON examples based on the specified endpoint.
 *
 * @param {string} [endpoint] - The endpoint for which to retrieve JSON examples.
 * @returns {string[]} An array of JSON examples corresponding to the specified endpoint.
 *
 * The following endpoints are supported:
 * - 'poams-post-required': Returns JSON example for POA&M post required fields.
 * - 'poams-post-put-required-va': Returns JSON example for POA&M post required fields specific to VA.
 * - 'poams-post-conditional': Returns JSON example for POA&M post conditional fields.
 * - 'poams-put-required': Returns JSON example for POA&M put required fields.
 * - 'poams-put-conditional': Returns JSON example for POA&M put conditional fields.
 * - 'poams-post-put-optional': Returns JSON example for POA&M post/put optional fields.
 * - 'controls-required': Returns JSON example for controls required fields.
 * - 'controls-conditional': Returns JSON example for controls conditional fields.
 * - 'controls-optional': Returns JSON example for controls optional fields.
 * - 'hardware-post-required': Returns JSON example for hardware post required fields.
 * - 'hardware-post-put-conditional': Returns JSON example for hardware post/put conditional fields.
 * - 'hardware-post-put-optional': Returns JSON example for hardware post/put optional fields.
 * - 'software-post-required': Returns JSON example for software post required fields.
 * - 'software-post-put-conditional': Returns JSON example for software post/put conditional fields.
 * - 'software-post-put-optional': Returns JSON example for software post/put optional fields.
 * - 'cloud_resources-required': Returns JSON example for cloud resources required fields.
 * - 'cloud_resources-optional': Returns JSON example for cloud resources optional fields.
 * - 'scan_findings-application': Returns JSON example for scan findings application fields.
 * - 'scan_findings-applicationFindings': Returns JSON example for scan findings application findings fields.
 * - 'scan_findings-clearFindings': Returns JSON example for clearing scan findings.
 * - 'container_scans-required': Returns JSON example for container scans required fields.
 * - 'container_scans-optional': Returns JSON example for container scans optional fields.
 */
// skipcq: JS-R1005 - Ignore Function cyclomatic complexity high threshold
export function getJsonExamples(endpoint?: string): string[] {
  if (endpoint === 'controls-required') {
    const data = '{ '
      + '"acronym": "System acronym, required to match the NIST SP 800-53 Revision 4.",'
      + '"responsibleEntities": "Include written description of Responsible Entities that are responsible for the Security Control.",'
      + '"controlDesignation":  "One of the following: [Common, System-Specific, Hybrid]",'
      + '"estimatedCompletionDate": "Estimation completion date - Field is required for Implementation Plan",'
      + '"implementationNarrative": "Includes Security Control comments"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'controls-conditional') {
    const data = '{ '
      + '"commonControlProvider": "Indicate the type of Common Control Provider for an “Inherited” Security Control. One of the following [DoD, Component, Enclave]",'
      + '"naJustification": "Provide justification for Security Controls deemed Not Applicable to the system",'
      + '"slcmCriticality": "Criticality of Security Control regarding system-level continuous monitoring (SLCM) ",'
      + '"slcmFrequency": "One of the following [Constantly,Daily,Weekly,Monthly,Quarterly,Semi-Annually,Annually,Every Two Years,Every Three Years,Undetermined]",'
      + '"slcmMethod": "One of the following [Automated, Semi-Automated, Manual, Undetermined]",'
      + '"slcmReporting": "Organization/Office represented",'
      + '"slcmTracking": "The System-Level Continuous Monitoring tracking",'
      + '"slcmComments":" Additional comments for Security Control regarding SLCM"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'controls-optional') {
    const data = '{ '
      + '"implementationStatus": "One of the following [Planned,Implemented,Inherited,Not Applicable,Manually Inherited]",'
      + '"severity": "One of the following [Very Low, Low, Moderate, High, Very High]",'
      + '"vulnerabilitySummary": "Include vulnerability summary",'
      + '"recommendations": "The include recommendations",'
      + '"relevanceOfThreat": "One of the following [Very Low, Low, Moderate, High, Very High]",'
      + '"likelihood": "One of the following [Very Low, Low, Moderate, High, Very High]",'
      + '"impact": "One of the following [Very Low, Low, Moderate, High, Very High]",'
      + '"impactDescription": "Include description of Security Controls impact",'
      + '"residualRiskLevel": "One of the following [Very Low, Low, Moderate, High, Very High]",'
      + '"testMethod": "One of the following [Test, Interview, Examine, Test,Interview, Test,Examine, Interview,Examine, Test,Interview,Examine]",'
      + '"mitigations": "One of the following [Very Low, Low, Moderate, High, Very High]",'
      + '"applicationLayer": "If the Financial Management (Navy) overlay is applied to the system, this field can be populated (Navy only)",'
      + '"databaseLayer": "If the Financial Management (Navy) overlay is applied to the system, this field can be populated (Navy only)",'
      + '"operatingSystemLayer": "If the Financial Management (Navy) overlay is applied to the system, this field can be populated (Navy only)"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'poams-post-required') {
    const data = '{ '
      + '"status":  "One of the following: [Ongoing, Risk Accepted, Completed, Not Applicable]",'
      + '"vulnerabilityDescription": "POA&M vulnerability description",'
      + '"sourceIdentifyingVulnerability": "Source that identifies the vulnerability",'
      + '"pocOrganization": "Organization/Office represented",'
      + '"resources": "List of resources used"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'poams-post-conditional') {
    const data = '{ '
      + '"milestones": [{'
      + '"description": "The milestone description",'
      + '"scheduledCompletionDate": "Milestone scheduled completion date (Unix format)"}],'
      + '"pocFirstName": "First name of POC (only if Last Name, Email, or Phone Number have data)",'
      + '"pocLastName": "Last name of POC (only if First Name, Email, or Phone Number have data)",'
      + '"pocEmail": "Email address of POC (only if First Name, Last Name, or Phone Number have data)",'
      + '"pocPhoneNumber": "Phone number of POC (only if First Name, Last Name, or Email have data)",'
      + '"severity": "Risk Analysis field, maybe required by certain eMASS instances. Required for approved items",'
      + '"scheduledCompletionDate": "Required for ongoing and completed POA&M items",'
      + '"completionDate": "Field is required for completed POA&M items",'
      + '"comments": "Field is required for completed and risk accepted POA&M items"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'poams-put-required') {
    const data = '{ '
      + '"poamId": "Unique identifier representing the nth POAM item entered into the site database.",'
      + '"displayPoamId": "Globally unique identifier for individual POA&M Items, seen on the front-end as ID",'
      + '"status":  "One of the following: [Ongoing, Risk Accepted, Completed, Not Applicable]",'
      + '"vulnerabilityDescription": "POA&M vulnerability description",'
      + '"sourceIdentifyingVulnerability": "Source that identifies the vulnerability",'
      + '"pocOrganization": "Organization/Office represented",'
      + '"resources": "List of resources used"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'poams-put-conditional') {
    const data = '{ '
      + '"milestones": [{'
      + '"milestoneId": "Unique milestone identifier",'
      + '"description": "The milestone description",'
      + '"scheduledCompletionDate": "Milestone scheduled completion date (Unix format)",'
      + '"isActive": "To prevent uploading duplicate/undesired milestones through the POA&M PUT include the isActive=false. If absent or set to true a new Milestone is created"}],'
      + '"pocFirstName": "First name of POC (only if Last Name, Email, or Phone Number have data)",'
      + '"pocLastName": "Last name of POC (only if First Name, Email, or Phone Number have data)",'
      + '"pocEmail": "Email address of POC (only if First Name, Last Name, or Phone Number have data)",'
      + '"pocPhoneNumber": "Phone number of POC (only if First Name, Last Name, or Email have data)",'
      + '"severity": "Risk Analysis field, maybe required by certain eMASS instances. Required for approved items",'
      + '"scheduledCompletionDate": "POA&M Items with a review status of “Approved” and a status of “Completed” or “Ongoing” cannot update Scheduled Completion Date.",'
      + '"completionDate": "Field is required for completed POA&M items",'
      + '"comments": "Field is required for completed and risk accepted POA&M items"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'poams-post-put-required-va') {
    const data = '{ '
      + '"identifiedInCFOAuditOrOtherReview":  "If not specified, this field will be set to false because it does not accept a null value (Required for VA. Optional for Army and USCG)",'
      + '"personnelResourcesFundedBaseHours": "Hours for personnel resources that are founded (Required for VA. Optional for Army and USCG)",'
      + '"personnelResourcesCostCode": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",'
      + '"personnelResourcesUnfundedBaseHours": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",'
      + '"personnelResourcesNonfundingObstacle": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",'
      + '"personnelResourcesNonfundingObstacleOtherReason": "Reason (text 2,000 char) (Required for VA. Optional for Army and USCG)",'
      + '"nonPersonnelResourcesFundedAmount": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",'
      + '"nonPersonnelResourcesCostCode": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",'
      + '"nonPersonnelResourcesUnfundedAmount": "Funded based hours (100.00) (Required for VA. Optional for Army and USCG)",'
      + '"nonPersonnelResourcesNonfundingObstacle": "Values are specific per eMASS instance (Required for VA. Optional for Army and USCG)",'
      + '"nonPersonnelResourcesNonfundingObstacleOtherReason": "Reason (text 2,000 char) (Required for VA. Optional for Army and USCG)"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'poams-post-put-optional') {
    const data = '{ '
      + '"externalUid": "External ID associated with the POA&M",'
      + '"controlAcronym": "The system acronym(s) e.g AC-1, AC-2",'
      + '"assessmentProcedure": "The Security Control Assessment Procedures being associated with the POA&M Item",'
      + '"securityChecks": "Security Checks that are associated with the POA&M",'
      + '"rawSeverity": "One of the following [Very Low, Low, Moderate, High, Very High]",'
      + '"relevanceOfThreat": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",'
      + '"likelihood": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",'
      + '"impact": "Risk Analysis field, maybe required by certain eMASS instances. Description of Security Control impact",'
      + '"residualRiskLevel": "Risk Analysis field, maybe required by certain eMASS instances. One of the following [Very Low, Low, Moderate, High, Very High]",'
      + '"mitigations": "Risk Analysis field, maybe required by certain eMASS instances. Mitigation explanation",'
      + '"impactDescription": "Description of the security control impact",'
      + '"recommendations": "Any recommendations content",'
      + '"resultingResidualRiskLevelAfterProposedMitigations": "One of the following [Very Low, Low, Moderate, High, Very High] (Navy only)",'
      + '"predisposingConditions": "Conditions (Navy only)",'
      + '"threatDescription": "Threat description (Navy only)",'
      + '"devicesAffected": "List of affected devices by hostname. If all devices are affected, use `system` or `all` (Navy only)"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'artifacts-put-required') {
    const data = '{ '
      + '"filename": "Artifact file name to update for the given system",'
      + '"isTemplate": "Indicates whether an artifact is a template",'
      + '"type":  "The type of artifact. Possible values are: Procedure, Diagram, Policy, Labor, Document, Image, Other, Scan Result, Auditor Report. May accept other values set by system administrators",'
      + '"category": "Artifact category. Possible values are: Implementation Guidance or Evidence. May accept other values set by system administrators"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'artifacts-put-optional') {
    const data = '{ '
      + '"name": "The artifact name",'
      + '"artifactDescription": "The artifact(s) description",'
      + '"refPageNumber": "Artifact reference page number",'
      + '"controls": "Control acronym associated with the artifact. NIST SP 800-53 Revision 4 defined",'
      + '"assessmentProcedures": "The Security Control Assessment Procedure being associated with the artifact",'
      + '"expirationDate": "Date artifact expires and requires review",'
      + '"lastReviewDate": "Date artifact was last reviewed",'
      + '"signedDate": "Date artifact was signed"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'hardware-post-required') {
    const data = '{ '
      + '"assetName":  "Name of the hardware asset"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'hardware-put-required') {
    const data = '{ '
      + '"hardwareId":  "GUID identifying the specific hardware asset",'
      + '"assetName":  "Name of the hardware asset"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'hardware-post-put-conditional') {
    const data = '{ '
      + '"publicFacingFqdn": "Public facing FQDN. Only applicable if Public Facing is set to true",'
      + '"publicFacingIpAddress": "Public facing IP address. Only applicable if Public Facing is set to true",'
      + '"publicFacingUrls":  "Public facing URL(s). Only applicable if Public Facing is set to true"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'hardware-post-put-optional') {
    const data = '{ '
      + '"componentType": "Public facing FQDN. Only applicable if Public Facing is set to true",'
      + '"nickname": "Public facing IP address. Only applicable if Public Facing is set to true",'
      + '"assetIpAddress": "IP address of the hardware asset",'
      + '"publicFacing": "Public facing is defined as any asset that is accessible from a commercial connection",'
      + '"virtualAsset": "Determine if this is a virtual hardware asset",'
      + '"manufacturer": "Manufacturer of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",'
      + '"modelNumber": "Model number of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",'
      + '"serialNumber": "Serial number of the hardware asset. Populated with “Virtual” by default if Virtual Asset is true",'
      + '"osIosFwVersion": "OS/iOS/FW version of the hardware asset",'
      + '"memorySizeType": "Memory size / type of the hardware asset",'
      + '"location": "Location of the hardware asset",'
      + '"approvalStatus": "Approval status of the hardware asset",'
      + '"criticalAsset":  "Indicates whether the asset is a critical information system asset"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'software-post-required') {
    const data = '{ '
      + '"softwareVendor":  "Vendor of the software asset",'
      + '"softwareName":  "Name of the software asset",'
      + '"version":  "Version of the software asset"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'software-put-required') {
    const data = '{ '
      + '"softwareId": "GUID identifying the specific software asset",'
      + '"softwareVendor": "Vendor of the software asset",'
      + '"softwareName": "Name of the software asset",'
      + '"version": "Version of the software asset"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'software-post-put-conditional') {
    const data = '{ '
      + '"approvalDate": "Approval date of the software asset. If Approval Status is set to “Unapproved” or “In Progress”, Approval Date will be set to null"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'software-post-put-optional') {
    const data = '{ '
      + '"softwareType": "Type of the software asset",'
      + '"parentSystem": "Parent system of the software asset",'
      + '"subsystem": "Subsystem of the software asset",'
      + '"network": "Network of the software asset",'
      + '"hostingEnvironment": "Hosting environment of the software asset",'
      + '"softwareDependencies": "Dependencies for the software asset",'
      + '"cryptographicHash": "Cryptographic hash for the software asset",'
      + '"inServiceData": "Date the sotware asset was added to the network",'
      + '"itBudgetUii": "IT budget UII for the software asset",'
      + '"fiscalYear": "Fiscal year (FY) for the software asset",'
      + '"popEndDate": "Period of performance (POP) end date for the software asset",'
      + '"licenseOrContract": "License or contract for the software asset",'
      + '"licenseTerm":  "License term for the software asset",'
      + '"costPerLicense": "Cost per license for the software asset",'
      + '"totalLicenses": "Number of total licenses for the software asset",'
      + '"totalLicenseCost": "Total cost of the licenses for the software asset",'
      + '"licensesUsed": "Number of licenses used for the software asset",'
      + '"licensePoc": "Point of contact (POC) for the software asset",'
      + '"licenseRenewalDate": "License renewal date for the software asset",'
      + '"licenseExpirationDate": "License expiration date for the software asset",'
      + '"approvalStatus": "Approval status of the software asset",'
      + '"releaseDate": "Release date of the software asset",'
      + '"maintenanceDate": "Maintenance date of the software asset",'
      + '"retirementDate": "Retirement date of the software asset",'
      + '"endOfLifeSupportDate":  "End of life/support date of the software asset",'
      + '"extendedEndOfLifeSupportDate": "Extended End of Life/Support Date cannot occur prior to the End of Life/Support Date",'
      + '"criticalAsset": "Indicates whether the asset is a critical information system asset",'
      + '"location": "Location of the software asset",'
      + '"purpose": "Purpose of the software asset",'
      + '"unsupportedOperatingSystem": "Unsupported operating system (VA only)",'
      + '"unapprovedSoftwareFromTrm": "Unapproved software from TRM (VA only)",'
      + '"approvedWaiver":  "Approved waiver (VA only)"'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'cloud_resources-required') {
    const data = '{ '
      + '"provider": "Cloud service provider name",'
      + '"resourceId": "Unique identifier/resource namespace for policy compliance result",'
      + '"resourceName":  "Friendly name of Cloud resource",'
      + '"resourceType": "The cloud resource type",'
      + '"complianceResults": [{'
      + '"cspPolicyDefinitionId": "Unique identifier/compliance namespace for CSP/Resource\'s policy definition/compliance check", '
      + '"isCompliant": "True/false flag for compliance status of the policy for the identified cloud resource", '
      + '"policyDefinitionTitle": "Friendly policy/compliance check title. Recommend short title"}]'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'cloud_resources-optional') {
    const data = '{ '
      + '"cspAccountId": "System/owner\'s CSP account ID/number",'
      + '"cspRegion": "CSP region of system",'
      + '"initiatedBy":  "Email of POC",'
      + '"isBaseline": "True/false flag for providing results as baseline. If true, all existing compliance results for the resourceId will be replaced by results in the current call",'
      + '"tags": {'
      + '"test": "Informational tags associated to results for other metadata" },'
      + '"complianceResults": [{'
      + '"assessmentProcedure": "Comma separated correlation to Assessment Procedure (i.e. CCI number for DoD Control Set)", '
      + '"complianceCheckTimestamp": "Unix date format", '
      + '"complianceReason": "Reason/comments for compliance result", '
      + '"control": "Comma separated correlation to Security Control (e.g. exact NIST Control acronym)", '
      + '"policyDeploymentName": "Name of policy deployment", '
      + '"policyDeploymentVersion": "Version of policy deployment", '
      + '"severity": "One of the following [Low, Medium, High, Critical]"}]'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'container_scans-required') {
    const data = '{ '
      + '"containerId": "Unique identifier of the container",'
      + '"containerName": "Friendly name of the container",'
      + '"time": "Datetime of scan/result. Unix date format",'
      + '"benchmarks": [{'
      + '"benchmark": "Identifier of the benchmark/grouping of compliance results. (e.g. for STIG results, provide the benchmark id for the STIG technology)", '
      + '"results": [{'
      + '"ruleId": "Identifier for the compliance result, vulnerability, etc. the result is for. (e.g. for STIGs, use the SV-XXXrXX identifier; for CVEs, the CVE-XXXX-XXX identifier, etc.).", '
      + '"lastSeen": "Datetime last seen. Unix date format",'
      + '"status": "One of the following [Pass,Fail,Other,Not Reviewed,Not Checked,Not Applicable]"}]'
      + '}]'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'container_scans-optional') {
    const data = '{ '
      + '"namespace": "Namespace of container in container orchestration (e.g. Kubernetes namespace)",'
      + '"podIp": "IP address of pod (e.g. Kubernetes assigned IP)",'
      + '"podName":  "Name of pod (e.g. Kubernetes pod)",'
      + '"tags": {'
      + '"test": "Informational tags associated to results for other metadata" },'
      + '"benchmarks": [{'
      + '"isBaseline": "True/false flag for providing results as baseline. If true, all existing compliance results for the provided benchmark within the container will be replaced by results in the current call", '
      + '"verion": "The benchmark version", '
      + '"release": "The benchmark release", '
      + '"results": [{'
      + '"message": "Comments for the result"}]'
      + '}]'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'scan_findings-application') {
    const data = '{ '
      + '"application": {'
      + '"applicationName": "Name of the software application that was assessed",'
      + '"version": "The version of the application"}'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'scan_findings-applicationFindings') {
    const data = '{ '
      + '"applicationFindings": [{'
      + '"codeCheckName": "Name of the software vulnerability or weakness",'
      + '"scanDate": "The scan date, Unix date format",'
      + '"cweId": "The Common Weakness Enumerator (CWE) identifier",'
      + '"count": "Number of instances observed for a specified finding",'
      + '"rawSeverity": "OPTIONAL - One of the following [Low, Medium, Moderate, High, Critical]"}]'
      + '}'
    return JSON.parse(data)
  }

  if (endpoint === 'scan_findings-clearFindings') {
    const data = '{ '
      + '"applicationFindings": [{'
      + '"clearFindings": "To clear an application\'s findings, use only the field clearFindings and set it to true."}]'
      + '}'
    return JSON.parse(data)
  }

  return []
}

/**
 * Saves data to a specified file within a given directory. If the directory does not exist, it will be created.
 *
 * @param dir - The directory where the file will be saved.
 * @param filename - The name of the file to save the data to.
 * @param data - The data to be saved in the file.
 *
 * @remarks
 * This function checks if the specified directory exists, and if not, it creates the directory.
 * It then writes the provided data to a file within that directory. If an error occurs during
 * the file writing process, an error message is logged to the console.
 */
export function saveFile(dir: string, filename: string, data: any): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  // Save to file
  const outDir = path.join(dir, filename)
  fs.writeFile(outDir, data, (err) => {
    if (err) {
      console.error(`Error saving file to: ${outDir}. Cause: ${err}`)
    }
  })
}

/**
 * Prints a help message to the console with a specific format.
 *
 * The message is prefixed with an arrow (→) and displayed in yellow color.
 *
 * @param msg - The help message to be printed.
 */
export function printHelpMsg(msg: string) {
  console.log('\x1B[93m\n→', msg, '\x1B[0m')
}

/**
 * Prints a message to the console in red color.
 *
 * @param msg - The message to be printed.
 */
export function printRedMsg(msg: string) {
  console.log('\x1B[91m»', msg, '\x1B[0m')
}

/**
 * Displays an error message to the console.
 *
 * If the error is an instance of `Error`, it will be formatted and colorized
 * before being logged. Otherwise, a generic error message will be displayed,
 * indicating the endpoint that caused the error.
 *
 * @param error - The error to display. Can be of any type.
 * @param endpoint - The endpoint that was being called when the error occurred.
 */
export function displayError(error: unknown, endpoint: string) {
  if (error instanceof Error) {
    console.error(colorize(outputError(error)))
  } else {
    console.error(`\x1B[91mError calling the ${endpoint} endpoint: ${String(error)}\x1B[0m`)
  }
}
