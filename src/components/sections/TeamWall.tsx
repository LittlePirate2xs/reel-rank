import { MediaFrame } from "@/components/primitives/MediaFrame";
import { Reveal } from "@/components/primitives/Reveal";
import { SplitText } from "@/components/primitives/SplitText";
import { team, teamIntro } from "@/content/team";
import { cn } from "@/lib/cn";
import { stagger } from "@/lib/motion";

/* ============================================================================
   Team — one typographic composition, not three identical cards.

   Manny is publicly named, so he leads the composition: the largest name, his
   portrait, the full bio. The other two members are deliberately un-named role
   slots (`name === ""`), so each one leads with its ROLE and reads as a line in
   a ruled list rather than as a card that is missing a name.

   Portraits are optional on every entry. Nothing reserves space for a portrait
   that does not exist, so `portrait: null` leaves no hole — the composition is
   portrait-then-text for the lead, and no card grid anywhere.
   ========================================================================= */

/** "Three people. All in." — the closing sentence carries the accent. */
const headingSentences = teamIntro.heading.split(". ");
const accentPhrase =
  headingSentences.length > 1
    ? headingSentences[headingSentences.length - 1]
    : "";
const accentWords = accentPhrase.split(/\s+/).filter((word) => word.length > 0);

export function TeamWall() {
  const leadMember = team.find((member) => member.name.length > 0) ?? null;
  const roleSlots = team.filter((member) => member.name.length === 0);

  return (
    <section aria-labelledby="team" className="section-y">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-20">
          <h2 id="team" className="text-display-2 text-paper">
            <SplitText text={teamIntro.heading} accentWords={accentWords} />
          </h2>

          <p className="u-measure text-lead text-ash lg:pb-3">
            {teamIntro.body}
          </p>
        </div>

        <div className="mt-16 grid gap-16 sm:mt-24 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-24">
          {/* The lead entry. Deliberately the only one with a portrait. */}
          {leadMember ? (
            <Reveal>
              {leadMember.portrait ? (
                <MediaFrame
                  asset={leadMember.portrait}
                  ratio="4 / 5"
                  sizes="(min-width: 1024px) 30vw, 92vw"
                  className="rounded-md lg:max-w-md"
                />
              ) : null}

              <h3
                className={cn(
                  "text-display-3 text-paper",
                  /* No portrait: no gap. The composition never leans on it. */
                  leadMember.portrait && "mt-10",
                )}
              >
                {leadMember.name}
              </h3>
              <p className="u-eyebrow mt-4">{leadMember.role}</p>
              <p className="u-measure mt-6 text-lead text-paper">
                {leadMember.focus}
              </p>
              <p className="u-measure mt-4 text-ash">{leadMember.bio}</p>
            </Reveal>
          ) : null}

          <div className="lg:flex lg:flex-col lg:justify-between lg:gap-16">
            {roleSlots.length > 0 ? (
              <ul className="divide-y divide-ink-700 border-y border-ink-700">
                {roleSlots.map((member, index) => (
                  <li key={member.id} className="py-8">
                    <Reveal delay={stagger(index, 70)}>
                      <h3 className="text-display-4 text-paper">
                        {member.role}
                      </h3>
                      <p className="mt-3 text-paper">{member.focus}</p>
                      <p className="u-measure mt-3 text-sm text-ash">
                        {member.bio}
                      </p>

                      {member.portrait ? (
                        <MediaFrame
                          asset={member.portrait}
                          ratio="1 / 1"
                          sizes="(min-width: 1024px) 22vw, 60vw"
                          className="mt-6 w-40 rounded-sm"
                        />
                      ) : null}
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : null}

            <p className="u-measure mt-10 text-sm text-ash lg:mt-0">
              {teamIntro.founded}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
