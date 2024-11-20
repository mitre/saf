/* eslint-disable array-element-newline */
/* eslint-disable array-bracket-newline */
import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import path from 'path'

describe('Test validate threshold', () => {
  it('Validate threshold test - Triple Overlay Valid Counts', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>(['validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.good.yml'),
    ])
    expect(stdout).to.equal('All validation tests passed\n')
    expect(stderr).to.equal('')
  })

  it('Validate threshold test - Triple Overlay Invalid Total Counts', async () => {
    const {stdout} = await runCommand<{name: string}>(['validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.bad.total.yml'),
    ])
    expect(stdout).to.equal('')
  })

  it('Validate threshold test - Triple Overlay Compliance', async () => {
    const {stdout} = await runCommand<{name: string}>(['validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.bad.compliance.yml'),
    ])
    expect(stdout).to.equal('')
  })

  it('Validate threshold minMaxTotal - Triple Overlay Compliance', async () => {
    const {stdout} = await runCommand<{name: string}>(['validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.totalMinMax.yml'),
    ])
    expect(stdout).to.equal('')
  })

  it('Validate threshold test - RHEL-8 Hardened Valid Exact Counts', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>(['validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml'),
    ])
    expect(stdout).to.equal('All validation tests passed\n')
    expect(stderr).to.equal('')
  })

  it('Validate threshold test - RHEL-8 Hardened Invalid Total Counts', async () => {
    const {stdout} = await runCommand<{name: string}>(['validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.bad.noimpactHigh.yml'),
    ])
    expect(stdout).to.equal('')
  })
})
