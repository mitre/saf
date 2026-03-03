import { runCommand } from '@oclif/test';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import tmp from 'tmp';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Test ckl2POAM RHEL8 example', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });
  let files: string[];

  beforeAll(async () => {
    await runCommand<{ name: string }>([
      'convert ckl2POAM',
      '-i', path.resolve('./test/sample_data/checklist/sample_input_report/converted-RHEL8V1R3.ckl'),
      '-o', `${tmpobj.name}`,
      '-d test',
      '-O testOrg',
    ]);

    files = await readdir(tmpobj.name);
  });

  it('generates the POAM successfully', () => {
    expect(files).to.have.lengthOf(1, 'No files found');
  });

  it('generates the POAM with a correctly formatted filename', () => {
    const filePattern = /^converted-RHEL8V1R3.ckl-\d{4}-\d{2}-\d{2}-\d{4}.xlsm$/;
    expect(filePattern.test(files[0])).toBe(true);
  });

  it('provides the correct output', async () => {
    const fileStats = await stat(path.resolve(tmpobj.name, files[0]));
    const sampleFileStats = await stat(path.resolve('./test/sample_data/poam/converted-RHEL8V1R3.ckl-2026-03-03-0034.xlsm'));
    // Compare the file size, varies between OS (87033 - 87036)
    expect(fileStats.size).to.be.within(87_030, 87_040);
    expect.assert.approximately(fileStats.size, sampleFileStats.size, 5);
  });
});
