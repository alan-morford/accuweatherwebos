# AccuWeather webOS radar — fix plan

## The app

`com.accuweather.palm.purchased` v1.0.6 (extracted from
`com.accuweather.palm.purchased_1.0.6_all.ipk` into `extracted/` in this
folder — a real webOS ipk, so this is genuine source, not guesswork). It's
a **Mojo**-framework app (Palm's pre-Enyo SDK, `Copyright © 2009
AccuWeather, Inc.` in the file headers) — older and structurally different
from our own `com.usatoday.webos` (Enyo). This is codepoet80's "last
patched build" — not his own original work, a patched copy of AccuWeather's
real historical app.

**Forecast and search are already fixed.** `app/services/weather-data.js`
and `app/services/location-search.js` already point at
`weather.webosarchive.org` (accuweatherxml-proxy's live domain), not the
original dead `accu-weather.com`. Confirmed by reading the extracted source
directly — no guessing needed there.

**Radar is not fixed.** `app/services/radar-image.js` still points at
`http://wapv4.accu-weather.com/nmigs/...`, which has been dead since
AccuWeather retired the old API. This is the one broken piece — the rest of
the app works.

## How the app's radar system actually works

Read directly from `app/services/radar-image.js` and
`app/assistants/radar-assistant.js`. This is a **completely different, much
older system** than the tile-pyramid `l2radar.xml`/`dataLocation` scheme
found in `accuweatherxml-proxy`'s `XMLPayloads/` folder (those reference
payloads are from a *later* AccuWeather app generation we don't have an ipk
for — irrelevant here). This app's radar is a single flat raster image per
request, not a zoomable tile map:

1. `GET /nmigs/acx.aspx?cb=<random>` (the "crypto feed") → returns XML
   `<acx>ENCRYPTED_TOKEN</acx>`. The client decrypts it with a simple
   character-interleaving reversal (`decryptToken`) into a `token` string.
2. `GET /nmigs/wapv4.aspx` with query params: `token`, `imagewidth`,
   `imageheight`, `mx` (lon), `my` (lat), `ux`, `uy` (original/un-panned
   lon/lat), `imagesource` (`US_SIR` / `WORLD_IR` / `HI_RE` for Hawaii /
   `AL_RE` for Alaska), `geowidth` (miles across — one of `50, 100, 200,
   400, 800, 1600, 3200, 6400`, default `400`), `layers` (an opaque bitmask
   string), `ulabel`, and — **only for the animated/"Play" case** —
   `framecount=5`, `interval` (`15` min US / `60` min international),
   `imageformat=gif`. The response is assigned straight to `<img>.src`.

**Key simplification: we own both endpoints, so the token is meaningless.**
`decryptToken` never throws on a short/empty string (uses `.substr`, which
is safe out-of-range in JS), and nothing we build needs to verify it. So:
- `/nmigs/acx.aspx` can return a trivial fixed placeholder token.
- `/nmigs/wapv4.aspx` can ignore `token`/`layers`/`ulabel` entirely.

**lat/lon/cityName/stateName are already available** — they come from the
*already-fixed* `weather-data.asp` response. Confirmed
`accuweather-proxy.php` (in `webOSArchive/accuweatherxml-proxy`) already
emits `<lat>`/`<lon>` inside `<local>`. `isInternational` is derived
client-side as `stateName.length > 2 && stateName !== "United States"` —
presumably correct already (AccuWeather's API likely returns 2-letter
codes for US states specifically to make this work) but worth a live
sanity check once radar is wired up, not something to preemptively "fix."

Zoom (`+`/`-` buttons) and pan (click-drag) are implemented **entirely
client-side** by re-requesting `/nmigs/wapv4.aspx` with a new
`geowidth`/`mx`/`my` — see `zoomIn`/`zoomOut`/`recenterRadar` in
`radar-assistant.js`. The pan math already assumes an equatorial
approximation (`gMilesPerDegree = 67.61562`) — reuse that same assumption
server-side for consistency with what the client thinks it asked for.

## What "fixing" it means, concretely

Two new endpoints, reachable wherever `wapv4.accu-weather.com` traffic
currently gets redirected (same hosts-file/SSL-bump mechanism already
redirecting the forecast/search domains — **verify it also covers this
specific subdomain**, it may currently be scoped to just the domains
`weather-data.js`/`location-search.js` use):

1. `GET /nmigs/acx.aspx` → dummy XML, e.g. `<?xml version="1.0"?><acx>0</acx>`.
2. `GET /nmigs/wapv4.aspx` → parse the params above, build a real radar
   image, return it:
   - Convert `geowidth` (miles) + `mx`/`my` into a bounding box, sized to
     `imagewidth` x `imageheight`.
   - Composite it — reuse the RainViewer+OSM GD pipeline built for
     `maps-proxy`'s `radar-map.php`/`radar-gif.php`
     ([webOSArchive/maps-proxy#1](https://github.com/webOSArchive/maps-proxy/pull/1)),
     generalized: that code assumes a fixed 512x512 output and a fixed
     zoom-6 3x3 tile grid; this needs arbitrary width/height and a
     bbox/zoom picked to comfortably cover the requested `geowidth`. This
     generalization is the biggest chunk of genuinely new work here — not
     a drop-in reuse.
   - Static vs. animated: same PNG-vs-GIF split `radar-map.php`/
     `radar-gif.php` already do (GIF needs `ext-imagick`, same 501
     graceful-failure pattern if it's missing).
   - `imagesource` can be ignored for image *selection* (RainViewer is one
     worldwide feed) — see the open decision below for whether it should
     matter at all.

## Open decision: RainViewer everywhere, or real NWS for US? (needs the user's call before coding)

**(a) RainViewer+OSM for every location, including US.** Ignore
`imagesource` entirely. Simplest — one code path, directly reuses/extends
`maps-proxy`'s existing compositing. Consistent with what non-US World
Today users already see. Downside: US users get RainViewer's radar
(decent, but visibly lower-res than NEXRAD) instead of the sharper NWS
imagery World Today shows for US locations.

**(b) Real NWS NEXRAD for US, RainViewer+OSM elsewhere** — matches World
Today's existing split (`worker/src/index.js`'s `isUS` branch:
`nearestRadarStation` + `radar.weather.gov/ridge/standard/{region}_loop.gif`).
Real complication: NWS only hands back a whole pre-rendered station loop
GIF at a **fixed** geographic extent per station — there's no way to
crop/zoom/pan it to an arbitrary `geowidth`/`mx`/`my`, and this app has
working zoom buttons and click-drag pan that genuinely change those values.
Supporting that properly would mean building real NEXRAD tile compositing
from scratch — a materially bigger project than `maps-proxy`'s PR. A
middle ground (serve the fixed NWS loop only at/near default zoom with no
pan, fall back to RainViewer the moment the user zooms/pans) adds real
branching complexity for a marginal quality gain.

Given the effort gap, (a) is the pragmatic default, but the original ask
("including the US solution") suggests real NWS imagery might matter here
too — **confirm which before writing code.**

## Where should the new endpoints live?

**Option 1:** Add directly to `accuweatherxml-proxy` (already deployed at
`weather.webosarchive.org`, already serving this app's forecast/search).
Keeps everything for this app under one deployed service. Means porting/
copying the compositing logic from `maps-proxy`'s `radar-common.php` into
this PHP codebase too (some duplication across two repos).

**Option 2:** Have these two new endpoints internally proxy through to
`maps-proxy`'s already-deployed radar endpoints (`maps.webosarchive.org`)
instead of reimplementing compositing a second time. Avoids duplicating
the GD/RainViewer/OSM code, at the cost of an extra internal hop and two
services to keep in sync.

## Steps for whoever picks this up

1. **Confirm the two open decisions above with the user first** — both are
   real forks in scope, not implementation details.
2. Get live traffic visibility before writing code: either novacom/
   palm-log the actual device with this app installed and its radar view
   open, or stand up a temporary request-logging endpoint reachable via the
   existing redirect setup, to confirm the *live* request shape (exact
   param values, actual `imagewidth`/`imageheight` the TouchPad sends,
   actual default `geowidth` on first load) matches this source-level
   analysis before building against assumptions. This project's sibling
   apps (`usatoday`, `mlbatbat`, `box`, `cbssports`) already have this
   workflow documented (novacom/palm-log, one session at a time — see
   their `CLAUDE.md`s) if this folder doesn't have its own yet.
3. Implement `/nmigs/acx.aspx` (trivial).
4. Implement `/nmigs/wapv4.aspx` per the "What fixing it means" section.
5. Verify the `wapv4.accu-weather.com` redirect is actually in place (or
   add it) — don't assume it's already covered by the existing setup.
6. Test on-device, looking at the actual images (matching the bar already
   set on the `maps-proxy` PR): a US city and a non-US city, zoom in/out,
   pan, and Play (animate).
7. PR into whichever of `codepoet80/accuweatherxml-proxy-foropenweather` /
   `webOSArchive/accuweatherxml-proxy` is the actual live upstream for
   `weather.webosarchive.org` (confirm with the dev which — don't assume;
   "merged" and "deployed" were two separate events on the `maps-proxy` PR
   and cost real back-and-forth to sort out).

## Reference material already in this folder

- `extracted/usr/palm/applications/com.accuweather.palm.purchased/app/services/radar-image.js`
  — the exact request-building logic (read this first).
- `extracted/.../app/assistants/radar-assistant.js` — zoom/pan/animate UI
  logic, and the mile-to-degree math already used client-side.
- `extracted/.../app/services/weather-data.js`, `location-search.js` — the
  already-fixed calls, and where `isInternational`/`lat`/`lon` come from.
- `com.accuweather.palm.purchased_1.0.6_all.ipk` — original archive.

## Related work (same account, same overall goal)

- `../usatoday/radar.md` — the original feasibility writeup for World
  Today's own worldwide radar (RainViewer+OSM compositing, bugs hit,
  approach that this whole effort is built on).
- [webOSArchive/maps-proxy#1](https://github.com/webOSArchive/maps-proxy/pull/1)
  — the PHP/GD radar compositing this plan reuses, merged and live at
  `maps.webosarchive.org`.
- `../usatoday/radar-server/` — the original Node/sharp prototype (now
  superseded by the PHP port, kept as reference).
