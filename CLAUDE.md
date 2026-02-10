# The Natural History Globe

## Project

A web-based 3D globe app using CesiumJS + React 19 + TypeScript (Vite 6). Visualizes Earth as a "human-free" environment for studying historical geography and river systems. Uses `resium` for declarative CesiumJS-in-React bindings.

## Build & Dev

- `npm run dev` — starts dev server on localhost:5173
- `npm run build` — production build
- `npx tsc --noEmit` — type check
- Cesium ion token: `VITE_CESIUM_ION_TOKEN` env var

## Architecture

- Globe component accepts `children` for composing data layers declaratively in App.tsx
- All sidebar/UI components are placed inside `<Globe>` to access resium's `useCesium()` context
- GeoJSON data served from `public/data/` (rivers, geography regions)
- Plain CSS styling (no framework), iOS safe areas supported
- `localStorage` for bookmark persistence (`globe_bookmarks` key)

## Key Conventions

- Terrain set imperatively via `viewer.scene.setTerrain()` in useEffect (resium limitation)
- Labels use white fill (`Color.WHITE.withAlpha(0.9)`) with black outline for readability across all feature types
- The `labelColor` variable in `GeographyRegionLabels.tsx` is intentionally computed but unused for fill — kept for potential future per-region coloring
- Altitude-gated visibility: rivers hidden below 50km, geography regions below 80km
- Rivers and geographic features default to OFF on load

## Workflow

- A Cursor agent automatically reviews each commit for bugs. Its findings will be shared during sessions for verification — some may be false positives due to lacking conversation context.
- User prefers to commit changes themselves — do not commit unless explicitly asked
- Use plan mode for non-trivial features
- Read `Docs/handover.md` for detailed phase-by-phase status and implementation notes
