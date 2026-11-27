import type { AddressInfo } from 'net';
import { createServer, type Server } from 'http';
import { runCommand } from '@oclif/test';
import express, { type Application } from 'express';
import open from 'open';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Heimdall from '../../../src/commands/view/heimdall';

vi.mock('open', () => ({ default: vi.fn() }));

describe('Heimdall CLI', { concurrent: false }, () => {
  let server: Server | undefined;

  async function startHeimdall(args: string[]) {
    const listening = Promise.withResolvers<string>();
    const listen = vi.spyOn(express.application, 'listen').mockImplementation(function (this: Application, _port, callback) {
      // Let the OS choose a free loopback port for the command's server.
      const instance = createServer(this);
      server = instance;
      return instance.once('error', listening.reject).listen(0, '127.0.0.1', () => {
        callback?.();
        const { port } = instance.address() as AddressInfo;
        listening.resolve(`http://127.0.0.1:${port}`);
      });
    });

    const [url] = await Promise.all([listening.promise, Heimdall.run(args, { root: process.cwd() })]);
    return { url, listen };
  }

  afterEach(async () => {
    vi.restoreAllMocks();
    if (server?.listening) {
      await server[Symbol.asyncDispose]();
    }
    server = undefined;
  });

  it('runs heimdall with --help', async () => {
    const { stdout } = await runCommand<{ name: string }>(['view', 'heimdall', '--help']);
    expect(stdout).to.contain('Run an instance of Heimdall Lite to visualize your data');
  });

  it('starts and serves the Heimdall app', async () => {
    const { url } = await startHeimdall(['-n']);
    const response = await fetch(url);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('id="app"');
  });

  it('starts and logs a browser launch failure', async () => {
    const openBrowser = vi.mocked(open).mockRejectedValueOnce(new Error('Browser unavailable'));
    const logError = vi.spyOn(console, 'error').mockReturnValue(undefined);

    const { url, listen } = await startHeimdall([]);
    const response = await fetch(url, { method: 'HEAD' });
    expect(response.status).toBe(200);
    expect(listen).toHaveBeenCalledBefore(openBrowser);
    expect(logError).toHaveBeenCalledWith('Could not open the default browser.', 'Browser unavailable');
  });
});
