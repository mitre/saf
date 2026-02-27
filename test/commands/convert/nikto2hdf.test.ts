import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test nikto', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert nikto2hdf',
      '-i', path.resolve('./test/sample_data/nikto/sample_input_report/zero.webappsecurity.json'),
      '-o', `${tmpobj.name}/niktotest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/niktotest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/nikto/nikto-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test nikto using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test', async () => {
    await runCommand<{ name: string }>([
      'convert nikto2hdf',
      '-i', path.resolve('./test/sample_data/nikto/sample_input_report/zero.webappsecurity.json'),
      '-o', `${tmpobj.name}/niktotest.json`, '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/niktotest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/nikto/nikto-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});
