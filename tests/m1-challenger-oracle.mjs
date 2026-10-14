import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("================================================================================");
console.log("  CHALLENGER EMPIRICAL VERIFICATION HARNESS — MILESTONE M1");
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

// -----------------------------------------------------------------------------
// SUITE 1: Static Files & Build Artifacts Existence
// -----------------------------------------------------------------------------
console.log("SUITE 1: Build Output & Endpoint Artifacts");

const llmsTxtPath = path.join(rootDir, ".next/server/app/llms.txt.body");
const llmsFullTxtPath = path.join(rootDir, ".next/server/app/llms-full.txt.body");
const publicLlmsTxtPath = path.join(rootDir, "public/llms.txt");
const publicLlmsFullTxtPath = path.join(rootDir, "public/llms-full.txt");
const robotsBodyPath = path.join(rootDir, ".next/server/app/robots.txt.body");

check("Build output .next/server/app/llms.txt.body exists", () => {
  assert.ok(fs.existsSync(llmsTxtPath), "Missing .next/server/app/llms.txt.body");
});

check("Build output .next/server/app/llms-full.txt.body exists", () => {
  assert.ok(fs.existsSync(llmsFullTxtPath), "Missing .next/server/app/llms-full.txt.body");
});

const llmsMetaPath = path.join(rootDir, ".next/server/app/llms.txt.meta");
const llmsFullMetaPath = path.join(rootDir, ".next/server/app/llms-full.txt.meta");

check("Route metadata .next/server/app/llms.txt.meta confirms status 200 & text/plain charset=utf-8", () => {
  assert.ok(fs.existsSync(llmsMetaPath), "Missing llms.txt.meta");
  const meta = JSON.parse(fs.readFileSync(llmsMetaPath, "utf-8"));
  assert.equal(meta.status, 200);
  assert.equal(meta.headers["content-type"], "text/plain; charset=utf-8");
});

check("Route metadata .next/server/app/llms-full.txt.meta confirms status 200 & text/plain charset=utf-8", () => {
  assert.ok(fs.existsSync(llmsFullMetaPath), "Missing llms-full.txt.meta");
  const meta = JSON.parse(fs.readFileSync(llmsFullMetaPath, "utf-8"));
  assert.equal(meta.status, 200);
  assert.equal(meta.headers["content-type"], "text/plain; charset=utf-8");
});

check("Public fallback public/llms.txt exists and matches route body", () => {
  assert.ok(fs.existsSync(publicLlmsTxtPath), "Missing public/llms.txt");
  const publicContent = fs.readFileSync(publicLlmsTxtPath, "utf-8").replace(/\r\n/g, "\n").replace(/\n+/g, "\n").trim();
  const bodyContent = fs.readFileSync(llmsTxtPath, "utf-8").replace(/\r\n/g, "\n").replace(/\n+/g, "\n").trim();
  assert.equal(publicContent, bodyContent, "public/llms.txt does not match route output");
});

check("Public fallback public/llms-full.txt exists and matches route body", () => {
  assert.ok(fs.existsSync(publicLlmsFullTxtPath), "Missing public/llms-full.txt");
  const publicContent = fs.readFileSync(publicLlmsFullTxtPath, "utf-8").replace(/\r\n/g, "\n").replace(/\n+/g, "\n").trim();
  const bodyContent = fs.readFileSync(llmsFullTxtPath, "utf-8").replace(/\r\n/g, "\n").replace(/\n+/g, "\n").trim();
  assert.equal(publicContent, bodyContent, "public/llms-full.txt does not match route output");
});

check("Build output .next/server/app/robots.txt.body exists", () => {
  assert.ok(fs.existsSync(robotsBodyPath), "Missing .next/server/app/robots.txt.body");
});

// -----------------------------------------------------------------------------
// SUITE 2: /llms.txt Content & Structure Verification
// -----------------------------------------------------------------------------
console.log("\nSUITE 2: /llms.txt Structure and Content Oracles");

const llmsTxtContent = fs.existsSync(llmsTxtPath) ? fs.readFileSync(llmsTxtPath, "utf-8") : "";

check("llms.txt starts with level-1 markdown heading", () => {
  assert.match(llmsTxtContent, /^#\s+Reel & Rank/m, "Must start with # Reel & Rank");
});

check("llms.txt contains blockquote studio summary", () => {
  assert.match(llmsTxtContent, /^>\s+.+/m, "Must include a blockquote summary");
});

check("llms.txt contains Studio Overview with Houston coords 29.7604, -95.3698", () => {
  assert.match(llmsTxtContent, /29\.7604,\s*-95\.3698/, "Must contain exact Houston coordinates");
});

check("llms.txt contains founder Manny Singh and title", () => {
  assert.match(llmsTxtContent, /Manny Singh/, "Must contain Manny Singh");
  assert.match(llmsTxtContent, /Founder & Creative Technologist/, "Must contain founder title");
});

check("llms.txt contains founder corporate pedigree (Salesforce, United Airlines, Morgan Stanley, Banco Santander)", () => {
  assert.match(llmsTxtContent, /Salesforce/);
  assert.match(llmsTxtContent, /United Airlines/);
  assert.match(llmsTxtContent, /Morgan Stanley/);
  assert.match(llmsTxtContent, /Banco Santander/);
});

check("llms.txt contains flat rates: $250, $500, $1,000, $2,000+", () => {
  assert.match(llmsTxtContent, /\$250/, "Missing $250");
  assert.match(llmsTxtContent, /\$500/, "Missing $500");
  assert.match(llmsTxtContent, /\$1,000/, "Missing $1,000");
  assert.match(llmsTxtContent, /\$2,000/, "Missing $2,000");
});

check("llms.txt contains turnaround commitments (one day / 24 hours)", () => {
  assert.match(llmsTxtContent, /one day|24 hours/i, "Missing turnaround commitment");
});

check("llms.txt contains Markdown links to key sections", () => {
  assert.match(llmsTxtContent, /\[Selected Work\]\(https?:\/\/[^\)]+\/work\)/);
  assert.match(llmsTxtContent, /\[Offers & Pricing\]\(https?:\/\/[^\)]+\/offers\)/);
  assert.match(llmsTxtContent, /\[Start a Brief\]\(https?:\/\/[^\)]+\/contact\)/);
});

// -----------------------------------------------------------------------------
// SUITE 3: /llms-full.txt Content & Structure Verification
// -----------------------------------------------------------------------------
console.log("\nSUITE 3: /llms-full.txt Structure and Content Oracles");

const llmsFullTxtContent = fs.existsSync(llmsFullTxtPath) ? fs.readFileSync(llmsFullTxtPath, "utf-8") : "";

check("llms-full.txt has full specification title heading", () => {
  assert.match(llmsFullTxtContent, /^# Reel & Rank — Full Studio Specification/m);
});

check("llms-full.txt contains 7 numbered markdown sections", () => {
  assert.match(llmsFullTxtContent, /## 1\. Studio Identification & Knowledge Graph/);
  assert.match(llmsFullTxtContent, /## 2\. Definitional Answer Summary/);
  assert.match(llmsFullTxtContent, /## 3\. Detailed Offer Catalog & Deliverables/);
  assert.match(llmsFullTxtContent, /## 4\. Career Packages/);
  assert.match(llmsFullTxtContent, /## 5\. Portfolio & Provenance Policy/);
  assert.match(llmsFullTxtContent, /## 6\. Team Roster & Specializations/);
  assert.match(llmsFullTxtContent, /## 7\. Studio Frequently Asked Questions/);
});

check("llms-full.txt includes all 5 offers with itemized deliverables", () => {
  assert.match(llmsFullTxtContent, /### Motion graphics, set of three/);
  assert.match(llmsFullTxtContent, /### 15-second advertisement/);
  assert.match(llmsFullTxtContent, /### Advertisement up to one minute/);
  assert.match(llmsFullTxtContent, /### Search visibility: SEO, GEO and AEO/);
  assert.match(llmsFullTxtContent, /### Selling campaign/);
  assert.match(llmsFullTxtContent, /Itemized Deliverables:/);
  assert.match(llmsFullTxtContent, /Contractual Commitments:/);
});

check("llms-full.txt includes career packages ($500, $1,000, $1,500) and commitments", () => {
  assert.match(llmsFullTxtContent, /### Interview video \(\$500\)/);
  assert.match(llmsFullTxtContent, /### Résumé, video and portfolio \(\$1,000\)/);
  assert.match(llmsFullTxtContent, /### Complete career package \(\$1,500\)/);
  assert.match(llmsFullTxtContent, /I will keep working with you until you get a job/);
});

check("llms-full.txt includes RamanRasa portfolio provenance explanation", () => {
  assert.match(llmsFullTxtContent, /RamanRasa/);
  assert.match(llmsFullTxtContent, /AI-assisted creative/);
  assert.match(llmsFullTxtContent, /portfolio creative rather than paid client testimonials/);
});

check("llms-full.txt includes FAQ items", () => {
  assert.match(llmsFullTxtContent, /### What actually happens in the first day\?/);
  assert.match(llmsFullTxtContent, /What does "refined until perfect" mean\?/);
});

// -----------------------------------------------------------------------------
// SUITE 4: Direct Answer Word Count Oracles (Strict 45-60 words)
// -----------------------------------------------------------------------------
console.log("\nSUITE 4: Direct-Answer Definition Blocks Word Count Oracles");

// Import offers definitions from content
import { offers, offersDirectAnswer } from "../src/content/offers.ts";

function countWords(str) {
  // Method 1: Standard whitespace separation
  const whitespaceWords = str.trim().split(/\s+/).filter(Boolean);
  
  // Method 2: Intl.Segmenter word counting (word-like tokens)
  let intlCount = 0;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("en", { granularity: "word" });
    const segments = segmenter.segment(str);
    for (const seg of segments) {
      if (seg.isWordLike) intlCount++;
    }
  }

  return {
    rawTokens: whitespaceWords.length,
    intlWordCount: intlCount,
    tokens: whitespaceWords,
  };
}

check("offersDirectAnswer word count is strictly between 45 and 60 words", () => {
  const counts = countWords(offersDirectAnswer);
  console.log(`     offersDirectAnswer: whitespace count = ${counts.rawTokens}, intl count = ${counts.intlWordCount}`);
  assert.ok(
    counts.rawTokens >= 45 && counts.rawTokens <= 60,
    `offersDirectAnswer count (${counts.rawTokens}) outside 45-60 range!`
  );
});

offers.forEach((offer) => {
  check(`Offer '${offer.slug}' directAnswer word count is strictly between 45 and 60 words`, () => {
    assert.ok(offer.directAnswer, `Missing directAnswer on offer ${offer.slug}`);
    const counts = countWords(offer.directAnswer);
    console.log(`     ${offer.slug}: whitespace count = ${counts.rawTokens}, intl count = ${counts.intlWordCount}`);
    assert.ok(
      counts.rawTokens >= 45 && counts.rawTokens <= 60,
      `Offer '${offer.slug}' directAnswer count (${counts.rawTokens}) outside 45-60 range!`
    );
  });
});

// Check compiled HTML for direct answers
const offersHtmlPath = path.join(rootDir, ".next/server/app/offers.html");
check("Compiled .next/server/app/offers.html renders offersDirectAnswer block", () => {
  const html = fs.readFileSync(offersHtmlPath, "utf-8");
  assert.ok(
    html.includes("Studio summary &amp; rates") || html.includes("Studio summary & rates"),
    "Missing 'Studio summary & rates' header in offers.html"
  );
  // Verify a substantial substring of offersDirectAnswer is present
  assert.ok(
    html.includes("Reel &amp; Rank is a Houston, Texas motion graphics") ||
    html.includes("Reel & Rank is a Houston, Texas motion graphics"),
    "Missing offersDirectAnswer text in offers.html"
  );
});

offers.forEach((offer) => {
  check(`Compiled .next/server/app/offers/${offer.slug}.html renders directAnswer block`, () => {
    const offerHtmlPath = path.join(rootDir, `.next/server/app/offers/${offer.slug}.html`);
    assert.ok(fs.existsSync(offerHtmlPath), `Missing ${offerHtmlPath}`);
    const html = fs.readFileSync(offerHtmlPath, "utf-8");
    assert.ok(
      html.includes("Direct answer &amp; deliverables") || html.includes("Direct answer & deliverables"),
      `Missing 'Direct answer & deliverables' eyebrow in ${offer.slug}.html`
    );
    // Extract first 4 words of direct answer
    const snippet = offer.directAnswer.split(/\s+/).slice(0, 4).join(" ");
    assert.ok(html.includes(snippet.replace(/&/g, "&amp;")) || html.includes(snippet), `Missing direct answer snippet in ${offer.slug}.html`);
  });
});

// -----------------------------------------------------------------------------
// SUITE 5: Schema.org @graph JSON-LD Parsing & Schema Integrity
// -----------------------------------------------------------------------------
console.log("\nSUITE 5: Schema.org @graph & VideoObject JSON-LD Oracles");

function extractJsonLdScripts(html) {
  const regex = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  const results = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      results.push(JSON.parse(match[1]));
    } catch (e) {
      throw new Error(`Failed to parse JSON-LD script tag: ${e.message}\nContent snippet: ${match[1].slice(0, 100)}`);
    }
  }
  return results;
}

const indexHtmlPath = path.join(rootDir, ".next/server/app/index.html");
const indexHtml = fs.readFileSync(indexHtmlPath, "utf-8");
const indexJsonLdList = extractJsonLdScripts(indexHtml);

check("index.html contains valid parseable JSON-LD scripts", () => {
  assert.ok(indexJsonLdList.length > 0, "No JSON-LD scripts found in index.html");
});

const unifiedGraph = indexJsonLdList.find((item) => item["@graph"] && Array.isArray(item["@graph"]));

check("index.html contains Schema.org @context and @graph array", () => {
  assert.ok(unifiedGraph, "Missing unified @graph object in index.html");
  assert.equal(unifiedGraph["@context"], "https://schema.org");
});

const graphNodes = unifiedGraph ? unifiedGraph["@graph"] : [];

check("@graph contains Person entity with correct founder details & corporate pedigree", () => {
  const person = graphNodes.find((node) => node["@type"] === "Person");
  assert.ok(person, "Missing Person entity in @graph");
  assert.equal(person.name, "Manny Singh");
  assert.equal(person.jobTitle, "Founder & Creative Technologist");
  assert.ok(person["@id"].endsWith("/#founder"), `Expected @id ending in /#founder, got ${person["@id"]}`);
  assert.ok(Array.isArray(person.sameAs), "sameAs must be an array");
  assert.ok(person.sameAs.includes("https://www.linkedin.com/in/mannysingh"), "Missing LinkedIn in sameAs");
  
  assert.ok(Array.isArray(person.alumniOf), "alumniOf must be an array");
  const alumniNames = person.alumniOf.map((a) => a.name);
  assert.ok(alumniNames.includes("Salesforce"), "Missing Salesforce");
  assert.ok(alumniNames.includes("United Airlines"), "Missing United Airlines");
  assert.ok(alumniNames.includes("Morgan Stanley"), "Missing Morgan Stanley");
  assert.ok(alumniNames.includes("Banco Santander"), "Missing Banco Santander");
});

check("@graph contains LocalBusiness / ProfessionalService with Houston coordinates 29.7604, -95.3698", () => {
  const studio = graphNodes.find((node) => {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    return types.includes("ProfessionalService") || types.includes("LocalBusiness");
  });
  assert.ok(studio, "Missing ProfessionalService/LocalBusiness entity in @graph");
  assert.equal(studio.name, "Reel & Rank");
  assert.ok(studio["@id"].endsWith("/#studio"), `Expected @id ending in /#studio, got ${studio["@id"]}`);
  assert.equal(studio.email, "hello@reelandrank.com");
  
  assert.ok(studio.geo, "Missing geo property on studio");
  assert.equal(studio.geo["@type"], "GeoCoordinates");
  assert.equal(studio.geo.latitude, 29.7604, "Latitude must be 29.7604");
  assert.equal(studio.geo.longitude, -95.3698, "Longitude must be -95.3698");
  
  assert.ok(studio.address, "Missing address on studio");
  assert.equal(studio.address.addressLocality, "Houston");
  assert.equal(studio.address.addressRegion, "Texas");
  assert.equal(studio.address.addressCountry, "US");

  assert.ok(studio.hasOfferCatalog, "Missing hasOfferCatalog on studio");
  assert.ok(studio.hasOfferCatalog["@id"].endsWith("/#catalog"), "hasOfferCatalog must point to #catalog");
});

check("@graph contains OfferCatalog linking 5 offers", () => {
  const catalog = graphNodes.find((node) => node["@type"] === "OfferCatalog");
  assert.ok(catalog, "Missing OfferCatalog in @graph");
  assert.ok(catalog["@id"].endsWith("/#catalog"));
  assert.ok(Array.isArray(catalog.itemListElement), "itemListElement must be array");
  assert.equal(catalog.itemListElement.length, 5, "Expected 5 offers in catalog list");
});

check("@graph contains 5 Offer entities with prices, USD currency, and itemOffered Service", () => {
  const offerNodes = graphNodes.filter((node) => node["@type"] === "Offer");
  assert.equal(offerNodes.length, 5, `Expected 5 Offer nodes in @graph, found ${offerNodes.length}`);
  
  const expectedPrices = [250, 500, 1000, 1000, 2000];
  const actualPrices = offerNodes.map((o) => o.price).sort((a, b) => a - b);
  assert.deepEqual(actualPrices, expectedPrices.sort((a, b) => a - b), "Offer prices do not match expected starting prices");

  for (const offer of offerNodes) {
    assert.equal(offer.priceCurrency, "USD");
    assert.ok(offer.seller && offer.seller["@id"].endsWith("/#studio"), "Seller must point to #studio");
    assert.ok(offer.itemOffered, `Missing itemOffered on offer ${offer.name}`);
    assert.equal(offer.itemOffered["@type"], "Service");
    assert.ok(offer.itemOffered.description, "itemOffered must include description (directAnswer)");
  }
});

// Check VideoObject in /work and all /work/[slug] pages
check("work.html contains VideoObject structured metadata for all films", () => {
  const workHtmlPath = path.join(rootDir, ".next/server/app/work.html");
  assert.ok(fs.existsSync(workHtmlPath), "Missing work.html");
  const workHtml = fs.readFileSync(workHtmlPath, "utf-8");
  const workJsonLdList = extractJsonLdScripts(workHtml);
  const videoObjects = workJsonLdList.flatMap((item) => {
    if (Array.isArray(item)) return item.filter((n) => n["@type"] === "VideoObject");
    if (item["@type"] === "VideoObject") return [item];
    return [];
  });
  
  assert.ok(videoObjects.length > 0, "No VideoObject items found on work.html");
  console.log(`     Found ${videoObjects.length} VideoObject items on /work`);
  
  for (const video of videoObjects) {
    assert.ok(video.name, "VideoObject missing name");
    assert.ok(video.description, "VideoObject missing description");
    assert.ok(Array.isArray(video.thumbnailUrl) && video.thumbnailUrl.length > 0, "Missing thumbnailUrl");
    assert.ok(video.contentUrl, "Missing contentUrl");
    assert.ok(video.uploadDate, "Missing uploadDate");
    assert.match(video.uploadDate, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, "uploadDate must be ISO 8601");
    if (video.duration) {
      assert.match(video.duration, /^PT\d+S$/, "duration must follow ISO 8601 (e.g. PT15S)");
    }
  }
});

const workSlugs = ["flavors-chase-me", "autumn-cover-motion", "fall-spice-reel", "brand-store-loop"];
workSlugs.forEach((slug) => {
  check(`work/${slug}.html contains VideoObject metadata for project films`, () => {
    const slugPath = path.join(rootDir, `.next/server/app/work/${slug}.html`);
    assert.ok(fs.existsSync(slugPath), `Missing ${slugPath}`);
    const html = fs.readFileSync(slugPath, "utf-8");
    const jsonLdList = extractJsonLdScripts(html);
    const videoObjects = jsonLdList.flatMap((item) => {
      if (Array.isArray(item)) return item.filter((n) => n["@type"] === "VideoObject");
      if (item["@type"] === "VideoObject") return [item];
      return [];
    });
    assert.ok(videoObjects.length > 0, `No VideoObject found in work/${slug}.html`);
    for (const vo of videoObjects) {
      assert.ok(vo.name, "Missing video name");
      assert.ok(vo.contentUrl, "Missing video contentUrl");
      assert.ok(vo.thumbnailUrl && vo.thumbnailUrl.length > 0, "Missing video thumbnailUrl");
    }
  });
});

offers.forEach((offer) => {
  check(`offers/${offer.slug}.html contains individual Offer JSON-LD linking to #studio`, () => {
    const slugPath = path.join(rootDir, `.next/server/app/offers/${offer.slug}.html`);
    assert.ok(fs.existsSync(slugPath), `Missing ${slugPath}`);
    const html = fs.readFileSync(slugPath, "utf-8");
    const jsonLdList = extractJsonLdScripts(html);
    const offerNode = jsonLdList.find((item) => item["@type"] === "Offer");
    assert.ok(offerNode, `Missing Offer JSON-LD in ${offer.slug}.html`);
    assert.equal(offerNode.priceCurrency, "USD");
    assert.equal(offerNode.price, offer.priceFrom);
    assert.ok(offerNode.seller && offerNode.seller["@id"].endsWith("/#studio"), "Seller must point to #studio");
    assert.ok(offerNode.itemOffered, "Missing itemOffered in offerJsonLd");
    assert.equal(offerNode.itemOffered.description, offer.directAnswer, "itemOffered description must equal directAnswer");
  });
});

// -----------------------------------------------------------------------------
// SUITE 6: robots.txt Rules Verification
// -----------------------------------------------------------------------------
console.log("\nSUITE 6: robots.txt AI Crawler Allowances");

const robotsContent = fs.existsSync(robotsBodyPath) ? fs.readFileSync(robotsBodyPath, "utf-8") : "";

check("robots.txt body contains GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended", () => {
  assert.match(robotsContent, /User-Agent:\s*GPTBot/i);
  assert.match(robotsContent, /User-Agent:\s*ClaudeBot/i);
  assert.match(robotsContent, /User-Agent:\s*PerplexityBot/i);
  assert.match(robotsContent, /User-Agent:\s*CCBot/i);
  assert.match(robotsContent, /User-Agent:\s*Google-Extended/i);
});

check("robots.txt body explicitly allows /llms.txt and /llms-full.txt", () => {
  assert.match(robotsContent, /Allow:\s*\/llms\.txt/i);
  assert.match(robotsContent, /Allow:\s*\/llms-full\.txt/i);
});

// -----------------------------------------------------------------------------
// SUMMARY & VERDICT
// -----------------------------------------------------------------------------
console.log("\n================================================================================");
console.log(`  VERIFICATION RESULTS: ${passedChecks} / ${totalChecks} PASSED`);
if (failureList.length > 0) {
  console.log(`  FAILURES: ${failureList.length}`);
  failureList.forEach((f, i) => console.log(`   ${i + 1}. ${f.title} :: [${f.error.split("\n")[0]}]`));
  console.log("  VERDICT: FAIL");
  console.log("================================================================================\n");
  process.exit(1);
} else {
  console.log("  FAILURES: 0");
  console.log("  VERDICT: APPROVE");
  console.log("================================================================================\n");
  process.exit(0);
}
