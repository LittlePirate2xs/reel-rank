# public/media

Drop real media here, then run:

```powershell
powershell -File scripts\wire-media.ps1 -ScanOnly
```

That regenerates `src/lib/media-availability.ts`, and any asset whose file is now
present stops rendering its placeholder frame. No component changes are needed.

## Layout

```
media/
  films/     film-01.mp4 ... film-08.mp4   and film-01.jpg ... film-08.jpg (posters)
  motion/    motion-01.mp4 ... motion-03.mp4  and matching .jpg posters
  campaign/  flavors-chase-me.jpg, still-01.jpg ... still-04.jpg
  team/      manny.jpg, teammate2.jpg, teammate3.jpg
  studio/    studio-01.jpg ... studio-03.jpg
  brand/     logo.svg, mark.svg, og-fallback.jpg
```

Posters are what every grid, card and rail draws. A video needs its .mp4 only to
be *played*, so a film with a poster looks finished everywhere while the player
still reports honestly that the file is not wired yet.

## What is in here now

The .jpg files are **demo stand-ins** fetched from
[Openverse](https://openverse.org) by `scripts/fetch-demo-images.py`. They are
not the studio's work and must not ship as portfolio content. Their creators and
licences are recorded in STOCK-CREDITS.json.

To remove them and go back to the designed placeholder frames, delete the .jpg
files and re-run `scripts\wire-media.ps1 -ScanOnly`.

## What is still missing

- `team/manny.jpg` - deliberately left as a placeholder. Putting a stock photo of
  a stranger where a real, named person is credited would misrepresent him.
- All .mp4 files.
- `brand/logo.svg` and `brand/mark.svg` - the wordmark is typeset, so no image is
  needed.

Full details are in [docs/MEDIA.md](../../docs/MEDIA.md).