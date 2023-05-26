import _ from 'lodash'
import {Flags} from '@oclif/core'
import {BooleanFlag, OptionFlag} from '@oclif/core/lib/interfaces'

interface CliArgs {
  requestType: string;
  endpoint: string;
  argument: string;
}

export interface FlagOptions {
  systemId?: OptionFlag<number>;
  poamId?: OptionFlag<number>;
  poamsId?: OptionFlag<number[]>;
  milestoneId?: OptionFlag<number>;
  milestonesId?: OptionFlag<number[]>;
  workflowInstanceId?: OptionFlag<number>;
  pageIndex?: OptionFlag<number|undefined>;
  includeComments?: BooleanFlag<boolean|undefined>;
  excludeInherited?: BooleanFlag<boolean|undefined>;
  includeInactive?: BooleanFlag<boolean|undefined>;
  isTemplate?: BooleanFlag<boolean>;
  includePackage?: BooleanFlag<boolean|undefined>;
  includeDitprMetrics?: BooleanFlag<boolean|undefined>;
  includeDecommissioned?: BooleanFlag<boolean|undefined>;
  reportsForScorecard?: BooleanFlag<boolean|undefined>;
  acronyms?: BooleanFlag<boolean|undefined>;
  latestOnly?: BooleanFlag<boolean|undefined>;
  systemOnly?: BooleanFlag<boolean|undefined>;
  compress?: BooleanFlag<boolean|undefined>;
  policy?: OptionFlag<string|undefined>;
  registrationType?: OptionFlag<string|undefined>;
  ditprId?: OptionFlag<string|undefined>;
  coamsId?: OptionFlag<string|undefined>;
  roleCategory?: OptionFlag<string>;
  role?: OptionFlag<string>;
  controlAcronyms?: OptionFlag<string|undefined>;
  ccis?: OptionFlag<string|undefined>;
  sinceDate?: OptionFlag<string|any>;
  scheduledCompletionDateStart?: OptionFlag<string|undefined>;
  scheduledCompletionDateEnd?: OptionFlag<string|undefined>;
  filename?: OptionFlag<string|any>;
  status?: OptionFlag<string|undefined>;
  cci?: OptionFlag<string>;
  testedBy?: OptionFlag<string>;
  testDate?: OptionFlag<string>;
  description?: OptionFlag<string|any>;
  complianceStatus?: OptionFlag<string|any>;
  scheduledCompletionDate?: OptionFlag<string|any>;
  orgId?:OptionFlag<number>;
  pageSize?: OptionFlag<number|undefined>;
  input?: OptionFlag<string[]>;
  fileName?: OptionFlag<string[]>;
  poamFile?: OptionFlag<string>;
  controlFile?: OptionFlag<string>;
  cloudResourceFile?: OptionFlag<string>;
  statiCodeScanFile?: OptionFlag<string>;
  containerCodeScanFile?: OptionFlag<string>;
  type?: OptionFlag<string|any>;
  category?: OptionFlag<string|any>;
  refPageNumber?: OptionFlag<string|undefined>;
  controls?: OptionFlag<string|undefined>;
  artifactExpirationDate?: OptionFlag<string|any>;
  lastReviewDate?: OptionFlag<string|any>;
  controlAcronym?: OptionFlag<string|any>;
  comments?: OptionFlag<string|any>;
  workflow?: OptionFlag<string|any>;
  name?: OptionFlag<string|any>;
}

// Supporting Function
function getArgs(argv: string[], endpointValue?: string): CliArgs {
  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post' || arg === 'put' || arg === 'delete'))
  return {
    requestType: argv[requestTypeIndex],
    endpoint: endpointValue || argv[requestTypeIndex + 1],
    argument: argv[requestTypeIndex + 2],
  }
}

export function getFlagsForEndpoint(argv: string[]): FlagOptions { // skipcq: JS-0044
  const args: CliArgs = getArgs(argv)
  let flagObj: FlagOptions = {}

  switch (args.requestType) { // skipcq: JS-0047
    case 'get': {
      switch (args.endpoint) { // skipcq: JS-0047
        case 'system': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            includePackage: Flags.boolean({char: 'I', description: 'Boolean - include system packages', allowNo: true, required: false}),
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
            includePackage: Flags.boolean({char: 'I', description: 'Boolean - include system packages', allowNo: true, required: false}),
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
              role: Flags.string({char: 'r', description: 'Filter on role type',
                options: ['AO', 'Auditor', 'Artifact Manager', 'C&A Team', 'IAO', 'ISSO', 'PM/IAM', 'SCA', 'User Rep', 'Validator'], required: true}),
              policy: Flags.string({char: 'p', description: 'Filter on policy', options: ['diacap', 'rmf', 'reporting'], required: false}),
              includeDecommissioned: Flags.boolean({char: 'D', description: 'Boolean - include decommissioned systems', allowNo: true, required: false}),
            }
          }

          break
        }

        case 'controls': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            acronyms: Flags.boolean({char: 'A', description: 'The system acronym(s) e.g "AC-1, AC-2" - if not provided all controls for systemId are returned', allowNo: true, required: false}),
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

        case 'cmmc': {
          flagObj = {
            sinceDate: Flags.string({char: 'd', description: 'The CMMC date. Unix date format', required: true}),
          }
          break
        }

        case 'test_results': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            controlAcronyms: Flags.string({char: 'a', description: 'The system acronym(s) e.g "AC-1, AC-2"', required: false}),
            ccis: Flags.string({char: 'c', description: 'The system CCIS string numerical value', required: false}),
            latestOnly: Flags.boolean({char: 'L', description: 'Boolean - Filter on latest only', allowNo: true, required: false}),
          }
          break
        }

        case 'workflow_definitions': {
          flagObj = {
            includeInactive: Flags.boolean({char: 'i', description: 'Boolean - Include inactive workflows', allowNo: true, required: false}),
            registrationType: Flags.string({char: 'r', description: 'The registration type - must be a valid type',
              options: ['assessAndAuthorize', 'assessOnly', 'guest', 'regular', 'functional', 'cloudServiceProvider', 'commonControlProvider'], required: false}),
          }
          break
        }

        case 'poams': {
          if (args.argument === 'forSystem') {
            flagObj = {
              systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
              scheduledCompletionDateStart: Flags.string({description: 'The completion start date', required: false}),
              scheduledCompletionDateEnd: Flags.string({description: 'The completion end date', required: false}),
              controlAcronyms: Flags.string({char: 'a', description: 'The system acronym(s) e.g "AC-1, AC-2"', required: false}),
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

        case 'artifacts': {
          if (args.argument === 'forSystem') {
            flagObj = {
              systemId: Flags.integer({char: 's', description: 'Unique system identifier', required: true}),
              filename: Flags.string({char: 'f', description: 'The artifact file name', required: false}),
              controlAcronyms: Flags.string({char: 'a', description: 'The system acronym(s) e.g "AC-1, AC-2"', required: false}),
              ccis: Flags.string({char: 'c', description: 'The system CCIS string numerical value', required: false}),
              systemOnly: Flags.boolean({char: 'y', description: 'Boolean - Return only systems', allowNo: true, required: false}),
            }
          } else if (args.argument === 'export') {
            flagObj = {
              systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
              filename: Flags.string({char: 'f', description: 'The artifact file name', required: true}),
              compress: Flags.boolean({char: 'C', description: 'Boolean - Compress true or false', allowNo: true, required: false}),
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
              poamId: Flags.integer({char: 'p', description: 'The poam identification number', required: true}),
              milestoneId: Flags.integer({char: 'm', description: 'Unique milestone identifier', required: true}),
            }
          }

          break
        }

        case 'workflow_instances': {
          if (args.argument === 'all') {
            flagObj = {
              includeComments: Flags.boolean({char: 'i', description: 'Boolean - Include transition comments', allowNo: true, required: false}),
              pageIndex: Flags.integer({char: 'p', description: 'The page number to query', required: false}),
              sinceDate: Flags.string({char: 'd', description: 'The Workflow Instance date. Unix date format', required: false}),
              status: Flags.string({char: 's', description: 'The Workflow status - must be a valid status', options: ['active', 'inactive', 'all'], required: false}),
            }
          } else if (args.argument === 'byInstanceId') {
            flagObj = {
              workflowInstanceId: Flags.integer({char: 'w', description: 'Unique workflow instance identifier', required: true}),
            }
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
            cci: Flags.string({char: 'c', description: 'The system CCI string numerical value', required: true}),
            testedBy: Flags.string({char: 'b', description: 'The person that conducted the test (Last Name, First)', required: true}),
            testDate: Flags.string({char: 't', description: 'The date test was conducted, Unix time format', required: true}),
            description: Flags.string({char: 'd', description: 'The description of test result. 4000 Characters', required: true}),
            complianceStatus: Flags.string({char: 'S', description: 'The system CCI string numerical value',
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
            input: Flags.string({char: 'i', description: 'Artifact file(s) to post to the given system, can have multiple (space separated)', required: true, multiple: true}),
            isTemplate: Flags.boolean({char: 'T', description: 'Boolean - Indicates whether an artifact is a template.', allowNo: true, required: false}),
            type: Flags.string({char: 't', description: 'Artifact file type',
              options: ['Procedure', 'Diagram', 'Policy', 'Labor', 'Document', 'Image', 'Other', 'Scan Result', 'Auditor Report'], required: false}),
            category: Flags.string({char: 'c', description: 'Artifact category', options: ['Implementation Guidance', 'Evidence'], required: false}),
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

        case 'poams': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            poamFile: Flags.string({char: 'f', description: 'A well formed JSON file with the POA&M(s) to add. It can ba a single object or an array of objects.', required: true}),
          }
          break
        }

        case 'cloud_resources': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            cloudResourceFile: Flags.string({char: 'f', description: 'A well formed JSON file with the cloud resources and their scan results. It can ba a single object or an array of objects.', required: true}),
          }
          break
        }

        case 'static_code_scans': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            statiCodeScanFile: Flags.string({char: 'f', description: 'A well formed JSON file with application scan findings. It can ba a single object or an array of objects.', required: true}),
          }
          break
        }

        case 'container_scans': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            containerCodeScanFile: Flags.string({char: 'f', description: 'A well formed JSON file with container scan results. It can ba a single object or an array of objects.', required: true}),
          }
          break
        }
      }

      break
    }

    case 'put': {
      switch (args.endpoint) { // skipcq: JS-0047
        case 'artifacts': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            filename: Flags.string({char: 'f', description: 'Artifact file name to update for the given system', required: true}),
            isTemplate: Flags.boolean({char: 'T', description: 'Boolean - Indicates whether an artifact is a template.', allowNo: true, required: true}),
            type: Flags.string({char: 't', description: 'Artifact file type',
              options: ['Procedure', 'Diagram', 'Policy', 'Labor', 'Document', 'Image', 'Other', 'Scan Result', 'Auditor Report'], required: true}),
            category: Flags.string({char: 'g', description: 'Artifact category', options: ['Implementation Guidance', 'Evidence'], required: true}),
            description: Flags.string({char: 'd', description: 'The artifact(s) description', required: false}),
            refPageNumber: Flags.string({char: 'p', description: 'Artifact reference page number', required: false}),
            ccis: Flags.string({char: 'c', description: 'CCIs associated with artifact', required: false}),
            controls: Flags.string({char: 'C', description: 'Control acronym associated with the artifact. NIST SP 800-53 Revision 4 defined.', required: false}),
            artifactExpirationDate: Flags.string({char: 'D', description: 'Date artifact expires and requires review', required: false}),
            lastReviewDate: Flags.string({char: 'R', description: 'Date artifact was last reviewed', required: false}),
          }
          break
        }

        case 'milestones': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            poamId: Flags.integer({char: 'p', description: 'The poam identification number', required: true}),
            milestoneId: Flags.integer({char: 'm', description: 'Unique milestone identifier', required: true}),
            description: Flags.string({char: 'd', description: 'The milestone description', required: false}),
            scheduledCompletionDate: Flags.string({char: 'c', description: 'The scheduled completion date - Unix time format', required: false}),
          }
          break
        }

        case 'poams': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            poamFile: Flags.string({char: 'f', description: 'A well formed JSON file with the POA&M(s) to updated the specified system. It can ba a single object or an array of objects.', required: true}),
          }
          break
        }

        case 'controls': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            controlFile: Flags.string({char: 'f', description: 'A well formed JSON file with the Security Control information to updated the specified system. It can ba a single object or an array of objects.', required: true}),
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
            fileName: Flags.string({char: 'F', description: 'The artifact file name to remove, can have multiple (space separated)', required: true, multiple: true}),
          }
          break
        }

        case 'milestones': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            poamId: Flags.integer({char: 'p', description: 'The poam identification number', required: true}),
            milestonesId: Flags.integer({char: 'M', description: 'Unique milestone identifier, can have multiple (space separated)', required: true, multiple: true}),
          }
          break
        }

        case 'poams': {
          flagObj = {
            systemId: Flags.integer({char: 's', description: 'The system identification number', required: true}),
            poamsId: Flags.integer({char: 'P', description: 'Unique POA&M identification number, can have multiple (space separated)', required: true, multiple: true}),
          }
          break
        }
      }

      break
    }
  }

  return flagObj
}

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
            description = 'Retrieves the artifact file (if compress is true the file binary contents are returned, otherwise the file textual contents are returned.)'
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

          case 'control_compliance_summary': {
            description = 'Get enterprise systems control compliance summary dashboard information'
            break
          }

          case 'security_control_details': {
            description = 'Get enterprise systems security control details dashboard information'
            break
          }

          case 'assessment_procedures_details': {
            description = 'Get enterprise systems assessment procedures details dashboard information'
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

          case 'ports_protocols_summary': {
            description = 'Get system ports and protocols summary dashboard information'
            break
          }

          case 'ports_protocols_details': {
            description = 'Get system ports and protocols details dashboard information'
            break
          }

          case 'associations_details': {
            description = 'Get system associations details dashboard information'
            break
          }

          case 'assignments_details': {
            description = 'Get user system assignments details dashboard information'
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

          case 'fisma_inventory_summary': {
            description = 'Get VA system FISMA inventory summary dashboard information'
            break
          }

          case 'fisma_inventory_crypto_summary': {
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
            exampleArray.push(`${baseCmd} forSystem [-s, --systemId] <value> [options]`, `${baseCmd} export [-s, --systemId] <value> [-f, --filename] <value> [options]`)
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

          case 'ports_protocols_summary': {
            exampleArray.push(`${baseCmd} ports_protocols_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'ports_protocols_details': {
            exampleArray.push(`${baseCmd} ports_protocols_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'associations_details': {
            exampleArray.push(`${baseCmd} associations_details [-o, --orgId] <value> [options]`)
            break
          }

          case 'assignments_details': {
            exampleArray.push(`${baseCmd} assignments_details [-o, --orgId] <value> [options]`)
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

          case 'fisma_inventory_summary': {
            exampleArray.push(`${baseCmd} fisma_inventory_summary [-o, --orgId] <value> [options]`)
            break
          }

          case 'fisma_inventory_crypto_summary': {
            exampleArray.push(`${baseCmd} fisma_inventory_crypto_summary [-o, --orgId] <value> [options]`)
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

          default: {
            exampleArray.push(`${baseCmd} [dashboard name] [options]`)
            break
          }
        }

        exampleArray.push('\x1B[93m NOTE: dashboard names are provided in the ARGUMENTS list, use lowercase format\x1B[0m')
        break
      }
    }
  }

  return exampleArray
}

export function getJsonExamples(endpoint?: string): string[] {
  if (endpoint === 'poams-post-required') {
    const data = '{ ' +
      '"status":  "One of the following: [Ongoing, Risk Accepted, Completed, Not Applicable]",' +
      '"vulnerabilityDescription": "POA&M vulnerability description",' +
      '"sourceIdentVuln": "Source that identifies the vulnerability",' +
      '"pocOrganization": "Organization/Office represented",' +
      '"mitigation": "Include mitigation explanation",' +
      '"resources": "List of resources used"' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'poams-post-conditional') {
    const data = '{ ' +
      '"milestones": [{' +
      '"description": "The milestone description",' +
      '"scheduledCompletionDate": "Milestone scheduled completion date (Unix format)"}],' +
      '"pocFirstName": "The system acronym(s) e.g AC-1, AC-2",' +
      '"pocLastName": "The system CCIS string numerical value",' +
      '"pocEmail": "Security Checks that are associated with the POA&M",' +
      '"pocPhoneNumber": "One of the following [I, II, III]",' +
      '"severity": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
      '"scheduledCompletionDate": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
      '"completionDate": "Description of Security Control impact",' +
      '"comments": "Description of the security control impact"' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'poams-put-required') {
    const data = '{ ' +
      '"poamId": "Unique identifier representing the nth POAM item entered into the site database.",' +
      '"displayPoamId": "Globally unique identifier for individual POA&M Items, seen on the front-end as ID",' +
      '"status":  "One of the following: [Ongoing, Risk Accepted, Completed, Not Applicable]",' +
      '"vulnerabilityDescription": "POA&M vulnerability description",' +
      '"sourceIdentVuln": "Source that identifies the vulnerability",' +
      '"pocOrganization": "Organization/Office represented",' +
      '"resources": "List of resources used"' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'poams-put-conditional') {
    const data = '{ ' +
        '"milestones": [{' +
        '"milestoneId": "Unique milestone identifier",' +
        '"description": "The milestone description",' +
        '"scheduledCompletionDate": "Milestone scheduled completion date (Unix format)",' +
        '"isActive": "To prevent uploading duplicate/undesired milestones through the POA&M PUT you must include an isActive field for the milestone and set it to equal to false"}],' +
        '"pocFirstName": "The system acronym(s) e.g AC-1, AC-2",' +
        '"pocLastName": "The system CCIS string numerical value",' +
        '"pocEmail": "Security Checks that are associated with the POA&M",' +
        '"pocPhoneNumber": "One of the following [I, II, III]",' +
        '"severity": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
        '"scheduledCompletionDate": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
        '"completionDate": "Description of Security Control impact",' +
        '"comments": "Description of the security control impact"' +
        '}'
    return JSON.parse(data)
  }

  if (endpoint === 'poams-post-put-optional') {
    const data = '{ ' +
      '"externalUid": "External ID associated with the POA&M",' +
      '"controlAcronym": "The system acronym(s) e.g AC-1, AC-2",' +
      '"cci": "The system CCIS string numerical value",' +
      '"securityChecks": "Security Checks that are associated with the POA&M",' +
      '"rawSeverity": "One of the following [I, II, III]",' +
      '"relevanceOfThreat": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
      '"likelihood": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
      '"impact": "Description of Security Control impact",' +
      '"impactDescription": "Description of the security control impact",' +
      '"residualRiskLevel": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
      '"recommendations": "Any recommendations content",' +
      '"mitigation": "Mitigation explanation"' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'controls-required') {
    const data = '{ ' +
      '"acronym": "System acronym, required to match the NIST SP 800-53 Revision 4.",' +
      '"responsibleEntities": "Include written description of Responsible Entities that are responsible for the Security Control.",' +
      '"controlDesignation":  "One of the following: [Common, System-Specific, Hybrid]",' +
      '"estimatedCompletionDate": "Field is required for Implementation Plan",' +
      '"implementationNarrative": "Includes Security Control comments"' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'controls-conditional') {
    const data = '{ ' +
      '"commonControlProvider": "One of the following [DoD, Component, Enclave]",' +
      '"naJustification": "Provide justification for Security Controls deemed Not Applicable to the system",' +
      '"slcmCriticality": "Criticality of Security Control regarding SLCM",' +
      '"slcmFrequency": "One of the following [Constantly,Daily,Weekly,Monthly,Quarterly,Semi-Annually,Annually,Every Two Years,Every Three Years,Undetermined]",' +
      '"slcmMethod": "One of the following [Automated, Semi-Automated, Manual, Undetermined]",' +
      '"slcmReporting": "Organization/Office represented",' +
      '"slcmTracking": "The System-Level Continuous Monitoring tracking",' +
      '"slcmComments":" Additional comments for Security Control regarding SLCM"' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'controls-optional') {
    const data = '{ ' +
      '"implementationStatus": "One of the following [Planned,Implemented,Inherited,Not Applicable,Manually Inherited]",' +
      '"severity": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
      '"vulnerabilitySummary": "Include vulnerability summary",' +
      '"recommendations": "The include recommendations",' +
      '"relevanceOfThreat": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
      '"likelihood": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
      '"impact": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
      '"impactDescription": "Include description of Security Controls impact",' +
      '"residualRiskLevel": "One of the following [Very Low, Low, Moderate, High, Very High]",' +
      '"testMethod": "One of the following [Test, Interview, Examine, Test,Interview, Test,Examine, Interview,Examine, Test,Interview,Examine]"' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'cloud_resources-required') {
    const data = '{ ' +
      '"provider": "Cloud service provider name",' +
      '"resourceId": "Unique identifier/resource namespace for policy compliance result",' +
      '"resourceName":  "Friendly name of Cloud resource",' +
      '"resourceType": "The cloud resource type",' +
      '"complianceResults": [{' +
      '"cspPolicyDefinitionId": "Unique identifier/compliance namespace for CSP/Resource\'s policy definition/compliance check", ' +
      '"isCompliant": "True/false flag for compliance status of the policy for the identified cloud resource", ' +
      '"policyDefinitionTitle": "Friendly policy/compliance check title. Recommend short title"}]' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'cloud_resources-optional') {
    const data = '{ ' +
      '"cspAccountId": "System/owner\'s CSP account ID/number",' +
      '"cspRegion": "CSP region of system",' +
      '"initiatedBy":  "Email of POC",' +
      '"isBaseline": "True/false flag for providing results as baseline. If true, all existing compliance results for the resourceId will be replaced by results in the current call",' +
      '"tags": {' +
      '"test": "Informational tags associated to results for other metadata" },' +
      '"complianceResults": [{' +
      '"assessmentProcedure": "Comma separated correlation to Assessment Procedure (i.e. CCI number for DoD Control Set)", ' +
      '"complianceCheckTimestamp": "Unix date format", ' +
      '"complianceReason": "Reason/comments for compliance result", ' +
      '"control": "Comma separated correlation to Security Control (e.g. exact NIST Control acronym)", ' +
      '"policyDeploymentName": "Name of policy deployment", ' +
      '"policyDeploymentVersion": "Version of policy deployment", ' +
      '"severity": "One of the following [Low, Medium, High, Critical]"}]' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'scan_findings-application') {
    const data = '{ ' +
      '"application": {' +
      '"applicationName": "Name of the software application that was assessed",' +
      '"version": "The version of the application"}' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'scan_findings-applicationFindings') {
    const data = '{ ' +
      '"applicationFindings": [{' +
      '"codeCheckName": "Name of the software vulnerability or weakness",' +
      '"scanDate": "The scan date, Unix date format",' +
      '"resourceName":  "Friendly name of Cloud resource",' +
      '"cweId": "The Common Weakness Enumerator (CWE) identifier",' +
      '"count": "Number of instances observed for a specified finding",' +
      '"rawSeverity": "OPTIONAL - One of the following [Low, Medium, Moderate, High, Critical]"}]' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'scan_findings-clearFindings') {
    const data = '{ ' +
      '"applicationFindings": [{' +
      '"clearFindings": "To clear an application\'s findings, use only the field clearFindings and set it to true."}]' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'container_scans-required') {
    const data = '{ ' +
      '"containerId": "Unique identifier of the container",' +
      '"containerName": "Friendly name of the container",' +
      '"time": "Datetime of scan/result. Unix date format",' +
      '"benchmarks": [{' +
      '"benchmark": "Identifier of the benchmark/grouping of compliance results. (e.g. for STIG results, provide the benchmark id for the STIG technology)", ' +
      '"results": [{' +
      '"ruleId": "Identifier for the compliance result, vulnerability, etc. the result is for. (e.g. for STIGs, use the SV-XXXrXX identifier; for CVEs, the CVE-XXXX-XXX identifier, etc.).", ' +
      '"lastSeen": "Datetime last seen. Unix date format",' +
      '"status": "One of the following [Pass,Fail,Other,Not Reviewed,Not Checked,Not Applicable]"}]' +
      '}]' +
      '}'
    return JSON.parse(data)
  }

  if (endpoint === 'container_scans-optional') {
    const data = '{ ' +
      '"namespace": "Namespace of container in container orchestration (e.g. Kubernetes namespace)",' +
      '"podIp": "IP address of pod (e.g. Kubernetes assigned IP)",' +
      '"podName":  "Name of pod (e.g. Kubernetes pod)",' +
      '"tags": {' +
      '"test": "Informational tags associated to results for other metadata" },' +
      '"benchmarks": [{' +
      '"isBaseline": "True/false flag for providing results as baseline. If true, all existing compliance results for the provided benchmark within the container will be replaced by results in the current call", ' +
      '"results": [{' +
      '"message": "Comments for the result"}]' +
      '}]' +
      '}'
    return JSON.parse(data)
  }

  return []
}
