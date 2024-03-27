import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test attest apply', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .stderr()
    .command(['attest apply', '-i', path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus.json'), path.resolve('./test/sample_data/attestations/attestations_jsonFormat.json'), '-o', `${tmpobj.name}/rhel8_attestations_jsonOutput.json`])
    .it('Successfully applies a JSON attestations file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/rhel8_attestations_jsonOutput.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus_output.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })

  test
    .stdout()
    .command(['attest apply', '-i', path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus.json'), path.resolve('./test/sample_data/attestations/attestations_xlsxFormat.xlsx'), '-o', `${tmpobj.name}/rhel8_attestations_xlsxOutput.json`])
    .it('Successfully applies an XLSX attestations file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/rhel8_attestations_xlsxOutput.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus_output.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })

    test
    .stdout()
    .command(['attest apply', '-i', path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus.json'), path.resolve('./test/sample_data/attestations/attestations_yamlFormat.yaml'), '-o', `${tmpobj.name}/rhel8_attestations_yamlOutput.json`])
    .it('Successfully applies a YAML attestations file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/rhel8_attestations_yamlOutput.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/rhel8_sample_oneOfEachControlStatus_output.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })
})
