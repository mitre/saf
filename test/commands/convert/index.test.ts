import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it, vi } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test generic convert command', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('Burp Suite example', async () => {
    const input = path.resolve('./test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min');
    vi.stubEnv('INPUT_FILE', input);
    await runCommand<{ name: string }>([
      'convert',
      '-i', input,
      '-o', `${tmpobj.name}/burpsuite-generic.json`,
    ]);

    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/burpsuite-generic.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/burpsuite/burpsuite-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});
