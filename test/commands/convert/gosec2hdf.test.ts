import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test gosec', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert gosec2hdf', '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Grype_gosec_results.json'), '-o', `${tmpobj.name}/gosectest.json`])
    .it('hdf-converter output test - grype', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/grype-gosec-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert gosec2hdf', '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Go_Ethereum_gosec_results_external_suppressed.json'), '-o', `${tmpobj.name}/gosectest.json`])
    .it('hdf-converter output test - unsuppressed go ethereum', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/go-ethereum-external-unsuppressed-gosec-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert gosec2hdf', '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Go_Ethereum_gosec_results_all_suppressed.json'), '-o', `${tmpobj.name}/gosectest.json`])
    .it('hdf-converter output test - suppressed go ethereum', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/go-ethereum-all-unsuppressed-gosec-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test gosec using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert gosec2hdf', '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Grype_gosec_results.json'), '-o', `${tmpobj.name}/gosectest.json`, '-w'])
    .it('hdf-converter output test - grype', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/grype-gosec-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert gosec2hdf', '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Go_Ethereum_gosec_results_external_suppressed.json'), '-o', `${tmpobj.name}/gosectest.json`, '-w'])
    .it('hdf-converter output test - unsuppressed go ethereum', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/go-ethereum-external-unsuppressed-gosec-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert gosec2hdf', '-i', path.resolve('./test/sample_data/gosec/sample_input_report/Go_Ethereum_gosec_results_all_suppressed.json'), '-o', `${tmpobj.name}/gosectest.json`, '-w'])
    .it('hdf-converter output test - suppressed go ethereum', () => {
      const test = JSON.parse(fs.readFileSync(`${tmpobj.name}/gosectest.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/gosec/go-ethereum-all-unsuppressed-gosec-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
    })
})
