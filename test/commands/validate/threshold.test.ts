import {expect, test} from '@oclif/test'
import path from 'path'

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
        './test/sample_data/thresholds/triple_overlay_profile_example.json.counts.good.yml',
      ),
    ])
    .it('Validate threshold test - Triple Overlay Valid Counts', ctx => {
      expect(ctx.stdout).to.equal('All validation tests passed\n')
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
        './test/sample_data/thresholds/triple_overlay_profile_example.json.counts.bad.total.yml',
      ),
    ])
    .it('Validate threshold test - Triple Overlay Invalid Total Counts',
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
        './test/sample_data/thresholds/triple_overlay_profile_example.json.counts.bad.compliance.yml',
      ),
    ])
    // .catch(error => {
    //   expect(error.message).to.equal('Overall compliance minimum was not satisfied')
    // })
    .it('Validate threshold test - Triple Overlay Compliance',
      ctx => {
        expect(ctx.stdout).to.equal('')
      },
    )

  test.stdout().stderr()
    .command([
      'validate threshold',
      '-i',
      path.resolve(
        './test/sample_data/HDF/input/triple_overlay_profile_example.json',
      ),
      '--templateFile',
      path.resolve(
        './test/sample_data/thresholds/triple_overlay_profile_example.json.counts.totalMinMax.yml',
      ),
    ])
    // .catch(error => {
    //   expect(error.message).to.equal('passed.total.max: Threshold not met. Number of received total passed controls (19) is greater than your set threshold for the number of passed controls (18)')
    // })
    .it('Validate threshold minMaxTotal - Triple Overlay Compliance',
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
        './test/sample_data/HDF/input/rhel-8_hardened.json',
      ),
      '--templateFile',
      path.resolve(
        './test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml',
      ),
    ])
    .it('Validate threshold test - RHEL-8 Hardened Valid Exact Counts', ctx => {
      expect(ctx.stdout).to.equal('All validation tests passed\n')
      expect(ctx.stderr).to.equal('')
    })

  test
    .stdout()
    .stderr()
    .command([
      'validate threshold',
      '-i',
      path.resolve(
        './test/sample_data/HDF/input/rhel-8_hardened.json',
      ),
      '--templateFile',
      path.resolve(
        './test/sample_data/thresholds/rhel-8_hardened.counts.bad.noimpactHigh.yml',
      ),
    ])
    // .catch(error => {
    //   expect(error.message).to.equal('no_impact.high.max: Threshold not met. Number of received total no_impact controls (3) is greater than your set threshold for the number of no_impact controls (2)')
    // })
    .it(
      'Validate threshold test - RHEL-8 Hardened Invalid Total Counts',
      ctx => {
        expect(ctx.stdout).to.equal('')
      },
    )
})
