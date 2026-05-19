# Bus Comming — Marketing Site

Landing page for **Bus Comming**, built with React + Vite + Tailwind CSS + [shadcn/ui](https://ui.shadcn.com).

Design reference: `docs/html/web.tsx`

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- shadcn/ui (base-nova)
- lucide-react

## Development

```bash
cd web
yarn install
yarn dev
```

Open [http://localhost:5173](http://localhost:5173).

## Configuration

Copy `.env.example` to `.env` and set the PWA app URL:

```bash
cp .env.example .env
```

| Variable        | Description                          |
|-----------------|--------------------------------------|
| `VITE_APP_URL`  | Link target for “打开 Web App” buttons |

## Screenshots

The features carousel renders live UI previews in `src/components/screenshots/` (bus arrival card, search, saved stops, etc.), matching the app design. Edit `AppScreenPreviews.tsx` or `BusArrivalCardPreview.tsx` to adjust.

## Build

```bash
yarn build
yarn preview
```
