import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, "../../");

/**
 * Read file safely from workspace root.
 * Returns null if file does not exist.
 */
export function readFileSafe(relativePath) {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  try {
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, "utf-8");
    }
  } catch (err) {
    // Return null on read error
  }
  return null;
}

/**
 * Check if a file or directory exists.
 */
export function exists(relativePath) {
  return fs.existsSync(path.resolve(PROJECT_ROOT, relativePath));
}

/**
 * Count words in a string according to whitespace partitioning.
 */
export function countWords(str) {
  if (!str || typeof str !== "string") return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Parse JSON-LD script blocks from an HTML-like string or JSX file.
 */
export function extractJsonLdBlocks(content) {
  if (!content) return [];
  const regex = /<script\s+type=["']application\/ld\+json["'][\s\S]*?>([\s\S]*?)<\/script>/gi;
  const blocks = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

/**
 * Validate unified Schema.org graph entity structure.
 */
export function validateUnifiedGraph(graphObj, oracle) {
  const errors = [];
  if (!graphObj || typeof graphObj !== "object") {
    return ["Root JSON-LD is not an object"];
  }
  if (graphObj["@context"] !== "https://schema.org") {
    errors.push(`Expected @context to be 'https://schema.org', got '${graphObj["@context"]}'`);
  }
  if (!Array.isArray(graphObj["@graph"])) {
    errors.push("Expected @graph array");
    return errors;
  }

  const graph = graphObj["@graph"];

  // 1. Person entity
  const person = graph.find(
    (e) => e["@type"] === "Person" || (Array.isArray(e["@type"]) && e["@type"].includes("Person"))
  );
  if (!person) {
    errors.push("Missing Person entity in @graph");
  } else {
    if (person.name !== oracle.studio.foundedBy) {
      errors.push(`Person name expected '${oracle.studio.foundedBy}', got '${person.name}'`);
    }
    const corpHistoryStr = JSON.stringify(person);
    for (const corp of oracle.studio.corporateHistory) {
      if (!corpHistoryStr.includes(corp)) {
        errors.push(`Person missing corporate history credential '${corp}'`);
      }
    }
  }

  // 2. LocalBusiness / ProfessionalService entity
  const studio = graph.find(
    (e) =>
      e["@type"] === "ProfessionalService" ||
      e["@type"] === "LocalBusiness" ||
      (Array.isArray(e["@type"]) &&
        (e["@type"].includes("ProfessionalService") || e["@type"].includes("LocalBusiness")))
  );
  if (!studio) {
    errors.push("Missing ProfessionalService/LocalBusiness entity in @graph");
  } else {
    if (studio.name !== oracle.studio.name) {
      errors.push(`Studio name expected '${oracle.studio.name}', got '${studio.name}'`);
    }
    if (!studio.geo || typeof studio.geo !== "object") {
      errors.push("Studio missing 'geo' GeoCoordinates object");
    } else {
      if (Math.abs(studio.geo.latitude - oracle.studio.latitude) > 0.001) {
        errors.push(
          `Studio latitude expected ${oracle.studio.latitude}, got ${studio.geo.latitude}`
        );
      }
      if (Math.abs(studio.geo.longitude - oracle.studio.longitude) > 0.001) {
        errors.push(
          `Studio longitude expected ${oracle.studio.longitude}, got ${studio.geo.longitude}`
        );
      }
    }
  }

  // 3. OfferCatalog entity
  const catalog = graph.find(
    (e) =>
      e["@type"] === "OfferCatalog" ||
      (Array.isArray(e["@type"]) && e["@type"].includes("OfferCatalog"))
  );
  if (!catalog) {
    errors.push("Missing OfferCatalog entity in @graph");
  }

  // 4. Offer entities
  const offers = graph.filter(
    (e) => e["@type"] === "Offer" || (Array.isArray(e["@type"]) && e["@type"].includes("Offer"))
  );
  if (offers.length === 0) {
    errors.push("Missing Offer entities in @graph");
  }

  return errors;
}

/**
 * Validate VideoObject schema entity.
 */
export function validateVideoObject(videoObj) {
  const errors = [];
  if (!videoObj || typeof videoObj !== "object") {
    return ["VideoObject is not an object"];
  }
  if (videoObj["@type"] !== "VideoObject") {
    errors.push(`Expected @type 'VideoObject', got '${videoObj["@type"]}'`);
  }
  if (!videoObj.name || typeof videoObj.name !== "string") {
    errors.push("VideoObject missing or invalid 'name'");
  }
  if (!videoObj.description || typeof videoObj.description !== "string") {
    errors.push("VideoObject missing or invalid 'description'");
  }
  if (!videoObj.thumbnailUrl) {
    errors.push("VideoObject missing 'thumbnailUrl'");
  }
  if (!videoObj.contentUrl) {
    errors.push("VideoObject missing 'contentUrl'");
  }
  if (!videoObj.uploadDate) {
    errors.push("VideoObject missing 'uploadDate'");
  } else if (!/^\d{4}-\d{2}-\d{2}/.test(videoObj.uploadDate)) {
    errors.push(`VideoObject 'uploadDate' not ISO 8601: '${videoObj.uploadDate}'`);
  }
  return errors;
}

/**
 * Extract directAnswer string for a specific offer slug, handling internal apostrophes.
 */
export function extractDirectAnswer(content, slug) {
  if (!content) return null;
  const slugIdx = content.indexOf(`slug: "${slug}"`);
  if (slugIdx === -1) return null;
  const directIdx = content.indexOf("directAnswer:", slugIdx);
  if (directIdx === -1) return null;
  const quoteStart = content.indexOf('"', directIdx);
  if (quoteStart === -1) return null;
  const quoteEnd = content.indexOf('",', quoteStart + 1);
  if (quoteEnd === -1) return null;
  return content.slice(quoteStart + 1, quoteEnd);
}

/**
 * Extract offersDirectAnswer string from content.
 */
export function extractOffersDirectAnswer(content) {
  if (!content) return null;
  const match = content.match(/offersDirectAnswer\s*=\s*"([\s\S]*?)";/);
  return match ? match[1] : null;
}
