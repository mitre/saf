import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test fortify', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert fortify2hdf',
      '-i', path.resolve('./test/sample_data/fortify/sample_input_report/fortify_webgoat_results.fvdl'),
      '-o', `${tmpobj.name}/fortify.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/fortify.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/fortify/fortify-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test fortify using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test', async () => {
    await runCommand<{ name: string }>([
      'convert fortify2hdf',
      '-i', path.resolve('./test/sample_data/fortify/sample_input_report/fortify_webgoat_results.fvdl'),
      '-o', `${tmpobj.name}/fortify.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/fortify.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/fortify/fortify-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});
