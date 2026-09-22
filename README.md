# HR Monitor dashboard

The "look at all my numbers" part. A single-page app served by the FastAPI
server at `/dashboard`, talking to its own `/stats` and `/sessions` endpoints.

## Stack (chosen)

- **Vite + React 18 + TypeScript** — componentized UI with types checked at build
  time; Vite produces a static bundle, so production has zero runtime deps.
- **TanStack Query** — caching, 60s auto-refresh, loading/error states for the
  `/stats` fetch.
- **Recharts** — line/area/pie/bar charts; dark theme, animated, flexible.
- **Plain hand-rolled CSS** — dark OLED-ish theme, no framework needed for one page.

Everything bundles to static files in `web/dist`; the API server just serves
them. No Node runtime needed on the server.

### Why not the alternatives

| Option                              | Verdict                                                                 |
|-------------------------------------|-------------------------------------------------------------------------|
| Vanilla JS + Chart.js (no build)    | Simple, but gets rough once you have 6 components of state to juggle.    |
| Svelte 5 + Vite                     | Smaller/sleeker, but fewer charting libs and a smaller hiring/copy-paste pool. |
| Vue 3 + ECharts                     | Great charts, more opinionation and boilerplate than React for tables + forms. |
| Server-rendered (Jinja2)            | Every interaction is a round trip; live-updating stats feel laggy.        |
| Streamlit / Dash                    | Heavy Python process always running for what is a static page.           |

## Stack options

If you'd rather change it later: the app is a plain SPA against the same JSON
API, so React↔Svelte↔Vue is a drop-in swap of the view layer only.

## Development

```bash
npm install
npm run dev          # vite on :5173, proxies /stats /sessions to :8000
```

Open `http://localhost:5173/?token=<HR_AUTH_TOKEN>` once — the token is stored
in `localStorage` and the URL cleaned. (In production the server injects the
token into the page automatically.)

## Build

```bash
npm run build        # -> dist/
```

## Deploy

`web/dist` is re-built on the server after pulling:

```bash
cd web && npm ci && npm run build
sudo systemctl restart hr-server
```

## Auth model

The `/stats` and `/sessions` endpoints require `X-Auth-Token`. The built page
has the token baked in by the server at serve time
(`server/app.py` `dashboard()` replaces `__AUTH_TOKEN__`). Anyone who can load
the page can already read the data, so this is not extra security — it stops
random internet scanners from hitting the API.