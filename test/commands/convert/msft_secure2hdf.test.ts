import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test msft_secure from pre-downloaded inputs', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert msft_secure2hdf',
      '-r', path.resolve('./test/sample_data/msft_secure/sample_input_report/secureScore.json'),
      '-p', path.resolve('./test/sample_data/msft_secure/sample_input_report/profiles.json'),
      '-o', `${tmpobj.name}/msft-secure.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/msft-secure-12345678-1234-1234-1234-1234567890abcd_2024-01-01.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/msft_secure/secure_score-hdfs.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample[0]));
  });
});

describe('Test msft_secure using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter withraw output test', async () => {
    await runCommand<{ name: string }>([
      'convert msft_secure2hdf',
      '-r', path.resolve('./test/sample_data/msft_secure/sample_input_report/secureScore.json'),
      '-p', path.resolve('./test/sample_data/msft_secure/sample_input_report/profiles.json'),
      '-o', `${tmpobj.name}/msft-secure.json`, '-w',
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/msft-secure-12345678-1234-1234-1234-1234567890abcd_2024-01-01.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/msft_secure/secure_score-hdf-withraws.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample[0]));
  });
});

describe('Test msft_secure from combined input', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert msft_secure2hdf',
      '-i', path.resolve('./test/sample_data/msft_secure/sample_input_report/combined.json'),
      '-o', `${tmpobj.name}/msft-secure.json`,
    ]);
    const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/msft-secure-12345678-1234-1234-1234-1234567890abcd_2024-01-01.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/msft_secure/secure_score-hdfs.json'), 'utf8'));
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample[0]));
  });
});
