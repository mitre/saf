import { describe, expect, it } from 'vitest';
import {
  applyRequirementFirstPipeline,
  autoDetectPrefix,
  buildSrgIndex,
  cciJaccard,
  extractCcis,
  extractSrgId,
  normalizeTitle,
  tokenJaccard,
} from '../../../src/utils/delta-matching';

// Minimal Control-shaped test fixtures. The real inspec-objects Control has
// many more fields; these tests exercise only the fields our matcher reads.
const mkControl = (
  id: string,
  gtitle?: string,
  ccis: string[] = [],
  title?: string,
) => ({
  id,
  title,
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

describe('tokenJaccard', () => {
  it('returns 1.0 for identical strings', () => {
    expect(
      tokenJaccard('must configure auditd', 'must configure auditd'),
    ).toBe(1);
  });

  it('returns 0.0 for completely disjoint token sets', () => {
    expect(tokenJaccard('foo bar', 'baz qux')).toBe(0);
  });

  it('returns the correct fraction for partial token overlap', () => {
    // {a,b,c} vs {b,c,d} -> intersect=2, union=4 -> 0.5
    expect(tokenJaccard('a b c', 'b c d')).toBe(0.5);
  });

  it('is whitespace-tolerant', () => {
    expect(tokenJaccard('a  b   c', ' a b c ')).toBe(1);
  });

  it('returns 0.0 when either side is empty', () => {
    expect(tokenJaccard('', 'a b c')).toBe(0);
    expect(tokenJaccard('a b c', '')).toBe(0);
    expect(tokenJaccard('', '')).toBe(0);
  });

  it('is case-insensitive', () => {
    expect(tokenJaccard('Foo Bar', 'foo bar')).toBe(1);
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

describe('applyRequirementFirstPipeline — Tier 1 (deterministic SRG)', () => {
  it('matches a new-profile control 1:1 to the old control sharing the same SRG-OS ID when only one candidate exists', () => {
    const oldProfile = {
      controls: [
        mkControl(
          'SV-257879',
          'SRG-OS-000185-GPOS-00079',
          ['CCI-001199', 'CCI-002475', 'CCI-002476'],
          'RHEL 9 local disk partitions must implement cryptographic mechanisms to prevent unauthorized disclosure.',
        ),
      ],
    };
    const newProfile = {
      controls: [
        mkControl(
          'SV-273994',
          'SRG-OS-000185-GPOS-00079',
          ['CCI-001199', 'CCI-002475', 'CCI-002476'],
          'Amazon Linux 2023 local disk partitions must implement cryptographic mechanisms to prevent unauthorized disclosure.',
        ),
      ],
    };
    const links = applyRequirementFirstPipeline(oldProfile, newProfile);
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      oldId: 'SV-257879',
      newId: 'SV-273994',
      matchMethod: 'srg-deterministic',
      relationship: 'primary',
      srg: 'SRG-OS-000185-GPOS-00079',
    });
    expect(links[0].confidence).toBe(1);
  });

  it('picks the old candidate with the highest CCI Jaccard when one SRG has multiple old candidates (1:1 from an N-old block)', () => {
    const oldProfile = {
      controls: [
        mkControl(
          'SV-OLD-A',
          'SRG-OS-000366-GPOS-00153',
          ['CCI-A'],
          'RHEL 9 must check GPG signature of locally installed packages.',
        ),
        mkControl(
          'SV-OLD-B',
          'SRG-OS-000366-GPOS-00153',
          ['CCI-A', 'CCI-B'],
          'RHEL 9 must ensure cryptographic verification of vendor software packages.',
        ),
        mkControl(
          'SV-OLD-C',
          'SRG-OS-000366-GPOS-00153',
          ['CCI-D'],
          'RHEL 9 must have GPG signature verification enabled for all software repositories.',
        ),
      ],
    };
    const newProfile = {
      controls: [
        mkControl(
          'SV-NEW-1',
          'SRG-OS-000366-GPOS-00153',
          ['CCI-A', 'CCI-B'],
          'Amazon Linux 2023 must ensure cryptographic verification of vendor software packages.',
        ),
      ],
    };
    const links = applyRequirementFirstPipeline(oldProfile, newProfile);
    expect(links).toHaveLength(1);
    // SV-OLD-B shares both CCIs -> Jaccard 1.0, best
    expect(links[0]).toMatchObject({
      oldId: 'SV-OLD-B',
      newId: 'SV-NEW-1',
      matchMethod: 'srg-cci-tiebreak',
      relationship: 'primary',
      srg: 'SRG-OS-000366-GPOS-00153',
    });
    expect(links[0].confidence).toBe(1);
  });

  it('assigns each of N new controls to its title-closest UNCLAIMED old candidate when CCI Jaccard is tied across the SRG block', () => {
    // Classic cross-vendor N:N-in-same-SRG scenario (Windows 2019->2022 style,
    // AL2023 SRG-OS-000480-GPOS-00227 cluster). All candidates tie on CCI so
    // the tiebreak must fall through to normalized-title similarity, AND the
    // allocator must prefer unclaimed candidates so every new gets a distinct
    // old (not all crowding onto the first candidate).
    const oldProfile = {
      controls: [
        mkControl(
          'SV-OLD-alpha',
          'SRG-OS-X',
          ['CCI-A'],
          'RHEL 9 must configure alpha service.',
        ),
        mkControl(
          'SV-OLD-beta',
          'SRG-OS-X',
          ['CCI-A'],
          'RHEL 9 must configure beta service.',
        ),
      ],
    };
    const newProfile = {
      controls: [
        mkControl(
          'SV-NEW-alpha',
          'SRG-OS-X',
          ['CCI-A'],
          'Amazon Linux 2023 must configure alpha service.',
        ),
        mkControl(
          'SV-NEW-beta',
          'SRG-OS-X',
          ['CCI-A'],
          'Amazon Linux 2023 must configure beta service.',
        ),
      ],
    };
    const links = applyRequirementFirstPipeline(oldProfile, newProfile);
    const byNewId = Object.fromEntries(links.map((l) => [l.newId, l]));
    expect(byNewId['SV-NEW-alpha']).toMatchObject({
      oldId: 'SV-OLD-alpha',
      matchMethod: 'srg-cci-tiebreak',
      relationship: 'primary',
    });
    expect(byNewId['SV-NEW-beta']).toMatchObject({
      oldId: 'SV-OLD-beta',
      matchMethod: 'srg-cci-tiebreak',
      relationship: 'primary',
    });
  });

  it('maps N new controls sharing one old (1:N split) with the first-seen as primary and the rest as related', () => {
    // Block size on the OLD side is 1, so matchMethod is srg-deterministic.
    // CCI wasn't needed to pick the old candidate (there was only one).
    // Primary/related disambiguates the split: the first new control to
    // claim SV-OLD is primary; subsequent controls in the same SRG block
    // become `related` so downstream tooling knows they share a body.
    const oldProfile = {
      controls: [
        mkControl(
          'SV-OLD',
          'SRG-OS-000366-GPOS-00153',
          ['CCI-A', 'CCI-B'],
          'RHEL 9 must ensure cryptographic verification of vendor software packages.',
        ),
      ],
    };
    const newProfile = {
      controls: [
        mkControl('SV-NEW-1', 'SRG-OS-000366-GPOS-00153', ['CCI-A', 'CCI-B']),
        mkControl('SV-NEW-2', 'SRG-OS-000366-GPOS-00153', ['CCI-A']),
      ],
    };
    const links = applyRequirementFirstPipeline(oldProfile, newProfile);
    const byNewId = Object.fromEntries(links.map((l) => [l.newId, l]));
    expect(byNewId['SV-NEW-1']).toMatchObject({
      oldId: 'SV-OLD',
      matchMethod: 'srg-deterministic',
      relationship: 'primary',
    });
    expect(byNewId['SV-NEW-2']).toMatchObject({
      oldId: 'SV-OLD',
      matchMethod: 'srg-deterministic',
      relationship: 'related',
    });
  });

  it('emits a no-match record for a new-profile control whose SRG has no candidates in old profile AND no fuzzy match found', () => {
    // Old has one control with a completely different SRG and no title
    // similarity; new should fall through all tiers to none.
    const oldProfile = {
      controls: [
        mkControl(
          'SV-OTHER',
          'SRG-OS-111-GPOS-999',
          ['CCI-ZZZ'],
          'RHEL 9 must configure something totally unrelated.',
        ),
      ],
    };
    const newProfile = {
      controls: [
        mkControl(
          'SV-273999',
          'SRG-OS-000439-GPOS-00195',
          ['CCI-002605'],
          'Amazon Linux 2023 must be a vendor-supported release.',
        ),
      ],
    };
    const links = applyRequirementFirstPipeline(oldProfile, newProfile);
    expect(links).toHaveLength(1);
    expect(links[0].matchMethod).toBe('none');
    expect(links[0].newId).toBe('SV-273999');
    expect(links[0].oldId).toBeNull();
  });
});

describe('applyRequirementFirstPipeline — Tier 3 (Fuse fallback)', () => {
  it('falls back to fuzzy title match (with vendor-prefix normalization) when SRG indexes do not overlap', () => {
    // Classic cross-vendor scenario: both sides have the same core
    // requirement sentence but under DIFFERENT SRG IDs (re-categorization).
    // Tier 1 and 2 can't help because the SRG blocks don't overlap. Tier 3
    // auto-detects the corpus vendor prefix ("RHEL 9" vs "Amazon Linux 2023"),
    // strips it, then fuzzy-matches on the remaining semantic content.
    const oldProfile = {
      controls: [
        mkControl(
          'SV-OLD',
          'SRG-OS-111-GPOS-999',
          ['CCI-X'],
          'RHEL 9 must be a vendor-supported release.',
        ),
      ],
    };
    const newProfile = {
      controls: [
        mkControl(
          'SV-NEW',
          'SRG-OS-222-GPOS-888', // different SRG — no tier-1/2 match
          ['CCI-X'],
          'Amazon Linux 2023 must be a vendor-supported release.',
        ),
      ],
    };
    const links = applyRequirementFirstPipeline(oldProfile, newProfile);
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      oldId: 'SV-OLD',
      newId: 'SV-NEW',
      matchMethod: 'fuse-fallback',
      relationship: 'primary',
    });
    // After vendor-prefix stripping both titles are "must be a vendor-supported
    // release." which is effectively identical -> very high confidence
    expect(links[0].confidence).toBeGreaterThan(0.9);
  });

  it('does NOT fuzzy-match two unrelated titles even with the same CCI when SRGs do not match', () => {
    const oldProfile = {
      controls: [
        mkControl(
          'SV-OLD',
          'SRG-OS-111-GPOS-999',
          ['CCI-X'],
          'RHEL 9 must configure auditd rules for login events.',
        ),
      ],
    };
    const newProfile = {
      controls: [
        mkControl(
          'SV-NEW',
          'SRG-OS-222-GPOS-888',
          ['CCI-X'],
          'Amazon Linux 2023 must disable kernel core dumps.',
        ),
      ],
    };
    const links = applyRequirementFirstPipeline(oldProfile, newProfile);
    expect(links).toHaveLength(1);
    expect(links[0].matchMethod).toBe('none');
    expect(links[0].oldId).toBeNull();
  });
});
