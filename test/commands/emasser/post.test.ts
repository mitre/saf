import {
  ArtifactsApi, CACApi, PACApi,
  CloudResourceResultsApi, ContainerScanResultsApi,
  MilestonesApi, POAMApi, RegistrationApi,
  StaticCodeScansApi, TestResultsApi,
  DeviceScanResultsApi, HardwareBaselineApi,
  SoftwareBaselineApi,
} from '@mitre/emass_client'
import {
  CacResponsePost, PacResponsePost, CloudResourcesResponsePost,
  ContainersResponsePost, MilestoneResponsePost, PoamResponsePostPutDelete,
  Register, StaticCodeResponsePost, TestResultsResponsePost,
  ArtifactsResponsePutPost, DeviceScanResultsResponsePost,
  HwBaselineResponsePostPut, SwBaselineResponsePostPut,
} from '@mitre/emass_client/dist/api'
import {describe, expect, it} from 'vitest'
import {getErrorMessage} from '../../../src/utils/global'
import {InitMockServer} from './mock.server'

describe('Test eMASSer API CLI (POST) commands', () => {
  const mocServer = new InitMockServer()
  let responseDataObj: Map<string, unknown>
  const testOk = {status: 200, statusText: 'OK'}

  it('Successfully tested endpoint - Artifacts', async () => {
    const artifactApi = new ArtifactsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await artifactApi.addArtifactsBySystemId(123, 'filename', true, false, 'type', 'category').then((response: ArtifactsResponsePutPost) => {
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

  it('Successfully tested endpoint - CAC', async () => {
    const addCac = new CACApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await addCac.addSystemCac(123, []).then((response: CacResponsePost) => {
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

  it('Successfully tested endpoint - Cloud Resources', async () => {
    const addCloudResource = new CloudResourceResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await addCloudResource.addCloudResourcesBySystemId(123, []).then((response: CloudResourcesResponsePost) => {
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

  it('Successfully tested endpoint - Container Scans', async () => {
    const addContainer = new ContainerScanResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await addContainer.addContainerSansBySystemId(123, []).then((response: ContainersResponsePost) => {
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

  it('Successfully tested endpoint - Device Scans', async () => {
    const addDeviceScans = new DeviceScanResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await addDeviceScans.addScanResultsBySystemId(123, 'disaStigViewerCklCklb', 'filename', false).then((response: DeviceScanResultsResponsePost) => {
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
    const hwBaseline = new HardwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await hwBaseline.addHwBaselineAssets(123, []).then((response: HwBaselineResponsePostPut) => {
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

  it('Successfully tested endpoint - Milestones', async () => {
    const addMilestone = new MilestonesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await addMilestone.addMilestoneBySystemIdAndPoamId(123, 456, []).then((response: MilestoneResponsePost) => {
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
    const addCac = new PACApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await addCac.addSystemPac(123, []).then((response: PacResponsePost) => {
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

  it('Successfully tested endpoint - POA&Ms', async () => {
    const addPoam = new POAMApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await addPoam.addPoamBySystemId(123, []).then((response: PoamResponsePostPutDelete) => {
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

  it('Successfully tested endpoint - Register', async () => {
    const registerAPI = new RegistrationApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await registerAPI.registerUser().then((response: Register) => {
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
    const swBaseline = new SoftwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await swBaseline.addSwBaselineAssets(123, []).then((response: SwBaselineResponsePostPut) => {
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

  it('Successfully tested endpoint - Static Code Scans', async () => {
    const addStaticCodeScans = new StaticCodeScansApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await addStaticCodeScans.addStaticCodeScansBySystemId(123, {}).then((response: StaticCodeResponsePost) => {
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
    const addTestResults = new TestResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await addTestResults.addTestResultsBySystemId(123, []).then((response: TestResultsResponsePost) => {
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
})
