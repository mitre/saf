/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test attest apply', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})
  const captureOpts = {
    print: true, // This will print the output to the console
    stripAnsi: false // Set to true if you want to remove ANSI codes from the output
  };


  // NOTE: replacing all CR from the files being generated to ensure proper comparison.
  it('Successfully applies a JSON attestations file', async () => {
    await runCommand<{name: string}>(['attest apply',
      '-i', path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus.json'),
      path.resolve('./test/sample_data/attestations/attestations_jsonFormat.json'),
      '-o', `${tmpobj.name}/rhel8_attestations_jsonOutput.json`,
    ])
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/rhel8_attestations_jsonOutput.json`, 'utf8').replaceAll(/\r/gi, ''))
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus_output.json'), 'utf8').replaceAll(/\r/gi, ''))

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
  })

  it('Successfully applies an XLSX attestations file', async () => {
    await runCommand<{name: string}>(['attest apply', '-i', path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus.json'), path.resolve('./test/sample_data/attestations/attestations_xlsxFormat.xlsx'), '-o', `${tmpobj.name}/rhel8_attestations_xlsxOutput.json`])
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/rhel8_attestations_xlsxOutput.json`, 'utf8').replaceAll(/\r/gi, ''))
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus_output.json'), 'utf8').replaceAll(/\r/gi, ''))

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
  })

  it('Successfully applies a YAML attestations file', async () => {
    const { stdout, stderr, result, error } = await runCommand(
      [
        'attest apply', 
        '-i', 
        path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus.json'), 
        path.resolve('./test/sample_data/attestations/attestations_yamlFormat.yaml'), 
        '-o', 
        `${tmpobj.name}/rhel8_attestations_yamlOutput.json`
      ],
      undefined,
      captureOpts
    )

    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/rhel8_attestations_yamlOutput.json`, 'utf8').replaceAll(/\r/gi, ''))
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus_output.json'), 'utf8').replaceAll(/\r/gi, ''))

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    expect(stderr).to.be.empty
  })

  it('Successfully applies JSON attestations file to an overlay profile', async () => {
    const { stdout, stderr, result, error } = await runCommand(
      [
        'attest apply',
        '-i',
        path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_sample.json'),
        path.resolve('./test/sample_data/attestations/triple_overlay_example-attestations.json'),
        '-o',
        `${tmpobj.name}/triple_overlay_attested.json`
      ],
      undefined, // No specific load options
      captureOpts
    );

    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/triple_overlay_attested.json`, 'utf8').replaceAll(/\r/gi, ''))
    fs.writeFileSync(path.resolve('./test/sample_data/attestations/triple_overlay_attested.json'), JSON.stringify(output, null, 2))
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/triple_overlay_attested.json'), 'utf8').replaceAll(/\r/gi, ''))

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    expect(stderr).to.be.empty
  })

  it('Successfully applies a YAML attestations file to an overlay profile', async () => {
    const { stdout, stderr, result, error } = await runCommand(
      [
        'attest apply',
        '-i',
        path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_sample.json'),
        path.resolve('./test/sample_data/attestations/triple_overlay_example-attestations.yml'),
        '-o',
        `${tmpobj.name}/triple_overlay_attested_with_yml.json`
      ],
      undefined, // No specific load options
      captureOpts
    );

    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/triple_overlay_attested_with_yml.json`, 'utf8').replaceAll(/\r/gi, ''))

    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/triple_overlay_attested.json'), 'utf8').replaceAll(/\r/gi, ''))

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    expect(stderr).to.be.empty
  })
})
