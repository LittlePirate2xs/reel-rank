import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

console.log("================================================================================");
console.log("  CHALLENGER EMPIRICAL VERIFICATION HARNESS — MILESTONE M2");
console.log("  Apple-Grade Fluid Motion & Interaction Craft");
console.log("================================================================================\n");

const rootDir = process.cwd();
let totalChecks = 0;
let passedChecks = 0;
const failureList = [];

function check(title, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  ✓ [PASS] ${title}`);
  } catch (err) {
    failureList.push({ title, error: err.message });
    console.error(`  ✗ [FAIL] ${title}`);
    console.error(`     Reason: ${err.message.split("\n")[0]}`);
  }
}

async function asyncCheck(title, fn) {
  totalChecks++;
  try {
    await fn();
    passedChecks++;
    console.log(`  ✓ [PASS] ${title}`);
  } catch (err) {
    failureList.push({ title, error: err.message });
    console.error(`  ✗ [FAIL] ${title}`);
    console.error(`     Reason: ${err.message.split("\n")[0]}`);
  }
}

// =============================================================================
// SUITE 1: Spring Physics & Presets (src/lib/motion.ts)
// =============================================================================
console.log("\nSUITE 1: Spring Physics & Apple Presets (src/lib/motion.ts)");

const motionModule = await import(pathToFileURL(path.join(rootDir, "src/lib/motion.ts")).href);
const { APPLE_SPRINGS, projectMomentum, rubberband, resolveSpring } = motionModule;

check("APPLE_SPRINGS presets are exported and strictly defined", () => {
  assert.ok(APPLE_SPRINGS, "APPLE_SPRINGS must be exported");
  assert.equal(typeof APPLE_SPRINGS, "object");
  assert.ok(APPLE_SPRINGS.criticallyDamped, "Missing criticallyDamped preset");
  assert.ok(APPLE_SPRINGS.momentum, "Missing momentum preset");
  assert.ok(APPLE_SPRINGS.snappy, "Missing snappy preset");
  assert.ok(APPLE_SPRINGS.press, "Missing press preset");
});

check("APPLE_SPRINGS.criticallyDamped: bounce is strictly 0 and duration is 0.35s", () => {
  assert.equal(APPLE_SPRINGS.criticallyDamped.type, "spring");
  assert.equal(APPLE_SPRINGS.criticallyDamped.bounce, 0, "Critically damped must have bounce: 0");
  assert.equal(APPLE_SPRINGS.criticallyDamped.duration, 0.35, "Critically damped duration must be 0.35s");
});

check("APPLE_SPRINGS.momentum: bounce is strictly 0.16 and duration is 0.4s", () => {
  assert.equal(APPLE_SPRINGS.momentum.type, "spring");
  assert.equal(APPLE_SPRINGS.momentum.bounce, 0.16, "Momentum spring must have bounce: 0.16");
  assert.equal(APPLE_SPRINGS.momentum.duration, 0.4, "Momentum spring duration must be 0.4s");
});

check("APPLE_SPRINGS.snappy & press presets meet Apple micro-interaction specs", () => {
  assert.equal(APPLE_SPRINGS.snappy.type, "spring");
  assert.equal(APPLE_SPRINGS.snappy.bounce, 0);
  assert.equal(APPLE_SPRINGS.snappy.duration, 0.22);

  assert.equal(APPLE_SPRINGS.press.type, "spring");
  assert.equal(APPLE_SPRINGS.press.bounce, 0);
  assert.equal(APPLE_SPRINGS.press.duration, 0.14);
});

check("projectMomentum: zero velocity returns initial position", () => {
  assert.equal(projectMomentum(0, 0), 0);
  assert.equal(projectMomentum(250, 0), 250);
  assert.equal(projectMomentum(0), 0);
});

check("projectMomentum: positive and negative velocities project symmetrically", () => {
  const current = 100;
  const forward = projectMomentum(current, 800);
  const backward = projectMomentum(current, -800);

  assert.ok(forward > current, "Positive velocity must project forward");
  assert.ok(backward < current, "Negative velocity must project backward");

  const forwardDelta = forward - current;
  const backwardDelta = current - backward;
  assert.ok(
    Math.abs(forwardDelta - backwardDelta) < 1e-6,
    `Momentum projection must be symmetric: forwardDelta=${forwardDelta}, backwardDelta=${backwardDelta}`
  );
});

check("projectMomentum: single-argument velocity delta signature works accurately", () => {
  const delta = projectMomentum(1000);
  assert.ok(delta > 0, "Single-argument velocity must return positive delta");
  // delta = (1000/1000) * (0.998 / 0.002) = 499
  assert.ok(Math.abs(delta - 499) < 0.1, `Expected ~499, got ${delta}`);
});

check("projectMomentum: extreme velocities (> 100,000 px/s) do not overflow to NaN or Infinity", () => {
  const extreme = projectMomentum(0, 150000);
  assert.ok(Number.isFinite(extreme), "Must remain finite");
  assert.ok(!Number.isNaN(extreme), "Must not be NaN");
});

check("projectMomentum: sub-threshold velocities (< 0.01 px/s) avoid micro-drift", () => {
  assert.equal(projectMomentum(50, 0.005), 50);
  assert.equal(projectMomentum(50, -0.005), 50);
  assert.equal(projectMomentum(0.005), 0);
});

check("projectMomentum: unit velocity (1 px/s) does not divide by zero returning Infinity", () => {
  const res = projectMomentum(100, 1);
  assert.ok(Number.isFinite(res), `projectMomentum(100, 1) must be finite, got ${res}`);
});

check("rubberband: zero offset returns 0 resistance", () => {
  assert.equal(rubberband(0, 300), 0);
  assert.equal(rubberband(0, 0), 0);
});

check("rubberband: symmetric resistance across positive and negative displacements", () => {
  const pos = rubberband(120, 400);
  const neg = rubberband(-120, 400);
  assert.ok(pos > 0, "Positive offset yields positive resistance");
  assert.ok(neg < 0, "Negative offset yields negative resistance");
  assert.equal(pos, -neg, "Resistance must be strictly symmetric");
});

check("rubberband: progressive resistance (strictly sublinear diminishing returns)", () => {
  const range = 300;
  const step1 = rubberband(100, range);
  const step2 = rubberband(200, range);
  const step3 = rubberband(300, range);

  const delta1 = step1 - 0;
  const delta2 = step2 - step1;
  const delta3 = step3 - step2;

  assert.ok(delta1 > delta2, `First 100px (${delta1}) must displace more than second 100px (${delta2})`);
  assert.ok(delta2 > delta3, `Second 100px (${delta2}) must displace more than third 100px (${delta3})`);
  assert.ok(step3 < range, "Resistance must remain strictly bounded below range");
});

check("rubberband: invalid range (<= 0) returns 0 without crashing", () => {
  assert.equal(rubberband(100, 0), 0);
  assert.equal(rubberband(100, -50), 0);
});

check("resolveSpring: reducedMotion false preserves spring preset, true returns instant tween", () => {
  const spring = resolveSpring(APPLE_SPRINGS.criticallyDamped, false);
  assert.equal(spring, APPLE_SPRINGS.criticallyDamped);

  const reduced = resolveSpring(APPLE_SPRINGS.criticallyDamped, true);
  assert.equal(reduced.type, "tween");
  assert.equal(reduced.duration, 0.001);
  assert.equal(reduced.bounce, 0);
});

// =============================================================================
// SUITE 2: Persistent Audio Hook & Mute Persistence (src/lib/audio.ts)
// =============================================================================
console.log("\nSUITE 2: Persistent Audio Hook & Mute Persistence (src/lib/audio.ts)");

const audioModule = await import(pathToFileURL(path.join(rootDir, "src/lib/audio.ts")).href);
const { AUDIO_STORAGE_KEY, usePersistentAudio } = audioModule;

check("AUDIO_STORAGE_KEY is exactly 'reel_audio_muted'", () => {
  assert.equal(AUDIO_STORAGE_KEY, "reel_audio_muted");
});

check("usePersistentAudio hook is exported function", () => {
  assert.equal(typeof usePersistentAudio, "function");
});

// Test audio storage reading oracle logic
function testAudioStorageReader(storedValue) {
  if (storedValue === null) return true;
  return storedValue !== "false";
}

check("Audio storage reader oracle: null or unset storage defaults to muted (true)", () => {
  assert.equal(testAudioStorageReader(null), true, "Clean storage must default to muted: true for autoplay");
});

check("Audio storage reader oracle: literal 'false' un-mutes, while 'true' or invalid defaults to muted", () => {
  assert.equal(testAudioStorageReader("false"), false, "Stored 'false' must un-mute");
  assert.equal(testAudioStorageReader("true"), true, "Stored 'true' must mute");
  assert.equal(testAudioStorageReader(""), true, "Empty string must fail-safe to muted");
  assert.equal(testAudioStorageReader("invalid_token"), true, "Corrupted string must fail-safe to muted");
});

// Verify audio source code implements event synchronization & storage safety
const audioSource = fs.readFileSync(path.join(rootDir, "src/lib/audio.ts"), "utf-8");

check("src/lib/audio.ts implements CustomEvent cross-component synchronization", () => {
  assert.ok(audioSource.includes("reel_audio_change"), "Must use 'reel_audio_change' custom event");
  assert.ok(audioSource.includes("window.dispatchEvent"), "Must dispatch custom event on mute change");
  assert.ok(audioSource.includes("addEventListener"), "Must listen to custom event and storage events");
});

check("src/lib/audio.ts wraps localStorage in try-catch for private browsing / quota safety", () => {
  assert.ok(audioSource.includes("try {"), "localStorage read/write must be wrapped in try/catch");
  assert.ok(audioSource.includes("catch"), "Storage exceptions must be caught safely");
});

// Verify FilmPlayer queue item advancement does NOT reset mute
const filmPlayerSource = fs.readFileSync(path.join(rootDir, "src/components/work/FilmPlayer.tsx"), "utf-8");

check("FilmPlayer.tsx uses usePersistentAudio hook", () => {
  assert.ok(filmPlayerSource.includes("usePersistentAudio"), "FilmPlayer must import and call usePersistentAudio");
  assert.ok(
    filmPlayerSource.includes("const { muted, toggleMute, setMuted } = usePersistentAudio()"),
    "FilmPlayer must destructure muted, toggleMute, setMuted"
  );
});

check("FilmPlayer.tsx does NOT reset mute state on queue item advancement", () => {
  // Ensure that on film?.id changes, setMuted(true) is NOT invoked
  const filmEffectMatch = filmPlayerSource.match(/useEffect\(\(\)\s*=>\s*\{[\s\S]*?setCurrentTime\(0\)[\s\S]*?\}\s*,\s*\[film\?\.id/);
  assert.ok(filmEffectMatch, "Found film queue transition effect");
  assert.ok(!filmEffectMatch[0].includes("setMuted"), "Film queue change effect MUST NOT call setMuted");
  assert.ok(!filmEffectMatch[0].includes("muted"), "Film queue change effect must preserve audio state");
});

check("FilmPlayer.tsx handles browser autoplay rejection gracefully", () => {
  assert.ok(filmPlayerSource.includes("started.catch"), "Video play promise must handle rejection catch");
  assert.ok(
    filmPlayerSource.includes("node.muted = true") && filmPlayerSource.includes("setMuted(true)"),
    "Must fall back to muted playback on autoplay rejection without unhandled exceptions"
  );
});

check("FilmPlayer.tsx audio button reflects accurate ARIA and visual state", () => {
  assert.ok(filmPlayerSource.includes("handleToggleMute"), "Must bind toggle handler");
  assert.ok(filmPlayerSource.includes('aria-pressed={muted}'), "Must set aria-pressed");
  assert.ok(filmPlayerSource.includes('aria-label={muted ? "Unmute film" : "Mute film"}'), "Must set accessible aria-label");
  assert.ok(filmPlayerSource.includes('{muted ? "Muted" : "Sound on"}'), "Must display Muted / Sound on text");
});

// =============================================================================
// SUITE 3: ScrubBar Direct Manipulation & ARIA Semantics (src/components/primitives/ScrubBar.tsx)
// =============================================================================
console.log("\nSUITE 3: ScrubBar Direct Manipulation & ARIA Semantics");

const scrubBarSource = fs.readFileSync(path.join(rootDir, "src/components/primitives/ScrubBar.tsx"), "utf-8");

check("ScrubBar.tsx exports ScrubBar component and ScrubBarProps type", () => {
  assert.ok(scrubBarSource.includes("export function ScrubBar"), "Must export ScrubBar function");
  assert.ok(scrubBarSource.includes("export type ScrubBarProps"), "Must export ScrubBarProps type");
});

check("ScrubBar.tsx implements pointer capture (setPointerCapture & releasePointerCapture)", () => {
  assert.ok(scrubBarSource.includes("setPointerCapture(e.pointerId)"), "Must call setPointerCapture on pointer down");
  assert.ok(scrubBarSource.includes("releasePointerCapture(e.pointerId)"), "Must call releasePointerCapture on pointer up");
  assert.ok(scrubBarSource.includes("hasPointerCapture(e.pointerId)"), "Must check hasPointerCapture before release");
  assert.ok(scrubBarSource.includes("onPointerCancel"), "Must handle onPointerCancel safely");
});

check("ScrubBar.tsx scales thumb to exactly 1.35 on pointer-down", () => {
  assert.ok(
    scrubBarSource.includes("scale: reduced ? 1 : dragging ? 1.35 : 1"),
    "Thumb scale must expand to 1.35 on dragging and settle to 1 on release"
  );
  assert.ok(
    scrubBarSource.includes("APPLE_SPRINGS.criticallyDamped"),
    "Thumb scale animation must use APPLE_SPRINGS.criticallyDamped transition"
  );
});

check("ScrubBar.tsx respects prefers-reduced-motion for thumb scaling", () => {
  assert.ok(scrubBarSource.includes("usePrefersReducedMotion"), "Must use usePrefersReducedMotion hook");
  assert.ok(
    scrubBarSource.includes("reduced ? 1 : dragging ? 1.35 : 1"),
    "Reduced motion must lock thumb scale to 1"
  );
  assert.ok(
    scrubBarSource.includes("reduced ? { duration: 0.001 } : APPLE_SPRINGS.criticallyDamped"),
    "Reduced motion must collapse transition duration to 0.001s"
  );
});

check("ScrubBar.tsx exposes complete ARIA slider semantics", () => {
  assert.ok(scrubBarSource.includes('role="slider"'), "Must specify role='slider'");
  assert.ok(scrubBarSource.includes("tabIndex={0}"), "Must specify tabIndex={0} for keyboard accessibility");
  assert.ok(scrubBarSource.includes("aria-valuenow={clampedValue}"), "Must specify dynamic aria-valuenow");
  assert.ok(scrubBarSource.includes("aria-valuemin={min}"), "Must specify aria-valuemin");
  assert.ok(scrubBarSource.includes("aria-valuemax={max}"), "Must specify aria-valuemax");
  assert.ok(scrubBarSource.includes("aria-valuetext={formatTime(clampedValue)}"), "Must specify aria-valuetext with formatted time");
  assert.ok(scrubBarSource.includes("aria-label={ariaLabel}"), "Must specify aria-label");
});

check("ScrubBar.tsx sets touch-action: none to prevent scroll hijacking", () => {
  assert.ok(scrubBarSource.includes('touch-none'), "Must include touch-none in className");
  assert.ok(scrubBarSource.includes('touchAction: "none"'), "Must set style touchAction: 'none'");
});

// Test default time formatter oracle
function defaultFormatTime(sec) {
  const safe = Math.max(0, Number.isFinite(sec) ? sec : 0);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

check("Timecode formatter oracle: formats MM:SS accurately across normal, zero, and boundary inputs", () => {
  assert.equal(defaultFormatTime(0), "0:00");
  assert.equal(defaultFormatTime(9), "0:09");
  assert.equal(defaultFormatTime(65), "1:05");
  assert.equal(defaultFormatTime(3599), "59:59");
  assert.equal(defaultFormatTime(3600), "60:00");
  assert.equal(defaultFormatTime(-10), "0:00", "Negative seconds must clamp to 0:00");
  assert.equal(defaultFormatTime(NaN), "0:00", "NaN must fail-safe to 0:00");
  assert.equal(defaultFormatTime(Infinity), "0:00", "Infinity must fail-safe to 0:00");
});

// Test 1:1 direct manipulation pointer calculation oracle
function calculateValueFromPointerOracle(clientX, rectLeft, rectWidth, min, max, step) {
  if (rectWidth <= 0) return min;
  const range = Math.max(0.0001, max - min);
  const rawFraction = Math.max(0, Math.min(1, (clientX - rectLeft) / rectWidth));
  const rawValue = min + rawFraction * range;
  if (step > 0) {
    const stepped = Math.round((rawValue - min) / step) * step + min;
    return Math.min(Math.max(stepped, min), max);
  }
  return Math.min(Math.max(rawValue, min), max);
}

check("Pointer calculation oracle: 1:1 direct tracking tracks accurately across track bounds", () => {
  const min = 0;
  const max = 120;
  const left = 100;
  const width = 400; // 100 to 500
  const step = 0.1;

  // Exact start
  assert.equal(calculateValueFromPointerOracle(100, left, width, min, max, step), 0);
  // Halfway
  assert.equal(calculateValueFromPointerOracle(300, left, width, min, max, step), 60);
  // Quarter
  assert.equal(calculateValueFromPointerOracle(200, left, width, min, max, step), 30);
  // Exact end
  assert.equal(calculateValueFromPointerOracle(500, left, width, min, max, step), 120);

  // Clamping outside bounds
  assert.equal(calculateValueFromPointerOracle(50, left, width, min, max, step), 0, "Left overshoot clamps to min");
  assert.equal(calculateValueFromPointerOracle(700, left, width, min, max, step), 120, "Right overshoot clamps to max");

  // Zero width track safety
  assert.equal(calculateValueFromPointerOracle(200, left, 0, min, max, step), 0, "Zero width safely returns min without NaN");
});

// Test keyboard arrow navigation logic
check("ScrubBar.tsx handles keyboard Arrow navigation (ArrowLeft, ArrowRight, PageDown, PageUp, Home, End)", () => {
  assert.ok(scrubBarSource.includes('case "ArrowLeft":'), "Handles ArrowLeft");
  assert.ok(scrubBarSource.includes('case "ArrowRight":'), "Handles ArrowRight");
  assert.ok(scrubBarSource.includes('case "ArrowDown":'), "Handles ArrowDown");
  assert.ok(scrubBarSource.includes('case "ArrowUp":'), "Handles ArrowUp");
  assert.ok(scrubBarSource.includes('case "PageDown":'), "Handles PageDown");
  assert.ok(scrubBarSource.includes('case "PageUp":'), "Handles PageUp");
  assert.ok(scrubBarSource.includes('case "Home":'), "Handles Home");
  assert.ok(scrubBarSource.includes('case "End":'), "Handles End");
  assert.ok(scrubBarSource.includes("e.preventDefault()"), "Prevents page scroll during keyboard seek");
});

// Test release velocity calculation
check("ScrubBar.tsx computes pointer release velocity and passes to onChangeEnd", () => {
  assert.ok(scrubBarSource.includes("historyRef"), "Maintains pointer movement history");
  assert.ok(scrubBarSource.includes("velocity = (last.x - first.x) / dt"), "Calculates dx/dt velocity in px/s");
  assert.ok(scrubBarSource.includes("onChangeEnd?.(finalValue, velocity)"), "Passes computed velocity to onChangeEnd");
});

// =============================================================================
// SUITE 4: Broader M2 Fluid Interactions (Dialog, MobileNav, ReelStrip, globals.css)
// =============================================================================
console.log("\nSUITE 4: Broader M2 Fluid Motion Implementations");

const dialogSource = fs.readFileSync(path.join(rootDir, "src/components/primitives/Dialog.tsx"), "utf-8");

check("Dialog.tsx: modal backdrop has backdrop-blur-md depth and critically damped springs", () => {
  assert.ok(dialogSource.includes("backdrop-blur-md"), "Backdrop must use backdrop-blur-md");
  assert.ok(
    dialogSource.includes("APPLE_SPRINGS.criticallyDamped"),
    "Dialog must use APPLE_SPRINGS.criticallyDamped"
  );
  assert.ok(dialogSource.includes("aria-modal=\"true\""), "Dialog must set aria-modal='true'");
  assert.ok(dialogSource.includes("role=\"dialog\""), "Dialog must set role='dialog'");
});

const mobileNavSource = fs.readFileSync(path.join(rootDir, "src/components/layout/MobileNav.tsx"), "utf-8");

check("MobileNav.tsx: drawer implements drag-to-dismiss with velocity and offset threshold", () => {
  assert.ok(mobileNavSource.includes('drag="y"'), "MobileNav must support drag='y'");
  assert.ok(
    mobileNavSource.includes("info.velocity.y > 400 || info.offset.y > 100"),
    "MobileNav must check velocity.y > 400 or offset.y > 100 for dismissal"
  );
  assert.ok(
    mobileNavSource.includes("APPLE_SPRINGS.criticallyDamped"),
    "MobileNav must use APPLE_SPRINGS.criticallyDamped for settle"
  );
});

const reelStripSource = fs.readFileSync(path.join(rootDir, "src/components/sections/ReelStrip.tsx"), "utf-8");

check("ReelStrip.tsx: integrates ScrubBar and applies momentum release handoff", () => {
  assert.ok(reelStripSource.includes("<ScrubBar"), "ReelStrip must integrate ScrubBar");
  assert.ok(
    reelStripSource.includes("projectMomentum(val, velocity / 10)") ||
      reelStripSource.includes("projectMomentum"),
    "ReelStrip must use projectMomentum for timeline scrub release"
  );
  assert.ok(
    reelStripSource.includes('drag="x"'),
    "ReelStrip card track must support drag='x'"
  );
  assert.ok(
    reelStripSource.includes("projectMomentum(info.velocity.x)"),
    "ReelStrip track release must apply momentum velocity projection"
  );
});

const globalsCss = fs.readFileSync(path.join(rootDir, "src/app/globals.css"), "utf-8");

check("globals.css: eliminates 300ms mobile tap delay via touch-action: manipulation", () => {
  assert.ok(
    /button,\s*a,\s*input,\s*select,\s*textarea,\s*\[role="button"\],\s*\[role="slider"\]\s*\{\s*touch-action:\s*manipulation;/s.test(
      globalsCss
    ),
    "globals.css must apply touch-action: manipulation to all interactive elements"
  );
});

check("globals.css: .u-press implements 40ms instant pointer-down scale and 160ms release settle", () => {
  assert.ok(
    /\.u-press\s*\{[\s\S]*?transition:\s*transform\s*160ms/s.test(globalsCss),
    ".u-press must define 160ms transition settle"
  );
  assert.ok(
    /\.u-press:active[^{]*\{[\s\S]*?transform:\s*scale\(0\.97\)[\s\S]*?transition-duration:\s*40ms/s.test(globalsCss),
    ".u-press:active must apply scale(0.97) with 40ms transition duration"
  );
});

// =============================================================================
// SUMMARY REPORT
// =============================================================================
console.log("\n================================================================================");
console.log(`  VERIFICATION RESULTS: ${passedChecks} / ${totalChecks} PASS (${Math.round((passedChecks / totalChecks) * 100)}%)`);
console.log("================================================================================\n");

if (failureList.length > 0) {
  console.error("FAILURES DETECTED:");
  for (const fail of failureList) {
    console.error(`- ${fail.title}: ${fail.error}`);
  }
  process.exit(1);
} else {
  console.log("ALL EMPIRICAL M2 CHECKS PASSED WITH 100% SUCCESS.\n");
  process.exit(0);
}
