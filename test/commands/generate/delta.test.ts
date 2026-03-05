import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { assert, describe, expect, it } from 'vitest';

// Functional tests
describe('Test generate delta command', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });

  // should process delta request with rule id type
  it('should generate the controls for delta request with "rule" id type', async () => {
    await runCommand<{ name: string }>([
      'generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}`,
      '-T', 'rule',
    ]);
    const fileCount = fs.readdirSync(`${tmpobj.name}/controls/`).length;
    expect(fileCount).to.eql(4);
  });

  // should process delta request with group id type
  it('should generate the controls for delta request with "group" id type', async () => {
    await runCommand<{ name: string }>([
      'generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}`,
      '-T', 'group',
    ]);
    const fileCount = fs.readdirSync(`${tmpobj.name}/controls/`).length;
    expect(fileCount).to.eql(4);
  });

  // should process delta request with cis id type
  it('should generate the controls for delta request with "cis" id type', async () => {
    await runCommand<{ name: string }>([
      'generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}`,
      '-T', 'cis',
    ]);
    const fileCount = fs.readdirSync(`${tmpobj.name}/controls/`).length;
    expect(fileCount).to.eql(4);
  });

  // should process delta request with version id type
  it('should generate the controls for delta request with "version" id type', async () => {
    await runCommand<{ name: string }>([
      'generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}/controls`,
      '-T', 'version',
    ]);
    const fileCount = fs.readdirSync(`${tmpobj.name}/controls/`).length;
    expect(fileCount).to.eql(4);
  });

  // should process delta request with the default id type, generate the
  // output folder, and place new controls in the generated out folder
  it('should generate the output folder, place new controls on the output folder for review', async () => {
    await runCommand<{ name: string }>([
      'generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}/RHEL_7`,
    ]);
    const fileCount = fs.readdirSync(`${tmpobj.name}/RHEL_7/controls/`).length;
    expect(fileCount).to.eql(4);
  });

  // should generate a report for the delta process, place the report on specified directory
  it('should generate a report with given file name and place it on the specified directory', async () => {
    await runCommand<{ name: string }>([
      'generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}/RHEL_7`,
      '-r', `${tmpobj.name}/RHEL_7/my-report.md`,
    ]);
    const isReportFile = fs.lstatSync((`${tmpobj.name}/RHEL_7/my-report.md`)).isFile();
    assert.isTrue(isReportFile);
    // expect(fs.lstatSync((`${tmpobj.name}/RHEL_7/my-report.md`)).isFile()).to.be.true
  });

  // should generate a report for the delta process, place the report on default directory
  it('should generate a report name delta.md and place it in the default directory', async () => {
    await runCommand<{ name: string }>([
      'generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/rhel-7-v3r7-mini-sample-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/rhel-7-v3r8-mini-sample-xxcdf.xml'),
      '-o', `${tmpobj.name}`,
      '-r', `${tmpobj.name}`,
    ]);
    const isFile = fs.lstatSync((`${tmpobj.name}/delta.md`)).isFile();
    assert.isTrue(isFile);
  });

  // should process delta using the fuzzy logic
  it('should generate the correct number of controls using fuzzy logic to match and map controls', async () => {
    const { stdout } = await runCommand<{ name: string }>([
      'generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/profile_and_controls/Windows_Server_2022_v1r3_mini-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/Windows_Server_2022_V2R1_mini-sample-xccdf.xml'),
      '-o', `${tmpobj.name}`,
      '-M',
      '-c', path.resolve('./test/sample_data/inspec/json/profile_and_controls/windows_server_2022_v1r3_mini_controls/'),
    ]);
    expect(stdout).to.include('Total Controls Available for Delta:  5');
    expect(stdout).to.include('Total Controls Found on XCCDF:  5');
    expect(stdout).to.include('Match Controls:  5');
    expect(stdout).to.include('Best Match Candidate:  V-93461 --> SV-254242');
    expect(stdout).to.include('Best Match Candidate:  V-93473 --> SV-254239');
    expect(stdout).to.include('Best Match Candidate:  V-93205 --> SV-254240');
    expect(stdout).to.include('Best Match Candidate:  V-93207 --> SV-254241');
    expect(stdout).to.include('Best Match Candidate:  V-93461 --> SV-254242');
  });
});
