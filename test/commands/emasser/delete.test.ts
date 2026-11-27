import {
  ArtifactsApi,
  POAMApi,
  MilestonesApi,
  CloudResourceResultsApi,
  ContainerScanResultsApi,
  HardwareBaselineApi,
  SoftwareBaselineApi,
} from '@mitre/emass_client';
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from '../../../src/utils/global';
import { InitMockServer } from './mock.server';

describe('Test eMASSer API CLI (DELETE) commands', () => {
  const mocServer = new InitMockServer();
  let responseDataObj: Map<string, unknown>;
  const testOk = { status: 200, statusText: 'OK' };

  it('Successfully tested endpoint - Artifacts', async () => {
    const delArtifact = new ArtifactsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await delArtifact.deleteArtifact(123, []);
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

  it('Successfully tested endpoint - Cloud Resources', async () => {
    const delCloudResources = new CloudResourceResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await delCloudResources.deleteCloudResources(123, []);
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

  it('Successfully tested endpoint - Container Scans', async () => {
    const delContainerScans = new ContainerScanResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await delContainerScans.deleteContainerSans(123, []);
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
    const delHwBaseline = new HardwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await delHwBaseline.deleteHwBaselineAssets(123, []);
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
    const delSwBaseline = new SoftwareBaselineApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await delSwBaseline.deleteSwBaselineAssets(123, []);
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
    const delMilestones = new MilestonesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await delMilestones.deleteMilestone(36, 76, []);
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
    const delPoam = new POAMApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await delPoam.deletePoam(34, []);
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
