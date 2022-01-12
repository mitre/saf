import {expect, test} from '@oclif/test'
import * as tmp from 'tmp'
import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import {convertEncodedXmlIntoJson} from '../../../src/utils/xccdf2inspec'
import {DisaStig} from '../../../src/types/xccdf'

describe('Test xccdf2inspec', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  fs.readdirSync('./test/sample_data/xccdf/stigs').forEach(file => {
    console.log(file)
    test
    .stdout()
    .command(['convert:xccdf2inspec', '-i', path.resolve('./test/sample_data/xccdf/stigs', file), '-o', `${tmpobj.name}/${file}`])
    .it(`Has the same number of controls in the stig as generated - ${file}`, () => {
      const parsedXML: DisaStig = convertEncodedXmlIntoJson(fs.readFileSync(path.resolve('./test/sample_data/xccdf/stigs', file), 'utf-8'))
      const fileCount = fs.readdirSync(`${tmpobj.name}/${file}/controls/`).length
      expect(parsedXML.Benchmark.Group.length).to.eql(fileCount)
    })
  })
})
