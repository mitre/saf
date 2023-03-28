import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import YAML from 'yaml'

describe('Generate threshold', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['generate threshold', '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'), '-o', `${tmpobj.name}/red_hat_good.counts.good.yml`])
    .it('when provided an output file to store threshold', () => {
      const test = YAML.stringify(fs.readFileSync(`${tmpobj.name}/red_hat_good.counts.good.yml`, 'utf8'))
      const sample = YAML.stringify(fs.readFileSync(path.resolve('./test/sample_data/thresholds/red_hat_good.counts.good.yml'), 'utf8'))
      expect(test).to.eql(sample)
    })

  test
    .stdout()
    .command(['generate threshold', '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json')])
    .it('when not provided an output file to store threshold', output => {
      expect(output.stdout).to.contain(fs.readFileSync(path.resolve('./test/sample_data/thresholds/red_hat_good.counts.good.yml'), 'utf8'))
    })
})
