import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test semgrep', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert semgrep2hdf',
      '-i', path.resolve('./test/sample_data/semgrep/sample_input_report/semgrep_findings.json'),
      '-o', `${tmpobj.name}/semgreptest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/semgreptest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/semgrep/semgrep_findings-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test semgrep using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test', async () => {
    await runCommand<{ name: string }>([
      'convert semgrep2hdf',
      '-i', path.resolve('./test/sample_data/semgrep/sample_input_report/semgrep_findings.json'),
      '-o', `${tmpobj.name}/semgreptest.json`, '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/semgreptest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/semgrep/semgrep_findings-withraw-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test semgrep with no findings', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter empty scan output test', async () => {
    await runCommand<{ name: string }>([
      'convert semgrep2hdf',
      '-i', path.resolve('./test/sample_data/semgrep/sample_input_report/semgrep_empty.json'),
      '-o', `${tmpobj.name}/semgreptest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/semgreptest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/semgrep/semgrep_empty-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test semgrep with scan errors', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter scan errors output test', async () => {
    await runCommand<{ name: string }>([
      'convert semgrep2hdf',
      '-i', path.resolve('./test/sample_data/semgrep/sample_input_report/semgrep_errors.json'),
      '-o', `${tmpobj.name}/semgreptest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/semgreptest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/semgrep/semgrep_errors-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});
