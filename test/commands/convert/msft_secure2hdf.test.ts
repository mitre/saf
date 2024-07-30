import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test msft_secure from pre-downloaded inputs', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert msft_secure2hdf', '-r', path.resolve('./test/sample_data/msft_secure/sample_input_report/secureScore.json'), '-p', path.resolve('./test/sample_data/msft_secure/sample_input_report/profiles.json'), '-o', `${tmpobj.name}/msft-secure.json`])
    .it('hdf-converter output test', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/msft-secure.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/msft_secure/secure-score-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test msft_secure using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert msft_secure2hdf', '-r', path.resolve('./test/sample_data/msft_secure/sample_input_report/secureScore.json'), '-p', path.resolve('./test/sample_data/msft_secure/sample_input_report/profiles.json'), '-o', `${tmpobj.name}/msft-secure.json`, '-w'])
    .it('hdf-converter withraw output test', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/msft-secure.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/msft_secure/secure-score-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test msft_secure from combined input', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert msft_secure2hdf', '-i', path.resolve('./test/sample_data/msft_secure/sample_input_report/combined.json'), '-o', `${tmpobj.name}/msft-secure.json`])
    .it('hdf-converter output test', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/msft-secure.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/msft_secure/secure-score-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})
