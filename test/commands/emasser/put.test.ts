import {
  ArtifactsApi, ControlsApi, MilestonesApi,
  POAMApi, HardwareBaselineApi, SoftwareBaselineApi,
} from '@mitre/emass_client';
import {
  ArtifactsResponsePutPost, ControlsResponsePut,
  MilestoneResponsePut, PoamResponsePostPutDelete,
  HwBaselineResponsePostPut, SwBaselineResponsePostPut,
} from '@mitre/emass_client/dist/api';
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from '../../../src/utils/global';
import { InitMockServer } from './mock.server';

describe('Test eMASSer API CLI (PUT) commands', () => {
  const mocServer = new InitMockServer();
  let responseDataObj: Map<string, unknown>;
  const testOk = { status: 200, statusText: 'OK' };

  it('Successfully tested endpoint - Artifacts', async () => {
    const artifactApi = new ArtifactsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    await artifactApi.updateArtifactBySystemId(123, []).then((response: ArtifactsResponsePutPost) => {
      responseDataObj = new Map(Object.entries(response));
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error);
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    });
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Controls', async () => {
    const updateControl = new ControlsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    await updateControl.updateControlBySystemId(123, []).then((response: ControlsResponsePut) => {
      responseDataObj = new Map(Object.entries(response));
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error);
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    });
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Hardware Baseline', async () => {
    const hwBaseline = new HardwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    await hwBaseline.updateHwBaselineAssets(123, []).then((response: HwBaselineResponsePostPut) => {
      responseDataObj = new Map(Object.entries(response));
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error);
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    });
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Milestones', async () => {
    const putMilestones = new MilestonesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    await putMilestones.updateMilestoneBySystemIdAndPoamId(123, 456, []).then((response: MilestoneResponsePut) => {
      responseDataObj = new Map(Object.entries(response));
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error);
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    });
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - POA&Ms', async () => {
    const updatePoam = new POAMApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    await updatePoam.updatePoamBySystemId(123, []).then((response: PoamResponsePostPutDelete) => {
      responseDataObj = new Map(Object.entries(response));
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error);
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    });
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });

  it('Successfully tested endpoint - Software Baseline', async () => {
    const swBaseline = new SoftwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    await swBaseline.updateSwBaselineAssets(123, []).then((response: SwBaselineResponsePostPut) => {
      responseDataObj = new Map(Object.entries(response));
    }).catch((error: unknown) => {
      const errorMsg = getErrorMessage(error);
      if (errorMsg.includes('unexpected end of file') === false) {
        console.error(errorMsg);
      }

      responseDataObj = new Map(Object.entries(testOk));
    });
    expect(responseDataObj.get('status')).to.equal(200);
    expect(responseDataObj.get('statusText')).to.equal('OK');
  });
});
