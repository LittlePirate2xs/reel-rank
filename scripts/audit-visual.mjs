/**
 * Visual audit harness.
 *
 * Drives an already-running headless Chrome over the DevTools Protocol.
 * Node 24 ships a global WebSocket, so this needs no dependencies.
 *
 * Why not `chrome --screenshot`: that captures the viewport, and capturing a
 * full page by making the window very tall breaks every `vh`-based section
 * (the pinned reel strip is 300vh, so a tall window makes it enormous).
 * `captureBeyondViewport` keeps the viewport at a real size and stitches the
 * whole page, and the same connection lets us emulate a real phone and then
 * *measure* the layout instead of guessing from pixels.
 *
 * Usage:
 *   node scripts/audit-visual.mjs <chrome-debug-port> <outDir>
 *
 * Launch Chrome with its profile OUTSIDE this project, so the profile never
 * ends up in the source tree where Tailwind's scanner and Turbopack can trip
 * over it:
 *
 *   chrome --headless=new --remote-debugging-port=9222 \
 *          --user-data-dir="$env:TEMP\rr-chrome" about:blank
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const port = process.argv[2] ?? "9222";
const outDir = path.resolve(process.argv[3] ?? "./shots/cdp");

/* ---------------------------------------------------------------------------
   Targets
   ------------------------------------------------------------------------ */

const DESKTOP = { width: 1440, height: 900, dsf: 1, mobile: false, touch: false };
const MOBILE = { width: 390, height: 844, dsf: 2, mobile: true, touch: true };

const PAGES = [
  { name: "home", url: "/" },
  { name: "work", url: "/work" },
  { name: "offers", url: "/offers" },
  { name: "career", url: "/career" },
  { name: "about", url: "/about" },
  { name: "contact", url: "/contact" },
  { name: "offer-detail", url: "/offers/search-visibility" },
  { name: "work-detail", url: "/work/flavors-chase-me" },
];

const ORIGIN = "http://localhost:3000";

/* ---------------------------------------------------------------------------
   Minimal CDP client
   ------------------------------------------------------------------------ */

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();

    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id !== undefined) {
        const entry = this.pending.get(msg.id);
        if (!entry) return;
        this.pending.delete(msg.id);
        if (msg.error) entry.reject(new Error(`${entry.method}: ${msg.error.message}`));
        else entry.resolve(msg.result);
        return;
      }
      const handlers = this.listeners.get(msg.method);
      if (handlers) for (const h of handlers) h(msg.params);
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`${method} timed out`));
      }, 30000);
    });
  }

  once(method) {
    return new Promise((resolve) => {
      const handler = (params) => {
        this.listeners.get(method)?.delete(handler);
        resolve(params);
      };
      if (!this.listeners.has(method)) this.listeners.set(method, new Set());
      this.listeners.get(method).add(handler);
    });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  const res = await fetch(`http://127.0.0.1:${port}/json/list`);
  const targets = await res.json();
  const page = targets.find((t) => t.type === "page");
  if (!page?.webSocketDebuggerUrl) {
    throw new Error(`no page target on port ${port}. Targets: ${JSON.stringify(targets.map((t) => t.type))}`);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", () => reject(new Error("websocket failed")), { once: true });
  });
  return new CDP(ws);
}

/* ---------------------------------------------------------------------------
   Probes
   ------------------------------------------------------------------------ */

/**
 * Measures horizontal overflow and names the elements causing it. Guessing
 * from a screenshot is what sent me down a blind alley earlier; this answers
 * it directly.
 */
const OVERFLOW_PROBE = `(() => {
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === "string" ? el.className : "").slice(0, 90),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
      });
    }
  }
  // Keep only the outermost offenders: children of an overflowing parent are noise.
  const trimmed = offenders.filter((o, i) => {
    const r = o.right;
    return !offenders.some((other, j) => j !== i && other.left <= o.left && other.right >= r && other.width > o.width);
  });
  return JSON.stringify({
    viewportWidth: vw,
    scrollWidth: doc.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    horizontalOverflow: doc.scrollWidth - vw,
    pageHeight: doc.scrollHeight,
    offenders: trimmed.slice(0, 12),
  });
})()`;

const REVEAL_PROBE = `(() => {
  const all = document.querySelectorAll("[data-reveal]");
  let off = 0;
  for (const el of all) if (el.getAttribute("data-reveal") === "off") off++;
  const stuck = [];
  for (const el of all) {
    if (el.getAttribute("data-reveal") !== "off") continue;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0 && r.height > 0) {
      stuck.push({ cls: (typeof el.className === "string" ? el.className : "").slice(0, 80), top: Math.round(r.top) });
    }
  }
  return JSON.stringify({ total: all.length, off, stuckInViewport: stuck.slice(0, 8) });
})()`;

async function evaluate(cdp, expression) {
  const { result } = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: false,
  });
  return JSON.parse(result.value);
}

async function applyDevice(cdp, device) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: device.width,
    height: device.height,
    deviceScaleFactor: device.dsf,
    mobile: device.mobile,
  });
  await cdp.send("Emulation.setTouchEmulationEnabled", {
    enabled: device.touch,
    maxTouchPoints: device.touch ? 5 : 1,
  });
  // Reduced motion settles every entrance so the capture shows the finished
  // layout rather than a frame mid-transition.
  await cdp.send("Emulation.setEmulatedMedia", {
    media: "screen",
    features: [
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "hover", value: device.mobile ? "none" : "hover" },
      { name: "pointer", value: device.mobile ? "coarse" : "fine" },
    ],
  });
}

async function capture(cdp, url, device, file) {
  await applyDevice(cdp, device);

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await loaded;

  // Let fonts settle and the entrance safety-net run.
  await sleep(1800);

  const overflow = await evaluate(cdp, OVERFLOW_PROBE);
  const reveals = await evaluate(cdp, REVEAL_PROBE);

  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    optimizeForSpeed: false,
  });
  await writeFile(file, Buffer.from(shot.data, "base64"));

  return { overflow, reveals, bytes: Buffer.from(shot.data, "base64").length };
}

/* ---------------------------------------------------------------------------
   Run
   ------------------------------------------------------------------------ */

await mkdir(outDir, { recursive: true });

const cdp = await connect();
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");

const report = { desktop: [], mobile: [] };

for (const [label, device] of [
  ["desktop", DESKTOP],
  ["mobile", MOBILE],
]) {
  for (const page of PAGES) {
    const file = path.join(outDir, `${label}-${page.name}.png`);
    try {
      const result = await capture(cdp, `${ORIGIN}${page.url}`, device, file);
      report[label].push({ page: page.name, ...result });
      const o = result.overflow;
      console.log(
        `${label.padEnd(7)} ${page.name.padEnd(14)} ` +
          `vw=${String(o.viewportWidth).padStart(4)} scrollW=${String(o.scrollWidth).padStart(5)} ` +
          `overflow=${String(o.horizontalOverflow).padStart(4)} height=${String(o.pageHeight).padStart(6)} ` +
          `reveals=${result.reveals.off}/${result.reveals.total} off  ${Math.round(result.bytes / 1024)}KB`,
      );
    } catch (error) {
      console.log(`${label.padEnd(7)} ${page.name.padEnd(14)} FAILED: ${error.message}`);
    }
  }
}

await writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

/* ---------------------------------------------------------------------------
   Slices.
   Full-page captures are thousands of pixels tall and become unreadable once
   scaled to fit a viewer. These clip native-resolution bands instead, which is
   the only way to actually judge type, spacing and contrast.
   ------------------------------------------------------------------------ */

const SLICES = {
  home: [850, 1200, 2000, 2600, 4200, 5400, 6600, 7800],
  offers: [0, 1000, 2100],
  work: [0, 1000, 2000],
  contact: [0, 1000],
};

for (const [label, device] of [
  ["desktop", DESKTOP],
  ["mobile", MOBILE],
]) {
  for (const [name, offsets] of Object.entries(SLICES)) {
    await applyDevice(cdp, device);
    const loaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.navigate", { url: `${ORIGIN}/${name === "home" ? "" : name}` });
    await loaded;
    await sleep(1800);

    const band = device.width <= 400 ? 844 : 1000;

    for (const y of offsets) {
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: 0, y, width: device.width, height: band, scale: 1 },
      });
      const file = path.join(outDir, `slice-${label}-${name}-${y}.png`);
      await writeFile(file, Buffer.from(shot.data, "base64"));
    }
    console.log(`slices ${label} ${name}: ${offsets.length}`);
  }
}

console.log("\n=== horizontal overflow offenders ===");
for (const [label, rows] of Object.entries(report)) {
  for (const row of rows) {
    if (row.overflow.horizontalOverflow > 0 || row.overflow.offenders.length > 0) {
      console.log(`\n${label} / ${row.page}  (overflow ${row.overflow.horizontalOverflow}px)`);
      for (const o of row.overflow.offenders) {
        console.log(`   <${o.tag}> ${o.left}..${o.right} (w=${o.width})  ${o.cls}`);
      }
    }
  }
}

console.log("\n=== reveals stuck in viewport ===");
for (const [label, rows] of Object.entries(report)) {
  for (const row of rows) {
    if (row.reveals.stuckInViewport.length > 0) {
      console.log(`\n${label} / ${row.page}`);
      for (const s of row.reveals.stuckInViewport) console.log(`   top=${s.top}  ${s.cls}`);
    }
  }
}

console.log(`\nwrote ${outDir}`);
process.exit(0);
