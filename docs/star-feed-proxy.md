# Live shooting-star feed (optional)

RS3 telescopes announce the **region** a star will land in, not the exact site,
so the map's **Star sites** layer (World tab → Overlays) shows every RS3 landing
site from `public/star-sites.json` and highlights the sites of a region you pick.

There is no public RS3 live-star feed, so none is built in. If you run or find
one, point the app at it with the layer's *feed* button (saved in
`localStorage` as `fate_star_feed`) or `VITE_STAR_FEED` at build time. The URL
must send a CORS header and return JSON shaped like:

```json
[
  { "world": 14, "region": "Crandor or Karamja", "size": 7, "earliest": 1760212800, "latest": 1760214000, "site": "Karamja gold mine" }
]
```

- `world` (number) and `region` (an RS3 telescope region name, as in
  `star-sites.json`) are required.
- `size` (1–10), `earliest` / `latest` (unix seconds) and `site` (a site name
  from `star-sites.json`, if known) are optional.

If the source you use has no CORS header, a tiny Cloudflare Worker can proxy it:

```js
export default {
  async fetch() {
    const r = await fetch('https://example.com/your-rs3-star-source');
    return new Response(r.body, {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  },
};
```
