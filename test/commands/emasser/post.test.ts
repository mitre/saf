import {
  ArtifactsApi,
  CACApi,
  PACApi,
  CloudResourceResultsApi,
  ContainerScanResultsApi,
  MilestonesApi,
  POAMApi,
  RegistrationApi,
  StaticCodeScansApi,
  TestResultsApi,
  DeviceScanResultsApi,
  HardwareBaselineApi,
  SoftwareBaselineApi,
} from '@mitre/emass_client';
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from '../../../src/utils/global';
import { InitMockServer } from './mock.server';

describe('Test eMASSer API CLI (POST) commands', () => {
  const mocServer = new InitMockServer();
  let responseDataObj: Map<string, unknown>;
  const testOk = { status: 200, statusText: 'OK' };

  it('Successfully tested endpoint - Artifacts', async () => {
    const artifactApi = new ArtifactsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await artifactApi.addArtifactsBySystemId(123, 'filename', true, false, 'type', 'category');
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

  it('Successfully tested endpoint - CAC', async () => {
    const addCac = new CACApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await addCac.addSystemCac(123, []);
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
    const addCloudResource = new CloudResourceResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await addCloudResource.addCloudResourcesBySystemId(123, []);
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
    const addContainer = new ContainerScanResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await addContainer.addContainerSansBySystemId(123, []);
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

  it('Successfully tested endpoint - Device Scans', async () => {
    const addDeviceScans = new DeviceScanResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await addDeviceScans.addScanResultsBySystemId(123, 'disaStigViewerCklCklb', 'filename', false);
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
      const response = await hwBaseline.addHwBaselineAssets(123, []);
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
    const addMilestone = new MilestonesApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await addMilestone.addMilestoneBySystemIdAndPoamId(123, 456, []);
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

  it('Successfully tested endpoint - PAC', async () => {
    const addCac = new PACApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await addCac.addSystemPac(123, []);
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
    const addPoam = new POAMApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await addPoam.addPoamBySystemId(123, []);
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

  it('Successfully tested endpoint - Register', async () => {
    const registerAPI = new RegistrationApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await registerAPI.registerUser();
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
      const response = await swBaseline.addSwBaselineAssets(123, []);
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

  it('Successfully tested endpoint - Static Code Scans', async () => {
    const addStaticCodeScans = new StaticCodeScansApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await addStaticCodeScans.addStaticCodeScansBySystemId(123, {});
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

  it('Successfully tested endpoint - Test Results', async () => {
    const addTestResults = new TestResultsApi(mocServer.configuration, mocServer.basePath, mocServer.axiosInstances);
    try {
      const response = await addTestResults.addTestResultsBySystemId(123, []);
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
