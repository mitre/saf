import { runCommand } from '@oclif/test';
import * as XLSX from '@e965/xlsx';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

describe('Test hdf2caat two RHEL HDF and a RHEL triple overlay HDF', () => {
  let tmpobj: tmp.DirResult;

  beforeAll(() => {
    XLSX.set_fs(fs); // https://docs.sheetjs.com/docs/getting-started/installation/nodejs/#filesystem-operations

    tmpobj = tmp.dirSync({ unsafeCleanup: true });
  });

  afterAll(() => {
    tmpobj.removeCallback();
  });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2caat',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '-o', `${tmpobj.name}/caat.xlsx`,
    ]);
    const converted = XLSX.readFile(`${tmpobj.name}/caat.xlsx`, { type: 'file' });
    const sample = XLSX.readFile(path.resolve('./test/sample_data/HDF/output/caat/caat.xlsx'), { type: 'file' });
    // convert workbooks to json to compare just the content instead of random bits of xlsx structure
    expect(converted.SheetNames.map(name => XLSX.utils.sheet_to_json(converted.Sheets[name]))).to.eql(sample.SheetNames.map(name => XLSX.utils.sheet_to_json(sample.Sheets[name])));
    // however, we do care about one bit of xlsx structure: the sheet names
    expect(converted.SheetNames).to.eql(sample.SheetNames);
  });
});
