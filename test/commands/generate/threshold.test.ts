import {runCommand} from '@oclif/test'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'
import {describe, expect, it} from 'vitest'
import YAML from 'yaml'

describe('Generate threshold', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('when provided an output file to store threshold', async () => {
    // Need to convert to linefeed (\n) otherwise the test will fail when executed in a Windows platform.
    // The YAML.stringify will always include \n as the last character, as is expected of YAML documents.
    await runCommand<{name: string}>(['generate threshold', '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'), '-o', `${tmpobj.name}/red_hat_good.counts.good.yml`])
    const test = YAML.stringify(fs.readFileSync(`${tmpobj.name}/red_hat_good.counts.good.yml`, 'utf8').replaceAll(/\r\n/gi, '\n'))
    const sample = YAML.stringify(fs.readFileSync(path.resolve('./test/sample_data/thresholds/red_hat_good.counts.good.yml'), 'utf8').replaceAll(/\r\n/gi, '\n'))
    expect(test).to.eql(sample)
  })

  it('when not provided an output file to store threshold', async () => {
    // Need to convert to linefeed (\n) otherwise the test will fail when executed in a Windows platform.
    const {stdout} = await runCommand<{name: string}>(['generate threshold', '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json')])
    expect(stdout.replaceAll(/\r\n/gi, '\n')).to.contain(fs.readFileSync(path.resolve('./test/sample_data/thresholds/red_hat_good.counts.good.yml'), 'utf8').replaceAll(/\r\n/gi, '\n'))
  })
})
