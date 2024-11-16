/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import {omitHDFChangingFields} from '../utils'

describe('Test supplement passthrough', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})
  fs.copyFileSync(path.resolve('./test/sample_data/HDF/input/minimal-hdf.json'), path.resolve(`${tmpobj.name}/minimal-hdf.json`))

  it('Successfully writes a passthrough json to an HDF and makes a new output file', async () => {
    const {stdout} = await runCommand<{name: string}>(['supplement passthrough write',
      '-i', path.resolve('./test/sample_data/HDF/input/minimal-hdf.json'),
      '-f', path.resolve('./test/sample_data/passthrough/passthrough-object.json'),
      '-o', `${tmpobj.name}/minimal-hdf-passthrough-object.json`,
    ])
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf-passthrough-object.json`, 'utf8'))
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/passthrough/minimal-hdf-passthrough-object.json'), 'utf8'))

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
  })

  it('Successfully writes a passthrough json to an HDF inline', async () => {
    const {stdout} = await runCommand<{name: string}>(['supplement passthrough write',
      '-i', path.resolve(`${tmpobj.name}/minimal-hdf.json`),
      '-f', path.resolve('./test/sample_data/passthrough/passthrough-object.json'),
    ])
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf.json`, 'utf8'))
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/passthrough/minimal-hdf-passthrough-object.json'), 'utf8'))

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
  })

  it('Successfully writes passthrough data to an HDF and makes a new output file', async () => {
    const {stdout} = await runCommand<{name: string}>(['supplement passthrough write',
      '-i', path.resolve('./test/sample_data/HDF/input/minimal-hdf.json'),
      '-d', '"test string"', '-o', `${tmpobj.name}/minimal-hdf-passthrough-nonobject.json`,
    ])
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/minimal-hdf-passthrough-nonobject.json`, 'utf8'))
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/passthrough/minimal-hdf-passthrough-nonobject.json'), 'utf8'))

    expect(omitHDFChangingFields(output)).to.eql(omitHDFChangingFields(expected))
  })

  it('Successfully reads passthrough data from an HDF and writes it to a file', async () => {
    const {stdout} = await runCommand<{name: string}>(['supplement passthrough read',
      '-i', path.resolve('./test/sample_data/passthrough/minimal-hdf-passthrough-object.json'),
      '-o', `${tmpobj.name}/passthrough-object.json`])
    const output = JSON.parse(fs.readFileSync(`${tmpobj.name}/passthrough-object.json`, 'utf8'))
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/passthrough/passthrough-object.json'), 'utf8'))

    expect(output).to.eql(expected)
  })

  it('Successfully reads passthrough data from an HDF and writes it to stdout', async () => {
    const {stdout} = await runCommand<{name: string}>(['supplement passthrough read',
      '-i', path.resolve('./test/sample_data/passthrough/minimal-hdf-passthrough-object.json'),
    ])
    const output = JSON.parse(stdout)
    const expected = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/passthrough/passthrough-object.json'), 'utf8'))

    expect(output).to.eql(expected)
  })
})
