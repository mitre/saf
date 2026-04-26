import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import * as winston from 'winston';
import type { Logger } from 'winston';
import { createDeltaLogger, createWinstonLogger } from '../../../src/utils/logging';

vi.mock('winston', { spy: true });

// ESC character (0x1B). Used to detect ANSI color sequences in the log
// output. Built via String.fromCodePoint so eslint's `no-control-regex`
// rule doesn't flag literal control chars in the test regex, and
// String.raw so the `\[` backslash escape isn't double-escaped.
const ESC = String.fromCodePoint(0x1B);
const ansiRegex = new RegExp(String.raw`${ESC}\[[0-9;]+m`, 'g');
const ansiPrefixRegex = new RegExp(String.raw`${ESC}\[`);

const tmpLogFile = () =>
  path.join(os.tmpdir(), `saf-delta-test-${Date.now()}-${randomBytes(8).toString('hex')}.log`);

// Close the logger and wait for all transports to release their fds
// (the File transport's underlying writable emits `close` only after
// the fd is actually released), then unlink the log file. Tests
// invoke this from `finally` so cleanup runs even if assertions
// throw. We don't use `afterEach` because vitest.config.ts enables
// `sequence.concurrent = true`, so tests in this file run in
// parallel — module-scoped cleanup state would race.
const closeAndRm = async (logger: Logger, logFile: string): Promise<void> => {
  await new Promise<void>((resolve) => {
    logger.on('close', () => resolve());
    logger.close();
  });
  fs.rmSync(logFile, { force: true });
};

// Deterministic flush — ends the logger and resolves when every transport
// has flushed. Avoids time-based `setTimeout(r, 150)` flakiness under CI.
const flushAndEnd = (logger: Logger): Promise<void> =>
  new Promise<void>((resolve) => {
    logger.on('finish', () => resolve());
    logger.end();
  });

describe('createWinstonLogger', () => {
  it('should create a logger with the correct configuration', () => {
    createWinstonLogger('testMapper', 'info');

    expect(winston.createLogger).toHaveBeenCalledTimes(1);
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining(
        {
          level: 'info',
          levels: {
            error: 0,
            warn: 1,
            info: 2,
            http: 3,
            verbose: 4,
            debug: 5,
            silly: 6,
          },
          transports: expect.arrayContaining([
            expect.objectContaining({
              filename: 'saf-cli.log',
            }),
            expect.any(winston.transports.File),
          ]),
        },
      ),
    );
  });
});

describe('createDeltaLogger', () => {
  it('writes messages to the specified log file in plain text (no ANSI color codes)', async () => {
    const logFile = tmpLogFile();
    const logger = createDeltaLogger(logFile);
    try {
      logger.info('Match Controls:  5');
      logger.warn('** Potential Mismatch **');
      logger.error('No Match Found for:  SV-123');

      await flushAndEnd(logger);

      const fileContent = fs.readFileSync(logFile, 'utf8');
      expect(fileContent).toContain('Match Controls:  5');
      expect(fileContent).toContain('** Potential Mismatch **');
      expect(fileContent).toContain('No Match Found for:  SV-123');

      // File must be plain text — no ANSI escape sequences leaked from console transport
      expect(fileContent).not.toMatch(ansiPrefixRegex);
    } finally {
      await closeAndRm(logger, logFile);
    }
  });

  it('refuses to open a log file that already exists as a symlink', () => {
    const logFile = tmpLogFile();
    const realTarget = tmpLogFile();
    fs.writeFileSync(realTarget, 'pre-existing content\n');
    fs.symlinkSync(realTarget, logFile);

    try {
      expect(() => createDeltaLogger(logFile)).toThrow(/symlink/);
    } finally {
      fs.rmSync(logFile, { force: true });
      fs.rmSync(realTarget, { force: true });
    }
  });

  it('honors the `level` option (drops lower levels)', async () => {
    const logFile = tmpLogFile();
    const logger = createDeltaLogger(logFile, { level: 'warn' });
    try {
      logger.info('suppressed');
      logger.warn('included');

      await flushAndEnd(logger);

      const fileContent = fs.readFileSync(logFile, 'utf8');
      expect(fileContent).toContain('included');
      expect(fileContent).not.toContain('suppressed');
    } finally {
      await closeAndRm(logger, logFile);
    }
  });

  it('preserves the literal message as-is (no winston prefix or level label leaks into stdout)', async () => {
    const logFile = tmpLogFile();
    const logger = createDeltaLogger(logFile);

    // Winston's Console transport writes via process.stdout.write, not console.log
    const writes: string[] = [];
    const origWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: unknown, ...rest: unknown[]) => {
      writes.push(typeof chunk === 'string' ? chunk : String(chunk));
      return origWrite(chunk as never, ...(rest as []));
    }) as typeof process.stdout.write;

    try {
      logger.info('Total Mapped Controls:  42');
      await flushAndEnd(logger);

      // ANSI-strip then search. The raw message must be there with no winston
      // level or timestamp prefix baked in.
      const joined = writes.join('').replaceAll(ansiRegex, '');
      expect(joined).toContain('Total Mapped Controls:  42');
      expect(joined).not.toMatch(/\binfo:\s/);
      expect(joined).not.toMatch(/\bERROR:\s/);
      expect(joined).not.toMatch(/\d{4}-\d{2}-\d{2}/); // no ISO timestamp
    } finally {
      process.stdout.write = origWrite;
      await closeAndRm(logger, logFile);
    }
  });
});
