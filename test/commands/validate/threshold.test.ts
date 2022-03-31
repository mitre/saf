import {expect, test} from '@oclif/test'
import path from 'path'
import _ from 'lodash'

describe('Test validate threshold', () => {
  test
  .stdout()
  .stderr()
  .command([
    'validate threshold',
    '-i',
    path.resolve(
      './test/sample_data/HDF/input/triple_overlay_profile_example.json',
    ),
    '--templateFile',
    path.resolve(
      './test/sample_data/HDF/input/triple_overlay_profile_example.json.counts.good',
    ),
  ])
  .it('Validate threshold test - Triple Overlay Valid Counts', ctx => {
    expect(ctx.stdout).to.equal('')
    expect(ctx.stderr).to.equal('')
  })

  test
  .stdout()
  .stderr()
  .command([
    'validate threshold',
    '-i',
    path.resolve(
      './test/sample_data/HDF/input/triple_overlay_profile_example.json',
    ),
    '--templateFile',
    path.resolve(
      './test/sample_data/HDF/input/triple_overlay_profile_example.json.counts.bad.total',
    ),
  ])
  .catch(error => {
    expect(error.message).to.equal('failed.total: 55 < 54')
  })
  .it(
    'Validate threshold test - Triple Overlay Invalid Total Counts',
    ctx => {
      expect(ctx.stdout).to.equal('')
    },
  )

  test
  .stdout()
  .stderr()
  .command([
    'validate threshold',
    '-i',
    path.resolve(
      './test/sample_data/HDF/input/triple_overlay_profile_example.json',
    ),
    '--templateFile',
    path.resolve(
      './test/sample_data/HDF/input/triple_overlay_profile_example.json.counts.bad.compliance',
    ),
  ])
  .catch(error => {
    expect(error.message).to.equal('Overall compliance minimum was not satisfied')
  })
  .it(
    'Validate threshold test - Triple Overlay Compliance',
    ctx => {
      expect(ctx.stdout).to.equal('')
    },
  )
})
