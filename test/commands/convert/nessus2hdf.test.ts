import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test Nessus', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert nessus2hdf',
      '-i', path.resolve('./test/sample_data/nessus/sample_input_report/sample.nessus'),
      '-o', `${tmpobj.name}/nessustest.json`,
    ]);

    const test1 = JSON.parse(fs.readFileSync(`${tmpobj.name}/nessustest-10.0.0.1.json`, 'utf8'));
    const test2 = JSON.parse(fs.readFileSync(`${tmpobj.name}/nessustest-10.0.0.2.json`, 'utf8'));
    const test3 = JSON.parse(fs.readFileSync(`${tmpobj.name}/nessustest-10.0.0.3.json`, 'utf8'));

    const sample1 = JSON.parse(fs.readFileSync(path.resolve('test/sample_data/nessus/nessus-hdf-10.0.0.1.json'), 'utf8'));
    const sample2 = JSON.parse(fs.readFileSync(path.resolve('test/sample_data/nessus/nessus-hdf-10.0.0.2.json'), 'utf8'));
    const sample3 = JSON.parse(fs.readFileSync(path.resolve('test/sample_data/nessus/nessus-hdf-10.0.0.3.json'), 'utf8'));

    expect(omitHDFChangingFields(test1)).to.eql(omitHDFChangingFields(sample1));
    expect(omitHDFChangingFields(test2)).to.eql(omitHDFChangingFields(sample2));
    expect(omitHDFChangingFields(test3)).to.eql(omitHDFChangingFields(sample3));
  });
});
