/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import {runCommand} from '@oclif/test'
import assert from 'assert'
import {diff} from 'deep-diff'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'
import {parseStringPromise} from 'xml2js'
import {removeUUIDs} from '../utils'

describe('Test hdf2checklist - deep compare', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})
  const logDir = './test/logs'

  beforeEach(() => {
    // Check if the directory exists
    if (!fs.existsSync(logDir)) {
      // If it doesn't exist, create the directory
      fs.mkdirSync(logDir)
    }
  })

  it('hdf-converter output test - defaults', async () => {
    await runCommand<{name: string}>(['convert hdf2ckl',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      '-o', `${tmpobj.name}/hdf2ckl_test.ckl`,
    ])
    const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_test.ckl`, 'utf8').replaceAll(/\r/gi, '')
    const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/red_hat_good.ckl'), 'utf8').replaceAll(/\r/gi, '')

    const testObj = await parseStringPromise(test)
    const sampleObj = await parseStringPromise(sample)

    removeUUIDs(testObj)
    removeUUIDs(sampleObj)

    const differences = diff(testObj, sampleObj)

    if (differences) {
      fs.writeFileSync(`${logDir}/differences_hdf2ckl_defaults.json`, JSON.stringify(differences, null, 2))
      assert.fail(`Objects are not deeply equal - see ${logDir}/differences_hdf2ckl_defaults.json`)
    }
  })

  it('hdf-converter output test - inspec results from profile with dependent profiles', async () => {
    await runCommand<{name: string}>(['convert hdf2ckl',
      '-i', path.resolve('./test/sample_data/HDF/input/vSphere8_report.json'),
      '-o', `${tmpobj.name}/hdf2ckl_test.json`,
    ])
    const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_test.json`, 'utf8').replaceAll(/\r/gi, '')
    const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/vSphere8_report.ckl'), 'utf8').replaceAll(/\r/gi, '')

    const testObj = await parseStringPromise(test)
    const sampleObj = await parseStringPromise(sample)

    removeUUIDs(testObj)
    removeUUIDs(sampleObj)

    const differences = diff(testObj, sampleObj)

    if (differences) {
      fs.writeFileSync(`${logDir}/differences_hdf2ckl_test.json`, JSON.stringify(differences, null, 2))
      assert.fail(`Objects are not deeply equal - see ${logDir}/differences_hdf2ckl_test.json`)
    }
  })

  it('hdf-converter output test - with metadata', async () => {
    await runCommand<{name: string}>(['convert hdf2ckl',
      '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'),
      '-o', `${tmpobj.name}/hdf2ckl_metadata_test.json`,
      '-m', path.resolve('./test/sample_data/checklist/metadata.json'),
    ])
    const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_metadata_test.json`, 'utf8').replaceAll(/\r/gi, '')
    const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/red_hat_good_metadata.ckl'), 'utf8').replaceAll(/\r/gi, '')

    const testObj = await parseStringPromise(test)
    const sampleObj = await parseStringPromise(sample)

    removeUUIDs(testObj)
    removeUUIDs(sampleObj)

    const differences = diff(testObj, sampleObj)

    if (differences) {
      fs.writeFileSync(`${logDir}/differences_hdf2ckl_metadata_test.json`, JSON.stringify(differences, null, 2))
      assert.fail(`Objects are not deeply equal - see ${logDir}/differences_hdf2ckl_metadata_test.json`)
    }
  })
})
