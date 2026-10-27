/* Pre-rendered phone players — the "Apple technique".
 *
 * The 3D flight was baked offline (the old three.js capture rig) into:
 *   - sprite sheets of the rotation swings (motion frames)
 *   - hi-res stills of the resting poses
 *
 * At runtime this is pure compositor work: one canvas blit when the frame
 * index changes, plus transform/opacity on the wrapper. No three.js, no
 * lighting, no per-frame GPU scene.
 *
 * Both players append their canvases to <body> (they are fixed / document-
 * positioned layers above the page) and remove them again in dispose(). */

/** capture box in phone-space CSS px */
const BOX_W = 640;
const BOX_H = 940;

/* The stage is a fixed 640×940 phone-space box, placed and scaled purely
 * via composited transforms; every layer inside fills it and starts hidden
 * (opacity is driven per frame). */
const STAGE_CLASS =
  "pointer-events-none fixed top-0 left-0 z-40 h-[940px] w-[640px] origin-top-left will-change-[transform,opacity] *:absolute *:inset-0 *:h-full *:w-full *:opacity-0";
/* the showcase back phone — document-positioned so it scrolls natively with
 * the section, under the front phone */
const BACK_CLASS = "pointer-events-none absolute z-39";

/** the single pose every scroll tween writes; see choreography.ts */
export interface Pose {
  x: number;
  y: number;
  scale: number;
  rotZ: number;
  rotY: number;
  rotX: number;
  alpha: number;
  /** article screen opacity */
  mix: number;
  /** qix screen opacity */
  sQ: number;
  /** trax screen opacity */
  sT: number;
  /** Pix card swipe progress */
  sw: number;
  /** normalized flight progress — frame selector for the baked sequence */
  prog: number;
}

/** doc-space centre + width of the showcase back phone's anchor */
export interface BackPhone {
  cx: number;
  cy: number;
  w: number;
  rotZ: number;
  rotY: number;
}

/** what the choreography needs from a phone renderer */
export interface PhoneRenderer {
  ready: boolean;
  failed: boolean;
  demoted: boolean;
  apply(pose: Pose, scrollY?: number): void;
  resize(): void;
  setBackPhone(cfg: BackPhone | null): void;
  demote(): void;
  dispose(): void;
}

interface BackBox {
  w: number;
  h: number;
}

/* HTMLImageElement.decode() can stall in throttled/background tabs, so
 * decode via fetch + createImageBitmap instead */
const loadBitmap = (url: string): Promise<ImageBitmap> =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.blob();
    })
    .then((b) => createImageBitmap(b));

const ctx2d = (c: HTMLCanvasElement): CanvasRenderingContext2D => {
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d canvas unavailable");
  return ctx;
};

const paint = (c: HTMLCanvasElement, bmp: ImageBitmap) => {
  c.width = bmp.width;
  c.height = bmp.height;
  ctx2d(c).drawImage(bmp, 0, 0);
  bmp.close();
};

const placeStage = (stage: HTMLElement, p: Pose, phoneW: number, phoneH: number) => {
  /* the stage's intrinsic size is the capture box in phone-space units
   * (640×940), so scaling by pose.scale makes the phone body in the
   * artwork exactly 400·scale CSS px */
  const k = p.scale;
  const cx = p.x + phoneW / 2;
  const cy = p.y + phoneH / 2;
  stage.style.transform =
    "translate3d(" + (cx - (BOX_W * k) / 2) + "px," + (cy - (BOX_H * k) / 2) + "px,0) scale(" + k + ")";
};

const placeBackCanvas = (backCnv: HTMLCanvasElement, cfg: BackPhone, box: BackBox, phoneW: number) => {
  const s = cfg.w / phoneW;
  const w = box.w * s;
  const h = box.h * s;
  backCnv.style.width = w + "px";
  backCnv.style.height = h + "px";
  backCnv.style.left = cfg.cx - w / 2 + "px";
  backCnv.style.top = cfg.cy - h / 2 + "px";
};

/* ------------------------------------------------------------------ */
/* Mobile player: the shorter flight sheet + the two rest poses        */
/* ------------------------------------------------------------------ */

export interface PhoneSeqOptions {
  phoneW: number;
  phoneH: number;
  meta: { frames: number; cols: number; rows: number; fw: number; fh: number; backBox?: BackBox };
  sheetUrl: string;
  poseAUrl: string;
  poseBUrl: string;
  backUrl?: string;
}

export function createPhoneSeq({ phoneW, phoneH, meta, sheetUrl, poseAUrl, poseBUrl, backUrl }: PhoneSeqOptions): PhoneRenderer {
  let disposed = false;

  /* the showcase back phone: the same baked still the desktop player uses */
  const backCnv = document.createElement("canvas");
  backCnv.className = BACK_CLASS;
  let backCfg: BackPhone | null = null;
  let backReady = false;

  /* stage: [cnv (motion frames)] + [cnvA, cnvB (hi-res rest poses)], each
   * painted once at init; runtime only toggles opacity between them and
   * transforms the stage */
  const stage = document.createElement("div");
  stage.className = STAGE_CLASS;
  const cnv = document.createElement("canvas");
  const cnvA = document.createElement("canvas");
  const cnvB = document.createElement("canvas");
  cnv.width = meta.fw;
  cnv.height = meta.fh;
  const ctx = ctx2d(cnv);
  stage.append(cnv, cnvA, cnvB);

  let sheet: ImageBitmap | null = null;
  let lastFrame = -1;
  let lastMode = "";
  let lastKey = "";

  const state: PhoneRenderer = {
    ready: false,
    failed: false,
    demoted: false,
    apply,
    resize() {},
    setBackPhone,
    demote() {},
    dispose,
  };

  Promise.all([loadBitmap(sheetUrl), loadBitmap(poseAUrl), loadBitmap(poseBUrl)])
    .then(([sheetBmp, aBmp, bBmp]) => {
      paint(cnvA, aBmp);
      paint(cnvB, bBmp);
      if (disposed) {
        sheetBmp.close();
        return;
      }
      sheet = sheetBmp;
      document.body.appendChild(stage);
      state.ready = true;
      /* loaded after the hero phone so it never delays first paint; a
       * failure only costs the back phone, never the front one */
      if (backUrl) {
        loadBitmap(backUrl)
          .then((bmp) => {
            paint(backCnv, bmp);
            backReady = true;
            placeBack();
          })
          .catch(() => {});
      }
    })
    .catch(() => {
      state.failed = true; // the choreography falls back to the PNG phone
    });

  function setBackPhone(cfg: BackPhone | null) {
    backCfg = cfg;
    placeBack();
  }

  function placeBack() {
    if (!backCfg || !backReady || !meta.backBox) {
      backCnv.remove();
      return;
    }
    if (!disposed && !backCnv.parentNode) document.body.appendChild(backCnv);
    placeBackCanvas(backCnv, backCfg, meta.backBox, phoneW);
  }

  function drawFrame(i: number) {
    if (i === lastFrame || !sheet) return;
    lastFrame = i;
    const sx = (i % meta.cols) * meta.fw;
    const sy = Math.floor(i / meta.cols) * meta.fh;
    ctx.clearRect(0, 0, meta.fw, meta.fh);
    ctx.drawImage(sheet, sx, sy, meta.fw, meta.fh, 0, 0, meta.fw, meta.fh);
  }

  function setMode(mode: "seq" | "a" | "b") {
    if (mode === lastMode) return;
    lastMode = mode;
    cnv.style.opacity = mode === "seq" ? "1" : "0";
    cnvA.style.opacity = mode === "a" ? "1" : "0";
    cnvB.style.opacity = mode === "b" ? "1" : "0";
  }

  /* `prog` (0..1) selects the baked rotation frame; x/y/scale/alpha place
   * and fade the stage */
  function apply(p: Pose) {
    if (!state.ready) return;
    const prog = Math.min(1, Math.max(0, p.prog || 0));
    const key = (p.x | 0) + "," + (p.y | 0) + "," + p.scale.toFixed(4) + "," + prog.toFixed(4) + "," + p.alpha.toFixed(3);
    if (key === lastKey) return;
    lastKey = key;

    if (p.alpha <= 0.01) {
      stage.style.visibility = "hidden";
      return;
    }
    stage.style.visibility = "visible";
    stage.style.opacity = String(p.alpha);

    // rest poses get the hi-res stills; motion gets the sheet
    if (prog <= 0.01) setMode("a");
    else if (prog >= 0.99) setMode("b");
    else {
      setMode("seq");
      drawFrame(Math.round(prog * (meta.frames - 1)));
    }
    placeStage(stage, p, phoneW, phoneH);
  }

  function dispose() {
    disposed = true;
    stage.remove();
    backCnv.remove();
    sheet?.close();
    sheet = null;
  }

  return state;
}

/* -------------------------------------------------------------------
 * Desktop player — the full journey, baked:
 *   prog 0        hero rest        → still A (upright, home screen)
 *   prog 0 → 1    swing 1 (leg B)  → sheet 1 frames
 *   prog 1        showcase rest    → still B (tilted, home screen)
 *   prog 1 → 2    swing 2 (D + E)  → sheet 2 frames (article fades in)
 *   prog 2        pinned features  → stills C/Q/T stacked; the screen
 *                 swaps are just opacity on the qix/trax stills (sQ/sT);
 *                 the Pix card swipe (sw) slides a strip cropped from
 *                 stills C and C2 across the screen
 * Plus one static baked still for the showcase back phone, positioned in
 * document space so it scrolls natively with the section.
 * ------------------------------------------------------------------- */

export interface PhoneSeqDesktopOptions {
  phoneW: number;
  phoneH: number;
  meta: {
    frames: number;
    cols: number;
    rows: number;
    fw: number;
    fh: number;
    backBox: BackBox;
    /** Pix swipe window in still-C pixels */
    swipe: { x: number; y: number; w: number; h: number; r: number };
  };
  urls: { seq1: string; seq2: string; a: string; b: string; c: string; c2: string; q: string; t: string; back: string };
}

type Layer = "s1" | "s2" | "a" | "b" | "c" | "cs" | "q" | "t";

export function createPhoneSeqDesktop({ phoneW, phoneH, meta, urls }: PhoneSeqDesktopOptions): PhoneRenderer {
  let disposed = false;

  const stage = document.createElement("div");
  stage.className = STAGE_CLASS;
  const layer = () => {
    const c = document.createElement("canvas");
    stage.appendChild(c);
    return c;
  };
  const cnv1 = layer(); // swing 1 motion frames
  const cnv2 = layer(); // swing 2 motion frames
  cnv1.width = cnv2.width = meta.fw;
  cnv1.height = cnv2.height = meta.fh;
  const ctx1 = ctx2d(cnv1);
  const ctx2 = ctx2d(cnv2);
  const cA = layer();
  const cB = layer();
  const cC = layer();
  /* Pix card swipe: a window over the screen (below the status bar) holding
   * a strip of both Pix screens cropped from stills C and C2, slid by p.sw */
  const sw = meta.swipe;
  const swWin = document.createElement("div");
  swWin.className = "overflow-hidden";
  stage.appendChild(swWin);
  const swStrip = document.createElement("canvas");
  swStrip.className = "absolute top-0 left-0 h-full w-[200%] will-change-transform";
  swWin.appendChild(swStrip);
  const cQ = layer();
  const cT = layer();
  /* stacking order matters (later layers paint on top) */
  const L: Record<Layer, HTMLElement> = { s1: cnv1, s2: cnv2, a: cA, b: cB, c: cC, cs: swWin, q: cQ, t: cT };
  const LAYERS = Object.keys(L) as Layer[];
  const ops: Partial<Record<Layer, number>> = {};

  const backCnv = document.createElement("canvas");
  backCnv.className = BACK_CLASS;

  let sheet1: ImageBitmap | null = null;
  let sheet2: ImageBitmap | null = null;
  let extrasReady = false;
  let backCfg: BackPhone | null = null;
  let lastF1 = -1;
  let lastF2 = -1;
  let lastKey = "";

  const state: PhoneRenderer = {
    ready: false,
    failed: false,
    demoted: false,
    apply,
    resize() {},
    setBackPhone,
    demote() {},
    dispose,
  };

  /* core (hero still + swing 1 + showcase still) gates `ready` so the intro
   * curtain lifts onto a working phone; everything past the showcase loads
   * behind the hero — nobody scrolls there that fast */
  Promise.all([loadBitmap(urls.a), loadBitmap(urls.seq1), loadBitmap(urls.b)])
    .then(([aB, s1, bB]) => {
      paint(cA, aB);
      paint(cB, bB);
      if (disposed) {
        s1.close();
        return;
      }
      sheet1 = s1;
      document.body.appendChild(stage);
      state.ready = true;
      return Promise.all([
        loadBitmap(urls.seq2),
        loadBitmap(urls.c),
        loadBitmap(urls.q),
        loadBitmap(urls.t),
        loadBitmap(urls.back),
        loadBitmap(urls.c2),
      ]).then(([s2, cBmp, qB, tB, bkB, c2B]) => {
        if (disposed) {
          for (const b of [s2, cBmp, qB, tB, bkB, c2B]) b.close();
          return;
        }
        sheet2 = s2;
        buildSwipe(cBmp, c2B); // before paint() closes cBmp
        paint(cC, cBmp);
        paint(cQ, qB);
        paint(cT, tB);
        paint(backCnv, bkB);
        extrasReady = true;
        placeBack();
        lastKey = ""; // repaint with the full asset set
      });
    })
    .catch(() => {
      if (!state.ready) state.failed = true; // → PNG phone fallback
    });

  function buildSwipe(cBmp: ImageBitmap, c2B: ImageBitmap) {
    swStrip.width = sw.w * 2;
    swStrip.height = sw.h;
    const ctx = ctx2d(swStrip);
    ctx.drawImage(cBmp, sw.x, sw.y, sw.w, sw.h, 0, 0, sw.w, sw.h);
    ctx.drawImage(c2B, sw.x, sw.y, sw.w, sw.h, sw.w, 0, sw.w, sw.h);
    c2B.close();
    // still px → phone-space CSS px (the stage is BOX_W wide)
    const k = BOX_W / cBmp.width;
    Object.assign(swWin.style, {
      left: sw.x * k + "px",
      top: sw.y * k + "px",
      width: sw.w * k + "px",
      height: sw.h * k + "px",
      borderRadius: "0 0 " + sw.r * k + "px " + sw.r * k + "px",
    });
  }

  function drawFrame(ctx: CanvasRenderingContext2D, sheet: ImageBitmap, i: number) {
    ctx.clearRect(0, 0, meta.fw, meta.fh);
    ctx.drawImage(sheet, (i % meta.cols) * meta.fw, Math.floor(i / meta.cols) * meta.fh, meta.fw, meta.fh, 0, 0, meta.fw, meta.fh);
  }

  function setOps(map: Partial<Record<Layer, number>>) {
    for (const k of LAYERS) {
      const v = map[k] || 0;
      if (ops[k] !== v) {
        ops[k] = v;
        L[k].style.opacity = String(v);
      }
    }
  }

  function apply(p: Pose) {
    if (!state.ready) return;
    const prog = Math.min(2, Math.max(0, p.prog || 0));
    const key =
      (p.x | 0) + "," + (p.y | 0) + "," + p.scale.toFixed(4) + "," + prog.toFixed(4) + "," + p.alpha.toFixed(3) + "," +
      p.sQ.toFixed(3) + "," + p.sT.toFixed(3) + "," + (p.sw || 0).toFixed(4);
    if (key === lastKey) return;
    lastKey = key;

    if (p.alpha <= 0.01) {
      stage.style.visibility = "hidden";
      return;
    }
    stage.style.visibility = "visible";
    stage.style.opacity = String(p.alpha);

    if (prog <= 0.01) setOps({ a: 1 });
    else if (prog < 0.99) {
      const f = Math.round(prog * (meta.frames - 1));
      if (f !== lastF1 && sheet1) {
        lastF1 = f;
        drawFrame(ctx1, sheet1, f);
      }
      setOps({ s1: 1 });
    } else if (prog <= 1.01 || !extrasReady) setOps({ b: 1 });
    else if (prog < 1.99) {
      const f = Math.round((prog - 1) * (meta.frames - 1));
      if (f !== lastF2 && sheet2) {
        lastF2 = f;
        drawFrame(ctx2, sheet2, f);
      }
      setOps({ s2: 1 });
    } else {
      const s = p.sw || 0;
      swStrip.style.transform = "translate3d(" + -50 * s + "%,0,0)";
      setOps({ c: 1, cs: s > 0.001 ? 1 : 0, q: p.sQ, t: p.sT });
    }
    placeStage(stage, p, phoneW, phoneH);
  }

  function setBackPhone(cfg: BackPhone | null) {
    backCfg = cfg;
    placeBack();
  }

  function placeBack() {
    if (!backCfg || !extrasReady) {
      backCnv.remove();
      return;
    }
    if (!disposed && !backCnv.parentNode) document.body.appendChild(backCnv);
    placeBackCanvas(backCnv, backCfg, meta.backBox, phoneW);
  }

  function dispose() {
    disposed = true;
    stage.remove();
    backCnv.remove();
    sheet1?.close();
    sheet2?.close();
    sheet1 = sheet2 = null;
  }

  return state;
}
