import colorize from 'json-colorizer';
import {Command, Flags} from "@oclif/core"
import { ApiConnection } from "../../../utils/emasser/apiConnection"
import { DashboardsApi } from '@mitre/emass_client';
import { outputFormat } from '../../../utils/emasser/outputFormatter';
import { outputError } from '../../../utils/emasser/outputError';
import { FlagOptions, 
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint } from '../../../utils/emasser/utilities';

const endpoint = 'dashboard';

export default class EmassergetDashboards extends Command {
  static usage = 'get dashboard [ARGUMENTS]';

  static description = getDescriptionForEndpoint(process.argv, endpoint);

  static examples = getExamplesForEndpoint(process.argv, endpoint);

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Dashboards endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions,
  };

  static args = [
    {name: "name", required: false, hidden: true},
    {name: "status_details", description: 'Get systems status detail dashboard information', required: false},
    {name: "control_compliance_summary", description: 'Get systems control compliance summary dashboard information', required: false},
    {name: "security_control_details", description: 'Get systems security control details dashboard information', required: false},
    {name: "assessment_procedures_details", description: 'Get systems assessment procedures details dashboard information', required: false},
    {name: "poam_summary", description: 'Get systems POA&Ms summary dashboard information', required: false},
    {name: "poam_details", description: 'Get system POA&Ms details dashboard information', required: false},
    {name: "hardware_summary", description: 'Get system hardware summary dashboard information', required: false},
    {name: "hardware_details", description: 'Get system hardware details dashboard information', required: false},
    {name: "associations_details", description: 'Get system associations details dashboard information', required: false},
    {name: "assignments_details", description: 'Get user system assignments details dashboard information', required: false},
    {name: "privacy_summary", description: 'Get user system privacy summary dashboard information', required: false},
    {name: "fisma_saop_summary", description: 'Get VA OMB-FISMA SAOP summary dashboard information', required: false},
    {name: "va_aa_summary", description: 'Get VA system A&A summary dashboard information', required: false},
    {name: "va_a2_summary", description: 'Get VA system A2.0 summary dashboard information', required: false},
    {name: "va_pl_109_summary", description: 'Get VA System P.L. 109 reporting summary dashboard information', required: false},
    {name: "fisma_inventory_summary", description: 'Get VA system FISMA inventory summary dashboard information', required: false},
  ];

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmassergetDashboards)
    const apiCxn = new ApiConnection();
    const getDashboards = new DashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances);

    if (args.name === 'status_details') {
      // Order is important here
      getDashboards.getSystemStatusDetails(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
        console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'control_compliance_summary') {
      // Order is important here
      getDashboards.getSystemControlComplianceSummary(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
        console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'security_control_details') {
      // Order is important here
      getDashboards.getSystemSecurityControlDetails(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'assessment_procedures_details') {
      // Order is important here
      getDashboards.getSystemAssessmentProceduresDetails(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'poam_summary') {
      // Order is important here
      getDashboards.getSystemPoamSummary(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'poam_details') {
        // Order is important here
        getDashboards.getSystemPoamDetails(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
            console.log(colorize(outputFormat(response)));
        }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'hardware_summary') {
      // Order is important here
      getDashboards.getSystemHardwareSummary(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'hardware_details') {
      // Order is important here
      getDashboards.getSystemHardwareDetails(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'associations_details') {
      // Order is important here
      getDashboards.getSystemAssociationsDetails(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'assignments_details') {
      // Order is important here
      getDashboards.getUserSystemAssignmentsDetails(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'privacy_summary') {
      // Order is important here
      getDashboards.getSystemPrivacySummary(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'fisma_saop_summary') {
    // Order is important here
    getDashboards.getVaOmbFsmaSaopSummary(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
        console.log(colorize(outputFormat(response)));
    }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'va_aa_summary') {
      // Order is important here
      getDashboards.getVaSystemAaSummary(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'va_a2_summary') {
      // Order is important here
      getDashboards.getVaSystemA2Summary(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'va_pl_109_summary') {
      // Order is important here
      getDashboards.getVaSystemPl109ReportingSummary(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else if (args.name === 'fisma_inventory_summary') {
      // Order is important here
      getDashboards.getVaSystemFismaInvetorySummary(flags.orgId,flags.pageIndex,flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)));
      }).catch((error:any) => console.error(colorize(outputError(error))));
    } else {
    throw this.error;
    }
  }

  async catch(error: any) {
    if (error.message) {
      this.error(error)
    } else {    
      let suggestions = 'get dashboards [-h or --help]';
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions);
    }
  }
}
