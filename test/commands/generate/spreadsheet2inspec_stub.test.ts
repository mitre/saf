import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';

describe('Test spreadsheet2inspec_stub', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('Has the same number of controls in the CSV as generated - Ubuntu', async () => {
    await runCommand<{ name: string }>([
      'generate spreadsheet2inspec_stub',
      '-i', path.resolve('./test/sample_data/csv/input/Ubuntu.csv'),
      '-o', `${tmpobj.name}/Ubuntu`, '--format', 'disa',
    ]);
    const fileCount = fs.readdirSync(`${tmpobj.name}/Ubuntu/controls/`).length;
    expect(fileCount).to.eql(194);
  });
});
