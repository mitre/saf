import { runCommand } from '@oclif/test';
import { promises as fse } from 'fs';
import path from 'path';
import tmp from 'tmp';
import { beforeAll, describe, expect, it } from 'vitest';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Test ckl2POAM RHEL8 example', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });
  let matchingFiles: string[];

  beforeAll(async () => {
    await runCommand<{ name: string }>([
      'convert ckl2POAM',
      '-i', path.resolve('./test/sample_data/checklist/sample_input_report/converted-RHEL8V1R3.ckl'),
      '-o', `${tmpobj.name}`,
      '-d test',
      '-O testOrg',
    ]);

    await delay(1500);
    const filePattern = /^converted-RHEL8V1R3.ckl-\d{4}-\d{2}-\d{2}-\d{4}.xlsm$/;
    // Read the files in the directory
    const files = await fse.readdir(tmpobj.name);
    // Filter files matching the pattern
    matchingFiles = files.filter(file => filePattern.test(file));
  });

  it('generates the POAM successfully', async () => {
    expect(matchingFiles).to.have.lengthOf.above(0, 'No file found matching the pattern');
  });

  it('provides the correct output', async () => {
    // Get the stats for the first matched file
    const fileStats = await fse.stat(path.resolve(tmpobj.name, matchingFiles[0]));
    // Compare the file size, varies between OS (87033 - 87035)
    expect(fileStats.size).to.be.within(87_000, 88_000);
  });
});
