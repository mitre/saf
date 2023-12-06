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

export default class EmasserGetDashboards extends Command {
  static usage = '<%= command.id %> [ARGUMENT] \n \x1B[93m NOTE: see EXAMPLES for argument case format\x1B[0m';

  static description = getDescriptionForEndpoint(process.argv, endpoint);

  static examples = getExamplesForEndpoint(process.argv, endpoint);

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Dashboards endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  };

  // NOTE: The way args are being implemented are mainly for the purposes of identifying which
  //       dashboard is being called, and provides the appropriate description.
  // Only args.name is used, there is, it contains the argument listed by the user, the dashboard name.
  // Example: If the command is invoked (saf emasser get dashboards status_details), args.name is set to status_details
  static args = {
    name: Args.string({name: 'name', required: false, hidden: true}),
    // System Status Dashboard
    status_details: Args.string({name: 'status_details', description: 'Get systems status detail dashboard information', required: false}),
    // Enterprise Security Controls Dashboard
    control_compliance_summary: Args.string({name: 'control_compliance_summary', description: 'Get control compliance summary dashboard information', required: false}),
    security_control_details: Args.string({name: 'security_control_details', description: 'Get security control details dashboard information', required: false}),
    assessment_procedures_details: Args.string({name: 'assessment_procedures_details', description: 'Get assessment procedures details dashboard information', required: false}),
    // Enterprise POA&M Dashboard
    poam_summary: Args.string({name: 'poam_summary', description: 'Get systems POA&Ms summary dashboard information', required: false}),
    poam_details: Args.string({name: 'poam_details', description: 'Get system POA&Ms details dashboard information', required: false}),
    // Enterprise Artifacts Dashboard
    artifacts_summary: Args.string({name: 'artifacts_summary', description: 'Get artifacts summary dashboard information', required: false}),
    artifacts_details: Args.string({name: 'artifacts_details', description: 'Get artifacts details dashboard information', required: false}),
    // Hardware Baseline Dashboard
    hardware_summary: Args.string({name: 'hardware_summary', description: 'Get hardware summary dashboard information', required: false}),
    hardware_details: Args.string({name: 'hardware_details', description: 'Get hardware details dashboard information', required: false}),
    // Enterprise Sensor-based Hardware Resources Dashboard
    sensor_hardware_summary: Args.string({name: 'sensor_hardware_summary', description: 'Get sensor hardware summary dashboard information', required: false}),
    sensor_hardware_details: Args.string({name: 'sensor_hardware_details', description: 'Get sensor hardware details dashboard information', required: false}),
    // Software Baseline Dashboard
    software_summary: Args.string({name: 'software_summary', description: 'Get software baseline summary dashboard information', required: false}),
    software_details: Args.string({name: 'software_details', description: 'Get software baseline details dashboard information', required: false}),
    // Ports and Protocols Dashboard
    ports_protocols_summary: Args.string({name: 'ports_protocols_summary', description: 'Get ports and protocols summary dashboard information', required: false}),
    ports_protocols_details: Args.string({name: 'ports_protocols_details', description: 'Get ports and protocols details dashboard information', required: false}),
    // System CONMON Integration Status Dashboard
    integration_status_summary: Args.string({name: 'integration_status_summary', description: 'Get CONMON integration status summary dashboard information', required: false}),
    // System Associations Dashboard
    associations_details: Args.string({name: 'associations_details', description: 'Get system associations details dashboard information', required: false}),
    // Users Dashboard
    assignments_details: Args.string({name: 'assignments_details', description: 'Get user system assignments details dashboard information', required: false}),
    // Privacy Compliance Dashboard
    privacy_summary: Args.string({name: 'privacy_summary', description: 'Get system privacy summary dashboard information', required: false}),
    fisma_saop_summary: Args.string({name: 'fisma_saop_summary', description: 'Get VA OMB-FISMA SAOP summary dashboard information', required: false}),
    // System A&A Summary Dashboard
    va_aa_summary: Args.string({name: 'va_aa_summary', description: 'Get VA system A&A summary dashboard information', required: false}),
    // System A2.0 Summary Dashboard
    va_a2_summary: Args.string({name: 'va_a2_summary', description: 'Get VA system A2.0 summary dashboard information', required: false}),
    // System P.L. 109 Reporting Summary Dashboard
    va_pl_109_summary: Args.string({name: 'va_pl_109_summary', description: 'Get VA System P.L. 109 reporting summary dashboard information', required: false}),
    // FISMA Inventory Summary Dashboard
    fisma_inventory_summary: Args.string({name: 'fisma_inventory_summary', description: 'Get VA system FISMA inventory summary dashboard information', required: false}),
    fisma_inventory_crypto_summary: Args.string({name: 'fisma_inventory_crypto_summary', description: 'Get VA system FISMA inventory summary dashboard information', required: false}),
    // Threat Risks Dashboard
    va_threat_risk_summary: Args.string({name: 'va_threat_risk_summary', description: 'Get VA threat risk summary dashboard information', required: false}),
    va_threat_source_details: Args.string({name: 'va_threat_source_details', description: 'Get VA threat source details dashboard information', required: false}),
    va_threat_architecture_details: Args.string({name: 'va_threat_architecture_details', description: 'Get VA threat architecture details dashboard information', required: false}),
  };

  async run(): Promise<void> { // skipcq: JS-0044
    const {args, flags} = await this.parse(EmasserGetDashboards)
    const apiCxn = new ApiConnection()
    const getDashboards = new DashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)

    switch (args.name) {
      case 'status_details': {
        // Order is important here
        getDashboards.getSystemStatusDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'control_compliance_summary': {
        // Order is important here
        getDashboards.getSystemControlComplianceSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'security_control_details': {
        // Order is important here
        getDashboards.getSystemSecurityControlDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'assessment_procedures_details': {
        // Order is important here
        getDashboards.getSystemAssessmentProceduresDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'poam_summary': {
        // Order is important here
        getDashboards.getSystemPoamSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'poam_details': {
        // Order is important here
        getDashboards.getSystemPoamDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'artifacts_summary': {
        // Order is important here
        getDashboards.getSystemArtifactsSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'artifacts_details': {
        // Order is important here
        getDashboards.getSystemArtifactsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'hardware_summary': {
        // Order is important here
        getDashboards.getSystemHardwareSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'hardware_details': {
        // Order is important here
        getDashboards.getSystemHardwareDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'sensor_hardware_summary': {
        // Order is important here
        getDashboards.getSystemSensorHardwareSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'sensor_hardware_details': {
        // Order is important here
        getDashboards.getSystemSensorHardwareDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'software_summary': {
        // Order is important here
        getDashboards.getSystemSoftwareSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'software_details': {
        // Order is important here
        getDashboards.getSystemSoftwareDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'ports_protocols_summary': {
        // Order is important here
        getDashboards.getSystemPortsProtocolsSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'ports_protocols_details': {
        // Order is important here
        getDashboards.getSystemPortsProtocolsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'integration_status_summary': {
        // Order is important here
        getDashboards.getSystemCommonIntegrationStatusSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'associations_details': {
        // Order is important here
        getDashboards.getSystemAssociationsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'assignments_details': {
        // Order is important here
        getDashboards.getUserSystemAssignmentsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'privacy_summary': {
        // Order is important here
        getDashboards.getSystemPrivacySummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'fisma_saop_summary': {
        // Order is important here
        getDashboards.getVaOmbFsmaSaopSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'va_aa_summary': {
        // Order is important here
        getDashboards.getVaSystemAaSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'va_a2_summary': {
        // Order is important here
        getDashboards.getVaSystemA2Summary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'va_pl_109_summary': {
        // Order is important here
        getDashboards.getVaSystemPl109ReportingSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'fisma_inventory_summary': {
        // Order is important here
        getDashboards.getVaSystemFismaInvetorySummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'fisma_inventory_crypto_summary': {
        // Order is important here
        getDashboards.getVaSystemFismaInvetoryCryptoSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'va_threat_risk_summary': {
        // Order is important here
        getDashboards.getVaSystemThreatRiskSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'va_threat_source_details': {
        // Order is important here
        getDashboards.getVaSystemThreatSourceDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error:any) => console.error(colorize(outputError(error))))

        break
      }

      case 'va_threat_architecture_details': {
        // Order is important here
        getDashboards.getVaSystemThreatArchitectureDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
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
