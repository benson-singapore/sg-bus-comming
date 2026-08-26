# SG Bus Comming (巴士来了)

A real-time bus arrival information tool for Singapore commuters. Search for bus arrival times by station code, save frequently used bus stops and routes, and install the app on your phone's home screen for convenient daily use.

Real-time bus data is provided by [ArriveLah2](https://arrivelah2.busrouter.sg/).

[中文文档](./README.md) · **English**

## Product Preview

The following screenshots are stored in the project's `docs/pic/` directory:

<table>
  <tr>
    <td align="center"><img src="./docs/pic/iShot_2026-08-26_21.26.00.png" alt="Application screenshot 1" width="220"></td>
    <td align="center"><img src="./docs/pic/iShot_2026-08-26_21.26.12.png" alt="Application screenshot 2" width="220"></td>
    <td align="center"><img src="./docs/pic/iShot_2026-08-26_21.26.19.png" alt="Application screenshot 3" width="220"></td>
    <td align="center"><img src="./docs/pic/iShot_2026-08-26_21.26.49.png" alt="Application screenshot 4" width="220"></td>
  </tr>
</table>

## Features

- **Real-time arrival lookup**: Enter a bus stop code to view the estimated arrival times of the next three buses for each route.
- **Saved bus stops**: Save frequently used stops and configure the routes you want to follow at each stop.
- **Stop management**: Add, edit, and remove stops. Drag and drop to reorder stops and routes.
- **Saved searches**: Save frequently used stop searches for quick access later.
- **Bilingual interface**: Switch between Chinese and English. The language preference is saved locally in the browser.
- **PWA installation**: Install the main app on a device home screen. Android uses the browser's native installation prompt, while iOS uses a WebClip installation profile.
- **Local caching**: Stop configuration and recent arrival results are stored locally. Cached results can be shown while the app requests the latest data.
- **Marketing landing page**: A separate product page provides feature information, application previews, QR codes, and a Web App entry point.

## Project Structure

```text
sg-bus-comming/
├── frontend/                         # Main PWA application (Next.js)
│   ├── src/app/page.tsx              # Main page and interaction logic
│   ├── src/app/api/weather/route.ts  # Bus arrival data proxy
│   ├── src/app/api/app/              # PWA installation endpoints
│   ├── src/app/manifest.ts           # Web App Manifest
│   └── ...
├── web/                              # Product marketing site (Vite + React)
│   ├── src/App.tsx
│   ├── src/components/               # Page and screenshot preview components
│   └── ...
├── docs/
│   ├── pic/                          # Product screenshots used in the README
│   ├── html/                         # Design reference code
│   └── 需求/                         # Requirements and implementation notes
├── README.md                         # Chinese documentation
├── README.en.md                      # English documentation
└── package-lock.json / yarn.lock     # Dependency lock files for the subprojects
```

| Directory | Purpose | Main technologies |
| --- | --- | --- |
| [`frontend/`](./frontend/) | Installable PWA, arrival lookup, and API proxy | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| [`web/`](./web/) | Product introduction and installation landing page | Vite 8, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| [`docs/`](./docs/) | Design references, requirements, and product screenshots | Markdown, React reference code, PNG |

## Architecture Overview

```text
┌─────────────────────┐       ┌─────────────────────────┐
│ web/ marketing site │       │ frontend/ main PWA      │
│ Vite + React        │       │ Next.js App Router     │
└──────────┬──────────┘       └────────────┬────────────┘
           │                               │
           │ Open Web App                  │ POST /api/weather
           │                               │
           │                    ┌──────────▼──────────┐
           └───────────────────►│ Next.js API Route   │
                                │ Edge Runtime        │
                                └──────────┬──────────┘
                                           │
                                ┌──────────▼──────────┐
                                │ ArriveLah2 API      │
                                │ Singapore bus data  │
                                └─────────────────────┘
```

### Main Application: `frontend/`

- The page entry point is [`src/app/page.tsx`](./frontend/src/app/page.tsx), which provides the main arrival, discovery, and management areas.
- [`/api/weather`](./frontend/src/app/api/weather/route.ts) requests data from ArriveLah2 on the server and transforms the upstream `services` data into arrival card data for the frontend.
- Stops, routes, cached results, language preferences, and installation state are stored in the browser's `localStorage`; no separate database is required.
- [`manifest.ts`](./frontend/src/app/manifest.ts) defines the PWA metadata. Android installation uses `beforeinstallprompt`, while iOS installation uses the WebClip profile endpoint.
- The application is built and deployed to Cloudflare using `@opennextjs/cloudflare` and requires the `nodejs_compat` compatibility flag.

### Marketing Site: `web/`

- Presents product features, application previews, and QR codes.
- The “Open Web App” button uses `VITE_APP_URL` to point to the main PWA.
- Supports Chinese and English.
- Screenshot preview components are located in [`web/src/components/screenshots/`](./web/src/components/screenshots/).

## Requirements

- Node.js 20.x
- npm 10.x for `frontend/`
- Yarn for `web/`

Using Node.js 20 for both local development and Cloudflare builds is recommended to reduce runtime differences.

## Getting Started

### 1. Run the main PWA

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>.

Common commands:

```bash
npm run lint       # Run ESLint
npm run build      # Create a production Next.js build
npm run start      # Start the production build
npm run cf:build   # Build the Cloudflare OpenNext output
npm run cf:dev     # Preview the Cloudflare Worker locally
npm run cf:deploy  # Deploy to Cloudflare
```

### 2. Run the marketing site

```bash
cd web
yarn install
cp .env.example .env   # Optional: configure the PWA URL
yarn dev
```

Open <http://localhost:5173>.

Common commands:

```bash
yarn lint
yarn build
yarn preview
```

## Environment Variables

The marketing site uses `VITE_APP_URL` to configure the URL of the main PWA. Copy the example file first:

```bash
cd web
cp .env.example .env
```

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_APP_URL` | Target URL for the “Open Web App” buttons | `https://bus.skycore.cloud` |

For local development, set the following in `web/.env`:

```dotenv
VITE_APP_URL=http://localhost:3000
```

## API Reference

The main application exposes `/api/weather` as a proxy endpoint. The browser requests the application endpoint, and the Next.js server requests ArriveLah2 so the frontend does not need to call the upstream API directly.

### POST (recommended)

```http
POST /api/weather
Content-Type: application/json

{"stationCode":"67661"}
```

### GET (compatible)

```http
GET /api/weather?city=67661
```

`67661` is an example bus stop code. A successful response includes the station name and route data, for example:

```json
{
  "stationName": "Station 67661",
  "data": [
    {
      "route": "371",
      "nextMinutes": 5,
      "nextSeconds": 12,
      "nextArrival": "10:30:00"
    }
  ]
}
```

Implementation: [`frontend/src/app/api/weather/route.ts`](./frontend/src/app/api/weather/route.ts).

## Local Data and Privacy

The project does not use a separate database. The following information is stored only in the current browser's `localStorage`:

- Saved stops and their order
- Followed routes and their order
- Saved searches
- Cached arrival data
- Language preference
- PWA installation state

Clearing browser site data, switching browsers, or using another device will not automatically sync local stops or cached data. When arrival information is requested, the station code is sent to the application API, which then requests the data from ArriveLah2.

## Cloudflare Deployment

The `frontend/` application uses OpenNext to generate a Cloudflare Worker output:

```bash
cd frontend
npm install
npm run cf:build
npm run cf:deploy
```

To simulate the Cloudflare environment locally:

```bash
npm run cf:dev
```

Recommended Cloudflare project settings:

| Setting | Value |
| --- | --- |
| Root directory | `frontend` |
| Build command | `npm run cf:build` |
| Deploy command (Workers Builds) | `npx wrangler deploy` |
| `NODE_VERSION` | `20` |
| Compatibility flag | `nodejs_compat` |

Relevant configuration files:

- [`frontend/wrangler.jsonc`](./frontend/wrangler.jsonc)
- [`frontend/open-next.config.ts`](./frontend/open-next.config.ts)
- [`frontend/next.config.ts`](./frontend/next.config.ts)

Use `@opennextjs/cloudflare`; do not use the deprecated `@cloudflare/next-on-pages` adapter.

## Related Documentation

- [PWA application development and API guide](./frontend/README.md)
- [Marketing site guide](./web/README.md)
- [PWA installation guide (Android + iOS)](./docs/需求/PWA安装按钮实现总结（Android+iOS）.md)
- [Design reference code](./docs/html/)
- [中文项目说明](./README.md)

## Data Source

Bus arrival data is provided by [ArriveLah2](https://arrivelah2.busrouter.sg/). If you deploy or publish this project, follow the upstream service's terms of use and API limitations.
