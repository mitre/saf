import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { omitHDFChangingFields } from '../utils';

describe('Test supplement target', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });
  fs.copyFileSync(path.resolve('./test/sample_data/HDF/input/minimal_hdf.json'), path.resolve(`${tmpobj.name}/minimal_hdf.json`));

  it('Successfully writes a target json to an HDF and makes a new output file', async () => {
    await runCommand<{ name: string }>([
      'supplement target write',
      '-i', path.resolve('./test/sample_data/HDF/input/minimal_hdf.json'),
      '-f', path.resolve('./test/sample_data/target/target-object.json'),
      '-o', `${tmpobj.name}/minimal-hdf-target-object.json`,
    ]);
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf-target-object.json`, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/target/minimal-hdf-target-object.json'), 'utf8'));

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected));
  });

  it('Successfully writes a target json to an HDF inline', async () => {
    await runCommand<{ name: string }>([
      'supplement target write',
      '-i', path.resolve(`${tmpobj.name}/minimal_hdf.json`),
      '-f', path.resolve('./test/sample_data/target/target-object.json'),
    ]);
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal_hdf.json`, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/target/minimal-hdf-target-object.json'), 'utf8'));

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected));
  });

  it('Successfully writes target data to an HDF and makes a new output file', async () => {
    await runCommand<{ name: string }>([
      'supplement target write',
      '-i', path.resolve('./test/sample_data/HDF/input/minimal_hdf.json'),
      '-d', '"test string"', '-o', `${tmpobj.name}/minimal-hdf-target-nonobject.json`,
    ]);
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf-target-nonobject.json`, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/target/minimal-hdf-target-nonobject.json'), 'utf8'));

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected));
  });

  it('Successfully reads target data from an HDF and writes it to a file', async () => {
    await runCommand<{ name: string }>([
      'supplement target read',
      '-i', path.resolve('./test/sample_data/target/minimal-hdf-target-object.json'),
      '-o', `${tmpobj.name}/target-object.json`,
    ]);
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/target-object.json`, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/target/target-object.json'), 'utf8'));

    expect(output).to.eql(expected);
  });

  it('Successfully reads target data from an HDF and writes it to stdout', async () => {
    const { stdout } = await runCommand<{ name: string }>([
      'supplement target read',
      '-i', path.resolve('./test/sample_data/target/minimal-hdf-target-object.json'),
    ]);
    const output = JSON.parse(stdout);
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/target/target-object.json'), 'utf8'));

    expect(output).to.eql(expected);
  });
});
