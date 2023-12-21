import {DashboardsApi} from '@mitre/emass_client'
import {Args, Command, Flags} from '@oclif/core'
import colorize from 'json-colorizer'

import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputError} from '../../../utils/emasser/outputError'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import {FlagOptions,
  getDescriptionForEndpoint,
  getExamplesForEndpoint,
  getFlagsForEndpoint} from '../../../utils/emasser/utilities'

const endpoint = 'dashboards'

export default class EmasserGetDashboards extends Command {
  // Example: If the command is invoked (saf emasser get dashboards status_details), args.name is set to status_details
  static args = {
    artifacts_details: Args.string({description: 'Get artifacts details dashboard information', name: 'artifacts_details', required: false}),
    // Enterprise Artifacts Dashboard
    artifacts_summary: Args.string({description: 'Get artifacts summary dashboard information', name: 'artifacts_summary', required: false}),
    assessment_procedures_details: Args.string({description: 'Get assessment procedures details dashboard information', name: 'assessment_procedures_details', required: false}),
    // Users Dashboard
    assignments_details: Args.string({description: 'Get user system assignments details dashboard information', name: 'assignments_details', required: false}),
    // System Associations Dashboard
    associations_details: Args.string({description: 'Get system associations details dashboard information', name: 'associations_details', required: false}),
    // Enterprise Security Controls Dashboard
    control_compliance_summary: Args.string({description: 'Get control compliance summary dashboard information', name: 'control_compliance_summary', required: false}),
    fisma_inventory_crypto_summary: Args.string({description: 'Get VA system FISMA inventory summary dashboard information', name: 'fisma_inventory_crypto_summary', required: false}),
    // FISMA Inventory Summary Dashboard
    fisma_inventory_summary: Args.string({description: 'Get VA system FISMA inventory summary dashboard information', name: 'fisma_inventory_summary', required: false}),
    fisma_saop_summary: Args.string({description: 'Get VA OMB-FISMA SAOP summary dashboard information', name: 'fisma_saop_summary', required: false}),
    hardware_details: Args.string({description: 'Get hardware details dashboard information', name: 'hardware_details', required: false}),
    // Hardware Baseline Dashboard
    hardware_summary: Args.string({description: 'Get hardware summary dashboard information', name: 'hardware_summary', required: false}),
    // System CONMON Integration Status Dashboard
    integration_status_summary: Args.string({description: 'Get CONMON integration status summary dashboard information', name: 'integration_status_summary', required: false}),
    name: Args.string({hidden: true, name: 'name', required: false}),
    poam_details: Args.string({description: 'Get system POA&Ms details dashboard information', name: 'poam_details', required: false}),
    // Enterprise POA&M Dashboard
    poam_summary: Args.string({description: 'Get systems POA&Ms summary dashboard information', name: 'poam_summary', required: false}),
    ports_protocols_details: Args.string({description: 'Get ports and protocols details dashboard information', name: 'ports_protocols_details', required: false}),
    // Ports and Protocols Dashboard
    ports_protocols_summary: Args.string({description: 'Get ports and protocols summary dashboard information', name: 'ports_protocols_summary', required: false}),
    // Privacy Compliance Dashboard
    privacy_summary: Args.string({description: 'Get system privacy summary dashboard information', name: 'privacy_summary', required: false}),
    security_control_details: Args.string({description: 'Get security control details dashboard information', name: 'security_control_details', required: false}),
    sensor_hardware_details: Args.string({description: 'Get sensor hardware details dashboard information', name: 'sensor_hardware_details', required: false}),
    // Enterprise Sensor-based Hardware Resources Dashboard
    sensor_hardware_summary: Args.string({description: 'Get sensor hardware summary dashboard information', name: 'sensor_hardware_summary', required: false}),
    software_details: Args.string({description: 'Get software baseline details dashboard information', name: 'software_details', required: false}),
    // Software Baseline Dashboard
    software_summary: Args.string({description: 'Get software baseline summary dashboard information', name: 'software_summary', required: false}),
    // System Status Dashboard
    status_details: Args.string({description: 'Get systems status detail dashboard information', name: 'status_details', required: false}),
    // System A2.0 Summary Dashboard
    va_a2_summary: Args.string({description: 'Get VA system A2.0 summary dashboard information', name: 'va_a2_summary', required: false}),
    // System A&A Summary Dashboard
    va_aa_summary: Args.string({description: 'Get VA system A&A summary dashboard information', name: 'va_aa_summary', required: false}),
    // System P.L. 109 Reporting Summary Dashboard
    va_pl_109_summary: Args.string({description: 'Get VA System P.L. 109 reporting summary dashboard information', name: 'va_pl_109_summary', required: false}),
    va_threat_architecture_details: Args.string({description: 'Get VA threat architecture details dashboard information', name: 'va_threat_architecture_details', required: false}),
    // Threat Risks Dashboard
    va_threat_risk_summary: Args.string({description: 'Get VA threat risk summary dashboard information', name: 'va_threat_risk_summary', required: false}),
    va_threat_source_details: Args.string({description: 'Get VA threat source details dashboard information', name: 'va_threat_source_details', required: false}),
  }

  static description = getDescriptionForEndpoint(process.argv, endpoint)

  static examples = getExamplesForEndpoint(process.argv, endpoint)

  static flags = {
    help: Flags.help({char: 'h', description: 'Show emasser CLI help for the GET Dashboards endpoint'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  // NOTE: The way args are being implemented are mainly for the purposes of identifying which
  //       dashboard is being called, and provides the appropriate description.
  // Only args.name is used, there is, it contains the argument listed by the user, the dashboard name.
  static usage = '<%= command.id %> [ARGUMENT] \n \x1B[93m NOTE: see EXAMPLES for argument case format\x1B[0m'

  async catch(error: any) { // skipcq: JS-0116
    if (error.message) {
      this.error(error)
    } else {
      const suggestions = 'get dashboards [-h or --help] for available arguments'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }

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
}
