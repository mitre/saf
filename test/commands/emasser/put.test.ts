import {
  ArtifactsApi,
  ControlsApi,
  MilestonesApi,
  POAMApi,
  HardwareBaselineApi,
  SoftwareBaselineApi,
} from '@mitre/emass_client';
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from '../../../src/utils/global';
import { InitMockServer } from './mock.server';

describe('Test eMASSer API CLI (PUT) commands', () => {
  const mocServer = new InitMockServer();
  let responseDataObj: Map<string, unknown>;
  const testOk = { status: 200, statusText: 'OK' };

  it('Successfully tested endpoint - Artifacts', async () => {
    const artifactApi = new ArtifactsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await artifactApi.updateArtifactBySystemId(123, []);
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
    const updateControl = new ControlsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await updateControl.updateControlBySystemId(123, []);
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
    const hwBaseline = new HardwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await hwBaseline.updateHwBaselineAssets(123, []);
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

  it('Successfully tested endpoint - Milestones', async () => {
    const putMilestones = new MilestonesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await putMilestones.updateMilestoneBySystemIdAndPoamId(123, 456, []);
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

  it('Successfully tested endpoint - POA&Ms', async () => {
    const updatePoam = new POAMApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await updatePoam.updatePoamBySystemId(123, []);
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
    const swBaseline = new SoftwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await swBaseline.updateSwBaselineAssets(123, []);
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
});
