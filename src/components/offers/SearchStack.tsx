import { Reveal } from "@/components/primitives/Reveal";
import { getOffer } from "@/content/offers";
import { stagger } from "@/lib/motion";

/* ============================================================================
   SearchStack — why SEO, GEO and AEO are three different jobs.

   The three acronyms are genuinely parallel, so they get equal treatment: one
   stacked list sharing a single left rule. No icon tiles, no numbered labels,
   no three-card grid.

   Where the words come from
   -------------------------
   Acronyms and their expansions are read back out of the search offer's own
   `deliverables` in `@/content/offers` ("SEO · Search engine optimization" and
   so on), so the panel and this explainer can never drift apart. The one-line
   explanations are written here in plain language — what each surface actually
   does for a business, with no promises attached.

   Server component. Owns its own `<ul aria-label>`.

   If a deliverable line ever stops matching the "ACRONYM · Expansion" shape,
   that item is dropped rather than filled in with invented copy — check the
   search offer's `deliverables` if this list ever looks short.
   ========================================================================= */

type SearchItem = {
  acronym: string;
  expansion: string;
  explain: string;
};

/** The offer whose deliverables carry the three acronym lines. */
const SEARCH_OFFER_SLUG = "search-visibility";

/** `"SEO · Search engine optimization"` -> acronym + expansion. */
const DELIVERABLE = /^([A-Z]{3})\s*·\s*(.+)$/;

/** Plain-language explanation per acronym. No claim, no price, no timeline. */
const EXPLANATIONS: Record<string, string> = {
  SEO: "Someone searching for what you sell finds your pages and profiles.",
  GEO: "Chat assistants and AI answers can read your pages and name you as the source.",
  AEO: "A full-sentence question gets a direct answer that names your business.",
};

/** Build the three items from content, keeping the offer's own order. */
function readSearchItems(): SearchItem[] {
  const offer = getOffer(SEARCH_OFFER_SLUG);
  if (!offer) return [];

  const items: SearchItem[] = [];
  for (const line of offer.deliverables) {
    const match = DELIVERABLE.exec(line);
    if (!match) continue;

    const explain = EXPLANATIONS[match[1]];
    if (explain === undefined) continue;

    items.push({ acronym: match[1], expansion: match[2], explain });
  }
  return items;
}

export function SearchStack() {
  const items = readSearchItems();

  return (
    <ul
      aria-label="How each search surface finds a business"
      className="border-l border-[color:var(--line)]"
    >
      {items.map((item, index) => (
        <Reveal
          as="li"
          key={item.acronym}
          delay={stagger(index, 70)}
          y={10}
          className="py-7 pl-6 sm:py-8 sm:pl-10"
        >
          <h3>
            {/*
              Inline, not flex: the acronym and the expansion then share a text
              baseline by default, and the real space between them keeps the
              heading's accessible name readable ("SEO Search engine ...").
            */}
            <span className="mr-3 font-mono text-2xl font-medium tracking-[0.02em] text-flare sm:text-3xl">
              {item.acronym}
            </span>{" "}
            <span className="font-sans text-sm font-normal text-ash">{item.expansion}</span>
          </h3>
          <p className="u-measure mt-3 text-paper">{item.explain}</p>
        </Reveal>
      ))}
    </ul>
  );
}
