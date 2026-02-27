import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test anchore grype', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert anchoregrype2hdf',
      '-i', path.resolve('./test/sample_data/anchoregrype/sample_input_report/anchore_grype.json'),
      '-o', `${tmpobj.name}/anchore-grype-hdf.json`,
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/anchore-grype-hdf.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(path.resolve('./test/sample_data/anchoregrype/anchore-grype-hdf.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test anchore grype with raw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter withraw output test', async () => {
    await runCommand<{ name: string }>([
      'convert anchoregrype2hdf',
      '-i', path.resolve('./test/sample_data/anchoregrype/sample_input_report/anchore_grype.json'),
      '-o', `${tmpobj.name}/anchore-grype-withraw.json`, '-w',
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/anchore-grype-withraw.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(path.resolve('./test/sample_data/anchoregrype/anchore-grype-withraw.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test amazon anchore grype', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert anchoregrype2hdf',
      '-i', path.resolve('./test/sample_data/anchoregrype/sample_input_report/amazon.json'),
      '-o', `${tmpobj.name}/amazon-grype-hdf.json`,
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/amazon-grype-hdf.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/anchoregrype/amazon-grype-hdf.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test amazon anchore grype withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test', async () => {
    await runCommand<{ name: string }>([
      'convert anchoregrype2hdf',
      '-i', path.resolve('./test/sample_data/anchoregrype/sample_input_report/amazon.json'),
      '-o', `${tmpobj.name}/amazon-grype-withraw.json`, '-w',
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/amazon-grype-withraw.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/anchoregrype/amazon-grype-withraw.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test tensorflow anchore grype', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert anchoregrype2hdf',
      '-i', path.resolve('./test/sample_data/anchoregrype/sample_input_report/tensorflow.json'),
      '-o', `${tmpobj.name}/tensorflow-grype-hdf.json`,
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/tensorflow-grype-hdf.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/anchoregrype/tensorflow-grype-hdf.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test tensorflow anchore grype withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test', async () => {
    await runCommand<{ name: string }>([
      'convert anchoregrype2hdf',
      '-i', path.resolve('./test/sample_data/anchoregrype/sample_input_report/tensorflow.json'),
      '-o', `${tmpobj.name}/tensorflow-grype-withraw.json`, '-w',
    ]);
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/tensorflow-grype-withraw.json`, 'utf8'),
    );
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/anchoregrype/tensorflow-grype-withraw.json'), 'utf8'),
    );
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});
