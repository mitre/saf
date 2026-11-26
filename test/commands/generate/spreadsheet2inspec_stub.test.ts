import { Config } from '@oclif/core';
import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import Spreadsheet2HDF from '../../../src/commands/generate/spreadsheet2inspec_stub';

describe('Test spreadsheet2inspec_stub', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('Has the same number of controls in the CSV as generated - Ubuntu', async () => {
    await runCommand<{ name: string }>([
      'generate spreadsheet2inspec_stub',
      '-i',
      path.resolve('./test/sample_data/csv/input/Ubuntu.csv'),
      '-o',
      `${tmpobj.name}/Ubuntu`,
      '--format',
      'disa',
    ]);
    const fileCount = fs.readdirSync(`${tmpobj.name}/Ubuntu/controls/`).length;
    expect(fileCount).to.eql(194);
  });

  it('extracts only HTTP and HTTPS references and joins wrapped URLs', async () => {
    const command = new Spreadsheet2HDF([], await Config.load());
    const result = command.matchReferences({
      ref: 'See (https://exam\r\nple.com/report?a=1&b=2). http://localhost:8080/guide '
        + 'ftp://example.net/archive mailto:help@example.net //example.net/link example.net',
    });

    expect(result).toStrictEqual({
      ref: undefined,
      refs: ['https://example.com/report?a=1&b=2', 'http://localhost:8080/guide'],
    });
  });

  it('keeps existing references when the text contains no HTTP or HTTPS links', async () => {
    const command = new Spreadsheet2HDF([], await Config.load());
    const result = command.matchReferences({
      ref: 'ftp://example.org/file',
      refs: ['https://example.org/saved'],
    });

    expect(result).toStrictEqual({ ref: undefined, refs: ['https://example.org/saved'] });
  });
});
