import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test msft_secure2hdf', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert msft_secure2hdf', '-r', path.resolve('./test/sample_data/msft_secure/sample_input_report/secureScore.json'), '-p', path.resolve('./test/sample_data/msft_secure/sample_input_report/profiles.json'), '-o', `${tmpobj.name}/msft_securetest.json`])
    .it('hdf-converter output test', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/msft_securetest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/msft_secure/secure_score-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test msft_secure2hdf using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert msft_secure2hdf', '-r', path.resolve('./test/sample_data/msft_secure/sample_input_report/secureScore.json'), '-p', path.resolve('./test/sample_data/msft_secure/sample_input_report/profiles.json'), '-o', `${tmpobj.name}/msft_securetest.json`, '-w'])
    .it('hdf-converter withraw output test', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/msft_securetest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/burpsuite/msft_secure-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})

// describe('Test using Msft Graph API pull using msft_secure case', () => {
//   const tmpobj = tmp.dirSync({unsafeCleanup: true})

//   test
//     .stdout()
//     .command(['convert burpsuite2hdf', '-i', path.resolve('./test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min'), '-o', `${tmpobj.name}/burpsuitetest.json`])
//     .it('hdf-converter output test', () => {
//       const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf8'))
//       const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/burpsuite/burpsuite-hdf.json'), 'utf8'))
//       expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
//     })
// })
