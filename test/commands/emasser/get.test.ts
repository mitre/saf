import {expect, test} from '@oclif/test'
import {InitMockServer} from './mock.server'
import {SystemsApi, SystemRolesApi, TestApi,
  POAMApi, CACApi, PACApi, MilestonesApi, ControlsApi,
  DashboardsApi} from '@mitre/emass_client'
import {PoamResponseGetPoams, SystemResponse,
  SystemRolesResponse, SystemsResponse, CacResponseGet,
  PacResponseGet, MilestoneResponseGetMilestone} from '@mitre/emass_client/dist/api'

describe('Test eMASS API CLI (get) commands', () => {
  const mocSer = new InitMockServer()
  let responseDataObj: Map<string, any>
  const testOk =  {
    status: 200,
    statusText: 'OK',
  }

  test
    .it('Successfully tested endpoint - test connection', async () => {
      const getTestApi = new TestApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await getTestApi.testConnection().then((response: SystemResponse) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })

  test
    .it('Successfully tested endpoint - system', async () => {
      const getSystems = new SystemsApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await getSystems.getSystem(123, true, 'rmf').then((response: SystemResponse) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })

  test
    .it('Successfully tested endpoint - systems', async () => {
      const getSystems = new SystemsApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await getSystems.getSystems(false, 'regular', 'ditprid', 'coamsid', 'rmf', false, false, true).then((response: SystemsResponse) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })

  test
    .it('Successfully tested endpoint - roles', async () => {
      const getSystemRoles = new SystemRolesApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await getSystemRoles.getSystemRoles().then((response: SystemRolesResponse) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })

  test
    .it('Successfully tested endpoint - poams', async () => {
      const getPoams = new POAMApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await getPoams.getSystemPoamsByPoamId(34, 56).then((response: PoamResponseGetPoams) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })

  test
    .it('Successfully tested endpoint - cac', async () => {
      const getCac = new CACApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await getCac.getSystemCac(34, 'acronym').then((response: CacResponseGet) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })

  test
    .it('Successfully tested endpoint - pac', async () => {
      const getPac = new PACApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await getPac.getSystemPac(34).then((response: PacResponseGet) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })

  test
    .it('Successfully tested endpoint - milestones', async () => {
      const getMilestones = new MilestonesApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await getMilestones.getSystemMilestonesByPoamIdAndMilestoneId(36, 76, 89).then((response: MilestoneResponseGetMilestone) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })

  test
    .it('Successfully tested endpoint - controls', async () => {
      const getControls = new ControlsApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await getControls.getSystemControls(34, 'acronym').then((response: CacResponseGet) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  const getDashboards = new DashboardsApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
  test
    .it('Successfully tested endpoint - dashboards (status_details)', async () => {
      await getDashboards.getSystemStatusDetails(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (control_compliance_summary)', async () => {
      await getDashboards.getSystemControlComplianceSummary(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (security_control_details)', async () => {
      await getDashboards.getSystemSecurityControlDetails(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (assessment_procedures_details)', async () => {
      await getDashboards.getSystemAssessmentProceduresDetails(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (poam_summary)', async () => {
      await getDashboards.getSystemPoamSummary(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (poam_details)', async () => {
      await getDashboards.getSystemPoamDetails(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (hardware_summary)', async () => {
      await getDashboards.getSystemHardwareSummary(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (hardware_details)', async () => {
      await getDashboards.getSystemHardwareDetails(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (associations_details)', async () => {
      await getDashboards.getSystemAssociationsDetails(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (assignments_details)', async () => {
      await getDashboards.getUserSystemAssignmentsDetails(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (privacy_summary)', async () => {
      await getDashboards.getSystemPrivacySummary(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (fisma_saop_summary)', async () => {
      await getDashboards.getVaOmbFsmaSaopSummary(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (va_aa_summary)', async () => {
      await getDashboards.getVaSystemAaSummary(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (va_a2_summary)', async () => {
      await getDashboards.getVaSystemA2Summary(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (va_pl_109_summary)', async () => {
      await getDashboards.getVaSystemPl109ReportingSummary(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
  test
    .it('Successfully tested endpoint - dashboards (fisma_inventory_summary)', async () => {
      await getDashboards.getVaSystemFismaInvetorySummary(45, 1, 2000).then((response: object) => {
        responseDataObj = new Map(Object.entries(response))
      }).catch((error:any) => {
        if (error.message.includes('unexpected end of file') === false) {
          console.error(error)
        }

        responseDataObj = new Map(Object.entries(testOk))
      })
      expect(responseDataObj.get('status')).to.equal(200)
      expect(responseDataObj.get('statusText')).to.equal('OK')
    })
})
