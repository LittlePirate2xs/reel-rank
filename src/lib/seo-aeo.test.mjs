import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("Starting Milestone M1 SEO, GEO & AEO verification suite...\n");

// 1. Verify llms.txt and llms-full.txt build output
const llmsTxtPath = path.resolve(".next/server/app/llms.txt.body");
const llmsFullTxtPath = path.resolve(".next/server/app/llms-full.txt.body");

assert.ok(fs.existsSync(llmsTxtPath), "llms.txt.body exists in .next build output");
assert.ok(fs.existsSync(llmsFullTxtPath), "llms-full.txt.body exists in .next build output");

const llmsTxt = fs.readFileSync(llmsTxtPath, "utf-8");
const llmsFullTxt = fs.readFileSync(llmsFullTxtPath, "utf-8");

assert.match(llmsTxt, /^# Reel & Rank/, "llms.txt starts with # Reel & Rank header");
assert.match(llmsTxt, /\$250/, "llms.txt contains $250 flat rate");
assert.match(llmsTxt, /\$500/, "llms.txt contains $500 flat rate");
assert.match(llmsTxt, /\$1,000/, "llms.txt contains $1,000 flat rate");
assert.match(llmsTxt, /\$2,000\+?/, "llms.txt contains $2,000 rate");
assert.match(llmsTxt, /Manny Singh/, "llms.txt contains founder Manny Singh");
assert.match(llmsTxt, /Salesforce.*United Airlines.*Morgan Stanley.*Banco Santander/s, "llms.txt contains corporate pedigree");
assert.match(llmsTxt, /29\.7604,\s*-95\.3698/, "llms.txt contains Houston geo coordinates");
assert.match(llmsTxt, /Initial example in one day/, "llms.txt contains turnaround commitments");

console.log("✓ /llms.txt verification passed.");

assert.match(llmsFullTxt, /^# Reel & Rank — Full Studio Specification/, "llms-full.txt has full specification header");
assert.match(llmsFullTxt, /## 1\. Studio Identification & Knowledge Graph/, "llms-full.txt has knowledge graph section");
assert.match(llmsFullTxt, /## 2\. Definitional Answer Summary/, "llms-full.txt has definitional summary");
assert.match(llmsFullTxt, /## 3\. Detailed Offer Catalog & Deliverables/, "llms-full.txt has offer catalog");
assert.match(llmsFullTxt, /## 4\. Career Packages/, "llms-full.txt has career packages");
assert.match(llmsFullTxt, /## 5\. Portfolio & Provenance Policy/, "llms-full.txt has RamanRasa portfolio policy");
assert.match(llmsFullTxt, /Flavors Chase Me/, "llms-full.txt includes portfolio projects");
assert.match(llmsFullTxt, /## 7\. Studio Frequently Asked Questions/, "llms-full.txt includes FAQ");

console.log("✓ /llms-full.txt verification passed.");

// 2. Verify robots.ts rules
const robotsPath = path.resolve("src/app/robots.ts");
const robotsCode = fs.readFileSync(robotsPath, "utf-8");
assert.match(robotsCode, /GPTBot/, "robots.ts allows GPTBot");
assert.match(robotsCode, /ClaudeBot/, "robots.ts allows ClaudeBot");
assert.match(robotsCode, /PerplexityBot/, "robots.ts allows PerplexityBot");
assert.match(robotsCode, /\/llms\.txt/, "robots.ts explicitly allows /llms.txt");

console.log("✓ robots.ts AI crawler rules verified.");

// 3. Verify HTML output has unified @graph and VideoObject
const indexPath = path.resolve(".next/server/app/index.html");
const indexHtml = fs.readFileSync(indexPath, "utf-8");

assert.match(indexHtml, /"@context":"https:\/\/schema\.org"/, "index.html contains schema.org context");
assert.match(indexHtml, /"@graph"/, "index.html contains @graph array");
assert.match(indexHtml, /"@type":"Person"/, "index.html contains Person entity");
assert.match(indexHtml, /"name":"Manny Singh"/, "index.html contains Manny Singh");
assert.match(indexHtml, /"latitude":29\.7604,"longitude":-95\.3698/, "index.html contains Houston geo coordinates");
assert.match(indexHtml, /"@type":"OfferCatalog"/, "index.html contains OfferCatalog");
assert.match(indexHtml, /"itemOffered"/, "index.html contains itemOffered Service entities");

console.log("✓ Root layout unified @graph JSON-LD verified.");

const workHtmlPath = path.resolve(".next/server/app/work.html");
const workHtml = fs.readFileSync(workHtmlPath, "utf-8");

assert.match(workHtml, /"@type":"VideoObject"/, "work.html contains VideoObject structured data");
assert.match(workHtml, /"name":"Flavors Chase Me — Part 01"/, "work.html contains film names");
assert.match(workHtml, /"uploadDate":"2025-01-01T00:00:00Z"/, "work.html contains ISO upload dates");
assert.match(workHtml, /"contentUrl":"https:\/\/reelandrank\.com\/media\/films\/film-01\.mp4"/, "work.html contains contentUrl");
assert.match(workHtml, /"duration":"PT15S"/, "work.html contains ISO 8601 duration");

console.log("✓ VideoObject structured metadata verified in /work.");

// 4. Verify offers.html and offer detail html definition blocks
const offersHtmlPath = path.resolve(".next/server/app/offers.html");
const offersHtml = fs.readFileSync(offersHtmlPath, "utf-8");
assert.match(offersHtml, /Studio summary &amp; rates|Studio summary & rates/, "offers.html contains direct-answer block header");
assert.match(offersHtml, /Reel &amp; Rank is a Houston, Texas motion graphics|Reel & Rank is a Houston, Texas motion graphics/, "offers.html contains definition block text");

const motionOfferHtmlPath = path.resolve(".next/server/app/offers/motion-graphics-set.html");
const motionOfferHtml = fs.readFileSync(motionOfferHtmlPath, "utf-8");
assert.match(motionOfferHtml, /Direct answer &amp; deliverables|Direct answer & deliverables/, "motion-graphics-set.html contains direct-answer block");
assert.match(motionOfferHtml, /The Motion Graphics Set from Houston studio Reel &amp; Rank|The Motion Graphics Set from Houston studio Reel & Rank/, "motion-graphics-set.html contains offer definition block text");

console.log("✓ Direct-answer definition blocks verified in HTML pages.");

console.log("\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
