import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test sbom', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test - dropwizard no vulns', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-no-vulns.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-no-vulns-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter output test - dropwizard vex', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-vex.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-vex-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter output test - dropwizard w/ vulns', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-vulns.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-vulns-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter output test - saf', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/generated-saf-sbom.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-saf-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter output test - vex', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/vex.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-vex-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter output test - spdx converted cyclonedx', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/spdx-to-cyclonedx.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-converted-spdx-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter output test - syft-generated alpine container', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/syft-scan-alpine-container.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`,
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-syft-alpine-container-hdf.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});

describe('Test sbom using withraw flag', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter with raw output test - dropwizard no vulns', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-no-vulns.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-no-vulns-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter with raw output test - dropwizard vex', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-vex.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-vex-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter with raw output test - dropwizard w/ vulns', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-vulns.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-vulns-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter with raw output test - saf', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/generated-saf-sbom.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-saf-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter with raw output test - vex', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/vex.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-vex-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter with raw output test - spdx converted cyclonedx', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/spdx-to-cyclonedx.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-converted-spdx-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
  it('hdf-converter with raw output test - syft-generated alpine container', async () => {
    await runCommand<{ name: string }>([
      'convert cyclonedx_sbom2hdf',
      '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/syft-scan-alpine-container.json'),
      '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w',
    ]);
    const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'));
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-syft-alpine-container-hdf-withraw.json'), 'utf8'));
    expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample));
  });
});
