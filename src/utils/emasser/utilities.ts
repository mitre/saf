import _ from 'lodash'
import {Flags} from "@oclif/core"
import * as emasser from '@mitre/emass_client'
import { integer } from 'aws-sdk/clients/cloudfront';
import { BooleanFlag, OptionFlag } from '@oclif/core/lib/interfaces';

interface CliArgs {
  requestType: string;
  endpoint: string;
  argument: string;
}

export interface FlagOptions {
  systemId?: OptionFlag<number>;
  poamId?: OptionFlag<number>;
  milestoneId?: OptionFlag<number>;
  workflowInstanceId?: OptionFlag<number>;
  includeInactive?: OptionFlag<number|undefined>;
  includeComments?: OptionFlag<number|undefined>;
  pageIndex?: OptionFlag<number|undefined>;
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
  complianceStatus?: OptionFlag<string>;
  scheduledCompletionDate?: OptionFlag<string|any>;
  orgId?:OptionFlag<number>;
  pageSize?: OptionFlag<number|undefined>;
  input?: OptionFlag<string[]>;
  type?: OptionFlag<string|any>;
  category?: OptionFlag<string|any>;
  refPageNumber?: OptionFlag<string|undefined>;
  controls?: OptionFlag<string|undefined>;
  artifactExpirationDate?: OptionFlag<string|any>;
  lastReviewDate?: OptionFlag<string|any>;
}

export function getFlagsForEndpoint(argv: string[]): FlagOptions {
  let args: CliArgs = getArgs(argv);

  if (args.requestType === 'get') {
    if (args.endpoint === 'system') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        includePackage: Flags.boolean({char: "I", description: "Boolean - include system packages", allowNo: true, required: false}),
        policy: Flags.string({char: "p", description: "Filter on policy", required: false, options: ['diacap','rmf','reporting']}),
      }
    } else if (args.endpoint === 'systems') {
      return {
        registrationType: Flags.string({char: "r", description: "Filter on registration type", 
        options: ['assessAndAuthorize','assessOnly','guest','regular','functional','cloudServiceProvider','commonControlProvider'], required: false}),
        ditprId: Flags.string({char: "t", description: "DoD Information Technology (IT) Portfolio Repository (DITPR) string Id", required: false}),
        coamsId: Flags.string({char: "c", description: "Cyber Operational Attributes Management System (COAMS) string Id", required: false}),
        policy: Flags.string({char: "p", description: "Filter on policy", options: ['diacap','rmf','reporting'], required: false}),
        includePackage: Flags.boolean({char: "I", description: "Boolean - include system packages", allowNo: true, required: false}),
        includeDitprMetrics: Flags.boolean({char: "M", description: "Boolean - include DoD Information Technology metrics", allowNo: true, required: false}),
        includeDecommissioned: Flags.boolean({char: "D", description: "Boolean - include decommissioned systems", allowNo: true, required: false}),
        reportsForScorecard: Flags.boolean({char: "S", description: "Boolean - include score card", allowNo: true, required: false}),
      }
    } else if (args.endpoint === 'roles' && args.argument === 'byCategory') {
      return {
        roleCategory: Flags.string({char: "c", description: "Filter on role category", options: ['CAC','PAC','Other'], required: true}),
        role: Flags.string({char: "r", description: "Filter on role type", 
        options: ['AO','Auditor','Artifact Manager','C&A Team', 'IAO','ISSO', 'PM/IAM', 'SCA', 'User Rep', 'Validator'], required: true}),
        policy: Flags.string({char: "p", description: "Filter on policy", options: ['diacap','rmf','reporting'], required: false}),
        includeDecommissioned: Flags.boolean({char: "D", description: "Boolean - include decommissioned systems", allowNo: true, required: false}),
      }
    } else if (args.endpoint === 'controls') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        acronyms: Flags.boolean({char: "A", description: "The system acronym(s) e.g \"AC-1, AC-2\" - if not provided all controls for systemId are returned", allowNo: true, required: false}),
      }
    } else if (args.endpoint === 'cac') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        controlAcronyms: Flags.string({char: "a", description: "The system acronym(s) e.g \"AC-1, AC-2\"", required: false})
      }
    } else if (args.endpoint === 'pac') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
      }
    } else if (args.endpoint === 'cmmc') {
      return {
        sinceDate: Flags.string({char: "d", description: "The CMMC date. Unix date format", required: true}),
      }
    } else if (args.endpoint === 'test_results') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        controlAcronyms: Flags.string({char: "a", description: "The system acronym(s) e.g \"AC-1, AC-2\"", required: false}),
        ccis: Flags.string({char: "c", description: "The system CCIS string numerical value", required: false}),
        latestOnly: Flags.boolean({char: "L", description: "Boolean - Filter on latest only", allowNo: true, required: false}),
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
        systemOnly: Flags.boolean({char: "Y", description: "Boolean - Return only systems", allowNo: true, required: false}),
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
        systemOnly: Flags.boolean({char: "y", description: "Boolean - Return only systems", allowNo: true, required: false}),
      }
    } else if (args.endpoint === 'artifacts' && args.argument === 'export') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        filename: Flags.string({char: "f", description: "The artifact file name", required: true}),
        compress: Flags.boolean({char: "C", description: "Boolean - Compress true or false", allowNo: true, required: false}),
      }
    } else if (args.endpoint === 'milestones' && args.argument === 'byPoamId') {
      return {
        systemId: Flags.integer({char: "s", description: "Unique system identifier", required: true}),
        poamId: Flags.integer({char: "p", description: "Unique poam identifier", required: true}),
        scheduledCompletionDateStart: Flags.string({char: "t", description: "Unix time format (e.g. 1499644800)", required: false}),
        scheduledCompletionDateEnd: Flags.string({char: "c", description: "Unix time format (e.g. 1499990400)", required: false}),
      }
    } else if (args.endpoint === 'milestones' && args.argument === 'byMilestoneId') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        poamId: Flags.integer({char: "p", description: "The poam identification number", required: true}),
        milestoneId: Flags.integer({char: "m", description: "Unique milestone identifier", required: true}),
      }
    } else if (args.endpoint === 'workflow_instances' && args.argument === 'all') {
      return {
        includeComments: Flags.integer({char: "i", description: "true or false", required: false}),
        pageIndex: Flags.integer({char: "p", description: "The page number to query", required: false}),
        sinceDate: Flags.string({char: "d", description: "The Workflow Instance date. Unix date format", required: false}),
        status: Flags.string({char: "s", description: "The Workflow status - must be a valid status", options: ['active', 'inactive', 'all'], required: false}),
      }
    } else if (args.endpoint === 'workflow_instances' && args.argument === 'byInstanceId') {
      return {
        workflowInstanceId: Flags.integer({char: "w", description: "Unique workflow instance identifier", required: true}),
      }
    } else if (args.endpoint === 'dashboards') {
      return {
        orgId: Flags.integer({char: "o", description: "The organization identification number", required: true}),
        pageIndex: Flags.integer({char: "i", description: "The index of the starting page (default first page 0)", required: false}),
        pageSize: Flags.integer({char: "s", description: "The number of entries per page (default 20000)", required: false}),
      }
    }
  } else if (args.requestType === 'post') {
    if (args.endpoint === 'test_results') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        cci: Flags.string({char: "c", description: "The system CCI string numerical value", required: true}),
        testedBy: Flags.string({char: "b", description: "The person that conducted the test (Last Name, First)", required: true}),
        testDate: Flags.string({char: "t", description: "The date test was conducted, Unix time format", required: true}),
        description: Flags.string({char: "d", description: "The description of test result. 4000 Characters", required: true}),
        complianceStatus: Flags.string({char: "c", description: "The system CCI string numerical value", required: true}),
      }
    } else if (args.endpoint === 'milestones') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        poamId: Flags.integer({char: "p", description: "The poam identification number", required: true}),
        description: Flags.string({char: "d", description: "The milestone description", required: true}),
        scheduledCompletionDate: Flags.string({char: "c", description: "The scheduled completion date - Unix time format", required: true}),
      }
    }  else if (args.endpoint === 'artifacts') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        input: Flags.string({char: 'i', description: "Artifact file(s) to post to the given system, can have multiple (space separated)", required: true, multiple: true}),
        isTemplate: Flags.boolean({char: 'T', description: "Boolean - Indicates whether an artifact is a template.", allowNo: true, required: false}),
        type: Flags.string({char: 't', description: "Artifact file type",
          options: ['Procedure','Diagram','Policy','Labor','Document','Image','Other','Scan Result','Auditor Report'], required: false}), 
        category: Flags.string({char: 'c', description: "Artifact category", options: ['Implementation Guidance','Evidence'], required: false}), 
      }
    }
  } else if (args.requestType === 'put') {
    if (args.endpoint === 'artifacts') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        filename: Flags.string({char: 'f', description: "Artifact file name to update for the given system", required: true}),
        isTemplate: Flags.boolean({char: 'T', description: "Boolean - Indicates whether an artifact is a template.", allowNo: true, required: false}),
        type: Flags.string({char: 't', description: "Artifact file type",
          options: ['Procedure','Diagram','Policy','Labor','Document','Image','Other','Scan Result','Auditor Report'], required: true}), 
        category: Flags.string({char: 'g', description: "Artifact category", options: ['Implementation Guidance','Evidence'], required: true}), 
        description: Flags.string({char: "d", description: "The artifact(s) description", required: false}),
        refPageNumber: Flags.string({char: "p", description: "Artifact reference page number", required: false}),
        ccis: Flags.string({char: "c", description: "CCIs associated with artifact", required: false}),    
        controls: Flags.string({char: "C", description: "Control acronym associated with the artifact. NIST SP 800-53 Revision 4 defined.", required: false}),
        artifactExpirationDate: Flags.string({char: "D", description: "Date artifact expires and requires review", required: false}),
        lastReviewDate: Flags.string({char: "R", description: "Date artifact was last reviewed", required: false}),
      }
    } else if (args.endpoint === 'milestones') {
      return {
        systemId: Flags.integer({char: "s", description: "The system identification number", required: true}),
        poamId: Flags.integer({char: "p", description: "The poam identification number", required: true}),
        milestoneId: Flags.integer({char: "m", description: "Unique milestone identifier", required: true}),
        description: Flags.string({char: "d", description: "The milestone description", required: false}),
        scheduledCompletionDate: Flags.string({char: "c", description: "The scheduled completion date - Unix time format", required: false}),
      }      
    }
  }
  return {}
}

export function getDescriptionForEndpoint(argv: string[], endpoint: string): string {
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
      } else if (args.argument === 'byInstanceId') {
        return 'Retrieves workflow instance by workflow Instance ID';
      } else {
        return 'Retrieve all workflow instances or workflow instances noted by workflowInstanceID';
      }
    } else if (args.endpoint === 'dashboards') {
      if (args.argument === 'status_details') {
        return 'Get systems status detail dashboard information';
      } else if (args.argument === 'control_compliance_summary') {
        return 'Get systems control compliance summary dashboard information';
      } else if (args.argument === 'security_control_details') {
        return 'Get systems security control details dashboard information';
      } else if (args.argument === 'assessment_procedures_details') {
        return 'Get systems assessment procedures details dashboard information';
      } else if (args.argument === 'poam_summary') {
        return 'Get systems POA&Ms summary dashboard information';
      } else if (args.argument === 'poam_details') {
        return 'Get system POA&Ms details dashboard information';
      } else if (args.argument === 'hardware_summary') {
        return 'Get system hardware summary dashboard information';
      } else if (args.argument === 'hardware_details') {
        return 'Get system hardware details dashboard information';
      } else if (args.argument === 'associations_details') {
        return 'Get system associations details dashboard information';
      } else if (args.argument === 'assignments_details') {
        return 'Get user system assignments details dashboard information';
      } else if (args.argument === 'privacy_summary') {
        return 'Get user system privacy summary dashboard information';
      } else if (args.argument === 'fisma_saop_summary') {
        return 'Get VA OMB-FISMA SAOP summary dashboard information';
      } else if (args.argument === 'va_aa_summary') {
        return 'Get VA system A&A summary dashboard information';
      } else if (args.argument === 'va_a2_summary') {
        return 'Get VA system A2.0 summary dashboard information';
      } else if (args.argument === 'va_pl_109_summary') {
        return 'Get VA System P.L. 109 reporting summary dashboard information';
      } else if (args.argument === 'fisma_inventory_summary') {
        return 'Get VA system FISMA inventory summary dashboard information';
      } else {
        return 'Retrieves a pre-defined dashboard by orgId';
      }
    } 
  }
  return '';
}

export function getExamplesForEndpoint(argv: string[], endpoint?: string): string[] {
  let args: CliArgs = getArgs(argv, endpoint);
  // <%= config.bin %> resolves to the executable name
  // <%= command.id %> resolves to the command name  
  let baseCmd: string = '<%= config.bin %> <%= command.id %>'; 

  if (args.requestType === 'get') {
    if (args.endpoint === 'roles') {
      if (args.argument === 'all') {
        return [`${baseCmd} roles all`];
      } else if (args.argument === 'byCategory') {
        return [`${baseCmd} byCategory [-c, --roleCategory] <value> [-r, --role] <value> [options]`];
      } else {
        return [`${baseCmd} all`, `${baseCmd} byCategory [-c, --roleCategory] <value> [-r, --role] <value> [options]`];
      }
    } else if (args.endpoint === 'poams') {
      if (args.argument === 'forSystem') {
        return [`${baseCmd} forSystem [-s, --systemId] <value> [options]`];
      } else if (args.argument === 'byPoamId') {
        return [`${baseCmd} byPoamId [-s, --systemId] <value> [-p, --poamId] <value>`];
      } else {
        return [`${baseCmd} forSystem [-s, --systemId] <value> [options]`, `${baseCmd} byPoamId [-s, --systemId] <value> [-p, --poamId] <value>`];
      }    
    } else if (args.endpoint === 'artifacts') {
      if (args.argument === 'forSystem') {
        return [`${baseCmd} forSystem [-s, --systemId] <value> [options]`];
      } else if (args.argument === 'export') {
        return [`${baseCmd} export [-s, --systemId] <value> [-f, --filename] <value> [options]`];
      } else {
        return [`${baseCmd} forSystem [-s, --systemId] <value> [options]`, `${baseCmd} export [-s, --systemId] <value> [-f, --filename] <value> [options]`];
      }    
    } else if (args.endpoint === 'milestones') {
      if (args.argument === 'byPoamId') {
        return [`${baseCmd} byPoamId [-s, --systemId] <value> [-p, --poamId] <value> [options]`];
      } else if (args.argument === 'byMilestoneId') {
        return [`${baseCmd} byMilestoneId [-s, --systemId] <value> [-p, --poamId] <value> [-m, --milestoneId] <value>`];
      } else {
        return [`${baseCmd} byPoamId [-s, --systemId] <value> [-p, --poamId] <value> [options]`, `${baseCmd} byMilestoneId [-s, --systemId] <value> [-p, --poamId] <value> [-m, --milestoneId] <value>`];
      }    
    } else if (args.endpoint === 'workflow_instances') {
      if (args.argument === 'all') {
        return [`${baseCmd} all [options]`];
      } else if (args.argument === 'byInstanceId') {
        return [`${baseCmd} byInstanceId [-w, --workflowInstanceId] <value>`];
      } else {
        return [`${baseCmd} all [options]`, `${baseCmd} byInstanceId [-w, --workflowInstanceId] <value>`];
      }  
    } else if (args.endpoint === 'dashboards') {
      if (args.argument === 'status_details') {
        return [`${baseCmd} status_details [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'control_compliance_summary') {
        return [`${baseCmd} control_compliance_summary [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'security_control_details') {
        return [`${baseCmd} security_control_details [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'assessment_procedures_details') {
        return [`${baseCmd} assessment_procedures_details [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'poam_summary') {
        return [`${baseCmd} poam_summary [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'poam_details') {
        return [`${baseCmd} poam_details [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'hardware_summary') {
        return [`${baseCmd} hardware_summary [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'hardware_details') {
        return [`${baseCmd} hardware_details [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'associations_details') {
        return [`${baseCmd} associations_details [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'assignments_details') {
        return [`${baseCmd} assignments_details [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'privacy_summary') {
        return [`${baseCmd} privacy_summary [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'fisma_saop_summary') {
        return [`${baseCmd} fisma_saop_summary [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'va_aa_summary') {
        return [`${baseCmd} va_aa_summary [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'va_a2_summary') {
        return [`${baseCmd} va_a2_summary [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'va_pl_109_summary') {
        return [`${baseCmd} va_pl_109_summary [-o, --orgId] <value> [options]`];
      } else if (args.argument === 'fisma_inventory_summary') {
        return [`${baseCmd} fisma_inventory_summary [-o, --orgId] <value> [options]`];
      } else {
        return [`${baseCmd} [dashboard name] [flag] [options]`];
      }  
    }     
  }
  return [''];
}

// Supporting Function
function getArgs(argv: string[], endpointValue?: string ): CliArgs {
  const requestTypeIndex = argv.findIndex(arg => (arg === 'get' || arg === 'post' || arg === 'put'))
  return {
    requestType: argv[requestTypeIndex],
    endpoint: (endpointValue) ? endpointValue : argv[requestTypeIndex + 1],
    argument: argv[requestTypeIndex + 2]
  }    
}