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

  if (args.requestType === 'get') {
    if (args.endpoint === 'system') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        includePackage: Flags.boolean({char: "i", description: "Boolean - include system packages", required: false}),
        policy: Flags.string({char: "p", description: "Filter on policy", required: false, options: ['diacap','rmf','reporting']}),
      }
    } else if (args.endpoint === 'systems') {
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
    } else if (args.endpoint === 'roles' && args.argument === 'byCategory') {
      return {
        roleCategory: Flags.string({char: "c", description: "Filter on role category", options: ['CAC','PAC','Other'], required: true}),
        role: Flags.string({char: "r", description: "Filter on role type", 
        options: ['AO','Auditor','Artifact Manager','C&A Team', 'IAO','ISSO', 'PM/IAM', 'SCA', 'User Rep', 'Validator'], required: true}),
        policy: Flags.string({char: "p", description: "Filter on policy", options: ['diacap','rmf','reporting'], required: false}),
        includeDecommissioned: Flags.boolean({char: "d", description: "Boolean - include decommissioned systems", required: false}),
      }
    } else if (args.endpoint === 'controls') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        acronyms: Flags.boolean({char: "a", description: "The system acronym(s) e.g \"AC-1, AC-2\" - if not provided all controls for systemId are returned", required: false}),
      }
    } else if (args.endpoint === 'cac') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        controlAcronyms: Flags.integer({char: "c", description: "The system acronym(s) e.g \"AC-1, AC-2\"", required: false})
      }
    } else if (args.endpoint === 'pac') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
      }
    } else if (args.endpoint === 'cmmc') {
      return {
        sinceDate: Flags.integer({char: "s", description: "The CMMC date. Unix date format", required: true}),
      }
    } else if (args.endpoint === 'test_results') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        controlAcronyms: Flags.string({char: "a", description: "The system acronym(s) e.g \"AC-1, AC-2\"", required: false}),
        ccis: Flags.string({char: "c", description: "The system CCIS string numerical value", required: false}),
        latestOnly: Flags.boolean({char: "l", description: "Filter on latest only", required: false}),
      }
    } else if (args.endpoint === 'workflow_defintions') {
      return {
        includeInactive: Flags.integer({char: "i", description: "true or false", required: false}),
        registrationType: Flags.string({char: "r", description: "The registration type - must be a valid type", 
            options: ['assessAndAuthorize', 'assessOnly', 'guest', 'regular', 'functional', 'cloudServiceProvider', 'commonControlProvider'], required: false}),
      }
    } else if (args.endpoint === 'poams' && args.argument === 'forSystem') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        scheduledCompletionDateStart: Flags.string({description: "The completion start date", required: false}),
        scheduledCompletionDateEnd: Flags.string({description: "The completion end date", required: false}),
        controlAcronyms: Flags.string({char: "a", description: "The system acronym(s) e.g \"AC-1, AC-2\"", required: false}),
        ccis: Flags.string({char: "c", description: "The system CCIS string numerical value", required: false}),
        systemOnly: Flags.boolean({char: "y", description: "Return only systems", required: false}),
      }
    } else if (args.endpoint === 'poams' && args.argument === 'byPoamId') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        poamId: Flags.integer({char: "p", description: "The poam identification number", required: true}),
      }
    } else if (args.endpoint === 'artifacts' && args.argument === 'forSystem') {
      return {
        systemId: Flags.integer({char: "s", description: "Unique system identifier", required: true}),
        filename: Flags.string({char: "f", description: "The artifact file name", required: false}),
        controlAcronyms: Flags.string({char: "a", description: "The system acronym(s) e.g \"AC-1, AC-2\"", required: false}),
        ccis: Flags.string({char: "c", description: "The system CCIS string numerical value", required: false}),
        systemOnly: Flags.boolean({char: "y", description: "Return only systems", required: false}),
      }
    } else if (args.endpoint === 'artifacts' && args.argument === 'export') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        filename: Flags.string({char: "f", description: "The artifact file name", required: true}),
        compress: Flags.boolean({char: "c", description: "Compress true or false", required: false}),
      }
    } else if (args.endpoint === 'milestones' && args.argument === 'byPoamId') {
      return {
        systemId: Flags.integer({char: "s", description: "Unique system identifier", required: true}),
        poamId: Flags.string({char: "p", description: "Unique poam identifier", required: true}),
        scheduledCompletionDateStart: Flags.string({char: "t", description: "Unix time format (e.g. 1499644800)", required: false}),
        scheduledCompletionDateEnd: Flags.string({char: "e", description: "Unix time format (e.g. 1499990400)", required: false}),
      }
    } else if (args.endpoint === 'milestones' && args.argument === 'byMilestoneId') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        poamId: Flags.integer({char: "p", description: "The poam identification number", required: true}),
        milestoneId: Flags.integer({char: "m", description: "Unique milestone identifier", required: true}),
      }
    } else if (args.endpoint === 'workflow_instances') {
      return {
        includeComments: Flags.integer({char: "i", description: "true or false", required: false}),
        pageIndex: Flags.integer({char: "p", description: "The page number to query", required: false}),
        sinceDate: Flags.string({char: "d", description: "The Workflow Instance date. Unix date format", required: false}),
        status: Flags.string({char: "s", description: "The Workflow status - must be a valid status", options: ['active', 'inactive', 'all'], required: false}),
      }
    } else if (args.endpoint === 'workflow_instances' && args.argument === 'byWorkflowInstanceId') {
      return {
        workflowInstanceId: Flags.integer({char: "w", description: "Unique workflow instance identifier", required: true}),
      }
    } 
  } else if (args.requestType === 'post') {
    if (args.endpoint === 'test_results') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        cci: Flags.string({char: "c", description: "The system CCI string numerical value", required: true}),
        testedBy: Flags.string({char: "t", description: "The person that conducted the test (Last Name, First)", required: true}),
        testDate: Flags.string({char: "d", description: "The date test was conducted, Unix time format", required: true}),
        description: Flags.string({char: "d", description: "The description of test result. 4000 Characters", required: true}),
        complianceStatus: Flags.string({char: "c", description: "The system CCI string numerical value", required: true}),
      }
    }
  }
  return {}
}

export function getDescriptionForEndpoint(argv: string[], endpoint?: string ): string {
  let args: CliArgs = getArgs(argv, endpoint);

  if (args.requestType === 'get') {
    if (args.endpoint === 'roles') {
      if (args.argument === 'all') {
        return 'Retrieve all available system roles';
      } else if (args.argument === 'byCategory') {
        return 'Retrieve system roles filter by options';
      } else {
        return 'Retrieve all available system roles, or filter by options';
      }
    } else if (args.endpoint === 'poams') {
      if (args.argument === 'forSystem') {
        return 'Retrieves Poams for specified system ID';
      } else if (args.argument === 'byPoamId') {
        return 'Retrieves Poams for specified system and poam ID';
      } else {
        return 'Retrieve Poams for a system or system/poam Id combination';
      }
    } else if (args.endpoint === 'artifacts') {
      if (args.argument === 'forSystem') {
        return 'Retrieves one or many artifacts for a system specified system ID';
      } else if (args.argument === 'export') {
        return 'Retrieves the file artifacts (if compress is true the file binary contents are returned, otherwise the file textual contents are returned.)';
      } else {
        return 'Retrieve artifacts for a system or system/filename combination';
      }
    } else if (args.endpoint === 'milestones') {
      if (args.argument === 'byPoamId') {
        return 'Retrieves milestone(s) for specified system and poam ID';
      } else if (args.argument === 'byMilestoneId') {
        return 'Retrieve milestone(s) for specified system, poam, and milestone ID';
      } else {
        return 'Retrieve milestones by system by systemID/poamID or systemID/poamID/milestoneID combination';
      }
    } else if (args.endpoint === 'workflow_instances') {
      if (args.argument === 'all') {
        return 'Retrieves all workflow instances';
      } else if (args.argument === 'byWorkflowInstanceId') {
        return 'Retrieves workflow instance by workflow Instance ID';
      } else {
        return 'Retrieve all workflow instances or workflow instance by workflowInstanceID';
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
  } else if (args.requestType === 'get' && args.endpoint === 'poams') {
    if (args.argument === 'forSystem') {
      return ['emasser get poams forSystem --systemId <value> [options]'];
    } else if (args.argument === 'byPoamId') {
      return ['emasser get poams byPoamId --systemId <value> --poamId <value>'];
    } else {
      return ['emasser get poams forSystem --systemId <value> [options]', 'emasser get poams byPoamId --systemId <value> --poamId <value>'];
    }    
  } else if (args.requestType === 'get' && args.endpoint === 'artifacts') {
    if (args.argument === 'forSystem') {
      return ['emasser get artifacts forSystem --systemId <value> [options]'];
    } else if (args.argument === 'export') {
      return ['emasser get artifacts export --systemId <value> --filename <value> [options]'];
    } else {
      return ['emasser get artifacts forSystem --systemId <value> [options]', 'emasser get artifacts export --systemId <value> --filename <value> [options]'];
    }    
  } else if (args.requestType === 'get' && args.endpoint === 'milestones') {
    if (args.argument === 'byPoamId') {
      return ['emasser get milestones byPoamId --systemId <value> --poamId <value> [options]'];
    } else if (args.argument === 'byMilestoneId') {
      return ['emasser get milestones byMilestoneId --systemId <value> --poamId <value> --milestoneId <value>'];
    } else {
      return ['emasser get milestones byPoamId --systemId <value> --poamId <value> [options]', 'emasser get milestones byMilestoneId --systemId <value> --poamId <value> --milestoneId <value>'];
    }    
  } else if (args.requestType === 'get' && args.endpoint === 'workflow_instances') {
    if (args.argument === 'all') {
      return ['emasser get workflow_instances all [options]'];
    } else if (args.argument === 'byWorkflowInstanceId') {
      return ['emasser get workflow_instances byWorkflowInstanceId --workflowInstanceId <value>'];
    } else {
      return ['emasser get workflow_instances all [options]', 'emasser get workflow_instances byWorkflowInstanceId --workflowInstanceId <value>'];
    }    
  }
  return [''];
}

// Supporting Functions
function getArgs(argv: string[], endpointValue?: string ): CliArgs {
  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post'))
  return {
    requestType: argv[requestTypeIndex],
    endpoint: (endpointValue) ? endpointValue : argv[requestTypeIndex + 1],
    argument: (endpointValue) ? '' : argv[requestTypeIndex + 2],
  }    
}