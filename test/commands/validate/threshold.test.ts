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
    expect(stdout).to.contain('✓ All threshold validations passed')
    expect(stdout).to.contain('threshold checks passed')
    expect(stderr).to.equal('')
  })

  it('Validate threshold test - Triple Overlay Invalid Total Counts', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.bad.total.yml'),
    ])
    // New behavior: outputs to stdout (not stderr)
    expect(stdout).to.contain('✗ Threshold validation failed')
    expect(stdout).to.contain('failed.total')
    expect(stdout).to.contain('55 > 54')
  })

  it('Validate threshold test - Triple Overlay Compliance', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.bad.compliance.yml'),
    ])
    expect(stdout).to.contain('✗ Threshold validation failed')
    expect(stdout).to.contain('compliance.min')
  })

  it('Validate threshold minMaxTotal - Triple Overlay Compliance', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.totalMinMax.yml'),
    ])
    expect(stdout).to.contain('✗ Threshold validation failed')
    expect(stdout).to.contain('passed.total.max')
    expect(stdout).to.contain('19 > 18')
  })

  it('Validate threshold test - RHEL-8 Hardened Valid Exact Counts', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml'),
    ])
    expect(stdout).to.contain('✓ All threshold validations passed')
    expect(stderr).to.equal('')
  })

  it('Validate threshold test - RHEL-8 Hardened Invalid Total Counts', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.bad.noimpactHigh.yml'),
    ])
    expect(stdout).to.contain('✗ Threshold validation failed')
    expect(stdout).to.contain('no_impact.high.max')
    expect(stdout).to.contain('3 > 2')
  })
})

describe('Test validate threshold - using inline values', () => {
  it('Validate threshold test - Valid inline content', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateInline', '"{compliance.min: 66}, {passed.critical.min: 0}, {failed.medium.min: 0}"',
    ])
    expect(stdout).to.contain('✓ All threshold validations passed')
    expect(stderr).to.equal('')
  })
  it('Validate threshold test - Invalid inline content', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateInline', '"{compliance.min: 66}, {passed.critical.min: 0}, {failed.medium.min: 97}"',
    ])
    expect(stdout).to.contain('✗ Threshold validation failed')
    expect(stdout).to.contain('failed.medium.min')
    expect(stdout).to.contain('87 < 97')
  })
})

describe('Test validate threshold - with control IDs', () => {
  it('Validate threshold with control IDs passes when controls match', async () => {
    const {stdout, stderr} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/red_hat_good.with_controls.yml'),
    ])
    expect(stdout).to.contain('✓ All threshold validations passed')
    expect(stderr).to.equal('')
  })
})

describe('Test validate threshold - error handling', () => {
  it('should error when HDF file does not exist', async () => {
    try {
      await runCommand<{name: string}>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/nonexistent.json'),
        '--templateFile', path.resolve('./test/sample_data/thresholds/red_hat_good.counts.good.yml'),
      ])
    } catch (error) {
      expect((error as Error).message).toContain('File not found')
      expect((error as Error).message).toContain('nonexistent.json')
    }
  })

  it('should error when threshold file does not exist', async () => {
    try {
      await runCommand<{name: string}>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
        '--templateFile', path.resolve('./test/sample_data/thresholds/nonexistent.yml'),
      ])
    } catch (error) {
      expect((error as Error).message).toContain('Threshold file not found')
    }
  })

  it('should error when no threshold template provided', async () => {
    try {
      await runCommand<{name: string}>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      ])
    } catch (error) {
      expect((error as Error).message).toContain('Please provide a threshold template')
    }
  })
})

describe('Test validate threshold - filtering and display', () => {
  it('should show transparency warning when filtering hides failures', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '-T', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.bad.noimpactHigh.yml'),
      '--filter-severity', 'critical', // This will hide the no_impact.high failure
    ])
    // Should pass because critical checks pass
    expect(stdout).toContain('✓ All threshold validations passed')
    // Warnings go to stdout (console.warn in Node goes to stdout by default)
    expect(stdout).toContain('⚠️  Validation was filtered')
    expect(stdout).toContain('failures were IGNORED')
  })

  it('should show info note when filtering hides only passes', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '-T', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml'),
      '--filter-severity', 'critical',
    ])
    expect(stdout).toContain('✓ All threshold validations passed')
    expect(stdout).toContain('ℹ️  Note:')
    expect(stdout).toContain('checks were filtered out')
  })

  it('should use display filter without affecting exit code', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '-T', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.bad.noimpactHigh.yml'),
      '--display-severity', 'critical,high', // Display filter only
    ])
    // Should still fail (validates everything, just displays less)
    expect(stdout).toContain('✗ Threshold validation failed')
    // Should NOT show transparency warning (not a validation filter)
    expect(stdout).not.toContain('⚠️  Validation was filtered')
  })
})

describe('Test validate threshold - new output formats', () => {
  it('should output JSON format when --format json is used', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml'),
      '--format', 'json',
    ])
    const parsed = JSON.parse(stdout)
    expect(parsed).toHaveProperty('passed')
    expect(parsed).toHaveProperty('checks')
    expect(parsed).toHaveProperty('summary')
  })

  it('should output JUnit XML format when --format junit is used', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml'),
      '--format', 'junit',
    ])
    expect(stdout).toContain('<?xml version="1.0"')
    expect(stdout).toContain('<testsuites')
    expect(stdout).toContain('<testcase')
  })

  it('should output markdown format when --format markdown is used', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml'),
      '--format', 'markdown',
    ])
    expect(stdout).toContain('# Threshold Validation')
    expect(stdout).toContain('## Summary')
    expect(stdout).toContain('**Status**')
  })

  it('should show detailed output when --verbose is used', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml'),
      '--verbose',
    ])
    expect(stdout).toContain('═══') // Box border
    expect(stdout).toContain('Summary')
  })

  it('should suppress output when --quiet is used', async () => {
    const {stdout} = await runCommand<{name: string}>([
      'validate threshold',
      '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
      '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml'),
      '--quiet',
    ])
    expect(stdout).toBe('')
  })
})
