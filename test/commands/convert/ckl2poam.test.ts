import {expect} from 'chai'
import {runCommand} from '@oclif/test'
import tmp from 'tmp'
import path from 'path'
import {promises as fse} from 'fs'

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('Test ckl2POAM RHEL8 example', () => {
  const tmpobj = tmp.dirSync({unsafeCleanup: true})

  it('hdf-converter output test', async () => {
    await runCommand<{name: string}>([
      'convert ckl2POAM',
      '-i', path.resolve('./test/sample_data/checklist/sample_input_report/converted-RHEL8V1R3.ckl'),
      '-o', `${tmpobj.name}`,
      '-d test',
      '-O testOrg',
    ])

    await delay(1500)
    // Wildcard pattern for the file to match any filename variation (e.g., with a timestamp)
    const filePattern = /^converted-RHEL8V1R3.ckl-\d{4}-\d{2}-\d{2}-\d{4}.xlsm$/
    // Read the files in the directory
    const files = await fse.readdir(tmpobj.name)
    // Filter files matching the pattern
    const matchingFiles = files.filter(file => filePattern.test(file))
    // Check that at least one file matched the pattern
    expect(matchingFiles).to.have.lengthOf.above(0, 'No file found matching the pattern')

    // Get the stats for the first matched file
    const fileStats = await fse.stat(path.resolve(tmpobj.name, matchingFiles[0]))
    expect(fileStats.size).to.equal(87033) // Compare the file size (adjust as needed)
  })
})
