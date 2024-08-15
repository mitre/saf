import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test sbom', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert cyclonedx_sbom2hdf', '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-no-vulns.json'), '-o', `${tmpobj.name}/cyclonedx_sbom.json`])
    .it('hdf-converter output test - dropwizard no vulns', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-no-vulns-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert cyclonedx_sbom2hdf', '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-vex.json'), '-o', `${tmpobj.name}/cyclonedx_sbom.json`])
    .it('hdf-converter output test - dropwizard vex', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-vex-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert cyclonedx_sbom2hdf', '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-vulns.json'), '-o', `${tmpobj.name}/cyclonedx_sbom.json`])
    .it('hdf-converter output test - dropwizard w/ vulns', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-vulns-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert cyclonedx_sbom2hdf', '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/generated-saf-sbom.json'), '-o', `${tmpobj.name}/cyclonedx_sbom.json`])
    .it('hdf-converter output test - saf', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-saf-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert cyclonedx_sbom2hdf', '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/vex.json'), '-o', `${tmpobj.name}/cyclonedx_sbom.json`])
    .it('hdf-converter output test - vex', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-vex-hdf.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
})

describe('Test sbom using withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert cyclonedx_sbom2hdf', '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-no-vulns.json'), '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w'])
    .it('hdf-converter withraw output test - dropwizard no vulns', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-no-vulns-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert cyclonedx_sbom2hdf', '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-vex.json'), '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w'])
    .it('hdf-converter withraw output test - dropwizard vex', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-vex-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert cyclonedx_sbom2hdf', '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/dropwizard-vulns.json'), '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w'])
    .it('hdf-converter withraw output test - dropwizard w/ vulns', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-dropwizard-vulns-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert cyclonedx_sbom2hdf', '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/generated-saf-sbom.json'), '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w'])
    .it('hdf-converter withraw output test - saf', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-saf-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
  test
    .stdout()
    .command(['convert cyclonedx_sbom2hdf', '-i', path.resolve('./test/sample_data/cyclonedx_sbom/sample_input_report/vex.json'), '-o', `${tmpobj.name}/cyclonedx_sbom.json`, '-w'])
    .it('hdf-converter withraw output test - vex', () => {
      const converted = JSON.parse(fs.readFileSync(`${tmpobj.name}/cyclonedx_sbom.json`, 'utf8'))
      const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/cyclonedx_sbom/sbom-vex-hdf-withraw.json'), 'utf8'))
      expect(omitHDFChangingFields(converted)).to.eql(omitHDFChangingFields(sample))
    })
})
