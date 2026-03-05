import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test zap', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test - webgoat', async () => {
    await runCommand<{ name: string }>([
      'convert zap2hdf',
      '-i', path.resolve('./test/sample_data/zap/sample_input_report/webgoat.json'),
      '-n', 'http://mymac.com:8191',
      '-o', `${tmpobj.name}/zaptest-webgoat.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/zaptest-webgoat.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/zap/zap-webgoat-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter output test - zero.webappsecurity', async () => {
    await runCommand<{ name: string }>([
      'convert zap2hdf',
      '-i', path.resolve('./test/sample_data/zap/sample_input_report/zero.webappsecurity.json'),
      '-n', 'http://zero.webappsecurity.com',
      '-o', `${tmpobj.name}/zaptest-webappsecurity.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/zaptest-webappsecurity.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/zap/zap-webappsecurity-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test zap using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test - webgoat', async () => {
    await runCommand<{ name: string }>([
      'convert zap2hdf',
      '-i', path.resolve('./test/sample_data/zap/sample_input_report/webgoat.json'),
      '-n', 'http://mymac.com:8191',
      '-o', `${tmpobj.name}/zaptest-webgoat.json`, '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/zaptest-webgoat.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/zap/zap-webgoat-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });

  it('hdf-converter with raw output test - zero.webappsecurity', async () => {
    await runCommand<{ name: string }>([
      'convert zap2hdf',
      '-i', path.resolve('./test/sample_data/zap/sample_input_report/zero.webappsecurity.json'),
      '-n', 'http://zero.webappsecurity.com',
      '-o', `${tmpobj.name}/zaptest-webappsecurity.json`, '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/zaptest-webappsecurity.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/zap/zap-webappsecurity-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});
