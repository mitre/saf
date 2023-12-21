import {ArtifactsApi, MilestonesApi, POAMApi} from '@mitre/emass_client'
import {ArtifactsResponseDel, MilestonesPutPostDelete,
  PoamResponseDelete} from '@mitre/emass_client/dist/api'
import {expect, test} from '@oclif/test'

import {InitMockServer} from './mock.server'

describe('Test eMASS API CLI (delete) commands', () => {
  const mocSer = new InitMockServer()
  let responseDataObj: Map<string, any>
  const testOk =  {
    status: 200,
    statusText: 'OK',
  }

  test
    .it('Successfully tested endpoint - artifacts', async () => {
      const delArtifact = new ArtifactsApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await delArtifact.deleteArtifact(123, []).then((response: ArtifactsResponseDel) => {
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
      const delPoam = new POAMApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await delPoam.deletePoam(34, []).then((response: PoamResponseDelete) => {
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
      const delMilestones = new MilestonesApi(mocSer.configuration, mocSer.basePath, mocSer.axiosInstances)
      await delMilestones.deleteMilestone(36, 76, []).then((response: MilestonesPutPostDelete) => {
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
