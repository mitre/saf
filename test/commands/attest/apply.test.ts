import {expect, test} from '@oclif/test'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'

import {omitHDFChangingFields} from '../utils'

describe('Test attest apply', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .stderr()
    .command(['attest apply', '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'), path.resolve('./test/sample_data/attestations/triple_overlay_example-attestations.json'), '-o', `${tmpobj.name}/triple_overlay_example_json-attestation.json`])
    .it('Successfully applies a JSON attestations file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/triple_overlay_example_json-attestation.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/output/triple_overlay_example_json-attestation.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })

  test
    .stdout()
    .command(['attest apply', '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'), path.resolve('./test/sample_data/attestations/rhel7-attestations.xlsx'), '-o', `${tmpobj.name}/red_hat_good_xlsx-attestation.json`])
    .it('Successfully applies an XLSX attestations file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/red_hat_good_xlsx-attestation.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/output/red_hat_good_xlsx-attestation.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })
})
