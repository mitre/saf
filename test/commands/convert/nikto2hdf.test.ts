import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test nikto', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command([
    'convert nikto2hdf',
    '-i',
    path.resolve(
      './test/sample_data/nikto/sample_input_report/zero.webappsecurity.json',
    ),
    '-o',
    `${tmpobj.name}/niktotest.json`,
  ])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/niktotest.json`, 'utf8'),
    )
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/nikto/nikto-hdf.json'),
        'utf8',
      ),
    )
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})

describe('Test nikto withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command([
    'convert nikto2hdf',
    '-i',
    path.resolve(
      './test/sample_data/nikto/sample_input_report/zero.webappsecurity.json',
    ),
    '-o',
    `${tmpobj.name}/niktotest.json`,
    '-w',
  ])
  .it('hdf-converter withraw output test', () => {
    const test = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/niktotest.json`, 'utf8'),
    )
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/nikto/nikto-hdf-withraw.json'),
        'utf8',
      ),
    )
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})
