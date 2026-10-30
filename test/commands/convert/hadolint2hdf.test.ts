import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test Hadolint', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert hadolint2hdf',
      '-i', path.resolve('./test/sample_data/hadolint/sample_input_report/heimdall_dockerfile.hadolint.json'),
      '-o', `${tmpobj.name}/hadolinttest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/hadolinttest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/hadolint/hadolint-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test Hadolint using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test', async () => {
    await runCommand<{ name: string }>([
      'convert hadolint2hdf',
      '-i', path.resolve('./test/sample_data/hadolint/sample_input_report/heimdall_dockerfile.hadolint.json'),
      '-o', `${tmpobj.name}/hadolinttest.json`,
      '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/hadolinttest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/hadolint/hadolint-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test Hadolint using rule descriptions flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });
  const input = path.resolve('./test/sample_data/hadolint/sample_input_report/heimdall_dockerfile.hadolint_shellcheck.json');

  it('hdf-converter output includes rule descriptions', async () => {
    await runCommand<{ name: string }>([
      'convert hadolint2hdf',
      '-i', input,
      '-o', `${tmpobj.name}/hadolinttest.json`,
      '-d',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/hadolinttest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/hadolint/hadolint-shellcheck-hdf-with-rule-descriptions.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter output includes rule descriptions and raw input', async () => {
    await runCommand<{ name: string }>([
      'convert hadolint2hdf',
      '-i', input,
      '-o', `${tmpobj.name}/hadolinttest.json`,
      '-d',
      '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/hadolinttest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/hadolint/hadolint-shellcheck-hdf-with-rule-descriptions-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});
