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
  const modalIdx = tokens.findIndex(t =>
    COMPLIANCE_MODALS.has(t.toLowerCase()),
  );
  return modalIdx === -1 ? tokens : tokens.slice(0, modalIdx);
}

/**
 * Tokenize a string into a lowercase Set. Whitespace-split, empty tokens
 * dropped. Module-scoped so it's not re-created per tokenJaccard call.
 */
function tokenizeSet(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 0),
  );
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
  return new Set(control.tags?.cci);
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
  const ta = tokenizeSet(a);
  const tb = tokenizeSet(b);
  if (ta.size === 0 || tb.size === 0) {
    return 0;
  }
  let intersectionSize = 0;
  for (const x of ta) {
    if (tb.has(x)) {
      intersectionSize++;
    }
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
  if (a.size === 0 && b.size === 0) {
    return 0;
  }
  let intersectionSize = 0;
  for (const x of a) {
    if (b.has(x)) {
      intersectionSize++;
    }
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
    if (srg === null) {
      continue;
    }
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
export type MatchMethod
  = | 'srg-deterministic'
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
 * Tier-2 ranker composite weights: `composite = CCI_WEIGHT * cciJaccard
 * + TITLE_WEIGHT * tokenJaccard(normalizedTitle)`. CCI dominates because
 * it's the block-internal discriminator; title is a tiebreak for the
 * N:N-in-one-SRG cross-vendor case where every candidate has identical
 * CCIs. The two MUST sum to 1.0 — asserted in tests.
 */
export const TIER2_COMPOSITE_CCI_WEIGHT = 0.7;
export const TIER2_COMPOSITE_TITLE_WEIGHT = 0.3;

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
  if (relationship !== 'primary') {
    return false;
  }
  if (matchMethod === 'srg-cci-tiebreak') {
    return confidence < TIER2_MISMATCH_THRESHOLD;
  }
  if (matchMethod === 'fuse-fallback') {
    return confidence < TIER3_MISMATCH_THRESHOLD;
  }
  return false;
}

/**
 * Shape of the text-diff portion of `delta.json`, produced by
 * `@mitre/inspec-objects::updateProfileUsingXCCDF`. Carried as an opaque
 * key bag because inspec-objects doesn't export a named type, but we
 * lock in the keys downstream consumers rely on so a breaking change
 * there is noisy here.
 */
export type DeltaDiff = {
  ignoreFormattingDiff?: Record<string, unknown>;
  rawDiff?: Record<string, unknown>;
  markdown?: string;
} & Record<string, unknown>;

/**
 * The complete `delta.json` payload. Consumers (adaptation queue
 * tooling, the future profile-derivation skill, etc.) should treat this
 * as the authoritative schema reference.
 *
 * Top-level keys:
 *   - `ignoreFormattingDiff` (inherited) — whitespace-insensitive diff
 *     of the rewritten controls/*.rb vs their originals.
 *   - `rawDiff` (inherited) — byte-level diff, same scope.
 *   - `markdown` (inherited, optional) — human-facing diff report.
 *   - `links` (added by this command) — one LinkRecord per new-profile
 *     control, describing which old control's body was carried forward:
 *       * `oldId`             old control id, or `null` for no-match
 *       * `newId`             new control id (always present)
 *       * `matchMethod`       'srg-deterministic' | 'srg-cci-tiebreak' |
 *                             'fuse-fallback' | 'none'
 *       * `confidence`        0-1 tier-specific confidence
 *       * `relationship`      'primary' | 'related' | 'no-match'
 *       * `srg`               SRG-OS id from the new control, or null
 *       * `potentialMismatch` soft-match flag for reviewer triage
 *     See LinkRecord for per-field semantics.
 */
export type DeltaJsonPayload = DeltaDiff & { links: LinkRecord[] };

/**
 * Assemble the object written to `delta.json`. `links` is applied last
 * so it wins over any stale key in the diff object (defensive —
 * `updatedResult.diff` should not carry a `links` key, but this keeps
 * the contract explicit).
 */
export function buildDeltaJsonPayload({
  diff,
  links,
}: {
  diff: DeltaDiff;
  links: LinkRecord[];
}): DeltaJsonPayload {
  return { ...diff, links };
}

type SearchRecord = { originalId: string; title: string; gtitle: string };

// Fuse.js's default export is typed as both a class and a namespace,
// which makes `Fuse<T>` ambiguous in type position. Structurally
// describing the one method we call sidesteps the namespace collision
// and documents exactly what tier 3 consumes.
type FuseSearcher = {
  search(query: string): { item: SearchRecord; score?: number }[];
};

type TierContext = {
  oldPrefix: string;
  newPrefix: string;
  fuse: FuseSearcher | null;
  claimedOldIds: Set<string>;
};

type ScoredCandidate = { idx: number; composite: number; cci: number };

/**
 * Mark `oldId` as claimed so subsequently-scored new controls prefer an
 * unclaimed old (the tier-2 spreading heuristic). This only records that
 * *some* new control mapped here; it does NOT decide which one is primary —
 * that is `electPrimaries`' job. Mutates `claimedOldIds` in place.
 */
function registerClaim(oldId: string, claimedOldIds: Set<string>): void {
  claimedOldIds.add(oldId);
}

/**
 * Construct a successful LinkRecord (any tier) as a `related` *candidate*.
 * A tier function cannot know whether its new control is the best match for
 * the old until the whole profile is scored, so it never assigns `primary`
 * here; `electPrimaries` elects one primary per old control afterward and
 * (re)computes `potentialMismatch` from the final relationship. Built as
 * `related` with `potentialMismatch=false` (the value for any non-primary).
 */
function makeLink(args: {
  newControl: ControlLike;
  oldId: string;
  matchMethod: MatchMethod;
  confidence: number;
  srg: string | null;
}): LinkRecord {
  return {
    oldId: args.oldId,
    newId: args.newControl.id,
    matchMethod: args.matchMethod,
    confidence: args.confidence,
    relationship: 'related',
    srg: args.srg,
    potentialMismatch: false,
  };
}

/** Emit a no-match link — same shape across all tier-miss paths. */
function makeNoMatch(newControl: ControlLike, srg: string | null): LinkRecord {
  return {
    oldId: null,
    newId: newControl.id,
    matchMethod: 'none',
    confidence: 0,
    relationship: 'no-match',
    srg,
    potentialMismatch: false,
  };
}

/**
 * Tier 1: exactly one candidate in the SRG block. Deterministic link,
 * confidence always 1.0.
 */
function tier1DeterministicMatch(
  newControl: ControlLike,
  candidate: ControlLike,
  srg: string,
  claimedOldIds: Set<string>,
): LinkRecord {
  registerClaim(candidate.id, claimedOldIds);
  return makeLink({
    newControl,
    oldId: candidate.id,
    matchMethod: 'srg-deterministic',
    confidence: 1,
    srg,
  });
}

/**
 * Tier 2: multiple candidates in this SRG block. Rank by a composite
 * score of CCI Jaccard (primary signal) + normalized-title Jaccard
 * (tiebreak — catches the N:N-in-one-SRG cross-vendor case where every
 * candidate has identical CCIs). Prefer unclaimed candidates so distinct
 * new controls don't all pile onto the same old; only fall back to a
 * claimed candidate (emits `related`) when every old in the block is
 * already taken.
 *
 * The reported `confidence` is the winner's CCI Jaccard alone (not the
 * composite), so downstream thresholds on `confidence` stay semantically
 * "how well do the block-internal CCI sets overlap" — see beads memory
 * `tier-2-composite-scoring`.
 */
function tier2CciTiebreak(
  newControl: ControlLike,
  candidates: ControlLike[],
  srg: string,
  ctx: TierContext,
): LinkRecord {
  const newCcis = extractCcis(newControl);
  const newNormTitle = normalizeTitle(
    safeTitle(newControl.title),
    ctx.newPrefix,
  );

  let bestUnclaimed: ScoredCandidate | null = null;
  let bestClaimed: ScoredCandidate | null = null;

  for (const [i, candidate] of candidates.entries()) {
    const cci = cciJaccard(newCcis, extractCcis(candidate));
    const oldNormTitle = normalizeTitle(
      safeTitle(candidate.title),
      ctx.oldPrefix,
    );
    const title = tokenJaccard(newNormTitle, oldNormTitle);
    const composite
      = TIER2_COMPOSITE_CCI_WEIGHT * cci
        + TIER2_COMPOSITE_TITLE_WEIGHT * title;
    const slot: ScoredCandidate = { idx: i, composite, cci };
    if (ctx.claimedOldIds.has(candidate.id)) {
      if (!bestClaimed || composite > bestClaimed.composite) {
        bestClaimed = slot;
      }
    } else if (!bestUnclaimed || composite > bestUnclaimed.composite) {
      bestUnclaimed = slot;
    }
  }

  // Invariant: tier 2 is only entered when candidates.length >= 2, so at
  // least one of bestUnclaimed / bestClaimed is populated. Explicit guard
  // so the type narrows without a non-null assertion.
  const winner = bestUnclaimed ?? bestClaimed;
  if (winner === null) {
    throw new Error(
      'tier2CciTiebreak invariant violated: no candidate selected from a non-empty candidate list',
    );
  }
  const winningCandidate = candidates[winner.idx];
  registerClaim(winningCandidate.id, ctx.claimedOldIds);
  return makeLink({
    newControl,
    oldId: winningCandidate.id,
    matchMethod: 'srg-cci-tiebreak',
    confidence: Math.max(winner.cci, 0),
    srg,
  });
}

/**
 * Tier 3: no SRG candidates. Normalize the new control's title with its
 * corpus prefix, search Fuse over old titles. Returns null when Fuse is
 * unavailable (empty old profile), no query is extractable, or the best
 * hit doesn't clear FUSE_ACCEPT_THRESHOLD — callers emit `makeNoMatch`.
 */
function tier3FuseFallback(
  newControl: ControlLike,
  srg: string | null,
  ctx: TierContext,
): LinkRecord | null {
  if (!ctx.fuse) {
    return null;
  }
  const searchQuery = normalizeTitle(
    safeTitle(newControl.title),
    ctx.newPrefix,
  );
  if (!searchQuery) {
    return null;
  }
  const results = ctx.fuse.search(searchQuery);
  const best = results[0];
  if (best?.score === undefined || best.score >= FUSE_ACCEPT_THRESHOLD) {
    return null;
  }
  // Invert Fuse score (0=perfect, 1=no match) into a 0-1 confidence
  // where 1.0 is perfect.
  const confidence = 1 - best.score;
  registerClaim(best.item.originalId, ctx.claimedOldIds);
  return makeLink({
    newControl,
    oldId: best.item.originalId,
    matchMethod: 'fuse-fallback',
    confidence,
    srg,
  });
}

/**
 * Trust ordering of match tiers, used to elect a primary when several new
 * controls (possibly from different tiers) land on one old control. Higher =
 * more trustworthy: an SRG-deterministic match beats an SRG+CCI tiebreak,
 * which beats a cross-SRG Fuse title fallback. `none` never reaches election.
 */
function matchMethodRank(matchMethod: MatchMethod): number {
  switch (matchMethod) {
    case 'srg-deterministic': {
      return 3;
    }
    case 'srg-cci-tiebreak': {
      return 2;
    }
    case 'fuse-fallback': {
      return 1;
    }
    default: {
      return 0;
    }
  }
}

/**
 * Elect the `primary` link for every old control. The tier functions build
 * each match as a `related` candidate; this is the single, authoritative
 * place that designates primaries — there is no provisional "primary" that
 * later gets overwritten. For each old control, the highest-confidence
 * candidate becomes `primary` (the link that inherits the old body
 * downstream) and the rest stay `related`; an exact tie resolves to the
 * first candidate in new-profile input order. `potentialMismatch` is
 * recomputed from the final relationship (it is false for `related`, so a
 * promoted primary must be re-evaluated). Mutates and returns `links`.
 *
 * SCOPE: `confidence` measures each candidate's fit to the old it was
 * *assigned* to. Tier 2's prefer-unclaimed spreading (see `tier2CciTiebreak`)
 * can route a new control off a stronger but already-claimed old, so this
 * elects the best body recipient *among the controls that landed on a given
 * old* — it does not guarantee that control was on its globally-strongest
 * old. That requires globally-optimal assignment (score all new x old pairs
 * together), which this greedy matcher does not do; it is addressed by the
 * requirement-text matcher rework, not here.
 */
export function electPrimaries(links: LinkRecord[]): LinkRecord[] {
  const byOld = new Map<string, LinkRecord[]>();
  for (const link of links) {
    if (link.oldId === null || link.relationship === 'no-match') {
      continue;
    }
    const bucket = byOld.get(link.oldId);
    if (bucket) {
      bucket.push(link);
    } else {
      byOld.set(link.oldId, [link]);
    }
  }
  for (const group of byOld.values()) {
    // Elect tier-first, then by confidence WITHIN a tier. Confidence is not
    // comparable across tiers (tier 1 = 1.0; tier 2 = CCI Jaccard; tier 3 =
    // 1 - Fuse title score), so a cross-SRG tier-3 fuzzy match must not
    // outrank a same-SRG tier-2 match on the same old just because its raw
    // score is higher. A higher tier (more trustworthy match) always wins;
    // strict `>` on confidence keeps the first candidate on within-tier ties
    // (deterministic input order).
    let best = group[0];
    for (const link of group) {
      const rank = matchMethodRank(link.matchMethod);
      const bestRank = matchMethodRank(best.matchMethod);
      if (rank > bestRank
        || (rank === bestRank && link.confidence > best.confidence)) {
        best = link;
      }
    }
    for (const link of group) {
      link.relationship = link === best ? 'primary' : 'related';
      link.potentialMismatch = computePotentialMismatch(
        link.matchMethod,
        link.relationship,
        link.confidence,
      );
    }
  }
  return links;
}

/**
 * Requirement-first cross-vendor matcher. For every control in the new
 * profile, try (in order): Tier 1 deterministic SRG match, Tier 2
 * composite CCI+title tiebreak, Tier 3 Fuse title fallback. Returns a
 * LinkRecord per new control, including explicit no-match records so
 * downstream consumers can iterate uniformly.
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
    oldProfile.controls.map(c => safeTitle(c.title)),
  );
  const newPrefix = autoDetectPrefix(
    newProfile.controls.map(c => safeTitle(c.title)),
  );

  // Pre-compute a Fuse index over normalized old-control titles + gtitles.
  // Only built when tier 3 will actually fire (there's at least one old
  // control to search against).
  const searchCorpus: SearchRecord[] = oldProfile.controls.map(c => ({
    originalId: c.id,
    title: normalizeTitle(safeTitle(c.title), oldPrefix),
    gtitle: c.tags?.gtitle ?? '',
  }));
  const fuse
    = searchCorpus.length > 0
      ? new Fuse(searchCorpus, {
        includeScore: true,
        shouldSort: true,
        threshold: 0.5,
        ignoreLocation: true,
        ignoreFieldNorm: true,
        keys: ['title', 'gtitle'],
      })
      : null;

  // Tracks which old controls have been mapped to, so tier 2 prefers an
  // unclaimed old when spreading distinct new controls across olds. This is
  // only used for candidate *selection*; `electPrimaries` (after the loop)
  // is what designates the primary of each old control by confidence.
  const claimedOldIds = new Set<string>();
  const ctx: TierContext = { oldPrefix, newPrefix, fuse, claimedOldIds };

  const links: LinkRecord[] = [];
  for (const newControl of newProfile.controls) {
    const srg = extractSrgId(newControl);
    // `candidates` is non-empty only when `srg` is non-null (srgIndex
    // only stores non-null SRG keys). The explicit `srg !== null` guard
    // in the tier 1/2 branches narrows the type so neither tier needs
    // a non-null assertion.
    const candidates = srg === null ? [] : (srgIndex.get(srg) ?? []);

    if (srg !== null && candidates.length === 1) {
      links.push(
        tier1DeterministicMatch(newControl, candidates[0], srg, claimedOldIds),
      );
    } else if (srg !== null && candidates.length > 1) {
      links.push(tier2CciTiebreak(newControl, candidates, srg, ctx));
    } else {
      links.push(
        tier3FuseFallback(newControl, srg, ctx)
        ?? makeNoMatch(newControl, srg),
      );
    }
  }
  return electPrimaries(links);
}

/**
 * Strip a detected vendor/product prefix from a rule title. No-op when
 * prefix is empty or not present at the start.
 */
export function normalizeTitle(title: string, prefix: string): string {
  if (!prefix) {
    return title;
  }
  if (title === prefix) {
    return '';
  }
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
  if (titles.length === 0) {
    return '';
  }
  const leading = titles.map(t => tokensBeforeModal(t));
  const maxLen = Math.max(...leading.map(l => l.length));
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
