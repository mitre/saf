import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test checkov', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test — terraform_plan scan', async () => {
    await runCommand<{ name: string }>([
      'convert checkov2hdf',
      '-i', path.resolve('./test/sample_data/checkov/sample_input_report/checkov_json.json'),
      '-o', `${tmpobj.name}/checkovtest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/checkovtest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/checkov/checkov-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test checkov using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test', async () => {
    await runCommand<{ name: string }>([
      'convert checkov2hdf',
      '-i', path.resolve('./test/sample_data/checkov/sample_input_report/checkov_json.json'),
      '-o', `${tmpobj.name}/checkovtest.json`, '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/checkovtest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/checkov/checkov-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test checkov — terraform scan', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test — terraform scan', async () => {
    await runCommand<{ name: string }>([
      'convert checkov2hdf',
      '-i', path.resolve('./test/sample_data/checkov/sample_input_report/checkov_sample.json'),
      '-o', `${tmpobj.name}/checkov_sample_test.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/checkov_sample_test.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/checkov/checkov_sample-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test checkov — skipped checks and parsing errors', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test — with skips', async () => {
    await runCommand<{ name: string }>([
      'convert checkov2hdf',
      '-i', path.resolve('./test/sample_data/checkov/sample_input_report/checkov_with_skips.json'),
      '-o', `${tmpobj.name}/checkov_skips_test.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/checkov_skips_test.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/checkov/checkov_with_skips-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test checkov — synthetic (all code paths)', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test — synthetic', async () => {
    await runCommand<{ name: string }>([
      'convert checkov2hdf',
      '-i', path.resolve('./test/sample_data/checkov/sample_input_report/checkov_synthetic.json'),
      '-o', `${tmpobj.name}/checkov_synthetic_test.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/checkov_synthetic_test.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/checkov/checkov_synthetic-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});
