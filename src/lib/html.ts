/* Escaping helpers for the few places that still build markup or URLs from
 * untrusted CMS strings (sitemaps, JSON-LD). React escapes everything else. */

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);

/* JSON-LD lives inside a <script>, where a "</script>" in a headline would
 * close the block early and where U+2028/U+2029 are valid JSON but illegal
 * in a JS string literal. JSON.stringify escapes neither. */
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
const UNSAFE = new RegExp(`[<${LS}${PS}]`, "g");
const UNSAFE_MAP: Record<string, string> = { "<": "\\u003c", [LS]: "\\u2028", [PS]: "\\u2029" };

export const safeJsonLd = (obj: unknown) => JSON.stringify(obj).replace(UNSAFE, (c) => UNSAFE_MAP[c]);

/* only http(s) URLs are ever emitted as href/src */
export function safeUrl(u: unknown): string {
  try {
    const url = new URL(String(u));
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
}
