#!/usr/bin/env node

/**
 * Reel & Rank — Unified 4-Tier E2E Test Runner
 *
 * Runs all test tiers, computes pass/fail metrics, displays formatted
 * diagnostics, and exports .test-results.json summary.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../");

const TEST_FILES = [
  { tier: "Tier 1: Feature Coverage", file: "tests/e2e/tier1-features.test.mjs" },
  { tier: "Tier 2: Boundary & Corner Cases", file: "tests/e2e/tier2-boundaries.test.mjs" },
  { tier: "Tier 3: Cross-Feature Interactions", file: "tests/e2e/tier3-pairwise.test.mjs" },
  { tier: "Tier 4: Real-World Application Scenarios", file: "tests/e2e/tier4-scenarios.test.mjs" },
];

console.log("================================================================================");
console.log("  Reel & Rank — Comprehensive 4-Tier E2E Test Suite Runner");
console.log("================================================================================\n");

function runTestFile(testItem) {
  return new Promise((resolve) => {
    const filePath = path.resolve(PROJECT_ROOT, testItem.file);
    const proc = spawn(process.execPath, ["--test", "--test-reporter=spec", filePath], {
      cwd: PROJECT_ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (exitCode) => {
      // Parse stdout for pass/fail counts
      const passMatches = stdout.match(/✔\s+/g) || [];
      const failMatches = stdout.match(/✖\s+/g) || [];

      // Look for Node test runner summary if available
      const passCount = passMatches.length;
      const failCount = failMatches.length;

      resolve({
        tier: testItem.tier,
        file: testItem.file,
        exitCode,
        passCount,
        failCount,
        total: passCount + failCount,
        stdout,
        stderr,
      });
    });
  });
}

async function main() {
  const results = [];
  let totalPass = 0;
  let totalFail = 0;
  let totalTests = 0;

  for (const testItem of TEST_FILES) {
    process.stdout.write(`Executing ${testItem.tier}... `);
    const result = await runTestFile(testItem);
    results.push(result);

    totalPass += result.passCount;
    totalFail += result.failCount;
    totalTests += result.total;

    if (result.exitCode === 0) {
      console.log(`PASS (${result.passCount} passed)`);
    } else {
      console.log(`FAIL (${result.passCount} passed, ${result.failCount} failed)`);
    }
  }

  console.log("\n================================================================================");
  console.log("  4-TIER TEST EXECUTION SUMMARY");
  console.log("================================================================================");

  console.log(`| ${"Tier".padEnd(42)} | ${"Passed".padStart(8)} | ${"Failed".padStart(8)} | ${"Total".padStart(8)} | Status |`);
  console.log(`|${"-".repeat(44)}|${"-".repeat(10)}|${"-".repeat(10)}|${"-".repeat(10)}|--------|`);

  for (const res of results) {
    const status = res.exitCode === 0 ? "PASS  " : "FAIL* ";
    console.log(
      `| ${res.tier.padEnd(42)} | ${res.passCount.toString().padStart(8)} | ${res.failCount.toString().padStart(8)} | ${res.total.toString().padStart(8)} | ${status} |`
    );
  }

  console.log(`|${"-".repeat(44)}|${"-".repeat(10)}|${"-".repeat(10)}|${"-".repeat(10)}|--------|`);
  console.log(
    `| ${"TOTAL SUITE".padEnd(42)} | ${totalPass.toString().padStart(8)} | ${totalFail.toString().padStart(8)} | ${totalTests.toString().padStart(8)} | ${totalFail === 0 ? "PASS  " : "FAIL* "} |`
  );
  console.log("================================================================================\n");

  // Output failure details if any
  const failures = results.filter((r) => r.exitCode !== 0);
  if (failures.length > 0) {
    console.log("FAILURE DIAGNOSTICS (Implementation milestones in progress):");
    for (const fail of failures) {
      console.log(`\n--- ${fail.tier} (${fail.file}) ---`);
      // Print failing lines from stdout
      const lines = fail.stdout.split("\n");
      const failLines = lines.filter((l) => l.includes("✖") || l.includes("Error:") || l.includes("AssertionError"));
      for (const line of failLines.slice(0, 15)) {
        console.log(`  ${line}`);
      }
      if (failLines.length > 15) {
        console.log(`  ... and ${failLines.length - 15} more failures.`);
      }
    }
  }

  // Write .test-results.json
  const summaryJson = {
    timestamp: new Date().toISOString(),
    totalTests,
    totalPass,
    totalFail,
    success: totalFail === 0,
    tiers: results.map((r) => ({
      tier: r.tier,
      file: r.file,
      passed: r.passCount,
      failed: r.failCount,
      total: r.total,
      status: r.exitCode === 0 ? "PASS" : "FAIL",
    })),
  };

  fs.writeFileSync(
    path.resolve(PROJECT_ROOT, ".test-results.json"),
    JSON.stringify(summaryJson, null, 2)
  );

  console.log(`\nTest results written to .test-results.json`);
  process.exit(totalFail === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
