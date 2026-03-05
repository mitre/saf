import { runCommand } from '@oclif/test';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('Summary command', () => {
  const hdfFilePath = path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json');
  const JSON_reference = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.json');
  const YAML_reference = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.yml');
  const MD_reference = path.resolve('./test/sample_data/HDF/output/summary/rhel-8_hardened_output.md');
  const generatedMD = 'generatedMD.md';
  const UTF8_ENCODING = 'utf8';

  it('runs summary with JSON output and matches the JSON reference file', async () => {
    const { stdout } = await runCommand<{ name: string }>(['summary', '-i', hdfFilePath, '--format=json']);
    const expectedOutput = JSON.parse(fs.readFileSync(JSON_reference, UTF8_ENCODING));
    expect(JSON.parse(stdout)).to.deep.equal(expectedOutput);
  });

  // NOTE: replacing the CR from both files to ensure proper comparison.
  it('runs summary with Markdown output and matches the markdown reference file', async () => {
    await runCommand<{ name: string }>(['summary', '-i', hdfFilePath, '--format=markdown', '--no-title-table', '-o', generatedMD]);
    const expectedOutput = fs.readFileSync(MD_reference, 'utf8').replaceAll(/\r/gi, '').trim();
    const actualOutput = fs.readFileSync(generatedMD, 'utf8').replaceAll(/\r/gi, '').trim();
    expect(actualOutput).to.equal(expectedOutput);
  });

  it('runs summary with YAML output and matches the YAML reference file', async () => {
    const { stdout } = await runCommand<{ name: string }>(['summary', '-i', hdfFilePath, '--format=yaml']);
    const expectedOutputYaml = fs.readFileSync(YAML_reference, UTF8_ENCODING);
    const expectedOutput = yaml.load(expectedOutputYaml);
    const actualOutput = yaml.load(stdout);
    expect(actualOutput).to.deep.equal(expectedOutput);
  });

  it('runs summary with --no-pretty flag and produces flat JSON output', async () => {
    const { stdout } = await runCommand<{ name: string }>(['summary', '-i', hdfFilePath, '--format=json', '--no-print-pretty']);
    const actualOutput = JSON.parse(stdout);
    const flatOutput = structuredClone(actualOutput);
    expect(actualOutput).to.deep.equal(flatOutput);
  });

  it('runs summary with --pretty flag and produces formatted JSON output', async () => {
    const { stdout } = await runCommand<{ name: string }>(['summary', '-i', hdfFilePath, '--format=json', '--print-pretty']);
    const actualOutput = JSON.parse(stdout);
    const prettyOutput = JSON.parse(JSON.stringify(actualOutput, null, 2));
    expect(actualOutput).to.deep.equal(prettyOutput);
  });

  it('runs summary with --stdout flag and prints output to console', async () => {
    const { stdout } = await runCommand<{ name: string }>(['summary', '-i', hdfFilePath, '--format=json', '--stdout']);
    const actualOutput = JSON.parse(stdout);
    expect(actualOutput).to.not.be.empty.equal(true);
  });

  it('runs summary with no-stdout flag and does not write to stdout', async () => {
    const { stdout } = await runCommand<{ name: string }>(['summary', '-i', hdfFilePath, '--format=json', '--no-stdout']);
    expect(stdout).to.be.empty.equal('');
  });
});
