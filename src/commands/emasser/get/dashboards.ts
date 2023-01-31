import colorize from 'json-colorizer'
import {Args, Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {DashboardsApi} from '@mitre/emass_client'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {outputError} from '../../../utils/emasser/outputError'
import {FlagOptions,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'dashboards'

export default class EmassergetDashboards extends Command {
  static usage = '<%= command.id %> [ARGUMENTS]';

  static description = getDescriptionForEndpoint(process.argv, endpoint);

  static examples = getExamplesForEndpoint(process.argv, endpoint);

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Dashboards endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  static args = {
    name: Args.string({name: 'name', required: false, hidden: true}),
    status_details: Args.string({name: 'status_details', description: 'Get systems status detail dashboard information', required: false}),
    control_compliance_summary: Args.string({name: 'control_compliance_summary', description: 'Get systems control compliance summary dashboard information', required: false}),
    security_control_details: Args.string({name: 'security_control_details', description: 'Get systems security control details dashboard information', required: false}),
    assessment_procedures_details: Args.string({name: 'assessment_procedures_details', description: 'Get systems assessment procedures details dashboard information', required: false}),
    poam_summary: Args.string({name: 'poam_summary', description: 'Get systems POA&Ms summary dashboard information', required: false}),
    poam_details: Args.string({name: 'poam_details', description: 'Get system POA&Ms details dashboard information', required: false}),
    hardware_summary: Args.string({name: 'hardware_summary', description: 'Get system hardware summary dashboard information', required: false}),
    hardware_details: Args.string({name: 'hardware_details', description: 'Get system hardware details dashboard information', required: false}),
    associations_details: Args.string({name: 'associations_details', description: 'Get system associations details dashboard information', required: false}),
    assignments_details: Args.string({name: 'assignments_details', description: 'Get user system assignments details dashboard information', required: false}),
    privacy_summary: Args.string({name: 'privacy_summary', description: 'Get user system privacy summary dashboard information', required: false}),
    fisma_saop_summary: Args.string({name: 'fisma_saop_summary', description: 'Get VA OMB-FISMA SAOP summary dashboard information', required: false}),
    va_aa_summary: Args.string({name: 'va_aa_summary', description: 'Get VA system A&A summary dashboard information', required: false}),
    va_a2_summary: Args.string({name: 'va_a2_summary', description: 'Get VA system A2.0 summary dashboard information', required: false}),
    va_pl_109_summary: Args.string({name: 'va_pl_109_summary', description: 'Get VA System P.L. 109 reporting summary dashboard information', required: false}),
    fisma_inventory_summary: Args.string({name: 'fisma_inventory_summary', description: 'Get VA system FISMA inventory summary dashboard information', required: false}),
  };

  async run(): Promise<void> {
    const {args, flags} = await this.parse(EmassergetDashboards)
    const apiCxn = new ApiConnection()
    const getDashboards = new DashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    switch (args.name) {
      case 'status_details': {
        // Order is important here
        getDashboards.getSystemStatusDetails(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'control_compliance_summary': {
        // Order is important here
        getDashboards.getSystemControlComplianceSummary(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'security_control_details': {
        // Order is important here
        getDashboards.getSystemSecurityControlDetails(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'assessment_procedures_details': {
        // Order is important here
        getDashboards.getSystemAssessmentProceduresDetails(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'poam_summary': {
        // Order is important here
        getDashboards.getSystemPoamSummary(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'poam_details': {
        // Order is important here
        getDashboards.getSystemPoamDetails(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'hardware_summary': {
        // Order is important here
        getDashboards.getSystemHardwareSummary(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'hardware_details': {
        // Order is important here
        getDashboards.getSystemHardwareDetails(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'associations_details': {
        // Order is important here
        getDashboards.getSystemAssociationsDetails(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'assignments_details': {
        // Order is important here
        getDashboards.getUserSystemAssignmentsDetails(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'privacy_summary': {
        // Order is important here
        getDashboards.getSystemPrivacySummary(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'fisma_saop_summary': {
        // Order is important here
        getDashboards.getVaOmbFsmaSaopSummary(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'va_aa_summary': {
        // Order is important here
        getDashboards.getVaSystemAaSummary(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'va_a2_summary': {
        // Order is important here
        getDashboards.getVaSystemA2Summary(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'va_pl_109_summary': {
        // Order is important here
        getDashboards.getVaSystemPl109ReportingSummary(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'fisma_inventory_summary': {
        // Order is important here
        getDashboards.getVaSystemFismaInvetorySummary(flags.orgId, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      default: {
        throw this.error
      }
    }
  }

  async catch(error: any) { // skipcq: JS-0116
    if (error.message) {
      this.error(error)
    } else {
      const suggestions = 'get dashboards [-h or --help] for available arguments'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }
}
