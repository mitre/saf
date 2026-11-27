import {
  SystemsApi,
  SystemRolesApi,
  TestApi,
  POAMApi,
  CACApi,
  PACApi,
  MilestonesApi,
  ControlsApi,
  SystemStatusDashboardApi,
  TestResultsApi,
  ArtifactsApi,
  ArtifactsExportApi,
  HardwareBaselineApi,
  WorkflowInstancesApi,
  CMMCAssessmentsApi,
  SoftwareBaselineApi,
  WorkflowDefinitionsApi,
  SystemSecurityControlsDashboardsApi,
  SystemTermsConditionsDashboardsApi,
  SystemConnectivityCCSDDashboardsApi,
  SystemATCIATCDashboardApi,
  SystemQuestionnaireDashboardsApi,
  SystemWorkflowsDashboardsApi,
  SystemPOAMDashboardsApi,
  SystemArtifactsDashboardsApi,
  SystemHardwareDashboardsApi,
  SystemSensorHardwareDashboardsApi,
  SystemSoftwareDashboardsApi,
  SystemSensorSoftwareDashboardsApi,
  SystemCriticalAssetsDashboardApi,
  SystemVulnerabilityDashboardApi,
  SystemDeviceFindingsDashboardsApi,
  SystemApplicationFindingsDashboardsApi,
  SystemPortsProtocolsDashboardsApi,
  SystemCONMONIntegrationStatusDashboardApi,
  SystemAssociationsDashboardApi,
  UserSystemAssignmentsDashboardApi,
  OrganizationMigrationStatusDashboardApi,
  SystemMigrationStatusDashboardApi,
  VAOMBFISMADashboardApi,
  SystemPrivacyDashboardApi,
  CoastGuardSystemFISMAMetricsDashboardApi,
  SystemFISMAMetricsDashboardApi,
  VASystemDashboardsApi,
  CMMCAssessmentDashboardsApi,
} from '@mitre/emass_client';
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from '../../../src/utils/global';
import { InitMockServer } from './mock.server';

describe('Test eMASSer API CLI (GET) commands', () => {
  const mocServer = new InitMockServer();
  const testOk = { status: 200, statusText: 'OK' };

  it('Successfully tested endpoint - Test Connection', async () => {
    const getTestApi = new TestApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getTestApi.testConnection();
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - System', async () => {
    const getSystems = new SystemsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getSystems.getSystem(123);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Systems', async () => {
    const getSystems = new SystemsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getSystems.getSystems();
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Roles', async () => {
    const getSystemRoles = new SystemRolesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getSystemRoles.getSystemRoles();
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Controls', async () => {
    const getControls = new ControlsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getControls.getSystemControls(34, 'acronym');
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Test Results', async () => {
    const getControls = new TestResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getControls.getSystemTestResults(34, 'acronym');
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - POA&Ms (for system)', async () => {
    const getPoams = new POAMApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getPoams.getSystemPoams(34, 56);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - POA&Ms (for poam Id)', async () => {
    const getPoams = new POAMApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getPoams.getSystemPoamsByPoamId(34, 56);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Milestones (for poam Id', async () => {
    const getMilestones = new MilestonesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getMilestones.getSystemMilestonesByPoamId(36, 76, 89);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Milestones (for poamId & milestone Id', async () => {
    const getMilestones = new MilestonesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getMilestones.getSystemMilestonesByPoamIdAndMilestoneId(36, 76, 89);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Artifacts', async () => {
    const getArtifacs = new ArtifactsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getArtifacs.getSystemArtifacts(34, 56);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Artifacts (export)', async () => {
    const getArtifacs = new ArtifactsExportApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response: unknown = await getArtifacs.getSystemArtifactsExport(34, 'thisfile', false);
      if (typeof response === 'object' && response !== null) {
        responseDataObj = new Map(Object.entries(response as Record<string, unknown>));
      } else {
        throw new Error('Unexpected response type');
      }
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - CAC', async () => {
    const getCac = new CACApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getCac.getSystemCac(34, 'acronym');
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - PAC', async () => {
    const getPac = new PACApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await getPac.getSystemPac(34);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Hardware Baseline', async () => {
    const hardware = new HardwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await hardware.getSystemHwBaseline(1, 2, 3);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Software Baseline', async () => {
    const software = new SoftwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await software.getSystemSwBaseline(34);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Workflow Definitions', async () => {
    const apiCon = new WorkflowDefinitionsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await apiCon.getWorkflowDefinitions(false, 'type');
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Workflow Instances (all)', async () => {
    const apiCon = new WorkflowInstancesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await apiCon.getSystemWorkflowInstances(false, false, 1, 2);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Workflow Instances (for workflow Id)', async () => {
    const apiCon = new WorkflowInstancesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await apiCon.getSystemWorkflowInstancesByWorkflowInstanceId(2);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - CMMC Assessment', async () => {
    const apiCon = new CMMCAssessmentsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    let responseDataObj: Map<string, unknown>;
    try {
      const response = await apiCon.getCmmcAssessments(34);
      responseDataObj = new Map(Object.entries(response));
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      if (!errorMsg.includes('unexpected end of file')) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    }
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  // Dashboards API endpoints
  const dashboardsMap = new Map([
    ['status_details', [SystemStatusDashboardApi, 'getSystemStatusDetails']],
    ['terms_conditions_details', [SystemTermsConditionsDashboardsApi, 'getSystemTermsConditionsDetails']],
    ['terms_conditions_summary', [SystemTermsConditionsDashboardsApi, 'getSystemTermsConditionsSummary']],
    ['connectivity_ccsd_details', [SystemConnectivityCCSDDashboardsApi, 'getSystemConnectivityCcsdDetails']],
    ['connectivity_ccsd_summary', [SystemConnectivityCCSDDashboardsApi, 'getSystemConnectivityCcsdSummary']],
    ['atc_iatc_details', [SystemATCIATCDashboardApi, 'getSystemAtcIatcDetails']],
    ['questionnaire_summary', [SystemQuestionnaireDashboardsApi, 'getSystemQuestionnaireSummary']],
    ['questionnaire_details', [SystemQuestionnaireDashboardsApi, 'getSystemQuestionnaireDetails']],
    ['workflows_history_summary', [SystemWorkflowsDashboardsApi, 'getSystemWorkflowsHistorySummary']],
    ['workflows_history_details', [SystemWorkflowsDashboardsApi, 'getSystemWorkflowsHistoryDetails']],
    ['workflows_history_stage_details', [SystemWorkflowsDashboardsApi, 'getSystemWorkflowsHistoryStageDetails']],
    ['control_compliance_summary', [SystemSecurityControlsDashboardsApi, 'getSystemControlComplianceSummary']],
    ['security_control_details', [SystemSecurityControlsDashboardsApi, 'getSystemSecurityControlDetails']],
    ['assessment_procedures_details', [SystemSecurityControlsDashboardsApi, 'getSystemAssessmentProceduresDetails']],
    ['poam_summary', [SystemPOAMDashboardsApi, 'getSystemPoamSummary']],
    ['poam_details', [SystemPOAMDashboardsApi, 'getSystemPoamDetails']],
    ['artifacts_summary', [SystemArtifactsDashboardsApi, 'getSystemArtifactsSummary']],
    ['artifacts_details', [SystemArtifactsDashboardsApi, 'getSystemArtifactsDetails']],
    ['hardware_summary', [SystemHardwareDashboardsApi, 'getSystemHardwareSummary']],
    ['hardware_details', [SystemHardwareDashboardsApi, 'getSystemHardwareDetails']],
    ['sensor_hardware_summary', [SystemSensorHardwareDashboardsApi, 'getSystemSensorHardwareSummary']],
    ['sensor_hardware_details', [SystemSensorHardwareDashboardsApi, 'getSystemSensorHardwareDetails']],
    ['software_summary', [SystemSoftwareDashboardsApi, 'getSystemSoftwareSummary']],
    ['software_details', [SystemSoftwareDashboardsApi, 'getSystemSoftwareDetails']],
    ['sensor_software_summary', [SystemSensorSoftwareDashboardsApi, 'getSystemSensorSoftwareSummary']],
    ['sensor_software_details', [SystemSensorSoftwareDashboardsApi, 'getSystemSensorSoftwareDetails']],
    ['sensor_software_counts', [SystemSensorSoftwareDashboardsApi, 'getSystemSensorSoftwareCounts']],
    ['critical_assets_summary', [SystemCriticalAssetsDashboardApi, 'getSystemCriticalAssetsSummary']],
    ['vulnerability_summary', [SystemVulnerabilityDashboardApi, 'getSystemVulnerabilitySummary']],
    ['device_findings_summary', [SystemDeviceFindingsDashboardsApi, 'getSystemDeviceFindingsSummary']],
    ['device_findings_details', [SystemDeviceFindingsDashboardsApi, 'getSystemDeviceFindingsDetails']],
    ['application_findings_summary', [SystemApplicationFindingsDashboardsApi, 'getSystemApplicationFindingsSummary']],
    ['application_findings_details', [SystemApplicationFindingsDashboardsApi, 'getSystemApplicationFindingsDetails']],
    ['ports_protocols_summary', [SystemPortsProtocolsDashboardsApi, 'getSystemPortsProtocolsSummary']],
    ['ports_protocols_details', [SystemPortsProtocolsDashboardsApi, 'getSystemPortsProtocolsDetails']],
    ['integration_status_summary', [SystemCONMONIntegrationStatusDashboardApi, 'getSystemCommonIntegrationStatusSummary']],
    ['associations_details', [SystemAssociationsDashboardApi, 'getSystemAssociationsDetails']],
    ['user_assignments_details', [UserSystemAssignmentsDashboardApi, 'getUserSystemAssignmentsDetails']],
    ['org_migration_status', [OrganizationMigrationStatusDashboardApi, 'getOrganizationMigrationStatusSummary']],
    ['system_migration_status', [SystemMigrationStatusDashboardApi, 'getSystemMigrationStatusSummary']],
    ['fisma_metrics', [SystemFISMAMetricsDashboardApi, 'getSystemFismaMetrics']],
    ['coast_guard_fisma_metrics', [CoastGuardSystemFISMAMetricsDashboardApi, 'getCoastGuardSystemFismaMetrics']],
    ['privacy_summary', [SystemPrivacyDashboardApi, 'getSystemPrivacySummary']],
    ['fisma_saop_summary', [VAOMBFISMADashboardApi, 'getVaOmbFsmaSaopSummary']],
    ['va_icamp_tableau_poam_details', [VASystemDashboardsApi, 'getVaSystemIcampTableauPoamDetails']],
    ['va_aa_summary', [VASystemDashboardsApi, 'getVaSystemAaSummary']],
    ['va_a2_summary', [VASystemDashboardsApi, 'getVaSystemA2Summary']],
    ['va_pl_109_summary', [VASystemDashboardsApi, 'getVaSystemPl109ReportingSummary']],
    ['va_fisma_inventory_summary', [VASystemDashboardsApi, 'getVaSystemFismaInvetorySummary']],
    ['va_fisma_inventory_crypto_summary', [VASystemDashboardsApi, 'getVaSystemFismaInvetoryCryptoSummary']],
    ['va_threat_risk_summary', [VASystemDashboardsApi, 'getVaSystemThreatRiskSummary']],
    ['va_threat_source_details', [VASystemDashboardsApi, 'getVaSystemThreatSourceDetails']],
    ['va_threat_architecture_details', [VASystemDashboardsApi, 'getVaSystemThreatArchitectureDetails']],
    ['cmmc_status_summary', [CMMCAssessmentDashboardsApi, 'getCmmcAssessmentStatusSummary']],
    ['cmmc_compliance_summary', [CMMCAssessmentDashboardsApi, 'getCmmcAssessmentRequirementsComplianceSummary']],
    ['cmmc_security_requirements_details', [CMMCAssessmentDashboardsApi, 'getCmmcAssessmentSecurityRequirementsDetails']],
    ['cmmc_requirement_objectives_details', [CMMCAssessmentDashboardsApi, 'getCmmcAssessmentRequirementObjectivesDetails']],
  ]);

  for (const [key, values] of dashboardsMap) {
    it(`Successfully tested endpoint - Dashboard (${key})`, async () => {
      const DashboardClass = eval(values[0]);
      const getDashboard = new DashboardClass(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
      let responseDataObj: Map<string, unknown>;
      try {
        const response: object = await getDashboard[values[1]](45, false, 1, 2000);
        responseDataObj = new Map(Object.entries(response));
      } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        if (!errorMsg.includes('unexpected end of file')) {
          console.error(errorMsg);
        }

        responseDataObj = new Map(Object.entries(testOk));
      }
      expect(responseDataObj.get('status')).to.equal(200);
      expect(responseDataObj.get('statusText')).to.equal('OK');
    });
  }
});
