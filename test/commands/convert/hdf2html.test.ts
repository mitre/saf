import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { runCommand } from '@oclif/test';
import { describe, expect, it } from 'vitest';
import { normalizeNewLines, omitHtmlChangingFields } from '../utils';

describe('Test hdf2html triple_overlay_profile_example with default (administrator) report type', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2html',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '-o', `${tmpobj.name}/triple_overlay_profile_example.html`,
    ]);
    const converted = normalizeNewLines(omitHtmlChangingFields(fs.readFileSync(`${tmpobj.name}/triple_overlay_profile_example.html`, 'utf8')));
    const sample = normalizeNewLines(omitHtmlChangingFields(fs.readFileSync(path.resolve('./test/sample_data/html/triple_overlay_profile_example.html'), 'utf8')));
    expect(converted).to.eql(sample);
  });
});

describe('Test hdf2html with manager report type and two input files', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2html',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'), path.resolve('./test/sample_data/HDF/input/vSphere8_report.json'),
      '-o', `${tmpobj.name}/combined_output.html`, '-t', 'Manager',
    ]);
    const converted = normalizeNewLines(omitHtmlChangingFields(fs.readFileSync(`${tmpobj.name}/combined_output.html`, 'utf8')));
    const sample = normalizeNewLines(omitHtmlChangingFields(fs.readFileSync(path.resolve('./test/sample_data/html/combined_output.html'), 'utf8')));
    expect(converted).to.eql(sample);
  });
});

describe('Test hdf2html with executive report type', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2html',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      '-t', 'Executive',
      '-o', `${tmpobj.name}/red_hat_good.html`]);
    const converted = normalizeNewLines(omitHtmlChangingFields(fs.readFileSync(`${tmpobj.name}/red_hat_good.html`, 'utf8')));
    const sample = normalizeNewLines(omitHtmlChangingFields(fs.readFileSync(path.resolve('./test/sample_data/html/red_hat_good.html'), 'utf8')));
    expect(converted).to.eql(sample);
  });
});

describe('Test hdf2html sonarqube with default (administrator) report type', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  it('hdf-converter output test', async () => {
    await runCommand<{ name: string }>([
      'convert hdf2html',
      '-i', path.resolve('./test/sample_data/sonarqube/sonarqube-hdf.json'),
      '-o', `${tmpobj.name}/sonarqube-hdf.html`,
    ]);
    const converted = normalizeNewLines(omitHtmlChangingFields(fs.readFileSync(`${tmpobj.name}/sonarqube-hdf.html`, 'utf8')));
    const sample = normalizeNewLines(omitHtmlChangingFields(fs.readFileSync(path.resolve('./test/sample_data/html/sonarqube-hdf.html'), 'utf8')));
    expect(converted).to.eql(sample);
  });
});
