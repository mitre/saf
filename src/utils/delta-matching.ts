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
  tags?: {
    gtitle?: string;
    cci?: string[];
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

/**
 * Return the control's CCI set (from `tags.cci`), deduped. Empty Set when
 * missing. Used as block-internal tiebreaker when multiple new-profile
 * controls share an SRG with the same old-profile control (1:N splits).
 */
export function extractCcis(control: ControlLike): Set<string> {
  return new Set(control.tags?.cci ?? []);
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
