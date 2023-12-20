import {expect, test} from '@oclif/test'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'

import {omitHDFChangingFields} from '../utils'

describe('Test supplement passthrough', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})
  fs.copyFileSync(path.resolve('./test/sample_data/HDF/input/minimal-hdf.json'), path.resolve(`${tmpobj.name}/minimal-hdf.json`))

  test
    .command(['supplement passthrough write', '-i', path.resolve('./test/sample_data/HDF/input/minimal-hdf.json'), '-f', path.resolve('./test/sample_data/passthrough/passthrough-object.json'), '-o', `${tmpobj.name}/minimal-hdf-passthrough-object.json`])
    .it('Successfully writes a passthrough json to an HDF and makes a new output file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf-passthrough-object.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/passthrough/minimal-hdf-passthrough-object.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })

  test
    .command(['supplement passthrough write', '-i', path.resolve(`${tmpobj.name}/minimal-hdf.json`), '-f', path.resolve('./test/sample_data/passthrough/passthrough-object.json')])
    .it('Successfully writes a passthrough json to an HDF inline', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/passthrough/minimal-hdf-passthrough-object.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })

  test
    .command(['supplement passthrough write', '-i', path.resolve('./test/sample_data/HDF/input/minimal-hdf.json'), '-d', 'test string', '-o', `${tmpobj.name}/minimal-hdf-passthrough-nonobject.json`])
    .it('Successfully writes passthrough data to an HDF and makes a new output file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf-passthrough-nonobject.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/passthrough/minimal-hdf-passthrough-nonobject.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })

  test
    .command(['supplement passthrough read', '-i', path.resolve('./test/sample_data/passthrough/minimal-hdf-passthrough-object.json'), '-o', `${tmpobj.name}/passthrough-object.json`])
    .it('Successfully reads passthrough data from an HDF and writes it to a file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/passthrough-object.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/passthrough/passthrough-object.json'), 'utf8'))

      expect(output).to.eql(expected)
    })

  test
    .stdout()
    .command(['supplement passthrough read', '-i', path.resolve('./test/sample_data/passthrough/minimal-hdf-passthrough-object.json')])
    .it('Successfully reads passthrough data from an HDF and writes it to stdout', ctx => {
      const output = JSON.parse(ctx.stdout)
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/passthrough/passthrough-object.json'), 'utf8'))

      expect(output).to.eql(expected)
    })
})
