import {expect, test} from '@oclif/test'
// import assert from 'assert'
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

  test
    .stdout()
    .command(['generate delta',
      '-J',
      path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X',
      path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o',
      `${tmpobj.name}/RHEL_7`])
    .it('should generate the output folder and place the controls in newly created folder for review', () => {
      const fileCount = fs.readdirSync(`${tmpobj.name}/RHEL_7/controls/`).length
      expect(fileCount).to.eql(4)
    })

  test
    .stdout()
    .command(['generate delta',
      '-J',
      path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X',
      path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o',
      `${tmpobj.name}/RHEL_7`,
      '-r',
      `${tmpobj.name}/RHEL_7/my-report.md`])
    .it('should generate a report with given file name and place it on the specified directory', () => {
      expect(fs.lstatSync((`${tmpobj.name}/RHEL_7/my-report.md`)).isFile()).to.be.true // skipcq: JS-0354
    })

  test
    .stdout()
    .command(['generate delta',
      '-J',
      path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X',
      path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o',
      `${tmpobj.name}`,
      '-r',
      `${tmpobj.name}`])
    .it('should generate a report name delta.md and place it the default directory', () => {
      expect(fs.lstatSync((`${tmpobj.name}/delta.md`)).isFile()).to.be.true // skipcq: JS-0354
    })

  // test
  // .stdout()
  // .command(['generate delta',
  //   '-J',
  //   path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profiles.json'),
  //   '-X',
  //   path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
  //   '-o',
  //   `${tmpobj.name}`,
  //   '-T',
  //   'rule'])
  // .it('should throw an exception if not given a proper InSpec Profile JSON file', () => {
  //   assert.throws(
  //     () => hello.greet(),
  //     'Invalid InsPec Profile JSON file provided'
  //   );
  // })
  // should process delta request with group id type
  // should process delta request with cis id type
  // should process delta request with version id type
  // should process delta request with no id type specified
  // should provide proper error message if provided an incorrect id type option (oclif should take care of this test case)

  // should provide error if not given a proper InSpec Profile JSON file
  // should provide error if not given a proper XCCDF file

  // should process delta request with oval definitions file specified
  // should provide error if oval definitions flag is specified with incorrect file format
  // should process delta with output folder that contains controls information
  // should process delta with initially empty output folder
})
