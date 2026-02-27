import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test gosec', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test - grype', async () => {
    await runCommand<{ name: string }>([
      'convert gosec2hdf',
      '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Grype_gosec_results.json'),
      '-o', `${tmpobj.name}/gosectest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/grype-gosec-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter output test - unsuppressed go ethereum', async () => {
    await runCommand<{ name: string }>([
      'convert gosec2hdf',
      '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Go_Ethereum_gosec_results_external_suppressed.json'),
      '-o', `${tmpobj.name}/gosectest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/go-ethereum-external-unsuppressed-gosec-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter output test - suppressed go ethereum', async () => {
    await runCommand<{ name: string }>([
      'convert gosec2hdf',
      '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Go_Ethereum_gosec_results_all_suppressed.json'),
      '-o', `${tmpobj.name}/gosectest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/go-ethereum-all-unsuppressed-gosec-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test gosec using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test - grype', async () => {
    await runCommand<{ name: string }>([
      'convert gosec2hdf',
      '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Grype_gosec_results.json'),
      '-o', `${tmpobj.name}/gosectest.json`, '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/grype-gosec-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter with raw output test - unsuppressed go ethereum', async () => {
    await runCommand<{ name: string }>([
      'convert gosec2hdf',
      '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Go_Ethereum_gosec_results_external_suppressed.json'),
      '-o', `${tmpobj.name}/gosectest.json`, '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/go-ethereum-external-unsuppressed-gosec-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter with raw output test - suppressed go ethereum', async () => {
    await runCommand<{ name: string }>([
      'convert gosec2hdf',
      '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Go_Ethereum_gosec_results_all_suppressed.json'),
      '-o', `${tmpobj.name}/gosectest.json`, '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/go-ethereum-all-unsuppressed-gosec-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});
