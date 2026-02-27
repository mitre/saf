import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test attest apply', () => {
  let tmpobj: tmp.DirResult;

  beforeAll(() => {
    tmpobj = tmp.dirSync({ unsafeCleanup: true });
  });

  afterAll(() => {
    tmpobj.removeCallback();
  });

  const captureOpts = {
    print: true,
    stripAnsi: false,
  };

  const readAndParseJSON = (filePath: fs.PathOrFileDescriptor) => {
    return JSON.parse(fs.readFileSync(filePath, 'utf8').replaceAll(/\r/gi, ''));
  };

  const runAndValidate = async (commandArgs: string | string[], outputFilePath: string, expectedFilePath: string) => {
    const { stderr } = await runCommand(commandArgs, undefined, captureOpts);
    const output = readAndParseJSON(outputFilePath);
    const expected = readAndParseJSON(expectedFilePath);

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected));
    expect(stderr).to.be.empty.equal('');
  };

  it('Successfully applies a JSON attestations file', async () => {
    await runAndValidate(
      [
        'attest apply',
        '-i', path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus.json'),
        path.resolve('./test/sample_data/attestations/attestations_jsonFormat.json'),
        '-o', `${tmpobj.name}/rhel8_attestations_jsonOutput.json`,
      ],
      `${tmpobj.name}/rhel8_attestations_jsonOutput.json`,
      path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus_output.json'),
    );
  });

  it('Successfully applies an XLSX attestations file', async () => {
    await runAndValidate(
      [
        'attest apply',
        '-i', path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus.json'),
        path.resolve('./test/sample_data/attestations/attestations_xlsxFormat.xlsx'),
        '-o', `${tmpobj.name}/rhel8_attestations_xlsxOutput.json`,
      ],
      `${tmpobj.name}/rhel8_attestations_xlsxOutput.json`,
      path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus_output.json'),
    );
  });

  it('Successfully applies a YAML attestations file', async () => {
    await runAndValidate(
      [
        'attest apply',
        '-i', path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus.json'),
        path.resolve('./test/sample_data/attestations/attestations_yamlFormat.yaml'),
        '-o', `${tmpobj.name}/rhel8_attestations_yamlOutput.json`,
      ],
      `${tmpobj.name}/rhel8_attestations_yamlOutput.json`,
      path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus_output.json'),
    );
  });

  it('Successfully applies JSON attestations file to an overlay profile', async () => {
    await runAndValidate(
      [
        'attest apply',
        '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_sample.json'),
        path.resolve('./test/sample_data/attestations/triple_overlay_example-attestations.json'),
        '-o', `${tmpobj.name}/triple_overlay_attested.json`,
      ],
      `${tmpobj.name}/triple_overlay_attested.json`,
      path.resolve('./test/sample_data/attestations/triple_overlay_attested.json'),
    );
  });

  it('Successfully applies a YAML attestations file to an overlay profile', async () => {
    await runAndValidate(
      [
        'attest apply',
        '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_sample.json'),
        path.resolve('./test/sample_data/attestations/triple_overlay_example-attestations.yml'),
        '-o', `${tmpobj.name}/triple_overlay_attested_with_yml.json`,
      ],
      `${tmpobj.name}/triple_overlay_attested_with_yml.json`,
      path.resolve('./test/sample_data/attestations/triple_overlay_attested.json'),
    );
  });
});
