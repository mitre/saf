import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test Trufflehog', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert trufflehog2hdf', '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog.json'), '-o', `${tmpobj.name}/trufflehog.json`])
    .it('hdf-converter output test - standard', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert trufflehog2hdf', '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_docker_example.json'), '-o', `${tmpobj.name}/trufflehog.json`])
    .it('hdf-converter output test - docker', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-docker-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert trufflehog2hdf', '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_report_example.json'), '-o', `${tmpobj.name}/trufflehog.json`])
    .it('hdf-converter output test - report', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-report-example-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert trufflehog2hdf', '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_saf_example.json'), '-o', `${tmpobj.name}/trufflehog.json`])
    .it('hdf-converter output test - saf', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-saf-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test Trufflehog using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert trufflehog2hdf', '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog.json'), '-o', `${tmpobj.name}/trufflehog.json`, '-w'])
    .it('hdf-converter withraw output test - standard', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert trufflehog2hdf', '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_docker_example.json'), '-o', `${tmpobj.name}/trufflehog.json`, '-w'])
    .it('hdf-converter withraw output test - docker', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-docker-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert trufflehog2hdf', '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_report_example.json'), '-o', `${tmpobj.name}/trufflehog.json`, '-w'])
    .it('hdf-converter withraw output test - report', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-report-example-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert trufflehog2hdf', '-i', path.resolve('./test/sample_data/trufflehog/sample_input_report/trufflehog_saf_example.json'), '-o', `${tmpobj.name}/trufflehog.json`, '-w'])
    .it('hdf-converter withraw output test - saf', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/trufflehog.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/trufflehog/trufflehog-saf-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
})
