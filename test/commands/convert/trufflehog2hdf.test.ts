import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test Trufflehog', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test - standard', async () => {
    await runCommand<{ name: string }>([
      'convert trufflehog2hdf',
      '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog.json'),
      '-o', `${tmpobj.name}/trufflehog.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter output test - docker', async () => {
    await runCommand<{ name: string }>([
      'convert trufflehog2hdf',
      '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_docker_example.json'),
      '-o', `${tmpobj.name}/trufflehog.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-docker-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter output test - report', async () => {
    await runCommand<{ name: string }>([
      'convert trufflehog2hdf',
      '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_report_example.json'),
      '-o', `${tmpobj.name}/trufflehog.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-report-example-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter output test - saf', async () => {
    await runCommand<{ name: string }>([
      'convert trufflehog2hdf',
      '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_saf_example.json'),
      '-o', `${tmpobj.name}/trufflehog.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-saf-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter output test - ndjson and duplicate finding', async () => {
    await runCommand<{ name: string }>([
      'convert trufflehog2hdf',
      '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_dup.ndjson'),
      '-o', `${tmpobj.name}/trufflehog.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-ndjson-dup-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test Trufflehog using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test - standard', async () => {
    await runCommand<{ name: string }>([
      'convert trufflehog2hdf',
      '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog.json'),
      '-o', `${tmpobj.name}/trufflehog.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter with raw output test - docker', async () => {
    await runCommand<{ name: string }>([
      'convert trufflehog2hdf',
      '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_docker_example.json'),
      '-o', `${tmpobj.name}/trufflehog.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-docker-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter with raw output test - report', async () => {
    await runCommand<{ name: string }>([
      'convert trufflehog2hdf',
      '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_report_example.json'),
      '-o', `${tmpobj.name}/trufflehog.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-report-example-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter with raw output test - saf', async () => {
    await runCommand<{ name: string }>([
      'convert trufflehog2hdf',
      '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_saf_example.json'),
      '-o', `${tmpobj.name}/trufflehog.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-saf-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});
