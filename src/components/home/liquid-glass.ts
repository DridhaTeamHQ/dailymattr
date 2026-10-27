/* Apple-style "liquid glass" for the feature copy panels.
 *
 * Chromium supports `backdrop-filter: url(<svg filter>)`, so each panel gets
 * a real lens: a displacement map (rounded-rect SDF — refraction strongest
 * across the rim bezel, neutral in the middle) chained with blur +
 * saturation. Safari/Firefox silently keep the frosted-blur fallback the
 * panels carry as utilities (backdrop-blur + backdrop-saturate). */

const NS = "http://www.w3.org/2000/svg";
const DEFS_ID = "lg-defs";
const RADIUS = 22; // matches the panel's border-radius
const BEZEL = 34; // how deep the refraction ring reaches inward

export const supportsLiquidGlass = () => /Chrom(e|ium)/.test(navigator.userAgent);

/** (re)builds one SVG filter per panel and points its backdrop-filter at it */
export function applyLiquidGlass(panels: HTMLElement[]) {
  if (!supportsLiquidGlass() || !panels.length) return;
  const defs = document.getElementById(DEFS_ID) ?? createDefs();
  defs.replaceChildren();

  panels.forEach((panel, i) => {
    const w = Math.round(panel.offsetWidth);
    const h = Math.round(panel.offsetHeight);
    if (!w || !h) return;
    const map = displacementMap(w, h);
    if (!map) return;

    const f = document.createElementNS(NS, "filter");
    f.id = "lg-copy-" + i;
    setAttrs(f, {
      filterUnits: "userSpaceOnUse",
      x: "0",
      y: "0",
      width: String(w),
      height: String(h),
      "color-interpolation-filters": "sRGB",
    });
    const feMap = document.createElementNS(NS, "feImage");
    setAttrs(feMap, { href: map, x: "0", y: "0", width: String(w), height: String(h), result: "map" });
    const feDisp = document.createElementNS(NS, "feDisplacementMap");
    setAttrs(feDisp, { in: "SourceGraphic", in2: "map", scale: "64", xChannelSelector: "R", yChannelSelector: "G" });
    const feBlur = document.createElementNS(NS, "feGaussianBlur");
    feBlur.setAttribute("stdDeviation", "9");
    const feSat = document.createElementNS(NS, "feColorMatrix");
    setAttrs(feSat, { type: "saturate", values: "1.2" });
    f.append(feMap, feDisp, feBlur, feSat);
    defs.appendChild(f);
    panel.style.backdropFilter = "url(#lg-copy-" + i + ")";
  });
}

/** removes the shared <svg> and hands the panels back to the CSS fallback */
export function removeLiquidGlass(panels: HTMLElement[]) {
  document.getElementById(DEFS_ID)?.remove();
  for (const p of panels) p.style.backdropFilter = "";
}

/* one hidden <svg> on <body> holds every panel's filter */
function createDefs(): SVGSVGElement {
  const defs = document.createElementNS(NS, "svg");
  defs.id = DEFS_ID;
  defs.setAttribute("width", "0");
  defs.setAttribute("height", "0");
  defs.style.cssText = "position:absolute;width:0;height:0";
  document.body.appendChild(defs);
  return defs;
}

const setAttrs = (el: Element, attrs: Record<string, string>) => {
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
};

/* R/G channels hold the rim's outward normal, eased across the bezel
 * (128,128 = no displacement) */
function displacementMap(w: number, h: number): string | null {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return null;
  const img = g.createImageData(w, h);
  const r = RADIUS;
  const sdf = (px: number, py: number) => {
    // signed distance to the rounded-rect rim (negative inside)
    const qx = Math.abs(px) - (w / 2 - r);
    const qy = Math.abs(py) - (h / 2 - r);
    const ax = Math.max(qx, 0);
    const ay = Math.max(qy, 0);
    return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
  };
  let p = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - w / 2;
      const py = y + 0.5 - h / 2;
      const t = Math.min(Math.max(1 + sdf(px, py) / BEZEL, 0), 1);
      const s = t * t * t; // ease — glassy falloff into the middle
      const nx = (sdf(px + 1, py) - sdf(px - 1, py)) / 2;
      const ny = (sdf(px, py + 1) - sdf(px, py - 1)) / 2;
      img.data[p++] = 128 + nx * s * 127;
      img.data[p++] = 128 + ny * s * 127;
      img.data[p++] = 128;
      img.data[p++] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL();
}
