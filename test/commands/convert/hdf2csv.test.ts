import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import parse from 'csv-parse/lib/sync'

describe('Test hdf2csv triple_overlay_profile_example', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert:hdf2csv', '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'), '-o', `${tmpobj.name}/triple_overlay_profile_example.csv`])
  .it('hdf-converter output test', () => {
    const converted = parse(fs.readFileSync(`${tmpobj.name}/triple_overlay_profile_example.csv`, {encoding: 'utf-8'}))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/HDF/output/csv/triple_overlay_parsed_CSV.json'), {encoding: 'utf-8'}))
    expect(converted).to.eql(sample)
  })
})

describe('Test hdf2csv red_hat_good', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
  .stdout()
  .command(['convert:hdf2csv', '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'), '-o', `${tmpobj.name}/red_hat_good.csv`])
  .it('hdf-converter output test', () => {
    const converted = parse(fs.readFileSync(`${tmpobj.name}/red_hat_good.csv`, {encoding: 'utf-8'}))
    const sample = JSON.parse(fs.readFileSync(path.resolve('./test/sample_data/HDF/output/csv/red_hat_good_parsed_CSV.json'), {encoding: 'utf-8'}))
    expect(converted).to.eql(sample)
  })
})

