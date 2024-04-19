import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test Dependency-Track', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command([
    'convert dependency_track2hdf',
    '-i',
    path.resolve(
      './test/sample_data/dependency_track/sample_input_report/fpf-default.json',
    ),
    '-o',
    `${tmpobj.name}/dependencytracktest.json`,
  ])
  .it('hdf-converter output test', () => {
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/dependencytracktest.json`, 'utf8'),
    )
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/dependency_track/hdf-default.json'),
        'utf8',
      ),
    )
    expect(omitHDFChangingFields(converted)).to.eql(
      omitHDFChangingFields(sample),
    )
  })
})

describe('Test Dependency-Track withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command([
    'convert dependency_track2hdf',
    '-i',
    path.resolve(
      './test/sample_data/dependency_track/sample_input_report/fpf-default.json',
    ),
    '-o',
    `${tmpobj.name}/dependencytracktest.json`,
    '-w',
  ])
  .it('hdf-converter withraw output test', () => {
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/dependencytracktest.json`, 'utf8'),
    )
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/dependency_track/hdf-default-withraw.json'),
        'utf8',
      ),
    )
    expect(omitHDFChangingFields(converted)).to.eql(
      omitHDFChangingFields(sample),
    )
  })
})

describe('Test Dependency-Track optional attributes (e.g. vulnerability.cwes, analysis.state, etc.)', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command([
    'convert dependency_track2hdf',
    '-i',
    path.resolve(
      './test/sample_data/dependency_track/sample_input_report/fpf-optional-attributes.json',
    ),
    '-o',
    `${tmpobj.name}/dependencytracktest.json`,
  ])
  .it('hdf-converter output test', () => {
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/dependencytracktest.json`, 'utf8'),
    )
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/dependency_track/hdf-optional-attributes.json'),
        'utf8',
      ),
    )
    expect(omitHDFChangingFields(converted)).to.eql(
      omitHDFChangingFields(sample),
    )
  })
})

describe('Test Dependency-Track no vulnerabilities', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command([
    'convert dependency_track2hdf',
    '-i',
    path.resolve(
      './test/sample_data/dependency_track/sample_input_report/fpf-no-vulnerabilities.json',
    ),
    '-o',
    `${tmpobj.name}/dependencytracktest.json`,
  ])
  .it('hdf-converter output test', () => {
    const converted = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/dependencytracktest.json`, 'utf8'),
    )
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/dependency_track/hdf-no-vulnerabilities.json'),
        'utf8',
      ),
    )
    expect(omitHDFChangingFields(converted)).to.eql(
      omitHDFChangingFields(sample),
    )
  })
})