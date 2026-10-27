// Compares the SEO payload (title, meta, canonical, icons, JSON-LD, H1) and
// status/redirect of each path between two deployments, e.g. the live Vite
// site and this Next build:
//   OLD=https://www.dailymattr.com NEW=http://localhost:3000 node scripts/compare-seo.mjs / /about/ /news/
const OLD = process.env.OLD || "https://www.dailymattr.com";
const NEW = process.env.NEW || "http://localhost:3000";
const paths = process.argv.slice(2);

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
function extract(html) {
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  const head = html;
  const out = new Set();
  const title = /<title[^>]*>([\s\S]*?)<\/title>/.exec(head);
  out.add(`title=${title ? decode(title[1].trim()) : ""}`);
  for (const m of head.matchAll(/<meta\s[^>]*>/g)) {
    const t = m[0];
    const k = /(?:name|property)="([^"]+)"/.exec(t)?.[1];
    const v = /content="([^"]*)"/.exec(t)?.[1];
    if (!k || k === "viewport" || k === "next-size-adjust") continue;
    let val = decode(v ?? "");
    if (k === "robots") val = val.replace(/\s/g, "");
    out.add(`meta ${k}=${val}`);
  }
  for (const m of head.matchAll(/<link\s[^>]*rel="(canonical|icon|apple-touch-icon|alternate icon)"[^>]*>/g)) {
    const href = /href="([^"]+)"/.exec(m[0])?.[1];
    out.add(`link ${m[1]}=${decode(href)}`);
  }
  for (const m of html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    out.add(`ld=${JSON.stringify(JSON.parse(m[1]))}`);
  }
  out.add(`h1=${(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()}`);
  return out;
}

for (const p of paths) {
  const [a, b] = await Promise.all([OLD, NEW].map((o) => fetch(o + p, { redirect: "manual", headers: { accept: "text/html" } })));
  const [ha, hb] = await Promise.all([a.text(), b.text()]);
  const ea = extract(ha), eb = extract(hb);
  const missing = [...ea].filter((x) => !eb.has(x));
  const extra = [...eb].filter((x) => !ea.has(x));
  console.log(`\n== ${p}  status ${a.status} -> ${b.status}${a.headers.get("location") || b.headers.get("location") ? `  loc ${a.headers.get("location")} -> ${b.headers.get("location")}` : ""}`);
  if (!missing.length && !extra.length) console.log("   identical SEO payload");
  for (const x of missing) console.log("   - " + x.slice(0, 220));
  for (const x of extra) console.log("   + " + x.slice(0, 220));
}
