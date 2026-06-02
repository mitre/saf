import Fuse from 'fuse.js';

/**
 * Helpers for requirement-first delta matching.
 *
 * SRG-IDs and CCI tags categorize STIG requirements; they do not identify
 * them. A single SRG by design buckets multiple specific rules with shared
 * CCIs (CCI Jaccard saturates inside dense blocks), and independently
 * authored STIGs bucket distinct requirements under the same SRG/CCI. The
 * stable signal is the requirement text itself (title + check).
 *
 * Pipeline: SRG-ID is a blocking key (narrows the candidate pool); inside
 * each block we run globally-optimal greedy bipartite assignment scored on
 * `SEMANTIC_WEIGHT * semanticScore(title+check) + CCI_WEIGHT * cciJaccard`,
 * so winning pairs don't permute under reordering of the new profile.
 * Controls with no SRG overlap fall through to a Fuse fuzzy fallback on
 * vendor-prefix-stripped titles.
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
 * `tags.check` is the STIG check text — the most discriminating semantic
 * content inside a dense SRG block where titles are near-synonymous.
 */
export type ControlLike = {
  id: string;
  title?: string | null;
  tags?: {
    gtitle?: string | null;
    cci?: string[] | null;
    check?: string | null;
  };
};

/**
 * Return the upstream DISA SRG ID for a control (from `tags.gtitle`),
 * or null when the field is missing. Used as a blocking key only — the
 * actual requirement identity is in the title + check text.
 */
export function extractSrgId(control: ControlLike): string | null {
  return control.tags?.gtitle ?? null;
}

function safeTitle(title: string | null | undefined): string {
  return title ?? '';
}

function safeCheck(control: ControlLike): string {
  return control.tags?.check ?? '';
}

/**
 * Return the control's CCI set (from `tags.cci`), deduped. Empty Set when
 * missing. Used as a secondary tiebreaker only (see module docstring on
 * why CCIs do not identify a requirement).
 */
export function extractCcis(control: ControlLike): Set<string> {
  return new Set(control.tags?.cci);
}

/**
 * Token-level Jaccard similarity between two strings. Lowercased,
 * whitespace-split, empty tokens dropped. 0.0 when either side is empty.
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
 * Combined title + check-text Jaccard similarity, with vendor-prefix stripping
 * on titles. This is the requirement-identity signal — titles can be
 * near-synonymous inside dense SRG blocks (audit, PAM); the check text carries
 * the distinguishing technical content (commands, file paths, expected values).
 *
 * `combined` weights title and check equally when both sides have check text,
 * and falls back to `titleSim` alone when either side lacks it (so a missing
 * check field doesn't penalize an otherwise-strong title match).
 */
export const SEMANTIC_TITLE_WEIGHT = 0.5;
export const SEMANTIC_CHECK_WEIGHT = 0.5;

export function semanticScore(
  newControl: ControlLike,
  oldControl: ControlLike,
  newPrefix: string,
  oldPrefix: string,
): { titleSim: number; checkSim: number; combined: number } {
  const newTitle = normalizeTitle(safeTitle(newControl.title), newPrefix);
  const oldTitle = normalizeTitle(safeTitle(oldControl.title), oldPrefix);
  const titleSim = tokenJaccard(newTitle, oldTitle);

  const newCheck = safeCheck(newControl);
  const oldCheck = safeCheck(oldControl);
  const hasCheck = newCheck.length > 0 && oldCheck.length > 0;
  const checkSim = hasCheck ? tokenJaccard(newCheck, oldCheck) : 0;
  const combined = hasCheck
    ? SEMANTIC_TITLE_WEIGHT * titleSim + SEMANTIC_CHECK_WEIGHT * checkSim
    : titleSim;

  return { titleSim, checkSim, combined };
}

/**
 * Structured link record produced by applyRequirementFirstPipeline for
 * every control in the new profile.
 *
 * `matchMethod` tracks which tier accepted the link:
 *   - `srg-deterministic`     Tier 1: single SRG candidate, accepted.
 *   - `srg-semantic-tiebreak` Tier 2: multi-candidate block, scored by
 *                                     requirement-text similarity with
 *                                     CCI as a secondary signal.
 *   - `fuse-fallback`         Tier 3: no SRG match, Fuse title similarity.
 *   - `none`                  No link found.
 *
 * `relationship`:
 *   - `primary`   This new control is the best (or only) link to its old control.
 *   - `related`   Another new control has a better composite score for the same
 *                 old control; kept here so downstream can copy the body once
 *                 but know all the related new controls.
 *   - `no-match`  Paired with matchMethod=`none`.
 *
 * Triage fields (optional, populated when relevant):
 *   - `titleSimilarity`   Vendor-prefix-stripped title Jaccard.
 *   - `checkSimilarity`   tags.check token Jaccard (0 when either side lacks check text).
 *   - `cciJaccardScore`   CCI overlap, retained for visibility / downstream sorting.
 *   - `semanticScore`     Combined title + check (the requirement-identity signal).
 *   - `blockNewCount`     # of new controls sharing this SRG (Tier 1/2 only).
 *   - `blockOldCount`     # of old controls sharing this SRG (Tier 1/2 only).
 */
export type MatchMethod
  = | 'srg-deterministic'
    | 'srg-semantic-tiebreak'
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
  titleSimilarity?: number;
  checkSimilarity?: number;
  cciJaccardScore?: number;
  semanticScore?: number;
  blockNewCount?: number;
  blockOldCount?: number;
};

export type ProfileLike = {
  controls: ControlLike[];
};

/**
 * Tier-3 Fuse acceptance threshold (Levenshtein-style score: 0 perfect,
 * 1 no match). With vendor prefix stripped via normalizeTitle, a threshold
 * of 0.45 admits token-level typos / re-ordering without unrelated content.
 */
const FUSE_ACCEPT_THRESHOLD = 0.45;

/**
 * Tier-1 / Tier-2 primary links with a semantic score below this threshold
 * are flagged as `potentialMismatch`. The pipeline still accepts them (they
 * are the best candidate inside their SRG block), but the requirement-text
 * evidence is weak enough that a human reviewer should confirm before
 * trusting the carried-forward body. 0.3 is intentionally permissive —
 * cross-vendor titles diverge enough that a stricter threshold would
 * generate too many soft warnings.
 */
export const TIER1_MISMATCH_THRESHOLD = 0.3;
export const TIER2_MISMATCH_THRESHOLD = 0.3;

/**
 * Tier-3 (Fuse-fallback) primary links with confidence below this threshold
 * are flagged. Fuse already gates acceptance at `1 - FUSE_ACCEPT_THRESHOLD`
 * (= 0.55 confidence), so the flag fires across [0.55, 0.9): accepted but soft.
 */
export const TIER3_MISMATCH_THRESHOLD = 0.9;

/**
 * Tier-2 composite weights: `composite = SEMANTIC_WEIGHT * semanticScore
 * + CCI_WEIGHT * cciJaccard`. Semantic similarity (title + check text) is
 * the requirement-identity signal; CCI is a secondary tag that
 * disambiguates only when semantic scores are tied. The two MUST sum
 * to 1.0 — asserted in tests.
 */
export const TIER2_COMPOSITE_SEMANTIC_WEIGHT = 0.7;
export const TIER2_COMPOSITE_CCI_WEIGHT = 0.3;

/**
 * Compute the `potentialMismatch` flag from a link's semantic score.
 * Related and no-match links never flag (the flag is about soft primary
 * matches). Tier 1 and Tier 2 share a semantic-score threshold; Tier 3
 * uses its own confidence threshold against the (also-semantic) Fuse score.
 */
function computePotentialMismatch(
  matchMethod: MatchMethod,
  relationship: 'primary' | 'related' | 'no-match',
  semantic: number,
  fuseConfidence: number,
): boolean {
  if (relationship !== 'primary') {
    return false;
  }
  if (matchMethod === 'srg-deterministic') {
    return semantic < TIER1_MISMATCH_THRESHOLD;
  }
  if (matchMethod === 'srg-semantic-tiebreak') {
    return semantic < TIER2_MISMATCH_THRESHOLD;
  }
  if (matchMethod === 'fuse-fallback') {
    return fuseConfidence < TIER3_MISMATCH_THRESHOLD;
  }
  return false;
}

/**
 * Shape of the text-diff portion of `delta.json`, produced by
 * `@mitre/inspec-objects::updateProfileUsingXCCDF`.
 */
export type DeltaDiff = {
  ignoreFormattingDiff?: Record<string, unknown>;
  rawDiff?: Record<string, unknown>;
  markdown?: string;
} & Record<string, unknown>;

/**
 * The complete `delta.json` payload. See LinkRecord for per-field semantics.
 */
export type DeltaJsonPayload = DeltaDiff & { links: LinkRecord[] };

/**
 * Assemble the object written to `delta.json`. `links` is applied last
 * so it wins over any stale key in the diff object.
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
// which makes `Fuse<T>` ambiguous in type position.
type FuseSearcher = {
  search(query: string): { item: SearchRecord; score?: number }[];
};

type PipelineContext = {
  oldPrefix: string;
  newPrefix: string;
  fuse: FuseSearcher | null;
  claimedOldIds: Set<string>;
};

/**
 * Build a LinkRecord with triage fields populated and `potentialMismatch`
 * derived from semantic score (Tier 1/2) or Fuse confidence (Tier 3).
 */
function makeLink(args: {
  newControl: ControlLike;
  oldId: string;
  matchMethod: MatchMethod;
  confidence: number;
  srg: string | null;
  relationship: 'primary' | 'related';
  titleSimilarity?: number;
  checkSimilarity?: number;
  cciJaccardScore?: number;
  semanticScore?: number;
  blockNewCount?: number;
  blockOldCount?: number;
}): LinkRecord {
  const semantic = args.semanticScore ?? args.confidence;
  const fuseConfidence = args.matchMethod === 'fuse-fallback' ? args.confidence : 0;
  return {
    oldId: args.oldId,
    newId: args.newControl.id,
    matchMethod: args.matchMethod,
    confidence: args.confidence,
    relationship: args.relationship,
    srg: args.srg,
    potentialMismatch: computePotentialMismatch(
      args.matchMethod,
      args.relationship,
      semantic,
      fuseConfidence,
    ),
    titleSimilarity: args.titleSimilarity,
    checkSimilarity: args.checkSimilarity,
    cciJaccardScore: args.cciJaccardScore,
    semanticScore: args.semanticScore,
    blockNewCount: args.blockNewCount,
    blockOldCount: args.blockOldCount,
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

type PairScore = {
  newIdx: number;
  oldIdx: number;
  composite: number;
  semantic: number;
  titleSim: number;
  checkSim: number;
  cci: number;
};

/**
 * Score every (new, old) pair inside an SRG block on the composite
 * `SEMANTIC_WEIGHT * semantic + CCI_WEIGHT * cciJaccard`. Sorted descending
 * by composite for the assignment pass.
 */
function scoreBlockPairs(
  newControls: ControlLike[],
  oldCandidates: ControlLike[],
  ctx: PipelineContext,
): PairScore[] {
  const pairs: PairScore[] = [];
  const newCcis = newControls.map(c => extractCcis(c));
  const oldCcis = oldCandidates.map(c => extractCcis(c));
  for (const [i, newControl] of newControls.entries()) {
    for (const [j, oldControl] of oldCandidates.entries()) {
      const sem = semanticScore(newControl, oldControl, ctx.newPrefix, ctx.oldPrefix);
      const cci = cciJaccard(newCcis[i], oldCcis[j]);
      const composite
        = TIER2_COMPOSITE_SEMANTIC_WEIGHT * sem.combined
          + TIER2_COMPOSITE_CCI_WEIGHT * cci;
      pairs.push({
        newIdx: i,
        oldIdx: j,
        composite,
        semantic: sem.combined,
        titleSim: sem.titleSim,
        checkSim: sem.checkSim,
        cci,
      });
    }
  }
  pairs.sort((a, b) => b.composite - a.composite);
  return pairs;
}

/**
 * Resolve an SRG block to per-new-control link records using globally-
 * optimal greedy bipartite assignment on the composite score:
 *
 *   1. Score every (new, old) pair in the block.
 *   2. Sort pairs by composite score, descending.
 *   3. Walk the sorted list, claiming pairs whose new and old are both
 *      free (primary links).
 *   4. Any new control still unassigned (block has more new than old)
 *      becomes `related` to its single best-scoring (already-claimed) old.
 *
 * Order-independent: the assignment depends only on the set of pairs and
 * their scores, not on the iteration order of the new profile.
 *
 * Single-candidate (Tier-1) blocks share the same scoring path so the
 * potentialMismatch flag derives consistently; the only difference is the
 * `matchMethod` label.
 */
function resolveSrgBlock(
  newControls: ControlLike[],
  oldCandidates: ControlLike[],
  srg: string,
  ctx: PipelineContext,
): LinkRecord[] {
  const pairs = scoreBlockPairs(newControls, oldCandidates, ctx);
  const blockNewCount = newControls.length;
  const blockOldCount = oldCandidates.length;
  // `srg-deterministic` when there is only one old candidate to pick from
  // (no ranking choice on the old side). Independent of new-side cardinality:
  // multiple news can all deterministically resolve to a single old, with
  // primary/related disambiguating the split.
  const matchMethod: MatchMethod
    = blockOldCount === 1 ? 'srg-deterministic' : 'srg-semantic-tiebreak';
  // Deterministic links report confidence 1.0 (no ranking was needed);
  // semantic-tiebreak links report the winning pair's semantic score.
  const confidenceFor = (semantic: number): number =>
    matchMethod === 'srg-deterministic' ? 1 : semantic;
  const linkFromPair = (
    p: PairScore,
    relationship: 'primary' | 'related',
  ): LinkRecord => makeLink({
    newControl: newControls[p.newIdx],
    oldId: oldCandidates[p.oldIdx].id,
    matchMethod,
    confidence: confidenceFor(p.semantic),
    srg,
    relationship,
    titleSimilarity: p.titleSim,
    checkSimilarity: p.checkSim,
    cciJaccardScore: p.cci,
    semanticScore: p.semantic,
    blockNewCount,
    blockOldCount,
  });

  const links: (LinkRecord | null)[] = Array.from(
    { length: newControls.length },
    () => null,
  );
  const claimedNewIdx = new Set<number>();
  const claimedOldIdx = new Set<number>();

  // Pass 1: globally-best unique pairings.
  for (const p of pairs) {
    if (claimedNewIdx.has(p.newIdx) || claimedOldIdx.has(p.oldIdx)) {
      continue;
    }
    const oldControl = oldCandidates[p.oldIdx];
    // Guard against double-claiming an old across SRG blocks. Currently
    // unreachable (buildSrgIndex partitions olds by single gtitle), but
    // cheap and prevents silent corruption if that invariant changes.
    if (ctx.claimedOldIds.has(oldControl.id)) {
      claimedOldIdx.add(p.oldIdx);
      continue;
    }
    claimedNewIdx.add(p.newIdx);
    claimedOldIdx.add(p.oldIdx);
    ctx.claimedOldIds.add(oldControl.id);
    links[p.newIdx] = linkFromPair(p, 'primary');
  }

  // Pass 2: leftover new controls become `related` to their highest-scoring
  // old candidate (already claimed by another new in pass 1).
  for (const [i, newControl] of newControls.entries()) {
    if (links[i] !== null) {
      continue;
    }
    let best: PairScore | null = null;
    for (const p of pairs) {
      if (p.newIdx !== i) {
        continue;
      }
      if (best === null || p.composite > best.composite) {
        best = p;
      }
    }
    // `best` is non-null whenever oldCandidates is non-empty; no-match
    // is a defensive fallback only.
    links[i] = best === null ? makeNoMatch(newControl, srg) : linkFromPair(best, 'related');
  }

  return links.filter((l): l is LinkRecord => l !== null);
}

/**
 * Tier 3: no SRG candidates. Normalize the new control's title with its
 * corpus prefix and search Fuse over old titles. Returns null when Fuse is
 * unavailable, no query is extractable, or the best hit doesn't clear
 * FUSE_ACCEPT_THRESHOLD — callers emit `makeNoMatch`.
 */
function tier3FuseFallback(
  newControl: ControlLike,
  srg: string | null,
  ctx: PipelineContext,
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
  const confidence = 1 - best.score;
  const oldId = best.item.originalId;
  const relationship: 'primary' | 'related'
    = ctx.claimedOldIds.has(oldId) ? 'related' : 'primary';
  if (relationship === 'primary') {
    ctx.claimedOldIds.add(oldId);
  }
  return makeLink({
    newControl,
    oldId,
    matchMethod: 'fuse-fallback',
    confidence,
    srg,
    relationship,
  });
}

/**
 * Requirement-first cross-vendor matcher. For every control in the new
 * profile, resolve to a LinkRecord (including explicit no-match records).
 *
 * Strategy:
 *   - Group new controls by their SRG-OS id.
 *   - For each SRG block whose old side also has candidates, run
 *     globally-optimal bipartite assignment scored on the composite
 *     `SEMANTIC_WEIGHT * (title+check Jaccard) + CCI_WEIGHT * CCI Jaccard`.
 *     Single-candidate blocks resolve to `srg-deterministic`; multi-candidate
 *     to `srg-semantic-tiebreak`.
 *   - New controls without an SRG match (no `gtitle` or empty old block)
 *     fall through to Tier-3 Fuse on normalized titles. The fallback can
 *     reach across SRG boundaries to pick up re-categorized requirements.
 *   - The returned array preserves the original new-profile order.
 */
export function applyRequirementFirstPipeline(
  oldProfile: ProfileLike,
  newProfile: ProfileLike,
): LinkRecord[] {
  const srgIndex = buildSrgIndex(oldProfile.controls);

  const oldPrefix = autoDetectPrefix(
    oldProfile.controls.map(c => safeTitle(c.title)),
  );
  const newPrefix = autoDetectPrefix(
    newProfile.controls.map(c => safeTitle(c.title)),
  );

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

  const claimedOldIds = new Set<string>();
  const ctx: PipelineContext = { oldPrefix, newPrefix, fuse, claimedOldIds };

  // Phase 1: resolve SRG blocks. Group new controls by SRG so the
  // bipartite assignment sees the full block at once.
  const newBySrg = new Map<string, ControlLike[]>();
  for (const c of newProfile.controls) {
    const srg = extractSrgId(c);
    if (srg === null) {
      continue;
    }
    const bucket = newBySrg.get(srg);
    if (bucket) {
      bucket.push(c);
    } else {
      newBySrg.set(srg, [c]);
    }
  }

  const linkById = new Map<string, LinkRecord>();
  for (const [srg, group] of newBySrg.entries()) {
    const candidates = srgIndex.get(srg) ?? [];
    if (candidates.length === 0) {
      // No old SRG match — leave these for Phase 2 (Tier 3).
      continue;
    }
    for (const link of resolveSrgBlock(group, candidates, srg, ctx)) {
      linkById.set(link.newId, link);
    }
  }

  // Phase 2: every new control without a Phase-1 link gets a Tier-3
  // attempt or no-match. Iterating newProfile.controls here also
  // preserves the original input order in the returned array.
  const out: LinkRecord[] = [];
  for (const newControl of newProfile.controls) {
    const existing = linkById.get(newControl.id);
    if (existing) {
      out.push(existing);
      continue;
    }
    const srg = extractSrgId(newControl);
    out.push(tier3FuseFallback(newControl, srg, ctx) ?? makeNoMatch(newControl, srg));
  }
  return out;
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
