import {test} from '@oclif/test'
import assert from 'assert'
import {diff} from 'deep-diff'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'
import {parseStringPromise} from 'xml2js'
import {removeUUIDs} from '../utils'
describe('Test hdf2checklist', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})
  const logDir = './test/logs'

  test
    .stdout()
    .command(['convert hdf2ckl', '-i', path.resolve('./test/sample_data/HDF/input/vSphere8_report.json'), '-o', `${tmpobj.name}/hdf2ckl_test.json`])
    .do(() => assert(fs.existsSync(`${tmpobj.name}/hdf2ckl_test.json`), 'Output file does not exist'))
    .it('hdf-converter output test - inspec results from profile with dependent profiles', async () => {
      const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_test.json`, 'utf8')
      const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/vSphere8_report.ckl'), 'utf8')

      const testObj = await parseStringPromise(test)
      const sampleObj = await parseStringPromise(sample)

      removeUUIDs(testObj)
      removeUUIDs(sampleObj)

      const differences = diff(testObj, sampleObj)

      if (differences) {
        fs.writeFileSync(`${logDir}/differences_hdf2ckl_test.json`, JSON.stringify(differences, null, 2))
        assert.fail('Objects are not deeply equal')
      }
    })

  test
    .stdout()
    .command(['convert hdf2ckl', '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'), '-o', `${tmpobj.name}/hdf2ckl_metadata_test.json`, '-m', path.resolve('./test/sample_data/checklist/metadata.json')])
    .do(() => assert(fs.existsSync(`${tmpobj.name}/hdf2ckl_metadata_test.json`), 'Output file does not exist'))
    .it('hdf-converter output test - with metadata', async () => {
      const test = fs.readFileSync(`${tmpobj.name}/hdf2ckl_metadata_test.json`, 'utf8')
      const sample = fs.readFileSync(path.resolve('./test/sample_data/checklist/red_hat_good_metadata.ckl'), 'utf8')

      const testObj = await parseStringPromise(test)
      const sampleObj = await parseStringPromise(sample)

      removeUUIDs(testObj)
      removeUUIDs(sampleObj)

      const differences = diff(testObj, sampleObj)

      if (differences) {
        fs.writeFileSync(`${logDir}/differences_hdf2ckl_metadata_test.json`, JSON.stringify(differences, null, 2))
        assert.fail('Objects are not deeply equal')
      }
    })
})
