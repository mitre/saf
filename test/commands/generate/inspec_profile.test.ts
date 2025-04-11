import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {processXCCDF} from '@mitre/inspec-objects'

describe('Test inspec_profile (aliases:xccdf_benchmark2inspec)', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})
  // Remove all controlled temporary objects on process exit
  tmp.setGracefulCleanup()

  fs.readdirSync('./test/sample_data/xccdf/stigs').forEach((file) => {
    it(`Generated scaffold has the same number of controls based on STIG benchmark: ${file}`, async () => {
      await runCommand<{name: string}>(['generate inspec_profile', '-X', path.resolve('./test/sample_data/xccdf/stigs', file), '-o', `${tmpobj.name}/${file}`])
      const parsedXCCDF = processXCCDF(fs.readFileSync(path.resolve('./test/sample_data/xccdf/stigs', file), 'utf8'), false, 'rule')
      const fileCount = fs.readdirSync(`${tmpobj.name}/${file}/controls/`).length
      expect(fileCount).to.eql(parsedXCCDF.controls.length)
    })
  })

  fs.readdirSync('./test/sample_data/xccdf/cis').forEach((file) => {
    it(`Generated scaffold has the same number of controls based on CIS benchmark: ${file}`, async () => {
      await runCommand<{name: string}>(['generate inspec_profile', '-X', path.resolve('./test/sample_data/xccdf/cis', file), '-T', 'cis', '-o', `${tmpobj.name}/${file}`])
      const parsedXCCDF = processXCCDF(fs.readFileSync(path.resolve('./test/sample_data/xccdf/cis', file), 'utf8'), false, 'rule')
      const fileCount = fs.readdirSync(`${tmpobj.name}/${file}/controls/`).length
      expect(fileCount).to.eql(parsedXCCDF.controls.length)
    })
  })
})
