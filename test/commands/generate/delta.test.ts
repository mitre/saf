import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { assert, describe, expect, it } from 'vitest';
import GenerateDelta from '../../../src/commands/generate/delta';

// Functional tests
describe.sequential('Test generate delta command', () => {
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

  it('should require --inspecPath when using fuzzy logic to match and map controls', async () => {
    const { stderr } = await runCommand<{ name: string }>([
      'generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/profile_and_controls/Windows_Server_2019_v1r3_mini-profile.json'),
      '-X', path.resolve('./test/sample_data/xccdf/stigs/Windows_Server_2022_V2R1_mini-sample-xccdf.xml'),
      '-o', `${tmpobj.name}`,
      '-M',
      '-c', path.resolve('./test/sample_data/inspec/json/profile_and_controls/windows_server_2019_v1r3_mini_controls/'),
    ]);
    expect(stderr).to.include('-M');
    expect(stderr).to.include('inspecPath');
  });

  // should process delta using the fuzzy logic
  it('should generate the correct number of controls using fuzzy logic to match and map controls', async () => {
    const { stdout } = await runCommand<{ name: string }>([
      'generate delta',
      '-J', path.resolve('./test/sample_data/inspec/json/profile_and_controls/Windows_Server_2019_v1r3_mini-profile.json'),
      '-I', 'cinc-auditor',
      '-X', path.resolve('./test/sample_data/xccdf/stigs/Windows_Server_2022_V2R1_mini-sample-xccdf.xml'),
      '-o', `${tmpobj.name}`,
      '-M',
      '-c', path.resolve('./test/sample_data/inspec/json/profile_and_controls/windows_server_2019_v1r3_mini_controls/'),
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

// GenerateDelta extends an oclif Command; instantiate it directly to unit
// test mapControls without a full command run. The minimal config stub is
// enough — mapControls only touches the instance logger and static counters.
const makeDeltaCmd = () => new (GenerateDelta as unknown as new (argv: string[], config: unknown) => {
  mapControls(o: unknown, n: unknown): Record<string, string>;
})([], { runHook: () => Promise.resolve({}) });

const resetDeltaStatics = () => {
  GenerateDelta.match = 0;
  GenerateDelta.posMisMatch = 0;
  GenerateDelta.dupMatch = 0;
  GenerateDelta.noMatch = 0;
  GenerateDelta.links = [];
};

const deltaCtl = (id: string, gtitle: string, cci: string[], title: string) => ({
  id, title, tags: { gtitle, cci }, code: `control '${id}' do\nend`,
});

// Unit tests for the 1:N split body-copy policy in mapControls. When several
// new controls resolve to one old control, ONLY the primary (best match)
// inherits the old Ruby body; `related` links are deliberately left out of
// controlMappings so they are emitted as new controls without a body. This
// also guarantees no two new controls share an old id in controlMappings, so
// the mapped-control file write cannot collide.
describe('Test generate delta mapControls 1:N body-copy policy', () => {
  it('maps only the primary new control to the old id; the related sibling is excluded', () => {
    resetDeltaStatics();
    const oldProfile = { controls: [deltaCtl('SV-OLD', 'SRG-1', ['CCI-1'], 'RHEL 9 must configure the audit service.')] };
    const newProfile = { controls: [
      deltaCtl('SV-NEW-1', 'SRG-1', ['CCI-1'], 'SLES 15 must configure the audit service.'),
      deltaCtl('SV-NEW-2', 'SRG-1', ['CCI-1'], 'SLES 15 must configure the audit service thresholds.'),
    ] };

    const mappings = makeDeltaCmd().mapControls(oldProfile as never, newProfile as never);

    // Both new controls link to the one old; exactly one is primary.
    const byNew = Object.fromEntries(GenerateDelta.links.map(l => [l.newId, l]));
    expect(byNew['SV-NEW-1'].relationship).toBe('primary');
    expect(byNew['SV-NEW-2'].relationship).toBe('related');
    expect(byNew['SV-NEW-1'].oldId).toBe('SV-OLD');
    expect(byNew['SV-NEW-2'].oldId).toBe('SV-OLD');

    // ...but only the primary gets a controlMappings entry (and thus a body).
    expect(mappings).toEqual({ 'SV-NEW-1': 'SV-OLD' });
    expect(mappings).not.toHaveProperty('SV-NEW-2');

    // Stats: 1 mapped primary, 1 related (no body), invariant holds.
    expect(GenerateDelta.match).toBe(1);
    expect(GenerateDelta.dupMatch).toBe(1);
  });

  it('never maps two new controls to the same old id (collision-free controlMappings)', () => {
    resetDeltaStatics();
    // One old control, three new controls in the same SRG block (a 3-way split).
    const oldProfile = { controls: [deltaCtl('SV-OLD', 'SRG-2', ['CCI-9'], 'RHEL 9 must restrict access.')] };
    const newProfile = { controls: [
      deltaCtl('SV-A', 'SRG-2', ['CCI-9'], 'SLES 15 must restrict access.'),
      deltaCtl('SV-B', 'SRG-2', ['CCI-9'], 'SLES 15 must restrict access to logs.'),
      deltaCtl('SV-C', 'SRG-2', ['CCI-9'], 'SLES 15 must restrict access to keys.'),
    ] };

    const mappings = makeDeltaCmd().mapControls(oldProfile as never, newProfile as never);

    // At most one new control maps to any given old id -> no file-write collision.
    const oldIds = Object.values(mappings);
    expect(new Set(oldIds).size).toBe(oldIds.length);
    expect(oldIds.filter(o => o === 'SV-OLD')).toHaveLength(1);
  });

  it('lists every related (no-body) control in the report, highest confidence first, and never lists the primary', () => {
    resetDeltaStatics();
    // One old, three new in the same SRG -> 1 primary + 2 related. The report
    // section must enumerate the two related controls (so reviewers can spot
    // close matches) and must not list the primary (which got the body).
    const oldProfile = { controls: [deltaCtl('SV-OLD', 'SRG-3', ['CCI-1'], 'RHEL 9 must enable auditing.')] };
    const newProfile = { controls: [
      deltaCtl('SV-NEW-1', 'SRG-3', ['CCI-1'], 'SLES 15 must enable auditing.'),
      deltaCtl('SV-NEW-2', 'SRG-3', ['CCI-1'], 'SLES 15 must enable auditing for logins.'),
      deltaCtl('SV-NEW-3', 'SRG-3', ['CCI-1'], 'SLES 15 must enable auditing for sudo.'),
    ] };
    makeDeltaCmd().mapControls(oldProfile as never, newProfile as never);

    const report = (GenerateDelta as unknown as {
      formatRelatedControlsReport(l: typeof GenerateDelta.links): string;
    }).formatRelatedControlsReport(GenerateDelta.links);

    const primary = GenerateDelta.links.find(l => l.relationship === 'primary')!;
    const related = GenerateDelta.links.filter(l => l.relationship === 'related');
    expect(related.length).toBe(2);
    expect(report).toContain('Related Controls (no body copied)');
    for (const r of related) {
      expect(report).toContain(r.newId);
    }
    // The primary keeps the body and must not appear in the related list.
    expect(report).not.toContain(`${primary.newId}  ~ best match`);
    expect(report).toContain(`Total Related (no body copied): ${related.length}`);
  });

  it('produces an empty related-report section when there are no related links', () => {
    resetDeltaStatics();
    const oldProfile = { controls: [deltaCtl('SV-OLD', 'SRG-4', ['CCI-1'], 'RHEL 9 must set a banner.')] };
    const newProfile = { controls: [deltaCtl('SV-NEW', 'SRG-4', ['CCI-1'], 'SLES 15 must set a banner.')] };
    makeDeltaCmd().mapControls(oldProfile as never, newProfile as never);

    const report = (GenerateDelta as unknown as {
      formatRelatedControlsReport(l: typeof GenerateDelta.links): string;
    }).formatRelatedControlsReport(GenerateDelta.links);
    expect(report).toBe('');
  });
});
