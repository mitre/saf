import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test burpsuite', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert burpsuite2hdf',
      '-i', path.resolve('./test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min'),
      '-o', `${tmpobj.name}/burpsuitetest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/burpsuite/burpsuite-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test burpsuite using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test', async () => {
    await runCommand<{ name: string }>([
      'convert burpsuite2hdf',
      '-i', path.resolve('./test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min'),
      '-o', `${tmpobj.name}/burpsuitetest.json`, '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/burpsuite/burpsuite-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test using space topic separator using burpsuite case', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert burpsuite2hdf',
      '-i', path.resolve('./test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min'),
      '-o', `${tmpobj.name}/burpsuitetest.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/burpsuite/burpsuite-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample));
  });
});
