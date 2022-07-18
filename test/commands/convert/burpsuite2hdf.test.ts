import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test burpsuite', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command([
    'convert burpsuite2hdf',
    '-i',
    path.resolve(
      './test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min',
    ),
    '-o',
    `${tmpobj.name}/burpsuitetest.json`,
  ])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf8'),
    )
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/burpsuite/burpsuite-hdf.json'),
        'utf8',
      ),
    )
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})

describe('Test burpsuite withraw flag', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command([
    'convert burpsuite2hdf',
    '-i',
    path.resolve(
      './test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min',
    ),
    '-o',
    `${tmpobj.name}/burpsuitetest.json`,
    '-w',
  ])
  .it('hdf-converter withraw output test', () => {
    const test = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf8'),
    )
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve(
          './test/sample_data/burpsuite/burpsuite-hdf-withraw.json',
        ),
        'utf8',
      ),
    )
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})

describe('Test using space topic separator using burpsuite case', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command([
    'convert burpsuite2hdf',
    '-i',
    path.resolve(
      './test/sample_data/burpsuite/sample_input_report/zero.webappsecurity.com.min',
    ),
    '-o',
    `${tmpobj.name}/burpsuitetest.json`,
  ])
  .it('hdf-converter output test', () => {
    const test = JSON.parse(
      fs.readFileSync(`${tmpobj.name}/burpsuitetest.json`, 'utf8'),
    )
    const sample = JSON.parse(
      fs.readFileSync(
        path.resolve('./test/sample_data/burpsuite/burpsuite-hdf.json'),
        'utf8',
      ),
    )
    expect(omitHDFChangingFields(test)).to.eql(omitHDFChangingFields(sample))
  })
})
