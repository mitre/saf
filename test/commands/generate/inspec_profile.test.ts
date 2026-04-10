import { runCommand } from '@oclif/test';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { describe, expect, it } from 'vitest';
import { processXCCDF } from '@mitre/inspec-objects';

describe('Test inspec_profile (aliases:xccdf_benchmark2inspec)', () => {
  const tmpobj = tmp.dirSync({ unsafeCleanup: true });
  // Remove all controlled temporary objects on process exit
  tmp.setGracefulCleanup();

  for (const file of fs.readdirSync('./test/sample_data/xccdf/stigs')) {
    it(`Generated scaffold has the same number of controls based on STIG benchmark: ${file}`, async () => {
      await runCommand<{ name: string }>(['generate inspec_profile', '-X', path.resolve('./test/sample_data/xccdf/stigs', file), '-o', `${tmpobj.name}/${file}`]);
      const parsedXCCDF = processXCCDF(fs.readFileSync(path.resolve('./test/sample_data/xccdf/stigs', file), 'utf8'), false, 'rule');
      const fileCount = fs.readdirSync(`${tmpobj.name}/${file}/controls/`).length;
      expect(fileCount).to.eql(parsedXCCDF.controls.length);
    });
  }

  for (const file of fs.readdirSync('./test/sample_data/xccdf/cis')) {
    it(`Generated scaffold has the same number of controls based on CIS benchmark: ${file}`, async () => {
      await runCommand<{ name: string }>(['generate inspec_profile', '-X', path.resolve('./test/sample_data/xccdf/cis', file), '-T', 'cis', '-o', `${tmpobj.name}/${file}`]);
      const parsedXCCDF = processXCCDF(fs.readFileSync(path.resolve('./test/sample_data/xccdf/cis', file), 'utf8'), false, 'rule');
      const fileCount = fs.readdirSync(`${tmpobj.name}/${file}/controls/`).length;
      expect(fileCount).to.eql(parsedXCCDF.controls.length);
    });
  }
});
