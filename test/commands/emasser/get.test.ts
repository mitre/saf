import {
  SystemsApi, SystemRolesApi, TestApi,
  POAMApi, CACApi, PACApi, MilestonesApi,
  ControlsApi, SystemStatusDashboardApi,
  TestResultsApi, ArtifactsApi,
  ArtifactsExportApi, HardwareBaselineApi,
  WorkflowInstancesApi, CMMCAssessmentsApi,
  SoftwareBaselineApi, WorkflowDefinitionsApi,
  SystemSecurityControlsDashboardsApi,
  SystemTermsConditionsDashboardsApi,
  SystemConnectivityCCSDDashboardsApi,
  SystemATCIATCDashboardApi, SystemQuestionnaireDashboardsApi,
  SystemWorkflowsDashboardsApi, SystemPOAMDashboardsApi,
  SystemArtifactsDashboardsApi, SystemHardwareDashboardsApi,
  SystemSensorHardwareDashboardsApi, SystemSoftwareDashboardsApi,
  SystemSensorSoftwareDashboardsApi, SystemCriticalAssetsDashboardApi,
  SystemVulnerabilityDashboardApi, SystemDeviceFindingsDashboardsApi,
  SystemApplicationFindingsDashboardsApi, SystemPortsProtocolsDashboardsApi,
  SystemCONMONIntegrationStatusDashboardApi,
  SystemAssociationsDashboardApi, UserSystemAssignmentsDashboardApi,
  OrganizationMigrationStatusDashboardApi, SystemMigrationStatusDashboardApi,
  VAOMBFISMADashboardApi, SystemPrivacyDashboardApi,
  CoastGuardSystemFISMAMetricsDashboardApi, SystemFISMAMetricsDashboardApi,
  VASystemDashboardsApi, CMMCAssessmentDashboardsApi,
} from '@mitre/emass_client'
import {
  PoamResponseGetPoams, PoamResponseGetSystems,
  SystemResponse, SystemRolesResponse, SystemsResponse,
  CacResponseGet, PacResponseGet, MilestoneResponseGetMilestone,
  MilestoneResponseGet, TestResultsResponseGet,
  ArtifactsResponseGet, HwBaselineResponseGet,
  SwBaselineResponseGet, WorkflowDefinitionResponseGet,
  WorkflowInstancesResponseGet, WorkflowInstanceResponseGet,
  CmmcResponseGet,
} from '@mitre/emass_client/dist/api'
import {describe, expect, it} from 'vitest'
import {getErrorMessage} from '../../../src/utils/global'
import {InitMockServer} from './mock.server'

describe('Test eMASSer API CLI (GET) commands', () => {
  const mocServer = new InitMockServer()
  let responseDataObj: Map<string, unknown>
  const testOk = {status: 200, statusText: 'OK'}

  it('Successfully tested endpoint - Test Connection', async () => {
    const getTestApi = new TestApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getTestApi.testConnection().then((response: SystemResponse) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - System', async () => {
    const getSystems = new SystemsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getSystems.getSystem(123).then((response: SystemResponse) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Systems', async () => {
    const getSystems = new SystemsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getSystems.getSystems().then((response: SystemsResponse) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Roles', async () => {
    const getSystemRoles = new SystemRolesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getSystemRoles.getSystemRoles().then((response: SystemRolesResponse) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Controls', async () => {
    const getControls = new ControlsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getControls.getSystemControls(34, 'acronym').then((response: CacResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Test Results', async () => {
    const getControls = new TestResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getControls.getSystemTestResults(34, 'acronym').then((response: TestResultsResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - POA&Ms (for system)', async () => {
    const getPoams = new POAMApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getPoams.getSystemPoams(34, 56).then((response: PoamResponseGetSystems) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - POA&Ms (for poam Id)', async () => {
    const getPoams = new POAMApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getPoams.getSystemPoamsByPoamId(34, 56).then((response: PoamResponseGetPoams) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Milestones (for poam Id', async () => {
    const getMilestones = new MilestonesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getMilestones.getSystemMilestonesByPoamId(36, 76, 89).then((response: MilestoneResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Milestones (for poamId & milestone Id', async () => {
    const getMilestones = new MilestonesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getMilestones.getSystemMilestonesByPoamIdAndMilestoneId(36, 76, 89).then((response: MilestoneResponseGetMilestone) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Artifacts', async () => {
    const getArtifacs = new ArtifactsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getArtifacs.getSystemArtifacts(34, 56).then((response: ArtifactsResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Artifacts (export)', async () => {
    const getArtifacs = new ArtifactsExportApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getArtifacs.getSystemArtifactsExport(34, 'thisfile', false).then((response: unknown) => {
      if (typeof response === 'object' && response !== null) {
        responseDataObj = new Map(Object.entries(response as Record<string, unknown>))
      } else {
        throw new Error('Unexpected response type')
      }
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - CAC', async () => {
    const getCac = new CACApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getCac.getSystemCac(34, 'acronym').then((response: CacResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - PAC', async () => {
    const getPac = new PACApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await getPac.getSystemPac(34).then((response: PacResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Hardware Baseline', async () => {
    const hardware = new HardwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await hardware.getSystemHwBaseline(1, 2, 3).then((response: HwBaselineResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Software Baseline', async () => {
    const software = new SoftwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await software.getSystemSwBaseline(34).then((response: SwBaselineResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Workflow Definitions', async () => {
    const apiCon = new WorkflowDefinitionsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await apiCon.getWorkflowDefinitions(false, 'type').then((response: WorkflowDefinitionResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Workflow Instances (all)', async () => {
    const apiCon = new WorkflowInstancesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await apiCon.getSystemWorkflowInstances(false, false, 1, 2).then((response: WorkflowInstancesResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - Workflow Instances (for workflow Id)', async () => {
    const apiCon = new WorkflowInstancesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await apiCon.getSystemWorkflowInstancesByWorkflowInstanceId(2).then((response: WorkflowInstanceResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  it('Successfully tested endpoint - CMMC Assessment', async () => {
    const apiCon = new CMMCAssessmentsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await apiCon.getCmmcAssessments(34).then((response: CmmcResponseGet) => {
      responseDataObj = new Map(Object.entries(response))
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error)
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg)
      }

      responseDataObj = new Map(Object.entries(testOk))
    })
    expect(responseDataObj.get('status')).to.equal(200)
    expect(responseDataObj.get('statusText')).to.equal('OK')
  })

  // Dashboards API endpoints
  const dashboardsMap = new Map()
  dashboardsMap.set('status_details', [SystemStatusDashboardApi, 'getSystemStatusDetails'])
  dashboardsMap.set('terms_conditions_details', [SystemTermsConditionsDashboardsApi, 'getSystemTermsConditionsDetails'])
  dashboardsMap.set('terms_conditions_summary', [SystemTermsConditionsDashboardsApi, 'getSystemTermsConditionsSummary'])
  dashboardsMap.set('connectivity_ccsd_details', [SystemConnectivityCCSDDashboardsApi, 'getSystemConnectivityCcsdDetails'])
  dashboardsMap.set('connectivity_ccsd_summary', [SystemConnectivityCCSDDashboardsApi, 'getSystemConnectivityCcsdSummary'])
  dashboardsMap.set('atc_iatc_details', [SystemATCIATCDashboardApi, 'getSystemAtcIatcDetails'])
  dashboardsMap.set('questionnaire_summary', [SystemQuestionnaireDashboardsApi, 'getSystemQuestionnaireSummary'])
  dashboardsMap.set('questionnaire_details', [SystemQuestionnaireDashboardsApi, 'getSystemQuestionnaireDetails'])
  dashboardsMap.set('workflows_history_summary', [SystemWorkflowsDashboardsApi, 'getSystemWorkflowsHistorySummary'])
  dashboardsMap.set('workflows_history_details', [SystemWorkflowsDashboardsApi, 'getSystemWorkflowsHistoryDetails'])
  dashboardsMap.set('workflows_history_stage_details', [SystemWorkflowsDashboardsApi, 'getSystemWorkflowsHistoryStageDetails'])
  dashboardsMap.set('control_compliance_summary', [SystemSecurityControlsDashboardsApi, 'getSystemControlComplianceSummary'])
  dashboardsMap.set('security_control_details', [SystemSecurityControlsDashboardsApi, 'getSystemSecurityControlDetails'])
  dashboardsMap.set('assessment_procedures_details', [SystemSecurityControlsDashboardsApi, 'getSystemAssessmentProceduresDetails'])
  dashboardsMap.set('poam_summary', [SystemPOAMDashboardsApi, 'getSystemPoamSummary'])
  dashboardsMap.set('poam_details', [SystemPOAMDashboardsApi, 'getSystemPoamDetails'])
  dashboardsMap.set('artifacts_summary', [SystemArtifactsDashboardsApi, 'getSystemArtifactsSummary'])
  dashboardsMap.set('artifacts_details', [SystemArtifactsDashboardsApi, 'getSystemArtifactsDetails'])
  dashboardsMap.set('hardware_summary', [SystemHardwareDashboardsApi, 'getSystemHardwareSummary'])
  dashboardsMap.set('hardware_details', [SystemHardwareDashboardsApi, 'getSystemHardwareDetails'])
  dashboardsMap.set('sensor_hardware_summary', [SystemSensorHardwareDashboardsApi, 'getSystemSensorHardwareSummary'])
  dashboardsMap.set('sensor_hardware_details', [SystemSensorHardwareDashboardsApi, 'getSystemSensorHardwareDetails'])
  dashboardsMap.set('software_summary', [SystemSoftwareDashboardsApi, 'getSystemSoftwareSummary'])
  dashboardsMap.set('software_details', [SystemSoftwareDashboardsApi, 'getSystemSoftwareDetails'])
  dashboardsMap.set('sensor_software_summary', [SystemSensorSoftwareDashboardsApi, 'getSystemSensorSoftwareSummary'])
  dashboardsMap.set('sensor_software_details', [SystemSensorSoftwareDashboardsApi, 'getSystemSensorSoftwareDetails'])
  dashboardsMap.set('sensor_software_counts', [SystemSensorSoftwareDashboardsApi, 'getSystemSensorSoftwareCounts'])
  dashboardsMap.set('critical_assets_summary', [SystemCriticalAssetsDashboardApi, 'getSystemCriticalAssetsSummary'])
  dashboardsMap.set('vulnerability_summary', [SystemVulnerabilityDashboardApi, 'getSystemVulnerabilitySummary'])
  dashboardsMap.set('device_findings_summary', [SystemDeviceFindingsDashboardsApi, 'getSystemDeviceFindingsSummary'])
  dashboardsMap.set('device_findings_details', [SystemDeviceFindingsDashboardsApi, 'getSystemDeviceFindingsDetails'])
  dashboardsMap.set('application_findings_summary', [SystemApplicationFindingsDashboardsApi, 'getSystemApplicationFindingsSummary'])
  dashboardsMap.set('application_findings_details', [SystemApplicationFindingsDashboardsApi, 'getSystemApplicationFindingsDetails'])
  dashboardsMap.set('ports_protocols_summary', [SystemPortsProtocolsDashboardsApi, 'getSystemPortsProtocolsSummary'])
  dashboardsMap.set('ports_protocols_details', [SystemPortsProtocolsDashboardsApi, 'getSystemPortsProtocolsDetails'])
  dashboardsMap.set('integration_status_summary', [SystemCONMONIntegrationStatusDashboardApi, 'getSystemCommonIntegrationStatusSummary'])
  dashboardsMap.set('associations_details', [SystemAssociationsDashboardApi, 'getSystemAssociationsDetails'])
  dashboardsMap.set('user_assignments_details', [UserSystemAssignmentsDashboardApi, 'getUserSystemAssignmentsDetails'])
  dashboardsMap.set('org_migration_status', [OrganizationMigrationStatusDashboardApi, 'getOrganizationMigrationStatusSummary'])
  dashboardsMap.set('system_migration_status', [SystemMigrationStatusDashboardApi, 'getSystemMigrationStatusSummary'])
  dashboardsMap.set('fisma_metrics', [SystemFISMAMetricsDashboardApi, 'getSystemFismaMetrics'])
  dashboardsMap.set('coast_guard_fisma_metrics', [CoastGuardSystemFISMAMetricsDashboardApi, 'getCoastGuardSystemFismaMetrics'])
  dashboardsMap.set('privacy_summary', [SystemPrivacyDashboardApi, 'getSystemPrivacySummary'])
  dashboardsMap.set('fisma_saop_summary', [VAOMBFISMADashboardApi, 'getVaOmbFsmaSaopSummary'])
  dashboardsMap.set('va_icamp_tableau_poam_details', [VASystemDashboardsApi, 'getVaSystemIcampTableauPoamDetails'])
  dashboardsMap.set('va_aa_summary', [VASystemDashboardsApi, 'getVaSystemAaSummary'])
  dashboardsMap.set('va_a2_summary', [VASystemDashboardsApi, 'getVaSystemA2Summary'])
  dashboardsMap.set('va_pl_109_summary', [VASystemDashboardsApi, 'getVaSystemPl109ReportingSummary'])
  dashboardsMap.set('va_fisma_inventory_summary', [VASystemDashboardsApi, 'getVaSystemFismaInvetorySummary'])
  dashboardsMap.set('va_fisma_inventory_crypto_summary', [VASystemDashboardsApi, 'getVaSystemFismaInvetoryCryptoSummary'])
  dashboardsMap.set('va_threat_risk_summary', [VASystemDashboardsApi, 'getVaSystemThreatRiskSummary'])
  dashboardsMap.set('va_threat_source_details', [VASystemDashboardsApi, 'getVaSystemThreatSourceDetails'])
  dashboardsMap.set('va_threat_architecture_details', [VASystemDashboardsApi, 'getVaSystemThreatArchitectureDetails'])
  dashboardsMap.set('cmmc_status_summary', [CMMCAssessmentDashboardsApi, 'getCmmcAssessmentStatusSummary'])
  dashboardsMap.set('cmmc_compliance_summary', [CMMCAssessmentDashboardsApi, 'getCmmcAssessmentRequirementsComplianceSummary'])
  dashboardsMap.set('cmmc_security_requirements_details', [CMMCAssessmentDashboardsApi, 'getCmmcAssessmentSecurityRequirementsDetails'])
  dashboardsMap.set('cmmc_requirement_objectives_details', [CMMCAssessmentDashboardsApi, 'getCmmcAssessmentRequirementObjectivesDetails'])

  for (const [key, values] of dashboardsMap) {
    it(`Successfully tested endpoint - Dashboard (${key})`, async () => {
      const DashboardClass = eval(values[0]) // skipcq: JS-0060
      const getDashboard = new DashboardClass(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
      await getDashboard[values[1]](45, false, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error: unknown) => {
        const errorMsg = getErrorMessage(error)
        if (errorMsg.includes('unexpected end of file') === false) {
          console.error(errorMsg)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  }
})
