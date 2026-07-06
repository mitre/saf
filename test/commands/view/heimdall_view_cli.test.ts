import type { AddressInfo } from 'net';
import type { Server } from 'http';
import path from 'path';
import { runCommand } from '@oclif/test';
import axios from 'axios';
import express from 'express';
import { JSDOM } from 'jsdom';
import { afterAll, assert, beforeAll, describe, expect, it } from 'vitest';
import { getInstalledPath } from '../../../src/utils/global';

describe('Test heimdall SAF CLI Command', () => {
  it('runs heimdall with --help', async () => {
    const { stdout } = await runCommand<{ name: string }>(['view', 'heimdall', '--help']);
    expect(stdout).to.contain('Run an instance of Heimdall Lite to visualize your data');
  });
});

describe('Test Heimdall Embedded', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const installedPath = getInstalledPath('@mitre/saf');
    const staticFilesDirectory = path.join(installedPath, 'node_modules/@mitre/heimdall-lite/dist');
    const predefinedLoadJSON = express.json();
    // Bind to port 0 so the OS assigns a free port. Hardcoding 3000
    // collides with anything already holding it on a dev machine
    // (OrbStack / Docker Desktop / Colima / another server), making
    // the test fail with EADDRINUSE and auto-skipping its siblings.
    server = express()
      .use(predefinedLoadJSON)
      .use(express.static(staticFilesDirectory))
      .use((_err: unknown, _req: express.Request, res: express.Response) => {
        res.status(500).send('Something broke!');
      })
      .listen(0);

    await new Promise<void>((resolve) => {
      server.on('listening', () => {
        const { port } = server.address() as AddressInfo;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it('should start the server on the specified port', async () => {
    const response = await axios.get(baseUrl);
    const dom = new JSDOM(response.data);
    const text = dom.window.document.body.textContent;
    assert.isNotNull(text);
  });

  it('should serve the Vue.js app', async () => {
    const response = await axios.get(baseUrl);
    const dom = new JSDOM(response.data);
    const appDiv = dom.window.document.querySelector('#app');
    assert.isNotNull(appDiv);
  });
});
