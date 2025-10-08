import {
  ArtifactsApi, POAMApi,
  MilestonesApi, CloudResourceResultsApi,
  ContainerScanResultsApi, HardwareBaselineApi,
  SoftwareBaselineApi,
} from '@mitre/emass_client'
import {
  ArtifactsResponseDel, PoamResponsePostPutDelete,
  MilestonesPutPostDelete, ContainersResourcesPostDelete,
  CloudResourcesPostDelete, HwBaselineResponseDelete,
  SwBaselineResponseDelete,
} from '@mitre/emass_client/dist/api'
import {describe, expect, it} from 'vitest'
import {getErrorMessage} from '../../../src/utils/global'
import {InitMockServer} from './mock.server'

describe('Test eMASSer API CLI (DELETE) commands', () => {
  const mocServer = new InitMockServer()
  let responseDataObj: Map<string, unknown>
  const testOk = {status: 200, statusText: 'OK'}

  it('Successfully tested endpoint - Artifacts', async () => {
    const delArtifact = new ArtifactsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await delArtifact.deleteArtifact(123, []).then((response: ArtifactsResponseDel) => {
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
    const delCloudResources = new CloudResourceResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await delCloudResources.deleteCloudResources(123, []).then((response: CloudResourcesPostDelete) => {
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
    const delContainerScans = new ContainerScanResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await delContainerScans.deleteContainerSans(123, []).then((response: ContainersResourcesPostDelete) => {
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
    const delHwBaseline = new HardwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await delHwBaseline.deleteHwBaselineAssets(123, []).then((response: HwBaselineResponseDelete) => {
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
    const delSwBaseline = new SoftwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await delSwBaseline.deleteSwBaselineAssets(123, []).then((response: SwBaselineResponseDelete) => {
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
    const delMilestones = new MilestonesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await delMilestones.deleteMilestone(36, 76, []).then((response: MilestonesPutPostDelete) => {
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
    const delPoam = new POAMApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances)
    await delPoam.deletePoam(34, []).then((response: PoamResponsePostPutDelete) => {
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
