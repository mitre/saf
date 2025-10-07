import {colorize} from 'json-colorizer'
import {Args, Command, Flags} from '@oclif/core'
import {ApiConnection} from '../../../utils/emasser/apiConnection'
import {outputFormat} from '../../../utils/emasser/outputFormatter'
import type {
  FlagOptions} from '../../../utils/emasser/utilities'
import {
  displayError,
  getFlagsForEndpoint,
  getExamplesForEndpoint,
  getDescriptionForEndpoint,
} from '../../../utils/emasser/utilities'
import {
  VASystemDashboardsApi,
  VAOMBFISMADashboardApi,
  SystemPOAMDashboardsApi,
  SystemStatusDashboardApi,
  SystemPrivacyDashboardApi,
  SystemATCIATCDashboardApi,
  CMMCAssessmentDashboardsApi,
  SystemHardwareDashboardsApi,
  SystemSoftwareDashboardsApi,
  SystemArtifactsDashboardsApi,
  SystemWorkflowsDashboardsApi,
  SystemFISMAMetricsDashboardApi,
  SystemAssociationsDashboardApi,
  SystemVulnerabilityDashboardApi,
  SystemCriticalAssetsDashboardApi,
  SystemQuestionnaireDashboardsApi,
  SystemDeviceFindingsDashboardsApi,
  SystemSensorSoftwareDashboardsApi,
  SystemSensorHardwareDashboardsApi,
  SystemMigrationStatusDashboardApi,
  SystemPortsProtocolsDashboardsApi,
  UserSystemAssignmentsDashboardApi,
  SystemTermsConditionsDashboardsApi,
  SystemConnectivityCCSDDashboardsApi,
  SystemSecurityControlsDashboardsApi,
  SystemApplicationFindingsDashboardsApi,
  OrganizationMigrationStatusDashboardApi,
  CoastGuardSystemFISMAMetricsDashboardApi,
  SystemCONMONIntegrationStatusDashboardApi,
} from '@mitre/emass_client'

const endpoint = 'dashboards'

export default class EmasserGetDashboards extends Command {
  static readonly usage = '<%= command.id %> [ARGUMENT] [FLAGS]\n\x1B[93m NOTE: see EXAMPLES for argument case format\x1B[0m'

  static readonly description = getDescriptionForEndpoint(process.argv, endpoint)

  static readonly examples = getExamplesForEndpoint(process.argv, endpoint)

  static readonly flags = {
    help: Flags.help({char: 'h', description: 'Show eMASSer CLI help for the GET Dashboards command'}),
    ...getFlagsForEndpoint(process.argv) as FlagOptions, // skipcq: JS-0349
  }

  // NOTE: The way args are being implemented are mainly for the purposes of identifying which
  //       dashboard is being called, and provides the appropriate description.
  // Only args.name is used, there is, it contains the argument listed by the user, the dashboard name.
  // Example: If the command is invoked (saf emasser get dashboards status_details), args.name is set to status_details
  static readonly args = {
    name: Args.string({name: 'name', required: false, hidden: true}),
    // System Status Dashboard
    status_details: Args.string({name: 'status_details', description: 'Get systems status detail dashboard information', required: false, defaultHelp: 'System Status Details'}),
    // System Terms and Conditions Dashboard
    terms_conditions_summary: Args.string({name: 'terms_conditions_summary', description: 'Get system terms and conditions summary dashboard information', required: false, defaultHelp: 'System Terms and Conditions Dashboard'}),
    terms_conditions_details: Args.string({name: 'terms_conditions_details', description: 'Get system terms and conditions details dashboard information', required: false, defaultHelp: 'System Terms and Conditions Dashboard'}),
    // System Connectivity CCSD Dashboard
    connectivity_ccsd_summary: Args.string({name: 'connectivity_ccsd_summary', description: 'Get system connectivity CCSD summary dashboard information', required: false}),
    connectivity_ccsd_details: Args.string({name: 'connectivity_ccsd_details', description: 'Get system connectivity CCSD details dashboard information', required: false}),
    // System ATC/IATC Dashboard
    atc_iatc_details: Args.string({name: 'atc_iatc_details', description: 'Get system ATC/IATC details dashboard information', required: false}),
    // System Questionnaire Dashboard
    questionnaire_summary: Args.string({name: 'questionnaire_summary', description: 'Get system questionnaire summary dashboard information', required: false}),
    questionnaire_details: Args.string({name: 'questionnaire_details', description: 'Get system questionnaire details dashboard information', required: false}),
    // System Workflows Dashboard
    workflows_history_summary: Args.string({name: 'workflow_history_summary', description: 'Get system workflow history summary dashboard information', required: false}),
    workflows_history_details: Args.string({name: 'workflow_history_details', description: 'Get system workflow history details dashboard information', required: false}),
    workflows_history_stage_details: Args.string({name: 'workflow_history_stage_details', description: 'Get system workflow history stage details dashboard information', required: false}),
    // System Security Controls Dashboard
    control_compliance_summary: Args.string({name: 'control_compliance_summary', description: 'Get control compliance summary dashboard information', required: false}),
    security_control_details: Args.string({name: 'security_control_details', description: 'Get security control details dashboard information', required: false}),
    assessment_procedures_details: Args.string({name: 'assessment_procedures_details', description: 'Get assessment procedures details dashboard information', required: false}),
    // System POA&M Dashboard
    poam_summary: Args.string({name: 'poam_summary', description: 'Get systems POA&Ms summary dashboard information', required: false}),
    poam_details: Args.string({name: 'poam_details', description: 'Get system POA&Ms details dashboard information', required: false}),
    // System Artifacts Dashboard
    artifacts_summary: Args.string({name: 'artifacts_summary', description: 'Get artifacts summary dashboard information', required: false}),
    artifacts_details: Args.string({name: 'artifacts_details', description: 'Get artifacts details dashboard information', required: false}),
    // System Hardware Dashboard
    hardware_summary: Args.string({name: 'hardware_summary', description: 'Get hardware summary dashboard information', required: false}),
    hardware_details: Args.string({name: 'hardware_details', description: 'Get hardware details dashboard information', required: false}),
    // System Sensor-based Hardware Resources Dashboard
    sensor_hardware_summary: Args.string({name: 'sensor_hardware_summary', description: 'Get sensor hardware summary dashboard information', required: false}),
    sensor_hardware_details: Args.string({name: 'sensor_hardware_details', description: 'Get sensor hardware details dashboard information', required: false}),
    // Software Baseline Dashboard
    software_summary: Args.string({name: 'software_summary', description: 'Get software baseline summary dashboard information', required: false}),
    software_details: Args.string({name: 'software_details', description: 'Get software baseline details dashboard information', required: false}),
    // Sensor-based Software Resources Dashboard
    sensor_software_summary: Args.string({name: 'sensor_software_summary', description: 'Get sensor software summary dashboard information', required: false}),
    sensor_software_details: Args.string({name: 'sensor_software_details', description: 'Get sensor software details dashboard information', required: false}),
    sensor_software_counts: Args.string({name: 'sensor_software_counts', description: 'Get sensor software counts dashboard information', required: false}),
    // Critical Assets Dashboard
    critical_assets_summary: Args.string({name: 'critical_assets_summary', description: 'Get critical assets summary dashboard information', required: false}),
    // Vulnerability Dashboard
    vulnerability_summary: Args.string({name: 'vulnerability_summary', description: 'Get vulnerability summary dashboard information', required: false}),
    // Device Findings Dashboard
    device_findings_summary: Args.string({name: 'device_findings_summary', description: 'Get device findings summary dashboard information', required: false}),
    device_findings_details: Args.string({name: 'device_findings_details', description: 'Get device findings details dashboard information', required: false}),
    // Application Findings Dashboard
    application_findings_summary: Args.string({name: 'application_findings_summary', description: 'Get application findings summary dashboard information', required: false}),
    application_findings_details: Args.string({name: 'application_findings_details', description: 'Get application findings details dashboard information', required: false}),
    // Ports and Protocols Dashboard
    ports_protocols_summary: Args.string({name: 'ports_protocols_summary', description: 'Get ports and protocols summary dashboard information', required: false}),
    ports_protocols_details: Args.string({name: 'ports_protocols_details', description: 'Get ports and protocols details dashboard information', required: false}),
    // System CONMON Integration Status Dashboard
    integration_status_summary: Args.string({name: 'integration_status_summary', description: 'Get CONMON integration status summary dashboard information', required: false}),
    // System Associations Dashboard
    associations_details: Args.string({name: 'associations_details', description: 'Get system associations details dashboard information', required: false}),
    // User System Assignments Dashboard
    user_assignments_details: Args.string({name: 'assignments_details', description: 'Get user system assignments details dashboard information', required: false}),
    // Organization Migration Status Dashboard
    org_migration_status: Args.string({name: 'org_migration_status', description: 'Get organization migration status dashboard information', required: false}),
    // System Migration Status Dashboard
    system_migration_status: Args.string({name: 'system_migration_status', description: 'Get system migration status dashboard information', required: false}),
    // FISMA Metrics Dashboard
    fisma_metrics: Args.string({name: 'fisma_metrics', description: 'Get FISMA metrics dashboard information', required: false}),
    // Coast Guard FISMA Metrics Dashboard
    coast_guard_fisma_metrics: Args.string({name: 'coast_guard_fisma_metrics', description: 'Get Coast Guard FISMA metrics dashboard information', required: false}),
    // Privacy Compliance Dashboard
    privacy_summary: Args.string({name: 'privacy_summary', description: 'Get system privacy summary dashboard information', required: false}),
    // VA OMB-FISMA SAOP Summary Dashboard
    fisma_saop_summary: Args.string({name: 'fisma_saop_summary', description: 'Get VA OMB-FISMA SAOP summary dashboard information', required: false}),
    // VA Systems Dashboards
    va_icamp_tableau_poam_details: Args.string({name: 'va_icamp_tableau_poam_details', description: 'Get VA system ICAMP Tableau POA&M details dashboard information', required: false}),
    va_aa_summary: Args.string({name: 'va_aa_summary', description: 'Get VA system A&A summary dashboard information', required: false}),
    va_a2_summary: Args.string({name: 'va_a2_summary', description: 'Get VA system A2.0 summary dashboard information', required: false}),
    va_pl_109_summary: Args.string({name: 'va_pl_109_summary', description: 'Get VA System P.L. 109 reporting summary dashboard information', required: false}),
    va_fisma_inventory_summary: Args.string({name: 'fisma_inventory_summary', description: 'Get VA system FISMA inventory summary dashboard information', required: false}),
    va_fisma_inventory_crypto_summary: Args.string({name: 'fisma_inventory_crypto_summary', description: 'Get VA system FISMA inventory summary dashboard information', required: false}),
    va_threat_risk_summary: Args.string({name: 'va_threat_risk_summary', description: 'Get VA threat risk summary dashboard information', required: false}),
    va_threat_source_details: Args.string({name: 'va_threat_source_details', description: 'Get VA threat source details dashboard information', required: false}),
    va_threat_architecture_details: Args.string({name: 'va_threat_architecture_details', description: 'Get VA threat architecture details dashboard information', required: false}),
    // CMMC Assessment Dashboard
    cmmc_status_summary: Args.string({name: 'cmmc_status_summary', description: 'Get CMMC assessment status summary dashboard information', required: false}),
    cmmc_compliance_summary: Args.string({name: 'cmmc_compliance_summary', description: 'Get CMMC assessment requirements compliance summary dashboard information', required: false}),
    cmmc_security_requirements_details: Args.string({name: 'cmmc_security_requirements_details', description: 'Get CMMC assessment security requirements details dashboard information', required: false}),
    cmmc_requirement_objectives_details: Args.string({name: 'cmmc_requirement_objectives_details', description: 'Get CMMC assessment requirement objectives details dashboard information', required: false}),
  }

  // skipcq: JS-R1005 - Ignore Function cyclomatic complexity high threshold
  // eslint-disable-next-line complexity
  async run(): Promise<void> { // skipcq: JS-0044
    const {args, flags} = await this.parse(EmasserGetDashboards)
    const apiCxn = new ApiConnection()

    switch (args.name) {
      case 'status_details': {
        const getDashboard = new SystemStatusDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemStatusDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'terms_conditions_details': {
        const getDashboard = new SystemTermsConditionsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemTermsConditionsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'terms_conditions_summary': {
        const getDashboard = new SystemTermsConditionsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemTermsConditionsSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'connectivity_ccsd_details': {
        const getDashboard = new SystemConnectivityCCSDDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemConnectivityCcsdDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'connectivity_ccsd_summary': {
        const getDashboard = new SystemConnectivityCCSDDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemConnectivityCcsdSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'atc_iatc_details': {
        const getDashboard = new SystemATCIATCDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemAtcIatcDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'questionnaire_summary': {
        const getDashboard = new SystemQuestionnaireDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemQuestionnaireSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'questionnaire_details': {
        const getDashboard = new SystemQuestionnaireDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemQuestionnaireDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'workflows_history_summary': {
        const getDashboard = new SystemWorkflowsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemWorkflowsHistorySummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'workflows_history_details': {
        const getDashboard = new SystemWorkflowsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemWorkflowsHistoryDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'workflows_history_stage_details': {
        const getDashboard = new SystemWorkflowsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemWorkflowsHistoryStageDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'control_compliance_summary': {
        const getDashboard = new SystemSecurityControlsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemControlComplianceSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'security_control_details': {
        const getDashboard = new SystemSecurityControlsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemSecurityControlDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'assessment_procedures_details': {
        const getDashboard = new SystemSecurityControlsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemAssessmentProceduresDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'poam_summary': {
        const getDashboard = new SystemPOAMDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemPoamSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'poam_details': {
        const getDashboard = new SystemPOAMDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemPoamDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'artifacts_summary': {
        const getDashboard = new SystemArtifactsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemArtifactsSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'artifacts_details': {
        const getDashboard = new SystemArtifactsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemArtifactsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'hardware_summary': {
        const getDashboard = new SystemHardwareDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemHardwareSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'hardware_details': {
        const getDashboard = new SystemHardwareDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemHardwareDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'sensor_hardware_summary': {
        const getDashboard = new SystemSensorHardwareDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemSensorHardwareSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'sensor_hardware_details': {
        const getDashboard = new SystemSensorHardwareDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemSensorHardwareDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'software_summary': {
        const getDashboard = new SystemSoftwareDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemSoftwareSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'software_details': {
        const getDashboard = new SystemSoftwareDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemSoftwareDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'sensor_software_summary': {
        const getDashboard = new SystemSensorSoftwareDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemSensorSoftwareSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'sensor_software_details': {
        const getDashboard = new SystemSensorSoftwareDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemSensorSoftwareDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'sensor_software_counts': {
        const getDashboard = new SystemSensorSoftwareDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemSensorSoftwareCounts(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'critical_assets_summary': {
        const getDashboard = new SystemCriticalAssetsDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemCriticalAssetsSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'vulnerability_summary': {
        const getDashboard = new SystemVulnerabilityDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemVulnerabilitySummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'device_findings_summary': {
        const getDashboard = new SystemDeviceFindingsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemDeviceFindingsSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'device_findings_details': {
        const getDashboard = new SystemDeviceFindingsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemDeviceFindingsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'application_findings_summary': {
        const getDashboard = new SystemApplicationFindingsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemApplicationFindingsSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'application_findings_details': {
        const getDashboard = new SystemApplicationFindingsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemApplicationFindingsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'ports_protocols_summary': {
        const getDashboard = new SystemPortsProtocolsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemPortsProtocolsSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'ports_protocols_details': {
        const getDashboard = new SystemPortsProtocolsDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemPortsProtocolsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'integration_status_summary': {
        const getDashboard = new SystemCONMONIntegrationStatusDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemCommonIntegrationStatusSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'associations_details': {
        const getDashboard = new SystemAssociationsDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemAssociationsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'user_assignments_details': {
        const getDashboard = new UserSystemAssignmentsDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getUserSystemAssignmentsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'org_migration_status': {
        const getDashboard = new OrganizationMigrationStatusDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getOrganizationMigrationStatusSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'system_migration_status': {
        const getDashboard = new SystemMigrationStatusDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemMigrationStatusSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'fisma_metrics': {
        const getDashboard = new SystemFISMAMetricsDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemFismaMetrics(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'coast_guard_fisma_metrics': {
        const getDashboard = new CoastGuardSystemFISMAMetricsDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getCoastGuardSystemFismaMetrics(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'privacy_summary': {
        const getDashboard = new SystemPrivacyDashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getSystemPrivacySummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'fisma_saop_summary': {
        const getDashboard = new VAOMBFISMADashboardApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getVaOmbFsmaSaopSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'va_icamp_tableau_poam_details': {
        const getDashboard = new VASystemDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getVaSystemIcampTableauPoamDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'va_aa_summary': {
        const getDashboard = new VASystemDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getVaSystemAaSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'va_a2_summary': {
        const getDashboard = new VASystemDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getVaSystemA2Summary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'va_pl_109_summary': {
        const getDashboard = new VASystemDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getVaSystemPl109ReportingSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'va_fisma_inventory_summary': {
        const getDashboard = new VASystemDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getVaSystemFismaInvetorySummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'va_fisma_inventory_crypto_summary': {
        const getDashboard = new VASystemDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getVaSystemFismaInvetoryCryptoSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'va_threat_risk_summary': {
        const getDashboard = new VASystemDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getVaSystemThreatRiskSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'va_threat_source_details': {
        const getDashboard = new VASystemDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getVaSystemThreatSourceDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'va_threat_architecture_details': {
        const getDashboard = new VASystemDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getVaSystemThreatArchitectureDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'cmmc_status_summary': {
        const getDashboard = new CMMCAssessmentDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getCmmcAssessmentStatusSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'cmmc_compliance_summary': {
        const getDashboard = new CMMCAssessmentDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getCmmcAssessmentRequirementsComplianceSummary(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'cmmc_security_requirements_details': {
        const getDashboard = new CMMCAssessmentDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getCmmcAssessmentSecurityRequirementsDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      case 'cmmc_requirement_objectives_details': {
        const getDashboard = new CMMCAssessmentDashboardsApi(apiCxn.configuration, apiCxn.basePath, apiCxn.axiosInstances)
        // Order is important here
        getDashboard.getCmmcAssessmentRequirementObjectivesDetails(flags.orgId, flags.excludeInherited, flags.pageIndex, flags.pageSize).then((response: object) => {
          console.log(colorize(outputFormat(response)))
        }).catch((error: unknown) => displayError(error, 'Dashboard'))

        break
      }

      default: {
        throw this.error
      }
    }
  }

  // skipcq: JS-0116 - Base class (CommandError) expects expected catch to be async
  async catch(error: unknown) {
    if (error instanceof Error) {
      this.warn(error.message)
    } else {
      const suggestions = 'get dashboards [-h or --help] for available arguments'
      this.warn('Invalid arguments\nTry this:\n\t' + suggestions)
    }
  }
}
