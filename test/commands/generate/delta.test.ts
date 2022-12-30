import {expect, test} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'

describe('The generate delta command', () => {
  // should process delta request with rule id type
  const tmpobj = tmp.dirSync({unsafeCleanup: true})
  test
    .stdout()
    .command(['generate delta',
      '-J',
      path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X',
      path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o',
      `${tmpobj.name}`,
      '-T',
      'rule'])
    .it('should generate the controls for delta request with "rule" id type', () => {
      const fileCount = fs.readdirSync(`${tmpobj.name}/controls/`).length
      expect(fileCount).to.eql(4)
    })

  //   test
  //     .stdout()
  //     .command(['generate delta',
  //       '-J',
  //       path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
  //       '-X',
  //       path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
  //       '-o',
  //       'test/sample_data/ac-test',
  //       '-T',
  //       'rule'])
  //     .it('should generate controls in a local folder for review', () => {
  //     })

  // should process delta request with group id type
  // should process delta request with cis id type
  // should process delta request with version id type
  // should process delta request with no id type specified
  // should provide proper error message if provided an incorrect id type option (oclif should take care of this test case)
  // should provide error if not given a proper InSpec Profile JSON file
  // should provide error if not given a proper XCCDF file
  // should process delta request with oval definitions file specified
  // should provide error if oval defintioins flag is specified with incorrect file format
  // should process delta with output folder that contains controls information
  // should process delta with intially empty output folder
})
