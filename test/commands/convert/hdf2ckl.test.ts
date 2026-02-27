import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitChecklistChangingFields } from '../utils';

describe('Test hdf2checklist', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test - defaults', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2ckl',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      '-o', `${tmpobj.name}/hdf2ckl_test.ckl`,
    ]);
    const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_test.ckl`, 'utf8').replaceAll(/\r/gi, '');
    const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/red_hat_good.ckl'), 'utf8').replaceAll(/\r/gi, '');
    expect(omitChecklistChangingFields(test)).to.eql(omitChecklistChangingFields(sample));
  });

  it('hdf-converter output test - inspec results from profile with dependent profiles', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2ckl',
      '-i', path.resolve('./test/sample_data/HDF/input/vSphere8_report.json'),
      '-o', `${tmpobj.name}/hdf2ckl_test.ckl`,
    ]);
    const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_test.ckl`, 'utf8').replaceAll(/\r/gi, '');
    const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/vSphere8_report.ckl'), 'utf8').replaceAll(/\r/gi, '');
    expect(omitChecklistChangingFields(test)).to.eql(omitChecklistChangingFields(sample));
  });

  it('hdf-converter output test - with metadata file', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2ckl',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      '-o', `${tmpobj.name}/hdf2ckl_metadata_test.ckl`,
      '-m', path.resolve('./test/sample_data/checklist/metadata.json'),
    ]);
    const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_metadata_test.ckl`, 'utf8').replaceAll(/\r/gi, '');
    const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/red_hat_good_metadata.ckl'), 'utf8').replaceAll(/\r/gi, '');
    expect(omitChecklistChangingFields(test)).to.eql(omitChecklistChangingFields(sample));
  });

  // NOTE: May have to wrap the string parameter in double quotes
  it('hdf-converter output test - with metadata flags', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2ckl',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      '-o', `${tmpobj.name}/hdf2ckl_metadata_test.ckl`,
      '--profilename', 'Red Hat Enterprise Linux 7 STIG', '--version', '2',
      '--releasenumber', '6', '--releasedate', '2024/06/08',
      '--marking', 'CUI', '--hostname', 'localhost',
      '--ip', '127.0.0.1', '--role', 'Domain Controller',
      '--assettype', 'Computing', '--techarea', 'Other Review',
    ]);
    const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_metadata_test.ckl`, 'utf8').replaceAll(/\r/gi, '');
    const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/red_hat_good_metadata.ckl'), 'utf8').replaceAll(/\r/gi, '');
    expect(omitChecklistChangingFields(test)).to.eql(omitChecklistChangingFields(sample));
  });

  it('hdf-converter output test - with severity overrides', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2ckl',
      '-i', path.resolve('./test/sample_data/HDF/input/RHEL7_overrides_hdf.json'),
      '-o', `${tmpobj.name}/hdf2ckl_overrides_test.ckl`,
    ]);
    const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_overrides_test.ckl`, 'utf8').replaceAll(/\r/gi, '');
    const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/converted-rhel7_overrides.ckl'), 'utf8').replaceAll(/\r/gi, '');
    expect(omitChecklistChangingFields(test)).to.eql(omitChecklistChangingFields(sample));
  });

  it('hdf-converter output test - throws error when using invalid checklist metadata (Asset Type)', async () => {
    const { stderr } = await runCommand<{ name: string }>([
      'convert hdf2ckl',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      '-o', `${tmpobj.name}/hdf2ckl_metadata_error_test.json`,
      '-m', path.resolve('test/sample_data/checklist/sample_input_report/invalid_metadata.json'),
    ]);
    expect(stderr).to.equal('Error creating checklist:\nInvalid checklist metadata fields:\n\tHost IP addresses must be valid and separated by newline, space, or comma. (invalid)\n\tAsset Type (Not a real assettype)\n');
  });

  it('hdf-converter output test - throws error when using invalid checklist metadata (Host IP)', async () => {
    const { stderr } = await runCommand<{ name: string }>([
      'convert hdf2ckl',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      '-o', `${tmpobj.name}/hdf2ckl_metadata_error_test.json`,
      '--ip', '"bad ip address"',
    ]);
    expect(stderr).to.equal('Error creating checklist:\nInvalid checklist metadata fields:\n\tHost IP addresses must be valid and separated by newline, space, or comma. (bad ip address)\n');
  });
});
