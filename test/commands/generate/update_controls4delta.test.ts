import {runCommand} from '@oclif/test'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'
import {describe, expect, it} from 'vitest'

describe('Test generate update_controls4delta command', () => {
    // Todo: (1) Generate new sample profile / controls for this test
    //       (2) Rename original delta sample profile / controls to 2019 to better reflect fuzzy match behavior
          

  // This command updates controls in place, so tests must operate on a temp copy
  // of the fixture controls rather than the checked-in sample files
  it('should rename legacy controls to the new XCCDF control ids', async () => {
    const tempWorkspace = tmp.dirSync({unsafeCleanup: true})
    const sourceControlsDir = path.resolve('./test/sample_data/inspec/json/profile_and_controls/windows_server_2022_v1r3_mini_controls')
    const tempControlsDir = path.join(tempWorkspace.name, 'controls')

    // Copy the sample controls into a temporary directory so the command can
    // safely rename files without affecting the repository fixtures
    fs.cpSync(sourceControlsDir, tempControlsDir, {recursive: true})

    await runCommand<{name: string}>([
      'generate update_controls4delta',
      '-J', path.resolve('./test/sample_data/inspec/json/profile_and_controls/Windows_Server_2022_v1r3_mini-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/Windows_Server_2022_V2R1_mini-sample-xccdf.xml'),
      '-c', tempControlsDir,
      '-g',
      '--no-backupControls',
    ])

    // These files represent the updated XCCDF control ids that should exist
    // after legacy V- controls are renamed in place
    expect(fs.existsSync(path.join(tempControlsDir, 'SV-254238.rb'))).to.eql(true)
    expect(fs.existsSync(path.join(tempControlsDir, 'SV-254240.rb'))).to.eql(true)
    expect(fs.existsSync(path.join(tempControlsDir, 'SV-254241.rb'))).to.eql(true)
    expect(fs.existsSync(path.join(tempControlsDir, 'SV-254242.rb'))).to.eql(true)
    expect(fs.existsSync(path.join(tempControlsDir, 'SV-254239.rb'))).to.eql(true)

    // The original legacy control filenames should no longer exist once the
    // rename/update pass completes
    expect(fs.existsSync(path.join(tempControlsDir, 'V-93205.rb'))).to.eql(false)
    expect(fs.existsSync(path.join(tempControlsDir, 'V-93207.rb'))).to.eql(false)
    expect(fs.existsSync(path.join(tempControlsDir, 'V-93369.rb'))).to.eql(false)
    expect(fs.existsSync(path.join(tempControlsDir, 'V-93461.rb'))).to.eql(false)
    expect(fs.existsSync(path.join(tempControlsDir, 'V-93473.rb'))).to.eql(false)
  })
})