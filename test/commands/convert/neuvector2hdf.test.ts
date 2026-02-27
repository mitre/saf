import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test NeuVector', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test on mitre/caldera', async () => {
    await runCommand<{ name: string }>([
      'convert neuvector2hdf',
      '-i', path.resolve('./test/sample_data/neuvector/sample_input_report/neuvector-mitre-caldera.json'),
      '-o', `${tmpobj.name}/neuvectortest.json`,
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/neuvector/neuvector-hdf-mitre-caldera.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter output test on mitre/heimdall', async () => {
    await runCommand<{ name: string }>([
      'convert neuvector2hdf',
      '-i', path.resolve('./test/sample_data/neuvector/sample_input_report/neuvector-mitre-heimdall.json'),
      '-o', `${tmpobj.name}/neuvectortest.json`,
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/neuvector/neuvector-hdf-mitre-heimdall.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter output test on mitre/heimdall2', async () => {
    await runCommand<{ name: string }>([
      'convert neuvector2hdf',
      '-i', path.resolve('./test/sample_data/neuvector/sample_input_report/neuvector-mitre-heimdall2.json'),
      '-o', `${tmpobj.name}/neuvectortest.json`,
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/neuvector/neuvector-hdf-mitre-heimdall2.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter output test on mitre/vulcan', async () => {
    await runCommand<{ name: string }>([
      'convert neuvector2hdf',
      '-i', path.resolve('./test/sample_data/neuvector/sample_input_report/neuvector-mitre-vulcan.json'),
      '-o', `${tmpobj.name}/neuvectortest.json`,
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/neuvector/neuvector-hdf-mitre-vulcan.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test NeuVector withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test on mitre/caldera', async () => {
    await runCommand<{ name: string }>([
      'convert neuvector2hdf',
      '-i', path.resolve('./test/sample_data/neuvector/sample_input_report/neuvector-mitre-caldera.json'),
      '-o', `${tmpobj.name}/neuvectortest.json`, '-w',
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/neuvector/neuvector-hdf-withraw-mitre-caldera.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter with raw output test on mitre/heimdall', async () => {
    await runCommand<{ name: string }>([
      'convert neuvector2hdf',
      '-i', path.resolve('./test/sample_data/neuvector/sample_input_report/neuvector-mitre-heimdall.json'),
      '-o', `${tmpobj.name}/neuvectortest.json`, '-w',
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/neuvector/neuvector-hdf-withraw-mitre-heimdall.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter with raw output test on mitre/heimdall2', async () => {
    await runCommand<{ name: string }>([
      'convert neuvector2hdf',
      '-i', path.resolve('./test/sample_data/neuvector/sample_input_report/neuvector-mitre-heimdall2.json'),
      '-o', `${tmpobj.name}/neuvectortest.json`, '-w',
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/neuvector/neuvector-hdf-withraw-mitre-heimdall2.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter with raw output test on mitre/vulcan', async () => {
    await runCommand<{ name: string }>([
      'convert neuvector2hdf',
      '-i', path.resolve('./test/sample_data/neuvector/sample_input_report/neuvector-mitre-vulcan.json'),
      '-o', `${tmpobj.name}/neuvectortest.json`, '-w',
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/neuvectortest.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/neuvector/neuvector-hdf-withraw-mitre-vulcan.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});
