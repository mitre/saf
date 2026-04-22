import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  applyRequirementFirstPipeline,
  type LinkRecord,
} from '../../../src/utils/delta_matching';

/**
 * Integration-style test locking in the requirement-first pipeline's
 * cross-vendor behavior against hand-crafted mini profiles. Fixtures
 * simulate the RHEL 9 -> Amazon Linux 2023 derivation scenario: same
 * SRG-OS ids, same CCIs, same core requirements with the vendor
 * prefix swapped. Plus three deliberate edge cases:
 *
 *   - 1:N split on a Tier-1 single-candidate SRG block (one `related`)
 *   - Tier-3 Fuse rescue across different SRGs ("vendor-supported release")
 *   - one CCI-zero Tier-2 primary (flagged as potentialMismatch)
 *   - one genuinely novel AL2023 requirement with no ancestor (no-match)
 *
 * Contract: >=90% of target rules end up mapped (primary + related);
 * tier counts and specific mappings are pinned here so future pipeline
 * tweaks cannot silently regress this scenario.
 */

const fixtureDir = path.resolve(__dirname, '../../sample_data/delta-matching');

function loadFixture(file: string): { controls: Record<string, unknown>[] } {
  return JSON.parse(fs.readFileSync(path.join(fixtureDir, file), 'utf8'));
}

describe('Cross-vendor integration: RHEL 9 -> Amazon Linux 2023 mini', () => {
  const oldProfile = loadFixture('rhel9-base-mini-profile.json');
  const newProfile = loadFixture('al2023-target-mini-profile.json');

  const links = applyRequirementFirstPipeline(oldProfile, newProfile);
  const byNew: Record<string, LinkRecord> = Object.fromEntries(
    links.map(l => [l.newId, l]),
  );

  it('produces exactly one link per target rule', () => {
    expect(links).toHaveLength(newProfile.controls.length);
    expect(links).toHaveLength(11);
  });

  it('meets the >=90% mapping target (primary + related)', () => {
    const mapped = links.filter(l => l.relationship !== 'no-match');
    const rate = mapped.length / links.length;
    expect(rate).toBeGreaterThanOrEqual(0.9);
    expect(mapped).toHaveLength(10);
  });

  it('distributes matches across all three tiers as designed', () => {
    const byMethod: Record<string, number> = {};
    for (const l of links) {
      byMethod[l.matchMethod] = (byMethod[l.matchMethod] ?? 0) + 1;
    }
    expect(byMethod['srg-deterministic']).toBe(6);
    expect(byMethod['srg-cci-tiebreak']).toBe(3);
    expect(byMethod['fuse-fallback']).toBe(1);
    expect(byMethod.none).toBe(1);
  });

  it('pins Tier-1 deterministic mappings (single-candidate SRG blocks)', () => {
    expect(byNew['SV-273801']).toMatchObject({
      oldId: 'SV-257780',
      matchMethod: 'srg-deterministic',
      relationship: 'primary',
    });
    expect(byNew['SV-273803']).toMatchObject({
      oldId: 'SV-257781',
      matchMethod: 'srg-deterministic',
      relationship: 'primary',
    });
    expect(byNew['SV-273804']).toMatchObject({
      oldId: 'SV-257850',
      matchMethod: 'srg-deterministic',
      relationship: 'primary',
    });
    expect(byNew['SV-273805']).toMatchObject({
      oldId: 'SV-257860',
      matchMethod: 'srg-deterministic',
      relationship: 'primary',
    });
    expect(byNew['SV-273806']).toMatchObject({
      oldId: 'SV-257870',
      matchMethod: 'srg-deterministic',
      relationship: 'primary',
    });
  });

  it('emits 1:N split as primary + related on the same old SRG block', () => {
    expect(byNew['SV-273802']).toMatchObject({
      oldId: 'SV-257780',
      matchMethod: 'srg-deterministic',
      relationship: 'related',
      potentialMismatch: false,
    });
  });

  it('rescues cross-SRG equivalent rules via Tier-3 Fuse fallback after prefix normalization', () => {
    // SRG-OS-VER-AL2023 has no overlap with SRG-OS-VER-RHEL, so Tier 1/2
    // cannot help. After stripping "RHEL 9" / "Amazon Linux 2023" prefixes,
    // titles both reduce to "must be a vendor-supported release." and Fuse
    // picks SV-257880 with high confidence (> 0.9 -> not flagged).
    expect(byNew['SV-273807']).toMatchObject({
      oldId: 'SV-257880',
      matchMethod: 'fuse-fallback',
      relationship: 'primary',
      potentialMismatch: false,
    });
    expect(byNew['SV-273807'].confidence).toBeGreaterThan(0.9);
  });

  it('pins Tier-2 primaries inside the multi-candidate SRG-OS-CRYPTO block', () => {
    // SV-273900 has CCI-000803, which overlaps 1:2 with SV-257900 (Jaccard
    // 0.5) and 0 with SV-257901/SV-257902 -> wins SV-257900.
    expect(byNew['SV-273900']).toMatchObject({
      oldId: 'SV-257900',
      matchMethod: 'srg-cci-tiebreak',
      relationship: 'primary',
      potentialMismatch: false,
    });
    // SV-273901 has CCI-002450, which is a perfect match with SV-257901
    // (Jaccard 1.0) and 0 with the other two -> wins SV-257901.
    expect(byNew['SV-273901']).toMatchObject({
      oldId: 'SV-257901',
      matchMethod: 'srg-cci-tiebreak',
      relationship: 'primary',
      potentialMismatch: false,
    });
  });

  it('flags a primary Tier-2 match with CCI Jaccard=0 as potentialMismatch', () => {
    // SV-273902 has CCI-999999, which has zero overlap with any candidate
    // in the SRG-OS-CRYPTO block. After SV-273900 and SV-273901 claim
    // SV-257900 and SV-257901, only SV-257902 is unclaimed; the pipeline
    // picks it by title tiebreak, marks primary, and flags the match
    // because the CCI Jaccard is below 0.5.
    expect(byNew['SV-273902']).toMatchObject({
      oldId: 'SV-257902',
      matchMethod: 'srg-cci-tiebreak',
      relationship: 'primary',
      potentialMismatch: true,
    });
    expect(byNew['SV-273902'].confidence).toBeLessThan(0.5);
  });

  it('correctly returns no-match for genuinely novel AL2023 requirements', () => {
    // SV-273999 has a novel SRG and novel CCI. Tier 3 Fuse gets nothing
    // semantically close (title is about DoS mitigation, no RHEL 9
    // control has any comparable content).
    expect(byNew['SV-273999']).toMatchObject({
      oldId: null,
      matchMethod: 'none',
      relationship: 'no-match',
      potentialMismatch: false,
    });
  });

  it('flags exactly one control as potentialMismatch (regression guard on the threshold)', () => {
    const flagged = links.filter(l => l.potentialMismatch);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].newId).toBe('SV-273902');
  });
});
