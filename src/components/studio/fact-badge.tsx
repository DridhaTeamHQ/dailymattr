"use client";

import { useState } from "react";
import type { Story } from "@/lib/studio/types";

/* AI fact-check badge + breakdown panel. Score bands mirror the email
 * agent's _shared/fact-check.ts: >=85 verified, >=65 mostly factual, >=40
 * mixed, <40 unverified. */
const rb = { fontVariationSettings: '"wdth" 100' };

type Band = { key: string; label: string; text: string; bg: string };

export function factBand(score: number): Band {
  if (score >= 85) return { key: "verified", label: "Verified", text: "#0F7A52", bg: "rgba(15,157,105,0.10)" };
  if (score >= 65) return { key: "mostly", label: "Mostly factual", text: "#8A6D00", bg: "rgba(196,159,23,0.12)" };
  if (score >= 40) return { key: "mixed", label: "Mixed", text: "#9A4A0F", bg: "rgba(217,126,66,0.12)" };
  return { key: "unverified", label: "Unverified", text: "#9D1F1F", bg: "rgba(224,96,96,0.12)" };
}

/* how many independent outlets the claims were checked against */
function sourceCount(item: Story): number {
  const n = item.factNotes?.source_count;
  if (typeof n === "number" && n > 0) return n;
  const arr = item.factNotes?.sources;
  return Array.isArray(arr) ? arr.length : 0;
}

/* Small pill for story cards; nothing when the story has no score (older
 * approvals predate fact checking). Shows the source count when the claims
 * were corroborated across several outlets. */
export function FactChip({ item }: { item: Story }) {
  if (item.factScore == null) return null;
  const score = Math.round(item.factScore);
  const band = factBand(score);
  const n = sourceCount(item);
  const rationale = item.factNotes?.rationale;
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-full px-[10px] py-[3px] font-roboto text-[10px] font-bold uppercase tracking-[0.06em]"
      style={{ ...rb, color: band.text, background: band.bg }}
      title={n > 1 ? `Checked across ${n} sources — ${rationale || band.label}` : rationale || band.label}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 0.5L10.5 2.5V5.5C10.5 8.3 8.6 10.6 6 11.5C3.4 10.6 1.5 8.3 1.5 5.5V2.5L6 0.5Z" fill="currentColor" opacity="0.25" />
        <path d="M4 5.8L5.4 7.2L8 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Fact {score}
      {n > 1 ? ` · ${n} src` : ""}
    </span>
  );
}

const VERDICT_STYLE: Record<string, { label: string; text: string; bg: string }> = {
  supported: { label: "Supported", text: "#0F7A52", bg: "rgba(15,157,105,0.10)" },
  "partially-supported": { label: "Partially supported", text: "#8A6D00", bg: "rgba(196,159,23,0.12)" },
  unsupported: { label: "Unsupported", text: "#9A4A0F", bg: "rgba(217,126,66,0.12)" },
  contradicted: { label: "Contradicted", text: "#9D1F1F", bg: "rgba(224,96,96,0.12)" },
};

const SIGNAL_LABEL = { attribution: "Attribution", specificity: "Specificity", tone: "Tone" } as const;

/* Full transparency panel for the reader: score dial, rationale, per-claim
 * verdicts and source signals — the "why" behind the number. The
 * claim-by-claim list starts collapsed so the panel reads as a compact
 * trust card. */
export function FactPanel({ item }: { item: Story }) {
  const [showClaims, setShowClaims] = useState(false);
  if (item.factScore == null) return null;
  const score = Math.round(item.factScore);
  const band = factBand(score);
  const notes = item.factNotes || {};
  const claims = Array.isArray(notes.claims) ? notes.claims : [];
  const signals = notes.signals || null;
  const sources = Array.isArray(notes.sources) ? notes.sources.filter((s): s is NonNullable<typeof s> => Boolean(s && s.url)) : [];
  const nSources = sources.length || (typeof notes.source_count === "number" ? notes.source_count : 0);

  return (
    <section className="mt-[32px] rounded-[16px] border border-[rgba(28,28,30,0.1)] bg-lm-50 p-[20px] sm:p-[24px]">
      <div className="flex flex-wrap items-center gap-[12px]">
        <span
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full font-roboto text-[18px] font-bold"
          style={{ ...rb, color: band.text, background: band.bg, border: `2px solid ${band.text}` }}
        >
          {score}
        </span>
        <div className="flex flex-col">
          <span className="font-roboto text-[15px] font-bold uppercase tracking-wide" style={{ ...rb, color: band.text }}>
            {band.label} · AI fact check
          </span>
          <span className="font-roboto text-[13px] text-lm-500" style={rb}>
            {nSources > 1 ? `Claims checked across ${nSources} independent sources at publish time.` : "Every claim graded against the original source at publish time."}
          </span>
        </div>
      </div>

      {notes.rationale && (
        <p className="mt-[14px] font-roboto text-[15px] leading-[24px] text-lm-700" style={rb}>
          {notes.rationale}
        </p>
      )}

      {claims.length > 0 && (
        <div className="mt-[14px]">
          <button
            type="button"
            onClick={() => setShowClaims((v) => !v)}
            className="flex items-center gap-[8px] rounded-[100px] border border-[rgba(28,28,30,0.14)] bg-white px-[14px] py-[8px] font-roboto text-[13px] font-semibold text-lm-700 transition-colors hover:border-lm-800"
            style={rb}
          >
            Claim-by-claim breakdown ({claims.length})
            <span className={`text-[11px] transition-transform duration-200 ${showClaims ? "rotate-180" : ""}`}>▼</span>
          </button>
          {showClaims && (
            <>
              <ul className="mt-[12px] flex flex-col gap-[10px]">
                {claims.map((c, i) => {
                  const v = VERDICT_STYLE[c.verdict || ""] || VERDICT_STYLE.unsupported;
                  return (
                    <li key={i} className="flex flex-col gap-[4px] rounded-[12px] bg-white p-[12px]">
                      <span
                        className="self-start rounded-[34px] px-[10px] py-[3px] font-roboto text-[11px] font-bold uppercase"
                        style={{ ...rb, color: v.text, background: v.bg }}
                      >
                        {v.label}
                      </span>
                      <span className="font-roboto text-[14px] leading-[22px] text-lm-800" style={rb}>
                        {c.claim}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {signals && (
                <div className="mt-[14px] flex flex-wrap gap-[8px]">
                  {(Object.keys(SIGNAL_LABEL) as (keyof typeof SIGNAL_LABEL)[]).map((key) =>
                    signals[key] != null ? (
                      <span key={key} className="rounded-[34px] bg-black/5 px-[12px] py-[5px] font-roboto text-[12px] font-medium text-lm-700" style={rb}>
                        {SIGNAL_LABEL[key]} {signals[key]}/2
                      </span>
                    ) : null,
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {sources.length > 0 && (
        <div className="mt-[16px] border-t border-[rgba(28,28,30,0.1)] pt-[14px]">
          <p className="font-roboto text-[13px] font-bold uppercase tracking-wide text-lm-500" style={rb}>
            {sources.length > 1 ? `Checked across ${sources.length} sources` : "Source"}
          </p>
          <ul className="mt-[8px] flex flex-col gap-[6px]">
            {sources.map((s, i) => (
              <li key={i} className="flex items-center gap-[8px]">
                <span
                  className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-lm-200 px-[5px] font-roboto text-[11px] font-bold text-lm-700"
                  style={rb}
                >
                  {i + 1}
                </span>
                <a
                  href={s.url || undefined}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-roboto text-[14px] text-lm-700 underline decoration-lm-300 underline-offset-2 hover:text-lm-800"
                  style={rb}
                >
                  {s.source || "Source"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
