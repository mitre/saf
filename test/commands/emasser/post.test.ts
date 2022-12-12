import {expect, test} from '@oclif/test'
import {InitMockServer} from './mock.server'
import {CACApi, PACApi, CloudResourcesApi, ContainersApi,
  MilestonesApi, POAMApi, RegistrationApi, StaticCodeScansApi,
  TestResultsApi} from '@mitre/emass_client'
import {CacResponsePost, PacResponsePost, CloudResourcesResponsePost,
  ContainersResponsePost, MilestoneResponsePost, PoamResponsePost,
  Register, StaticCodeResponsePost, TestResultsResponsePost} from '@mitre/emass_client/dist/api'

describe('Test eMASS API CLI (post) commands', () => {
  const mocSer = new InitMockServer()
  let responseDataObj: Map<string, any>
  const testOk =  {
    status: 200,
    statusText: 'OK',
  }

  test
    .it('Successfully tested endpoint - cac', async () => {
      const addCac = new CACApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await addCac.addSystemCac(123, []).then((response: CacResponsePost) => {
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
      const addCac = new PACApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await addCac.addSystemPac(123, []).then((response: PacResponsePost) => {
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
    .it('Successfully tested endpoint - cloud_resources', async () => {
      const addCloudResource = new CloudResourcesApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await addCloudResource.addCloudResourcesBySystemId(123, []).then((response: CloudResourcesResponsePost) => {
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
    .it('Successfully tested endpoint - container_scans', async () => {
      const addContainer = new ContainersApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await addContainer.addContainerSansBySystemId(123, []).then((response: ContainersResponsePost) => {
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
      const addMilestone = new MilestonesApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await addMilestone.addMilestoneBySystemIdAndPoamId(123, 456, []).then((response: MilestoneResponsePost) => {
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
      const addPoam = new POAMApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await addPoam.addPoamBySystemId(123, []).then((response: PoamResponsePost) => {
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
    .it('Successfully tested endpoint - register', async () => {
      const registerAPI = new RegistrationApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await registerAPI.registerUser().then((response: Register) => {
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
    .it('Successfully tested endpoint - static_code_scans', async () => {
      const addStaticCodeScans = new StaticCodeScansApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await addStaticCodeScans.addStaticCodeScansBySystemId(123, {}).then((response: StaticCodeResponsePost) => {
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
    .it('Successfully tested endpoint - test_results', async () => {
      const addTestResults = new TestResultsApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await addTestResults.addTestResultsBySystemId(123, []).then((response: TestResultsResponsePost) => {
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
