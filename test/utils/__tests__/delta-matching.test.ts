import { describe, expect, it } from 'vitest';
import {
  autoDetectPrefix,
  buildSrgIndex,
  cciJaccard,
  extractCcis,
  extractSrgId,
  normalizeTitle,
} from '../../../src/utils/delta-matching';

// Minimal Control-shaped test fixtures. The real inspec-objects Control has
// many more fields; these tests exercise only the fields our matcher reads.
const mkControl = (
  id: string,
  gtitle?: string,
  ccis: string[] = [],
) => ({
  id,
  tags: {
    ...(gtitle !== undefined ? { gtitle } : {}),
    ...(ccis.length > 0 ? { cci: ccis } : {}),
  },
});

describe('autoDetectPrefix', () => {
  it('returns the dominant multi-token prefix from a uniform corpus', () => {
    const titles = [
      'RHEL 9 must be a vendor-supported release.',
      'RHEL 9 vendor packaged system security patches and updates must be installed and up to date.',
      'RHEL 9 must display the Standard Mandatory DOD Notice and Consent Banner before granting local or remote access.',
      'RHEL 9 must enable the hardware random number generator entropy gatherer service.',
    ];
    expect(autoDetectPrefix(titles)).toBe('RHEL 9');
  });

  it('accepts a prefix that dominates at least 50% of titles when some outliers diverge', () => {
    // 4 of 5 rules start with "Nutanix VMM" (80%); one outlier uses "Nutanix OS".
    // At the 2-token level "Nutanix VMM" is dominant -> accept.
    const titles = [
      'Nutanix VMM must be configured to remove ypserv.',
      'Nutanix VMM must limit the number of concurrent sessions to 10.',
      'Nutanix VMM must configure the firewall to control remote access.',
      'Nutanix VMM must be a vendor-supported release.',
      'Nutanix OS must monitor SSH access.',
    ];
    expect(autoDetectPrefix(titles)).toBe('Nutanix VMM');
  });

  it('falls back to a shorter common prefix when no long prefix dominates', () => {
    // 50/50 split between "Nutanix VMM" and "Nutanix OS" -> shortest common "Nutanix"
    const titles = [
      'Nutanix VMM must be configured to remove ypserv.',
      'Nutanix OS must monitor SSH access.',
      'Nutanix VMM must limit concurrent sessions.',
      'Nutanix OS must configure the firewall.',
    ];
    expect(autoDetectPrefix(titles)).toBe('Nutanix');
  });

  it('returns empty string when no prefix reaches the threshold', () => {
    // Feature-focused corpus (Google Chrome style) -- rules lead with the feature name
    const titles = [
      'Firewall traversal from remote host must be disabled.',
      'Sites ability for showing desktop notifications must be disabled.',
      'Sites ability to show pop-ups must be disabled.',
      'Default search provider must be enabled.',
      'Default download directory must be configured.',
    ];
    expect(autoDetectPrefix(titles)).toBe('');
  });

  it('stops the detected prefix before a modal verb so semantic content is not consumed', () => {
    const titles = [
      'The Apache web server must perform server-side session management.',
      'The Apache web server must use encryption strength in accordance with the categorization of data hosted by the server.',
      'The Apache web server must produce log records containing sufficient information.',
      'The Apache web server must limit the number of allowed simultaneous session requests.',
    ];
    expect(autoDetectPrefix(titles)).toBe('The Apache web server');
  });
});

describe('normalizeTitle', () => {
  it('strips the detected prefix from the start of the title', () => {
    expect(
      normalizeTitle('RHEL 9 must be a vendor-supported release.', 'RHEL 9'),
    ).toBe('must be a vendor-supported release.');
  });

  it('returns the title unchanged when prefix is empty', () => {
    expect(
      normalizeTitle('Firewall traversal must be disabled.', ''),
    ).toBe('Firewall traversal must be disabled.');
  });

  it('returns the title unchanged when prefix is not at the start', () => {
    expect(
      normalizeTitle('The system must use RHEL 9 conventions.', 'RHEL 9'),
    ).toBe('The system must use RHEL 9 conventions.');
  });

  it('handles an empty title', () => {
    expect(normalizeTitle('', 'RHEL 9')).toBe('');
  });
});

describe('extractSrgId', () => {
  it('returns the SRG-OS ID from tags.gtitle', () => {
    const control = mkControl('SV-273994', 'SRG-OS-000185-GPOS-00079');
    expect(extractSrgId(control)).toBe('SRG-OS-000185-GPOS-00079');
  });

  it('returns null when tags.gtitle is missing', () => {
    const control = mkControl('SV-273994');
    expect(extractSrgId(control)).toBeNull();
  });

  it('returns null when tags object is missing', () => {
    expect(extractSrgId({ id: 'SV-273994' } as never)).toBeNull();
  });
});

describe('extractCcis', () => {
  it('returns a Set of CCI strings from tags.cci', () => {
    const control = mkControl('SV-1', 'SRG-OS-X', [
      'CCI-001199',
      'CCI-002475',
      'CCI-002476',
    ]);
    expect(extractCcis(control)).toEqual(
      new Set(['CCI-001199', 'CCI-002475', 'CCI-002476']),
    );
  });

  it('returns an empty Set when tags.cci is missing', () => {
    const control = mkControl('SV-1', 'SRG-OS-X');
    expect(extractCcis(control).size).toBe(0);
  });

  it('de-duplicates CCIs within a single control', () => {
    const control = mkControl('SV-1', 'SRG-OS-X', [
      'CCI-000366',
      'CCI-000366',
    ]);
    expect(extractCcis(control).size).toBe(1);
  });
});

describe('cciJaccard', () => {
  it('returns 1.0 for identical sets', () => {
    const a = new Set(['CCI-1', 'CCI-2']);
    const b = new Set(['CCI-1', 'CCI-2']);
    expect(cciJaccard(a, b)).toBe(1);
  });

  it('returns 0.0 for disjoint sets', () => {
    const a = new Set(['CCI-1']);
    const b = new Set(['CCI-2']);
    expect(cciJaccard(a, b)).toBe(0);
  });

  it('returns the correct fraction for partial overlap', () => {
    // {1,2,3} vs {2,3,4} -> intersect = {2,3} (2), union = {1,2,3,4} (4) -> 0.5
    const a = new Set(['CCI-1', 'CCI-2', 'CCI-3']);
    const b = new Set(['CCI-2', 'CCI-3', 'CCI-4']);
    expect(cciJaccard(a, b)).toBe(0.5);
  });

  it('returns 0.0 when both sets are empty (cannot differentiate)', () => {
    expect(cciJaccard(new Set(), new Set())).toBe(0);
  });
});

describe('buildSrgIndex', () => {
  it('groups controls by their SRG-OS ID', () => {
    const controls = [
      mkControl('SV-a', 'SRG-OS-001-GPOS-X'),
      mkControl('SV-b', 'SRG-OS-002-GPOS-X'),
      mkControl('SV-c', 'SRG-OS-001-GPOS-X'),
    ];
    const index = buildSrgIndex(controls);
    expect(index.get('SRG-OS-001-GPOS-X')?.map((c) => c.id)).toEqual([
      'SV-a',
      'SV-c',
    ]);
    expect(index.get('SRG-OS-002-GPOS-X')?.map((c) => c.id)).toEqual([
      'SV-b',
    ]);
  });

  it('skips controls with no SRG-OS ID', () => {
    const controls = [
      mkControl('SV-a'),
      mkControl('SV-b', 'SRG-OS-001-GPOS-X'),
    ];
    const index = buildSrgIndex(controls);
    expect(index.size).toBe(1);
    expect(index.get('SRG-OS-001-GPOS-X')?.map((c) => c.id)).toEqual(['SV-b']);
  });

  it('returns an empty Map for empty input', () => {
    expect(buildSrgIndex([]).size).toBe(0);
  });
});
