import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {ExecJSON} from 'inspecjs'
import _ from 'lodash'

export function omitHDFChangingFields(
  input: Partial<ExecJSON.Execution> & {profiles: ExecJSON.Profile[]},
) {
  return {
    ..._.omit(input, ['version', 'platform.release', 'profiles[0].sha256']),
    profiles: input.profiles.map(profile => {
      return {
        ...profile,
        controls: profile.controls.map(control => {
          return {
            ...control,
            results: control.results.map(result => {
              return {
                ..._.omit(result, 'start_time'),
                message: result.message?.replace(/Updated:.*\n/g, ''),
              }
            }),
          }
        }),
      }
    }),
  }
}

describe('Test attest apply', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .stderr()
  .command(['attest apply', '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'), path.resolve('./test/sample_data/attestations/triple_overlay_example-attestations.json'), '-o', `${tmpobj.name}/triple_overlay_example_json-attestation.json`])
  .it('Sucessfully applies a JSON attestations file', () => {
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/triple_overlay_example_json-attestation.json`, 'utf8'))
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/output/triple_overlay_example_json-attestation.json'), 'utf8'))

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
  })

  test
  .stdout()
  .command(['attest apply', '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'), path.resolve('./test/sample_data/attestations/rhel7-attestations.xlsx'), '-o', `${tmpobj.name}/triple_overlay_example_xlsx-attestation.json`])
  .it('Sucessfully applies an XLSX attestations file', () => {
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/triple_overlay_example_xlsx-attestation.json`, 'utf8'))
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/attestations/output/triple_overlay_example_xlsx-attestation.json'), 'utf8'))

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
  })
})
