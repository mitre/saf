import { runCommand } from '@oclif/test';
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import YAML from 'yaml';

describe.sequential('Test validate threshold', () => {
  describe('Using template file', () => {
    it('Validate threshold test - Triple Overlay Valid Counts', async () => {
      const { stdout, stderr } = await runCommand<{ name: string }>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
        '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.good.yml'),
      ]);
      expect(stdout).to.equal('All validation tests passed\n');
      expect(stderr).to.equal('');
    });

    it('Validate threshold test - Triple Overlay Invalid Total Counts', async () => {
      const { stdout, stderr } = await runCommand<{ name: string }>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
        '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.bad.total.yml'),
      ]);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('Error: failed.total: Threshold not met. Number of received total failed controls (55) is not equal to your set threshold for the number of failed controls (54)\n');
    });

    it('Validate threshold test - Triple Overlay Compliance', async () => {
      const { stdout, stderr } = await runCommand<{ name: string }>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
        '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.bad.compliance.yml'),
      ]);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('Error: Overall compliance minimum was not satisfied\n');
    });

    it('Validate threshold minMaxTotal - Triple Overlay Compliance', async () => {
      const { stdout, stderr } = await runCommand<{ name: string }>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
        '--templateFile', path.resolve('./test/sample_data/thresholds/triple_overlay_profile_example.json.counts.totalMinMax.yml'),
      ]);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('Error: passed.total.max: Threshold not met. Number of received total passed controls (19) is greater than your set threshold for the number of passed controls (18)\n');
    });

    it('Validate threshold test - RHEL-8 Hardened Valid Exact Counts', async () => {
      const { stdout, stderr } = await runCommand<{ name: string }>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
        '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.good.exact.yml'),
      ]);
      expect(stdout).to.equal('All validation tests passed\n');
      expect(stderr).to.equal('');
    });

    it('Validate threshold test - RHEL-8 Hardened Invalid Total Counts', async () => {
      const { stdout, stderr } = await runCommand<{ name: string }>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
        '--templateFile', path.resolve('./test/sample_data/thresholds/rhel-8_hardened.counts.bad.noimpactHigh.yml'),
      ]);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('Error: no_impact.high.max: Threshold not met. Number of received total no_impact controls (3) is greater than your set threshold for the number of no_impact controls (2)\n');
    });
  });

  describe('Control IDs in template files', () => {
    it.each([
      {
        name: 'accepts matching IDs in any order',
        status: 'passed',
        controls: ['V-61539', 'V-61427', 'V-61425'],
        stderr: '',
      },
      {
        name: 'rejects an unexpected ID even when the count matches',
        status: 'passed',
        controls: ['V-61425', 'V-61427', 'missing-control'],
        stderr: 'Error: Expected passed.high.controls to contain control missing-control but it only contained [V-61425, V-61427, V-61539]\n',
      },
      {
        name: 'rejects too few IDs even when every expected ID is present',
        status: 'passed',
        controls: ['V-61425'],
        stderr: 'Error: Expected passed.high.controls to contain 1 controls but it contained 3\n',
      },
      {
        name: 'rejects an empty list when actual controls exist',
        status: 'passed',
        controls: [],
        stderr: 'Error: Expected passed.high.controls to contain 0 controls but it contained 3\n',
      },
      {
        name: 'rejects an ID when its status category is absent',
        status: 'error',
        controls: ['missing-control'],
        stderr: 'Error: Expected error.high.controls to contain control missing-control but it contained no controls\n',
      },
      {
        name: 'accepts an empty list when its status category is absent',
        status: 'error',
        controls: [],
        stderr: '',
      },
    ])('$name', async ({ status, controls, stderr: expectedStderr }) => {
      const templateFile = tmp.fileSync({ postfix: '.yml' });
      const previousExitCode = process.exitCode;
      try {
        fs.writeFileSync(templateFile.name, YAML.stringify({ [status]: { high: { controls } } }));
        process.exitCode = 0;
        const { stdout, stderr, error } = await runCommand([
          'validate threshold',
          '-i', path.resolve('./test/sample_data/HDF/input/triple_overlay_profile_example.json'),
          '--templateFile', `"${templateFile.name}"`,
        ]);
        expect(error).toBeUndefined();
        expect(stdout).to.equal(expectedStderr ? '' : 'All validation tests passed\n');
        expect(stderr).to.equal(expectedStderr);
        expect(process.exitCode).to.equal(expectedStderr ? 1 : 0);
      } finally {
        process.exitCode = previousExitCode;
        templateFile.removeCallback();
      }
    });
  });

  describe('Using inline values', () => {
    it('Validate threshold test - Valid inline content', async () => {
      const { stdout, stderr } = await runCommand<{ name: string }>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
        '--templateInline', '"{compliance.min: 66}, {passed.critical.min: 0}, {failed.medium.min: 0}"',
      ]);
      expect(stdout).to.equal('All validation tests passed\n');
      expect(stderr).to.equal('');
    });
    it('Validate threshold test - Invalid inline content', async () => {
      const { stdout, stderr } = await runCommand<{ name: string }>([
        'validate threshold',
        '-i', path.resolve('./test/sample_data/HDF/input/rhel-8_hardened.json'),
        '--templateInline', '"{compliance.min: 66}, {passed.critical.min: 0}, {failed.medium.min: 97}"',
      ]);
      expect(stdout).to.equal('');
      expect(stderr).to.equal('Error: failed.medium.min: Threshold not met. Number of received total failed controls (87) is less than your set threshold for the number of failed controls (97)\n');
    });
  });
});
