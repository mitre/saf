import {runCommand} from '@oclif/test'
import {describe, expect, it} from 'vitest'
import path from 'path'

describe('Test validate threshold - using template file', () => {
  it('Validate threshold test - Triple Overlay Valid Counts', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.good.yml'),
    ])
    expect(stdout).to.equal('All validation tests passed\n')
    expect(stderr).to.equal('')
  })

  it('Validate threshold test - Triple Overlay Invalid Total Counts', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.bad.total.yml'),
    ])
    expect(stdout).to.equal('')
    expect(stderr).to.equal('Error: failed.total: Threshold not met. Number of received total failed controls (55) is not equal to your set threshold for the number of failed controls (54)\n')
  })

  it('Validate threshold test - Triple Overlay Compliance', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.bad.compliance.yml'),
    ])
    expect(stdout).to.equal('')
    expect(stderr).to.equal('Error: Overall compliance minimum was not satisfied\n')
  })

  it('Validate threshold minMaxTotal - Triple Overlay Compliance', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.totalMinMax.yml'),
    ])
    expect(stdout).to.equal('')
    expect(stderr).to.equal('Error: passed.total.max: Threshold not met. Number of received total passed controls (19) is greater than your set threshold for the number of passed controls (18)\n')
  })

  it('Validate threshold test - RHEL-8 Hardened Valid Exact Counts', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml'),
    ])
    expect(stdout).to.equal('All validation tests passed\n')
    expect(stderr).to.equal('')
  })

  it('Validate threshold test - RHEL-8 Hardened Invalid Total Counts', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.bad.noimpactHigh.yml'),
    ])
    expect(stdout).to.equal('')
    expect(stderr).to.equal('Error: no_impact.high.max: Threshold not met. Number of received total no_impact controls (3) is greater than your set threshold for the number of no_impact controls (2)\n')
  })
})

describe('Test validate threshold - using inline values', () => {
  it('Validate threshold test - Valid inline content', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateInline', '"{compliance.min: 66}, {passed.critical.min: 0}, {failed.medium.min: 0}"',
    ])
    expect(stdout).to.equal('All validation tests passed\n')
    expect(stderr).to.equal('')
  })
  it('Validate threshold test - Invalid inline content', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateInline', '"{compliance.min: 66}, {passed.critical.min: 0}, {failed.medium.min: 97}"',
    ])
    expect(stdout).to.equal('')
    expect(stderr).to.equal('Error: failed.medium.min: Threshold not met. Number of received total failed controls (87) is less than your set threshold for the number of failed controls (97)\n')
  })
})
