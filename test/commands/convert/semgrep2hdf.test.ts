import { runCommand } from '@oclif/test';
import fs from 'node:fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

async function compareSemgrep(
  input: string,
  baseline = input,
  includeRaw = false,
) {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });
  const output = path.join(tmpobj.name, 'semgrep-hdf.json');
  const samples = path.resolve('./test/sample_data/semgrep');

  try {
    await runCommand<{ name: string }>([
      'convert semgrep2hdf',
      '-i', path.join(samples, 'sample_input_report', `${input}.json`),
      '-o', output,
      ...(includeRaw ? ['-w'] : []),
    ]);

    const actual = JSON.parse(fs.readFileSync(output, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(
      path.join(samples, `${baseline}-hdf.json`),
      'utf8',
    ));

    expect(omitHDFChangingFields(actual)).to.eql(
      omitHDFChangingFields(expected),
    );
  } finally {
    tmpobj.removeCallback();
  }
}

describe('Test semgrep', () => {
  it('hdf-converter output test', async () => {
    await compareSemgrep('semgrep_findings');
  });
});

describe('Test semgrep using withraw flag', () => {
  it('hdf-converter with raw output test', async () => {
    await compareSemgrep(
      'semgrep_findings',
      'semgrep_findings-withraw',
      true,
    );
  });
});

describe('Test semgrep with no findings', () => {
  it('hdf-converter empty scan output test', async () => {
    await compareSemgrep('semgrep_empty');
  });
});

describe('Test semgrep with scan errors', () => {
  it('hdf-converter scan errors output test', async () => {
    await compareSemgrep('semgrep_errors');
  });
});
