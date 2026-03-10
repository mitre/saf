import {runCommand} from '@oclif/test'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'
import {describe, expect, it} from 'vitest'

// Functional tests
describe('Test generate update_controls4delta command', () => {

  // This command updates controls in place, so tests must operate on a temp copy
  // of the fixture controls rather than the checked-in sample files
  it('should rename legacy controls to the new XCCDF control ids', async () => {
    const tempWorkspace = tmp.dirSync({unsafeCleanup: true})
    const sourceControlsDir = path.resolve('./test/sample_data/inspec/json/profile_and_controls/windows_server_2019_v1r3_mini_controls')
    const tempControlsDir = path.join(tempWorkspace.name, 'controls')

    // Copy the sample controls into a temporary directory so the command can
    // safely rename files without affecting the repository fixtures
    fs.cpSync(sourceControlsDir, tempControlsDir, {recursive: true})

    await runCommand<{name: string}>([
      'generate update_controls4delta',
      '-J', path.resolve('./test/sample_data/inspec/json/profile_and_controls/Windows_Server_2019_v1r3_mini-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/Windows_Server_2019_V3R2_xccdf.xml'),
      '-c', tempControlsDir,
      '--no-backupControls',
    ])

    // The temp controls directory should only contain the 5 updated controls
    // that were processed and not any of the others included in the XCCDF STIG
    const fileCount = fs.readdirSync(tempControlsDir).length
    expect(fileCount).to.eql(5)

    // These files represent the updated XCCDF control IDs that should exist after the command is run
    expect(fs.existsSync(path.join(tempControlsDir, 'SV-205844.rb'))).to.eql(true)
    expect(fs.existsSync(path.join(tempControlsDir, 'SV-205845.rb'))).to.eql(true)
    expect(fs.existsSync(path.join(tempControlsDir, 'SV-205846.rb'))).to.eql(true)
    expect(fs.existsSync(path.join(tempControlsDir, 'SV-205657.rb'))).to.eql(true)
    expect(fs.existsSync(path.join(tempControlsDir, 'SV-205661.rb'))).to.eql(true)

    // The original legacy control filenames should no longer exist
    expect(fs.existsSync(path.join(tempControlsDir, 'V-93369.rb'))).to.eql(false)
    expect(fs.existsSync(path.join(tempControlsDir, 'V-93205.rb'))).to.eql(false)
    expect(fs.existsSync(path.join(tempControlsDir, 'V-93207.rb'))).to.eql(false)
    expect(fs.existsSync(path.join(tempControlsDir, 'V-93473.rb'))).to.eql(false)
    expect(fs.existsSync(path.join(tempControlsDir, 'V-93461.rb'))).to.eql(false)
  })

})
