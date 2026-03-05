import { runCommand } from '@oclif/test';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';

describe('Test hdf2csv triple_overlay_profile_example', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2csv',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '-o', `${tmpobj.name}/triple_overlay_profile_example.csv`,
    ]);
    const converted = parse(fs.readFileSync(`${tmpobj.name}/triple_overlay_profile_example.csv`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/HDF/output/csv/triple_overlay_parsed_CSV.json'), 'utf8'));
    expect(converted).to.eql(sample);
  });
});

describe('Test hdf2csv red_hat_good', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2csv',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      '-o', `${tmpobj.name}/red_hat_good.csv`,
    ]);
    const converted = parse(fs.readFileSync(`${tmpobj.name}/red_hat_good.csv`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/HDF/output/csv/red_hat_good_parsed_CSV.json'), 'utf8'));
    expect(converted).to.eql(sample);
  });
});
