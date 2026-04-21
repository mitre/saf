import Fuse from 'fuse.js';

/**
 * Helpers for requirement-first delta matching.
 *
 * Cross-vendor STIG deltas (RHEL9 -> AL2023, Ubuntu -> Oracle Linux, etc.)
 * suffer under a pure fuzzy matcher on control titles alone: the vendor
 * prefix drift ("RHEL 9" vs "Amazon Linux 2023") dominates the score and
 * pushes identical requirements out of the accept band.
 *
 * These helpers treat the upstream DISA SRG ID as the canonical requirement
 * identity, CCIs as the block-internal tiebreaker when one SRG is split
 * into N vendor-specific rules, and auto-detected / normalized titles as a
 * last-resort tiebreaker for the long tail.
 */

/**
 * Given the rule titles of a STIG benchmark, discover the dominant leading
 * token prefix (e.g. "RHEL 9", "The Apache web server") that the vendor
 * used on (nearly) every rule. That prefix is then stripped before fuzzy
 * comparison so cross-vendor deltas aren't dragged down by vendor-name
 * drift.
 *
 * Returns '' when no single prefix dominates the corpus.
 */
/**
 * Modal verbs mark the start of a STIG rule's compliance statement
 * ("... must ...", "... will ...", "... shall ..."). Anything before the
 * first modal is "preamble" the vendor adds uniformly; anything after is
 * the semantic content we want to preserve for fuzzy comparison.
 */
const COMPLIANCE_MODALS = new Set([
  'must', 'will', 'shall', 'should', 'may', 'needs',
]);

function tokensBeforeModal(title: string): string[] {
  const tokens = title.split(/\s+/);
  const modalIdx = tokens.findIndex((t) =>
    COMPLIANCE_MODALS.has(t.toLowerCase()),
  );
  return modalIdx === -1 ? tokens : tokens.slice(0, modalIdx);
}

/**
 * Minimal structural shape the matcher needs from an InSpec control.
 * Matches the subset of `@mitre/inspec-objects`' Control that we read.
 */
export type ControlLike = {
  id: string;
  title?: string | null;
  tags?: {
    gtitle?: string | null;
    cci?: string[] | null;
  };
};

/**
 * Return the upstream DISA SRG ID for a control (from `tags.gtitle`),
 * or null when the field is missing. SRG IDs are identical across vendor
 * flavors of the same requirement, which makes them the canonical
 * blocking key for cross-vendor STIG delta matching.
 */
export function extractSrgId(control: ControlLike): string | null {
  return control.tags?.gtitle ?? null;
}

function safeTitle(title: string | null | undefined): string {
  return title ?? '';
}

/**
 * Return the control's CCI set (from `tags.cci`), deduped. Empty Set when
 * missing. Used as block-internal tiebreaker when multiple new-profile
 * controls share an SRG with the same old-profile control (1:N splits).
 */
export function extractCcis(control: ControlLike): Set<string> {
  return new Set(control.tags?.cci ?? []);
}

/**
 * Token-level Jaccard similarity between two strings. Lowercased,
 * whitespace-split, empty tokens dropped. 0.0 when either side is empty.
 *
 * Used as a block-internal tiebreaker in Tier 2 when multiple old
 * candidates share the new control's SRG *and* its CCI set — distinct
 * control titles (modulo normalized vendor prefix) still discriminate.
 */
export function tokenJaccard(a: string, b: string): number {
  const toks = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 0),
    );
  const ta = toks(a);
  const tb = toks(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let intersectionSize = 0;
  for (const x of ta) {
    if (tb.has(x)) intersectionSize++;
  }
  const unionSize = ta.size + tb.size - intersectionSize;
  return intersectionSize / unionSize;
}

/**
 * Jaccard similarity between two CCI sets. Returns 0.0 when both sides
 * are empty (no signal to differentiate) — callers must treat that as
 * "tied" not "match".
 */
export function cciJaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersectionSize = 0;
  for (const x of a) {
    if (b.has(x)) intersectionSize++;
  }
  const unionSize = a.size + b.size - intersectionSize;
  return intersectionSize / unionSize;
}

/**
 * Build a Map from SRG-OS ID to the list of controls tagged with that SRG.
 * Used as a blocking index: each new-profile control looks up its
 * candidate pool by SRG-ID in O(1) instead of scanning all old controls.
 * Controls without a gtitle are skipped (they will fall through to the
 * fuzzy-title fallback path).
 */
export function buildSrgIndex(
  controls: ControlLike[],
): Map<string, ControlLike[]> {
  const index = new Map<string, ControlLike[]>();
  for (const c of controls) {
    const srg = extractSrgId(c);
    if (srg === null) continue;
    const bucket = index.get(srg);
    if (bucket) {
      bucket.push(c);
    } else {
      index.set(srg, [c]);
    }
  }
  return index;
}

/**
 * Structured link record produced by applyRequirementFirstPipeline for
 * every control in the new profile.
 *
 * `matchMethod` tracks which tier accepted the link:
 *   - `srg-deterministic`  Tier 1: single SRG candidate, accepted.
 *   - `srg-cci-tiebreak`   Tier 2: multiple SRG candidates, best CCI Jaccard won.
 *   - `fuse-fallback`      Tier 3: no SRG match, Fuse title similarity carried it.
 *   - `none`               No link found.
 *
 * `relationship`:
 *   - `primary`   This new control is the best (or only) link to its old control.
 *   - `related`   Another new control has a better CCI Jaccard for the same old
 *                 control; kept here so downstream can copy the RHEL body once
 *                 but know all the related new controls.
 *   - `no-match`  Paired with matchMethod=`none`.
 */
export type MatchMethod =
  | 'srg-deterministic'
  | 'srg-cci-tiebreak'
  | 'fuse-fallback'
  | 'none';

export type LinkRecord = {
  oldId: string | null;
  newId: string;
  matchMethod: MatchMethod;
  confidence: number;
  relationship: 'primary' | 'related' | 'no-match';
  srg?: string | null;
  potentialMismatch: boolean;
};

export type ProfileLike = {
  controls: ControlLike[];
};

/**
 * Tier-3 acceptance threshold. Fuse.js Levenshtein-style score where 0.0
 * is a perfect match and 1.0 is no match at all. The original saf
 * implementation accepted scores < 0.3, which rejected ~65% of genuinely
 * equivalent cross-vendor rules due to vendor-prefix drift. With the
 * prefix stripped by normalizeTitle beforehand, a threshold of 0.45
 * generously admits token-level typos / re-ordering without accepting
 * unrelated content.
 */
const FUSE_ACCEPT_THRESHOLD = 0.45;

/**
 * Primary Tier-2 links with a CCI Jaccard below this threshold are flagged
 * as `potentialMismatch`. The algorithm still accepts them (they are the
 * best candidate in their SRG block), but reviewers should confirm the
 * carried-forward control body still fits the new requirement.
 */
export const TIER2_MISMATCH_THRESHOLD = 0.5;

/**
 * Primary Tier-3 (Fuse-fallback) links with a confidence below this
 * threshold are flagged as `potentialMismatch`. Fuse already gates
 * acceptance at `1 - FUSE_ACCEPT_THRESHOLD` (= 0.55 confidence), so the
 * flag fires across the [0.55, 0.9) band: accepted but soft.
 */
export const TIER3_MISMATCH_THRESHOLD = 0.9;

/**
 * Compute the `potentialMismatch` flag for a link from its (matchMethod,
 * relationship, confidence) tuple. Related and no-match links never flag
 * (the flag is about soft primary matches). Tier 1 is always trusted.
 */
function computePotentialMismatch(
  matchMethod: MatchMethod,
  relationship: 'primary' | 'related' | 'no-match',
  confidence: number,
): boolean {
  if (relationship !== 'primary') return false;
  if (matchMethod === 'srg-cci-tiebreak') {
    return confidence < TIER2_MISMATCH_THRESHOLD;
  }
  if (matchMethod === 'fuse-fallback') {
    return confidence < TIER3_MISMATCH_THRESHOLD;
  }
  return false;
}

/**
 * Assemble the object written to `delta.json`. Spreads the text-diff
 * object (`ignoreFormattingDiff` + `rawDiff`) and appends the
 * machine-readable `links` array. Single source of truth for the
 * delta.json schema; update here when the shape changes.
 *
 * `links` is applied last so it wins over any stale key in the diff
 * object (defensive — `updatedResult.diff` should not carry a `links`
 * key, but this keeps the contract explicit).
 */
export function buildDeltaJsonPayload({
  diff,
  links,
}: {
  diff: Record<string, unknown>;
  links: LinkRecord[];
}): Record<string, unknown> {
  return { ...diff, links };
}

/**
 * Minimal-shape Profile pair -> LinkRecord per new control.
 *
 * Tier 1 (this commit): deterministic SRG block with single candidate.
 * Later tiers appended by subsequent TDD cycles.
 */
export function applyRequirementFirstPipeline(
  oldProfile: ProfileLike,
  newProfile: ProfileLike,
): LinkRecord[] {
  const srgIndex = buildSrgIndex(oldProfile.controls);

  // Detect each corpus's dominant leading prefix so cross-vendor drift
  // (e.g. "RHEL 9" vs "Amazon Linux 2023") doesn't bleed into the fuzzy
  // scores in tier 3.
  const oldPrefix = autoDetectPrefix(
    oldProfile.controls.map((c) => safeTitle(c.title)),
  );
  const newPrefix = autoDetectPrefix(
    newProfile.controls.map((c) => safeTitle(c.title)),
  );

  // Pre-compute a Fuse index over normalized old-control titles + gtitles.
  // Only built when tier 3 will actually fire (there's at least one old
  // control to search against).
  type SearchRecord = { originalId: string; title: string; gtitle: string };
  const searchCorpus: SearchRecord[] = oldProfile.controls.map((c) => ({
    originalId: c.id,
    title: normalizeTitle(safeTitle(c.title), oldPrefix),
    gtitle: c.tags?.gtitle ?? '',
  }));
  const fuse =
    searchCorpus.length > 0
      ? new Fuse(searchCorpus, {
          includeScore: true,
          shouldSort: true,
          threshold: 0.5,
          ignoreLocation: true,
          ignoreFieldNorm: true,
          keys: ['title', 'gtitle'],
        })
      : null;

  const links: LinkRecord[] = [];

  // Track which old control has already been claimed as `primary` by a new
  // control within the same SRG block. If a second new control best-matches
  // the same old control, it becomes `related` (1:N split — multiple new
  // controls inherit one old body, but only the highest-Jaccard is primary).
  const claimedOldIds = new Set<string>();

  for (const newControl of newProfile.controls) {
    const srg = extractSrgId(newControl);
    const candidates = srg ? (srgIndex.get(srg) ?? []) : [];

    if (candidates.length === 0) {
      // Tier 3 — fuzzy fallback. Normalize the new control's title with
      // its corpus's detected prefix, then search Fuse over old titles.
      if (fuse) {
        const searchQuery = normalizeTitle(safeTitle(newControl.title), newPrefix);
        if (searchQuery) {
          const results = fuse.search(searchQuery);
          const best = results[0];
          if (
            best?.score !== undefined &&
            best.score < FUSE_ACCEPT_THRESHOLD
          ) {
            const matchedOldId = best.item.originalId;
            const primary = !claimedOldIds.has(matchedOldId);
            if (primary) claimedOldIds.add(matchedOldId);
            const confidence = 1 - best.score;
            const relationship = primary ? 'primary' : 'related';
            links.push({
              oldId: matchedOldId,
              newId: newControl.id,
              matchMethod: 'fuse-fallback',
              // Invert Fuse score (0=perfect, 1=no match) into a
              // 0-1 confidence where 1.0 is perfect.
              confidence,
              relationship,
              srg: srg ?? null,
              potentialMismatch: computePotentialMismatch(
                'fuse-fallback',
                relationship,
                confidence,
              ),
            });
            continue;
          }
        }
      }
      links.push({
        oldId: null,
        newId: newControl.id,
        matchMethod: 'none',
        confidence: 0,
        relationship: 'no-match',
        srg: srg ?? null,
        potentialMismatch: false,
      });
      continue;
    }

    if (candidates.length === 1) {
      const winner = candidates[0];
      const primary = !claimedOldIds.has(winner.id);
      if (primary) claimedOldIds.add(winner.id);
      const relationship = primary ? 'primary' : 'related';
      links.push({
        oldId: winner.id,
        newId: newControl.id,
        matchMethod: 'srg-deterministic',
        confidence: 1,
        relationship,
        srg,
        potentialMismatch: computePotentialMismatch(
          'srg-deterministic',
          relationship,
          1,
        ),
      });
      continue;
    }

    // Tier 2: multiple candidates in this SRG block. Rank by a composite
    // score of CCI Jaccard (primary signal) + normalized-title Jaccard
    // (tiebreak — catches the N:N-in-one-SRG cross-vendor case where
    // every candidate has identical CCIs). Prefer unclaimed candidates
    // so distinct new controls don't all pile onto the same old; only
    // fall back to a claimed candidate (→ `related`) when every old in
    // the block is already taken.
    const newCcis = extractCcis(newControl);
    const newNormTitle = normalizeTitle(safeTitle(newControl.title), newPrefix);

    let bestUnclaimedIdx = -1;
    let bestUnclaimedComposite = -1;
    let bestUnclaimedCci = 0;
    let bestClaimedIdx = -1;
    let bestClaimedComposite = -1;
    let bestClaimedCci = 0;

    for (let i = 0; i < candidates.length; i++) {
      const cci = cciJaccard(newCcis, extractCcis(candidates[i]));
      const oldNormTitle = normalizeTitle(
        safeTitle(candidates[i].title),
        oldPrefix,
      );
      const title = tokenJaccard(newNormTitle, oldNormTitle);
      const composite = 0.7 * cci + 0.3 * title;

      if (claimedOldIds.has(candidates[i].id)) {
        if (composite > bestClaimedComposite) {
          bestClaimedComposite = composite;
          bestClaimedCci = cci;
          bestClaimedIdx = i;
        }
      } else if (composite > bestUnclaimedComposite) {
        bestUnclaimedComposite = composite;
        bestUnclaimedCci = cci;
        bestUnclaimedIdx = i;
      }
    }

    const winnerIdx =
      bestUnclaimedIdx !== -1 ? bestUnclaimedIdx : bestClaimedIdx;
    const winnerCci =
      bestUnclaimedIdx !== -1 ? bestUnclaimedCci : bestClaimedCci;
    const winner = candidates[winnerIdx];
    const primary = !claimedOldIds.has(winner.id);
    if (primary) claimedOldIds.add(winner.id);
    const confidence = Math.max(winnerCci, 0);
    const relationship = primary ? 'primary' : 'related';
    links.push({
      oldId: winner.id,
      newId: newControl.id,
      matchMethod: 'srg-cci-tiebreak',
      confidence,
      relationship,
      srg,
      potentialMismatch: computePotentialMismatch(
        'srg-cci-tiebreak',
        relationship,
        confidence,
      ),
    });
  }
  return links;
}

/**
 * Strip a detected vendor/product prefix from a rule title. No-op when
 * prefix is empty or not present at the start.
 */
export function normalizeTitle(title: string, prefix: string): string {
  if (!prefix) return title;
  if (title === prefix) return '';
  if (title.startsWith(prefix + ' ')) {
    return title.slice(prefix.length + 1);
  }
  return title;
}

/**
 * Discover the dominant leading-token prefix of a corpus of rule titles.
 *
 * Tries long prefixes first; at each length, returns the prefix if it
 * dominates more than `threshold` (default 0.5, strict majority) of the
 * corpus. Falls back to progressively shorter prefixes when no long prefix
 * dominates. Returns '' when no prefix at any length reaches the threshold
 * (feature-focused corpora like Google Chrome STIG).
 */
export function autoDetectPrefix(titles: string[], threshold = 0.5): string {
  if (titles.length === 0) return '';
  const leading = titles.map(tokensBeforeModal);
  const maxLen = Math.max(...leading.map((l) => l.length));
  for (let n = maxLen; n > 0; n--) {
    const counts = new Map<string, number>();
    for (const l of leading) {
      if (l.length >= n) {
        const key = l.slice(0, n).join(' ');
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    let bestKey = '';
    let bestCount = 0;
    for (const [key, count] of counts) {
      if (count > bestCount) {
        bestKey = key;
        bestCount = count;
      }
    }
    if (bestCount / titles.length > threshold) {
      return bestKey;
    }
  }
  return '';
}
