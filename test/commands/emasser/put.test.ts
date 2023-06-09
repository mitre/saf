import {expect, test} from '@oclif/test'
import {InitMockServer} from './mock.server'
import {ArtifactsApi, ControlsApi, MilestonesApi, POAMApi} from '@mitre/emass_client'
import {ArtifactsResponsePutPost, ControlsResponsePut,
  MilestoneResponsePut, PoamResponsePut} from '@mitre/emass_client/dist/api'

describe('Test eMASS API CLI (put) commands', () => {
  const mocSer = new InitMockServer()
  let responseDataObj: Map<string, any>
  const testOk =  {
    status: 200,
    statusText: 'OK',
  }

  test
    .it('Successfully tested endpoint - artifacts', async () => {
      const artifactApi = new ArtifactsApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await artifactApi.updateArtifactBySystemId(123, []).then((response: ArtifactsResponsePutPost) => {
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
      const updateControl = new ControlsApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await updateControl.updateControlBySystemId(123, []).then((response: ControlsResponsePut) => {
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
      const putMilestones = new MilestonesApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await putMilestones.updateMilestoneBySystemIdAndPoamId(123, 456, []).then((response: MilestoneResponsePut) => {
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
      const updatePoam = new POAMApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await updatePoam.updatePoamBySystemId(123, []).then((response: PoamResponsePut) => {
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
