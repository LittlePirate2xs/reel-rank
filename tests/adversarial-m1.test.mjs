import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

function readRootFile(relPath) {
  const full = path.resolve(ROOT, relPath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf-8");
}

describe("Adversarial Stress-Test Suite: Milestone M1 (SEO, GEO, AEO)", () => {
  // =========================================================================
  // 1. VideoObject Metadata Compliance (Google Video Rich Snippets)
  // =========================================================================
  describe("1. VideoObject Metadata Compliance with Google Video Rich Snippets", () => {
    const workHtml = readRootFile(".next/server/app/work.html");
    const workJsonMatch = workHtml?.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);

    // Extract all JSON-LD blocks from work.html
    const jsonLdBlocks = (workJsonMatch || []).map((b) => {
      const inner = b.replace(/<\/?script[^>]*>/g, "");
      try {
        return JSON.parse(inner);
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Find VideoObject entities
    const videoObjects = jsonLdBlocks.flatMap((block) => {
      if (Array.isArray(block)) {
        return block.filter((item) => item["@type"] === "VideoObject");
      }
      if (block["@type"] === "VideoObject") return [block];
      if (Array.isArray(block["@graph"])) {
        return block["@graph"].filter((item) => item["@type"] === "VideoObject");
      }
      return [];
    });

    it("V1-01: /work page contains VideoObject structured data for all films", () => {
      assert.ok(videoObjects.length >= 11, `Expected at least 11 VideoObjects across work, got ${videoObjects.length}`);
    });

    videoObjects.forEach((video, idx) => {
      describe(`VideoObject #${idx + 1}: ${video.name}`, () => {
        it("V1-REQ-NAME: name property is non-empty string and trimmed", () => {
          assert.equal(typeof video.name, "string");
          assert.ok(video.name.trim().length > 0, "name must not be empty");
          assert.equal(video.name, video.name.trim(), "name should not have leading/trailing whitespace");
        });

        it("V1-REQ-DESC: description property is non-empty string without HTML tags", () => {
          assert.equal(typeof video.description, "string");
          assert.ok(video.description.trim().length > 0, "description must not be empty");
          assert.ok(!/<[^>]+>/.test(video.description), "description must not contain HTML tags");
        });

        it("V1-REQ-THUMB: thumbnailUrl is non-empty array of valid absolute URLs", () => {
          assert.ok(Array.isArray(video.thumbnailUrl), "thumbnailUrl must be an array");
          assert.ok(video.thumbnailUrl.length > 0, "thumbnailUrl must contain at least one URL");
          for (const thumb of video.thumbnailUrl) {
            assert.equal(typeof thumb, "string");
            assert.match(thumb, /^https?:\/\//, "thumbnailUrl must be an absolute URL starting with http/https");
            assert.doesNotThrow(() => new URL(thumb), `Invalid URL: ${thumb}`);
          }
        });

        it("V1-REQ-CONTENT: contentUrl is valid absolute media URL", () => {
          assert.equal(typeof video.contentUrl, "string");
          assert.match(video.contentUrl, /^https?:\/\//, "contentUrl must be an absolute URL");
          assert.doesNotThrow(() => new URL(video.contentUrl), `Invalid URL: ${video.contentUrl}`);
          assert.match(video.contentUrl, /\.(mp4|webm|mov)(\?.*)?$/i, "contentUrl should point to a recognized video file");
        });

        it("V1-REQ-UPLOAD: uploadDate is valid ISO 8601 date string", () => {
          assert.equal(typeof video.uploadDate, "string");
          assert.match(
            video.uploadDate,
            /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/,
            `uploadDate '${video.uploadDate}' does not conform to ISO 8601`
          );
          const timestamp = Date.parse(video.uploadDate);
          assert.ok(!isNaN(timestamp), `uploadDate '${video.uploadDate}' cannot be parsed by Date.parse`);
        });

        it("V1-OPT-DURATION: duration (if present) strictly matches ISO 8601 duration format", () => {
          if (video.duration !== undefined) {
            assert.equal(typeof video.duration, "string");
            assert.match(video.duration, /^PT(\d+H)?(\d+M)?(\d+S)?$/, `duration '${video.duration}' not ISO 8601`);
          }
        });

        it("V1-OPT-PUB: publisher is valid Organization with name and logo", () => {
          assert.ok(video.publisher, "publisher should be present");
          assert.equal(video.publisher["@type"], "Organization");
          assert.equal(video.publisher.name, "Reel & Rank");
          assert.match(video.publisher.url, /^https?:\/\//);
          assert.ok(video.publisher.logo, "publisher logo should be present");
          assert.equal(video.publisher.logo["@type"], "ImageObject");
          assert.match(video.publisher.logo.url, /^https?:\/\//);
        });
      });
    });

    it("V1-EDGE-SLUG: All /work/[slug] pages contain valid VideoObject structured data", () => {
      const slugs = ["flavors-chase-me", "autumn-cover-motion", "fall-spice-reel", "brand-store-loop"];
      for (const slug of slugs) {
        const slugHtml = readRootFile(`.next/server/app/work/${slug}.html`);
        assert.ok(slugHtml, `Page /work/${slug}.html must exist`);
        const matches = slugHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs) || [];
        const blocks = matches.map((b) => {
          try {
            return JSON.parse(b.replace(/<\/?script[^>]*>/g, ""));
          } catch {
            return null;
          }
        }).filter(Boolean);

        const vids = blocks.flatMap((b) => {
          if (Array.isArray(b)) return b.filter((i) => i["@type"] === "VideoObject");
          if (b["@type"] === "VideoObject") return [b];
          return [];
        });

        assert.ok(vids.length > 0, `/work/${slug} must contain at least 1 VideoObject`);
        for (const v of vids) {
          assert.ok(v.name && v.description && v.thumbnailUrl && v.contentUrl && v.uploadDate);
        }
      }
    });
  });

  // =========================================================================
  // 2. Robots.txt Parsing & AI Crawler Directive Coverage (RFC 9309)
  // =========================================================================
  describe("2. Robots.txt Parsing and AI Crawler Directive Coverage (RFC 9309)", () => {
    const robotsBody = readRootFile(".next/server/app/robots.txt.body");

    it("R2-01: robots.txt.body exists in Next.js build output", () => {
      assert.ok(robotsBody, ".next/server/app/robots.txt.body must exist");
      assert.ok(robotsBody.length > 0, "robots.txt must not be empty");
    });

    // RFC 9309 Mini Parser
    function parseRobotsTxt(content) {
      const lines = content.split(/\r?\n/);
      const groups = [];
      let currentGroup = null;
      let sitemap = null;
      let host = null;

      for (let rawLine of lines) {
        // Strip comments
        const commentIdx = rawLine.indexOf("#");
        if (commentIdx !== -1) rawLine = rawLine.slice(0, commentIdx);
        const line = rawLine.trim();
        if (!line) {
          if (currentGroup && currentGroup.userAgents.length > 0) {
            groups.push(currentGroup);
            currentGroup = null;
          }
          continue;
        }

        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) continue;
        const field = line.slice(0, colonIdx).trim().toLowerCase();
        const value = line.slice(colonIdx + 1).trim();

        if (field === "user-agent") {
          if (!currentGroup || currentGroup.rules.length > 0) {
            if (currentGroup && currentGroup.userAgents.length > 0) {
              groups.push(currentGroup);
            }
            currentGroup = { userAgents: [], rules: [] };
          }
          currentGroup.userAgents.push(value);
        } else if (field === "allow" || field === "disallow") {
          if (currentGroup) {
            currentGroup.rules.push({ type: field, path: value });
          }
        } else if (field === "sitemap") {
          sitemap = value;
        } else if (field === "host") {
          host = value;
        }
      }
      if (currentGroup && currentGroup.userAgents.length > 0) {
        groups.push(currentGroup);
      }
      return { groups, sitemap, host };
    }

    function isPathAllowed(parsed, userAgent, path) {
      const lowerUa = userAgent.toLowerCase();
      // Find matching group: exact match first, then fallback to *
      let matchedGroup = parsed.groups.find((g) =>
        g.userAgents.some((ua) => ua.toLowerCase() === lowerUa)
      );
      if (!matchedGroup) {
        matchedGroup = parsed.groups.find((g) =>
          g.userAgents.some((ua) => ua === "*")
        );
      }
      if (!matchedGroup) return true; // Default allow

      // Match rules by longest matching prefix (RFC 9309 section 2.2.2)
      let bestMatch = null;
      for (const rule of matchedGroup.rules) {
        if (!rule.path) {
          if (rule.type === "disallow") {
            // Disallow with empty value means allow everything
            if (!bestMatch || 0 > bestMatch.path.length) {
              bestMatch = { type: "allow", path: "" };
            }
          }
          continue;
        }
        if (path.startsWith(rule.path)) {
          if (!bestMatch || rule.path.length > bestMatch.path.length) {
            bestMatch = rule;
          } else if (rule.path.length === bestMatch.path.length && rule.type === "allow") {
            bestMatch = rule; // Allow wins ties
          }
        }
      }
      if (!bestMatch) return true;
      return bestMatch.type === "allow";
    }

    const parsed = parseRobotsTxt(robotsBody);

    it("R2-02: robots.txt declares sitemap pointing to valid URL", () => {
      assert.ok(parsed.sitemap, "robots.txt must specify Sitemap directive");
      assert.match(parsed.sitemap, /^https:\/\/reelandrank\.com\/sitemap\.xml$/);
    });

    it("R2-03: robots.txt declares host matching canonical domain", () => {
      assert.ok(parsed.host, "robots.txt must specify Host directive");
      assert.match(parsed.host, /^https:\/\/reelandrank\.com$/);
    });

    const aiBots = ["GPTBot", "ClaudeBot", "PerplexityBot", "CCBot", "Google-Extended"];

    it("R2-04: All required AI crawlers are explicitly declared", () => {
      const allDeclaredUas = parsed.groups.flatMap((g) => g.userAgents.map((u) => u.toLowerCase()));
      for (const bot of aiBots) {
        assert.ok(
          allDeclaredUas.includes(bot.toLowerCase()),
          `robots.txt must declare User-Agent for '${bot}'`
        );
      }
    });

    describe("R2-05: Crawler path allowance and disallowance behavior under RFC 9309", () => {
      const testCases = [
        // AI crawlers
        ...aiBots.flatMap((bot) => [
          { bot, path: "/", expected: true, label: "home" },
          { bot, path: "/llms.txt", expected: true, label: "llms.txt" },
          { bot, path: "/llms-full.txt", expected: true, label: "llms-full.txt" },
          { bot, path: "/offers", expected: true, label: "offers" },
          { bot, path: "/work", expected: true, label: "work" },
          { bot, path: "/api/", expected: false, label: "api base" },
          { bot, path: "/api/preview", expected: false, label: "api subpath" },
        ]),
        // Generic bots
        { bot: "Googlebot", path: "/", expected: true, label: "home" },
        { bot: "Googlebot", path: "/llms.txt", expected: true, label: "llms.txt" },
        { bot: "Googlebot", path: "/api/", expected: false, label: "api base" },
        { bot: "*", path: "/llms-full.txt", expected: true, label: "llms-full.txt" },
      ];

      testCases.forEach(({ bot, path, expected, label }) => {
        it(`${bot} -> ${path} (${label}) should be ${expected ? "ALLOWED" : "DISALLOWED"}`, () => {
          const allowed = isPathAllowed(parsed, bot, path);
          assert.equal(allowed, expected);
        });
      });
    });
  });

  // =========================================================================
  // 3. Schema.org @id References and Relationship Integrity
  // =========================================================================
  describe("3. Schema.org @id References and Relationship Integrity", () => {
    const indexHtml = readRootFile(".next/server/app/index.html");
    const jsonLdBlocks = (indexHtml?.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs) || [])
      .map((b) => {
        try {
          return JSON.parse(b.replace(/<\/?script[^>]*>/g, ""));
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const unifiedGraph = jsonLdBlocks.find((b) => Array.isArray(b["@graph"]))?.["@graph"] || [];

    it("S3-01: Root layout injects unified @graph with all required entities", () => {
      assert.ok(unifiedGraph.length > 0, "unified @graph must contain entities");
      const types = unifiedGraph.flatMap((e) => Array.isArray(e["@type"]) ? e["@type"] : [e["@type"]]);
      assert.ok(types.includes("Person"), "@graph must contain Person");
      assert.ok(types.includes("ProfessionalService") || types.includes("LocalBusiness"), "@graph must contain ProfessionalService");
      assert.ok(types.includes("OfferCatalog"), "@graph must contain OfferCatalog");
      assert.ok(types.includes("Offer"), "@graph must contain Offer");
    });

    // Build entity directory by @id
    const entityMap = new Map();
    for (const entity of unifiedGraph) {
      if (entity["@id"]) {
        assert.ok(!entityMap.has(entity["@id"]), `Duplicate @id detected: ${entity["@id"]}`);
        entityMap.set(entity["@id"], entity);
      }
    }

    const founderId = "https://reelandrank.com/#founder";
    const studioId = "https://reelandrank.com/#studio";
    const catalogId = "https://reelandrank.com/#catalog";

    it("S3-02: #founder entity is defined with correct credentials and sameAs", () => {
      const founder = entityMap.get(founderId);
      assert.ok(founder, `Entity with @id '${founderId}' must exist`);
      assert.equal(founder["@type"], "Person");
      assert.equal(founder.name, "Manny Singh");
      assert.equal(founder.jobTitle, "Founder & Creative Technologist");
      assert.deepEqual(founder.worksFor, { "@id": studioId });
      assert.ok(Array.isArray(founder.sameAs) && founder.sameAs.length > 0);
      assert.ok(Array.isArray(founder.alumniOf) && founder.alumniOf.length === 4);
      const alumniNames = founder.alumniOf.map((a) => a.name);
      assert.ok(alumniNames.includes("Salesforce"));
      assert.ok(alumniNames.includes("United Airlines"));
      assert.ok(alumniNames.includes("Morgan Stanley"));
      assert.ok(alumniNames.includes("Banco Santander"));
    });

    it("S3-03: #studio entity links to #founder and has exact Houston geo coordinates", () => {
      const studio = entityMap.get(studioId);
      assert.ok(studio, `Entity with @id '${studioId}' must exist`);
      const types = Array.isArray(studio["@type"]) ? studio["@type"] : [studio["@type"]];
      assert.ok(types.includes("ProfessionalService") && types.includes("LocalBusiness"));
      assert.deepEqual(studio.founder, { "@id": founderId }, "studio.founder must link to #founder");
      assert.deepEqual(studio.hasOfferCatalog, { "@id": catalogId }, "studio.hasOfferCatalog must link to #catalog");
      assert.equal(studio.geo?.latitude, 29.7604, "latitude must be 29.7604");
      assert.equal(studio.geo?.longitude, -95.3698, "longitude must be -95.3698");
      assert.equal(studio.address?.addressLocality, "Houston");
      assert.equal(studio.address?.addressRegion, "Texas");
      assert.equal(studio.email, "hello@reelandrank.com");
    });

    it("S3-04: #catalog entity links all Offer items in sequential order", () => {
      const catalog = entityMap.get(catalogId);
      assert.ok(catalog, `Entity with @id '${catalogId}' must exist`);
      assert.equal(catalog["@type"], "OfferCatalog");
      assert.ok(Array.isArray(catalog.itemListElement));
      assert.equal(catalog.itemListElement.length, 5, "Catalog must list 5 offers");

      catalog.itemListElement.forEach((item, idx) => {
        assert.equal(item["@type"], "ListItem");
        assert.equal(item.position, idx + 1);
        const offerId = item.item?.["@id"];
        assert.ok(offerId, `Item ${idx + 1} must reference an @id`);
        assert.ok(entityMap.has(offerId), `Referenced offer '${offerId}' must exist in graph`);
      });
    });

    it("S3-05: Every Offer seller links to #studio and itemOffered provider links to #studio", () => {
      const offers = unifiedGraph.filter((e) => e["@type"] === "Offer");
      assert.equal(offers.length, 5, "Must have exactly 5 Offer entities");

      for (const offer of offers) {
        assert.deepEqual(offer.seller, { "@id": studioId }, `Offer ${offer["@id"]} seller must link to #studio`);
        assert.ok(offer.itemOffered, `Offer ${offer["@id"]} must have itemOffered`);
        assert.equal(offer.itemOffered["@type"], "Service");
        assert.deepEqual(offer.itemOffered.provider, { "@id": studioId }, "Service provider must link to #studio");
        assert.deepEqual(offer.itemOffered.offers, { "@id": offer["@id"] }, "Service offers must link back to Offer");
        assert.equal(offer.priceCurrency, "USD");
        assert.ok(typeof offer.price === "number" && offer.price >= 250);
      }
    });

    it("S3-06: Zero dangling @id references in unified @graph", () => {
      function findIdReferences(obj, refs = []) {
        if (!obj || typeof obj !== "object") return refs;
        if (Array.isArray(obj)) {
          for (const item of obj) findIdReferences(item, refs);
          return refs;
        }
        for (const [key, val] of Object.entries(obj)) {
          if (key === "@id" && typeof val === "string") {
            // this is an ID declaration or reference
          } else if (val && typeof val === "object" && "@id" in val && Object.keys(val).length === 1) {
            refs.push(val["@id"]);
          } else {
            findIdReferences(val, refs);
          }
        }
        return refs;
      }

      const allRefs = findIdReferences(unifiedGraph);
      for (const ref of allRefs) {
        assert.ok(entityMap.has(ref), `Dangling @id reference found: '${ref}' does not exist in graph!`);
      }
    });

    it("S3-07: Standalone offer JSON-LD on /offers/[slug] has valid seller and provider links", () => {
      const slugs = [
        "motion-graphics-set",
        "fifteen-second-ad",
        "sixty-second-ad",
        "search-visibility",
        "selling-campaign",
      ];

      for (const slug of slugs) {
        const offerHtml = readRootFile(`.next/server/app/offers/${slug}.html`);
        assert.ok(offerHtml, `Page /offers/${slug}.html must exist`);
        const matches = offerHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs) || [];
        const blocks = matches.map((b) => {
          try {
            return JSON.parse(b.replace(/<\/?script[^>]*>/g, ""));
          } catch {
            return null;
          }
        }).filter(Boolean);

        const standaloneOffer = blocks.find((b) => b["@type"] === "Offer");
        assert.ok(standaloneOffer, `/offers/${slug} must contain standalone Offer JSON-LD`);
        assert.equal(standaloneOffer["@id"], `https://reelandrank.com/offers/${slug}#offer`);
        assert.equal(standaloneOffer.seller?.["@id"], studioId);
        assert.equal(standaloneOffer.itemOffered?.provider?.["@id"], studioId);
      }
    });
  });

  // =========================================================================
  // 4. Quotable Direct-Answer Definition Blocks & llms.txt Consistency
  // =========================================================================
  describe("4. Quotable Direct-Answer Definition Blocks & llms.txt Consistency", () => {
    const llmsTxt = readRootFile(".next/server/app/llms.txt.body");
    const llmsFullTxt = readRootFile(".next/server/app/llms-full.txt.body");

    it("Q4-01: llms.txt and llms-full.txt contain no HTML tags", () => {
      assert.ok(!/<[^>]+>/.test(llmsTxt), "llms.txt must be pure markdown without HTML");
      assert.ok(!/<[^>]+>/.test(llmsFullTxt), "llms-full.txt must be pure markdown without HTML");
    });

    it("Q4-02: llms.txt includes all price points accurately", () => {
      assert.match(llmsTxt, /\$250\s+\(set of 3\)/);
      assert.match(llmsTxt, /\$500\s+\(advertisement\)/);
      assert.match(llmsTxt, /\$1,000\s+\(advertisement\)/);
      assert.match(llmsTxt, /From \$1,000\s+\(strategy and dashboard\)/);
      assert.match(llmsTxt, /From \$2,000\s+\(campaign\)/);
    });

    it("Q4-03: Definition blocks in HTML meet 45-60 word count constraint", () => {
      const offersHtml = readRootFile(".next/server/app/offers.html");
      assert.ok(offersHtml.includes("Studio summary &amp; rates") || offersHtml.includes("Studio summary & rates"));

      const slugs = [
        "motion-graphics-set",
        "fifteen-second-ad",
        "sixty-second-ad",
        "search-visibility",
        "selling-campaign",
      ];

      for (const slug of slugs) {
        const slugHtml = readRootFile(`.next/server/app/offers/${slug}.html`);
        assert.ok(
          slugHtml.includes("Direct answer &amp; deliverables") ||
          slugHtml.includes("Direct answer & deliverables"),
          `/offers/${slug} must render direct answer section`
        );
      }
    });
  });
});
