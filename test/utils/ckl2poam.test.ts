import { describe, expect, it } from 'vitest';
import { extractSTIGUrl } from '../../src/utils/ckl2poam';

describe('extractSTIGUrl', () => {
  it('extracts the STIG name from a download URL with path, query, and fragment components', () => {
    const details = 'Download https://dl.dod.cyber.mil/wp-content/uploads/stigs/zip/U_MS_Windows_11_STIG_V1R1_Manual-xccdf.zip?download=1#files.';

    expect(extractSTIGUrl(details)).toBe('U_MS_Windows_11_STIG_V1R1_Manual-xccdf');
  });

  it('returns an empty string when no DISA download URL is present', () => {
    expect(extractSTIGUrl('No download link is available.')).toBe('');
  });
});
