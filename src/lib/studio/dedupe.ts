import type { Story } from "./types";

/* Same-story dedupe. Different outlets file the same story under DIFFERENT
 * headlines, so headline comparison alone can't catch them. The pipeline
 * already links them semantically: the fact-check corroborator matches title
 * embeddings and records each sibling's URL in fact_notes.sources[]
 * (item.relatedUrls). Two stories where either lists the other's URL ARE the
 * same story. Headline-token overlap stays only as a fallback for
 * near-identical twins on rows whose source list is missing. The
 * better-corroborated copy survives; comparison is against already-kept
 * stories only — no transitive chain-merging. */

const STOP = new Set(["the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "at", "by", "with", "from", "as", "is", "are", "was", "were", "has", "have", "had", "his", "her", "their", "any", "after", "over", "into", "says", "said", "new"]);

function titleTokens(headline: string): Set<string> {
  const out = new Set<string>();
  for (const t of String(headline || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)) {
    if (t && (t.length >= 3 || /\d/.test(t)) && !STOP.has(t)) out.add(t);
  }
  return out;
}

function similarTitles(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0 || b.size === 0) return false;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const jaccard = inter / (a.size + b.size - inter);
  return jaccard >= 0.5 || inter >= 7;
}

type Entry = { item: Story; url: string; tokens: Set<string> };

function sameStory(a: Entry, b: Entry): boolean {
  if (a.url && b.item.relatedUrls?.includes(a.url)) return true;
  if (b.url && a.item.relatedUrls?.includes(b.url)) return true;
  return similarTitles(a.tokens, b.tokens);
}

const corroboration = (it: Story) => (it.factNotes?.source_count ?? 1) * 1000 + (it.factScore ?? 0);

/* prefers the better-corroborated duplicate, but keeps the feed's order */
export function dedupeStories(items: Story[]): Story[] {
  const ranked = [...items].sort((a, b) => corroboration(b) - corroboration(a));
  const kept = new Set<string>();
  const picked: Entry[] = [];
  for (const it of ranked) {
    const entry = { item: it, url: it.sourceUrl || "", tokens: titleTokens(it.headline) };
    if (picked.some((p) => sameStory(entry, p))) continue;
    picked.push(entry);
    kept.add(it.id);
  }
  return items.filter((it) => kept.has(it.id));
}
