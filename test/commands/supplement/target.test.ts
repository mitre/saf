import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test supplement target', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})
  fs.copyFileSync(path.resolve('./test/sample_data/HDF/input/minimal-hdf.json'), path.resolve(`${tmpobj.name}/minimal-hdf.json`))

  test
    .command(['supplement target write', '-i', path.resolve('./test/sample_data/HDF/input/minimal-hdf.json'), '-f', path.resolve('./test/sample_data/target/target-object.json'), '-o', `${tmpobj.name}/minimal-hdf-target-object.json`])
    .it('Successfully writes a target json to an HDF and makes a new output file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf-target-object.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/target/minimal-hdf-target-object.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })

  test
    .command(['supplement target write', '-i', path.resolve(`${tmpobj.name}/minimal-hdf.json`), '-f', path.resolve('./test/sample_data/target/target-object.json')])
    .it('Successfully writes a target json to an HDF inline', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/target/minimal-hdf-target-object.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })

  test
    .command(['supplement target write', '-i', path.resolve('./test/sample_data/HDF/input/minimal-hdf.json'), '-d', 'test string', '-o', `${tmpobj.name}/minimal-hdf-target-nonobject.json`])
    .it('Successfully writes target data to an HDF and makes a new output file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf-target-nonobject.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/target/minimal-hdf-target-nonobject.json'), 'utf8'))

      expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
    })

  test
    .command(['supplement target read', '-i', path.resolve('./test/sample_data/target/minimal-hdf-target-object.json'), '-o', `${tmpobj.name}/target-object.json`])
    .it('Successfully reads target data from an HDF and writes it to a file', () => {
      const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/target-object.json`, 'utf8'))
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/target/target-object.json'), 'utf8'))

      expect(output).to.eql(expected)
    })

  test
    .stdout()
    .command(['supplement target read', '-i', path.resolve('./test/sample_data/target/minimal-hdf-target-object.json')])
    .it('Successfully reads target data from an HDF and writes it to stdout', ctx => {
      const output = JSON.parse(ctx.stdout)
      const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/target/target-object.json'), 'utf8'))

      expect(output).to.eql(expected)
    })
})
