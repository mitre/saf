import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import * as XLSX from '@e965/xlsx'

describe('Test hdf2caat two RHEL HDF and a RHEL triple overlay HDF', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  test
    .stdout()
    .command(['convert hdf2caat', '-i', path.resolve('./test/sample_data/HDF/input/red_hat_good.json'), path.resolve('./test/sample_data/HDF/input/red_hat_good.json'), path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'), '-o', `${tmpobj.name}/caat.xlsx`])
    .it('hdf-converter output test', () => {
      const converted = XLSX.readFile(`${tmpobj.name}/caat.xlsx`, {type: 'file'})
      const sample = XLSX.readFile(path.resolve('./test/sample_data/HDF/output/caat/caat.xlsx'), {type: 'file'})
      // convert workbooks to json to compare just the content instead of random bits of xlsx structure
      expect(converted.SheetNames.map(name => XLSX.utils.sheet_to_json(converted.Sheets[name]))).to.eql(sample.SheetNames.map(name => XLSX.utils.sheet_to_json(sample.Sheets[name])))
      // however, we do care about one bit of xlsx structure: the sheet names
      expect(converted.SheetNames).to.eql(sample.SheetNames)
    })
})
