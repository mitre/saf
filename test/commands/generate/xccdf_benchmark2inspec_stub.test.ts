import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {processXCCDF} from '@mitre/inspec-objects'

describe('Test xccdf_benchmark2inspec', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  fs.readdirSync('./test/sample_data/xccdf/stigs').forEach(file => {
    test
      .stdout()
      .command(['generate xccdf_benchmark2inspec_stub', '-i', path.resolve('./test/sample_data/xccdf/stigs', file), '-o', `${tmpobj.name}/${file}`])
      .it(`Has the same number of controls in the stig as generated - ${file}`, () => {
        const parsedXCCDF = processXCCDF(fs.readFileSync(path.resolve('./test/sample_data/xccdf/stigs', file), 'utf8'), false, 'rule')
        const fileCount = fs.readdirSync(`${tmpobj.name}/${file}/controls/`).length
        expect(fileCount).to.eql(parsedXCCDF.controls.length)
      })
  })
})
