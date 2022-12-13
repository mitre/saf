import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {convertEncodedXmlIntoJson} from '../../../src/utils/xccdf2inspec'

describe('Test xccdf2inspec', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  fs.readdirSync('./test/sample_data/xccdf/stigs').forEach(file => {
    test
      .stdout()
      .command(['generate xccdf_benchmark2inspec_stub', '-i', path.resolve('./test/sample_data/xccdf/stigs', file), '-o', `${tmpobj.name}/${file}`])
      .it(`Has the same number of controls in the stig as generated - ${file}`, () => {
        const parsedXML = convertEncodedXmlIntoJson(fs.readFileSync(path.resolve('./test/sample_data/xccdf/stigs', file), 'utf8'))
        const fileCount = fs.readdirSync(`${tmpobj.name}/${file}/controls/`).length
        expect(fileCount).to.eql(parsedXML.Benchmark.Group.length)
      })
  })
})
