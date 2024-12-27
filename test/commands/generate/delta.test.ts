/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import fs from 'fs'

// Functional tests
describe('Test generate delta command', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  // should process delta request with rule id type
  it('should generate the controls for delta request with "rule" id type', async () => {
    await runCommand<{name: string}>(['generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}`,
      '-T', 'rule',
    ])
    const fileCount = fs.readdirSync(`${tmpobj.name}/controls/`).length
    expect(fileCount).to.eql(4)
  })

  // should process delta request with no id type specified
  // should process delta with initially empty output folder
  it('should generate the output folder and place the controls in newly created folder for review', async () => {
    await runCommand<{name: string}>(['generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}/RHEL_7`,
    ])
    const fileCount = fs.readdirSync(`${tmpobj.name}/RHEL_7/controls/`).length
    expect(fileCount).to.eql(4)
  })

  it('should generate a report with given file name and place it on the specified directory', async () => {
    await runCommand<{name: string}>(['generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}/RHEL_7`,
      '-r', `${tmpobj.name}/RHEL_7/my-report.md`,
    ])
    expect(fs.lstatSync((`${tmpobj.name}/RHEL_7/my-report.md`)).isFile()).to.be.true // skipcq: JS-0354
  })

  it('should generate a report name delta.md and place it in the default directory', async () => {
    await runCommand<{name: string}>(['generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}`,
      '-r', `${tmpobj.name}`,
    ])
    expect(fs.lstatSync((`${tmpobj.name}/delta.md`)).isFile()).to.be.true // skipcq: JS-0354
  })

  // should process delta request with group id type
  // should process delta with output folder that contains controls information
  it('should generate the controls for delta request with "group" id type', async () => {
    await runCommand<{name: string}>(['generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}`,
      '-T', 'group',
    ])
    const fileCount = fs.readdirSync(`${tmpobj.name}/controls/`).length
    expect(fileCount).to.eql(4)
  })

  // should process delta request with cis id type
  it('should generate the controls for delta request with "cis" id type', async () => {
    await runCommand<{name: string}>(['generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}`,
      '-T', 'cis',
    ])
    const fileCount = fs.readdirSync(`${tmpobj.name}/controls/`).length
    expect(fileCount).to.eql(4)
  })

  // should process delta request with version id type
  // should process delta request if given the "controls" folder
  it('should generate the controls for delta request with "version" id type', async () => {
    await runCommand<{name: string}>(['generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}/controls`,
      '-T', 'version',
    ])
    const fileCount = fs.readdirSync(`${tmpobj.name}/controls/`).length
    expect(fileCount).to.eql(4)
  })

  // should process delta request with oval definitions file specified
  // should provide error if oval definitions flag is specified with incorrect file format
  it('should match and map controls from one profile to another', async () => {
    const {stdout} = await runCommand<{name: string}>(['generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/profile_and_controls/Windows_Server_2022_v1r3_mini-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/Windows_Server_2022_V2R1_mini-sample-xccdf.xml'),
      '-o', `${tmpobj.name}`,
      '-T', 'rule', '-M',
      '-c', path.resolve('./test/sample_data/inspec/json/profile_and_controls/windows_server_2022_v1r3_mini_controls/'),
    ])

    // Now you can safely access the output
    expect(stdout).to.contain('Match Controls:  5')
  }, 45000)

  it('should map to the correct filenames', async () => {
    const {stdout} = await runCommand<{name: string}>(['generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/profile_and_controls/Windows_Server_2022_v1r3_mini-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/Windows_Server_2022_V2R1_mini-sample-xccdf.xml'),
      '-o', `${tmpobj.name}`,
      '-T', 'rule', '-M',
      '-c', path.resolve('./test/sample_data/inspec/json/profile_and_controls/windows_server_2022_v1r3_mini_controls/'),
    ])

    const output = stdout.split('\n')
    expect(output.includes('Total Controls Found on Delta Directory:  5'))
    expect(output.includes('Total Controls Found on XCCDF:  5'))
    expect(output.includes('["+","SV-254238"]'))
    expect(output.includes('["+","SV-254239"]'))
    expect(output.includes('["+","SV-254240"]'))
    expect(output.includes('["+","SV-254241"]'))
    expect(output.includes('["+","SV-254242"]'))
  }, 45000)
})
