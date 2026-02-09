# The Natural History Globe - Handover Document

> This file is a living document for context continuity. Read this if resuming work in a new session.

## Project Overview

A web-based 3D globe app using CesiumJS that visualizes Earth as a "human-free" environment for studying historical geography and river systems. Runs on desktop and iPhone Safari.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite 6 with `vite-plugin-static-copy` for Cesium assets
- **3D Engine:** CesiumJS ~1.138 with `resium` React bindings
- **Styling:** Plain CSS (no framework)
- **Data:** Natural Earth GeoJSON for rivers, Cesium ion for terrain/imagery

## Architecture Decisions

1. **Responsive web app** (not PWA, not native wrapper) - simplest path for iPhone support
2. **resium** for declarative CesiumJS-in-React rather than imperative Viewer management
3. **vite-plugin-static-copy** over abandoned vite-plugin-cesium - officially recommended approach
4. **Cesium ion default imagery** to start, NASA Blue Marble as fallback if user dislikes defaults
5. **localStorage** for bookmark persistence (simple, no backend needed)
6. **1:50m Natural Earth rivers** to start (~200KB), can upgrade to 1:10m later
7. **Cesium ion token** via `VITE_CESIUM_ION_TOKEN` env var - user needs to create account at ion.cesium.com

## Current Status

### Phase 0: Project Scaffold - COMPLETE

All files created, `npm install` succeeded (194 packages, 0 vulnerabilities), `npm run dev` serves the app on localhost:5173, `npx vite build` produces a clean production bundle with `cesiumStatic/` directory containing Workers, Assets, ThirdParty, Widgets.

**Files created:**
- `.gitignore` - standard Node/Vite ignores
- `package.json` - cesium ^1.138.0, resium ^1.19.3, react ^19, vite ^6.1, etc.
- `vite.config.ts` - React plugin + Cesium static asset copy + CESIUM_BASE_URL define
- `tsconfig.json` / `tsconfig.node.json` - strict TypeScript, ES2020, bundler resolution
- `index.html` - Vite entry with mobile viewport meta tags (viewport-fit=cover, apple-mobile-web-app-capable)
- `.env.example` - token placeholder with setup instructions
- `src/vite-env.d.ts` - Vite types + CESIUM_BASE_URL declaration
- `src/cesium-config.ts` - Ion token init + widget CSS import
- `src/App.css` - full-screen reset, overflow hidden, position fixed
- `src/App.tsx` - placeholder with title
- `src/main.tsx` - init Cesium, render React
- `src/types/index.ts` - Bookmark, MeasurementPoint, MeasurementResult types
- `public/favicon.svg` - simple globe SVG icon
- `Docs/handover.md` - this file

### Next Phase: Phase 1 - Core Globe

**What to build:**
- `src/components/Globe/Globe.tsx` - resium `<Viewer>` component with:
  - `Terrain.fromWorldTerrain({ requestWaterMask: true, requestVertexNormals: true })`
  - `scene.verticalExaggeration = 1.5`
  - Atmosphere, fog, lighting enabled
  - All Cesium widgets disabled (animation, timeline, geocoder, etc.)
  - No OSM buildings, labels, or admin boundaries (off by default)
- `src/components/Globe/Globe.css` - minimize Cesium credit display
- Update `src/App.tsx` to render `<Globe />`

**Key APIs:** `Terrain.fromWorldTerrain()`, `scene.verticalExaggeration`, resium `<Viewer>`

**Prerequisite:** User must create Cesium ion account at https://ion.cesium.com/ and add token to `.env.local`

### Phases After That

- **Phase 2:** Hydrology layer (Natural Earth 50m rivers GeoJSON, `<GeoJsonDataSource>`, steel blue polylines, clampToGround)
- **Phase 3:** UI features (collapsible sidebar, bookmarks CRUD with localStorage, geodesic measurement tool using EllipsoidGeodesic, coordinate display)
- **Phase 4:** Polish & mobile (iOS safe areas, touch targets 44px min, performance tuning, river visibility by altitude)

## Key File Paths

- Plan: `C:\Users\johnm\.claude\plans\curried-snuggling-creek.md`
- Project root: `c:\Users\johnm\OneDrive\Desktop\DesktopFiles\Projects\Cursor\planet_earth`
- Vite config (critical): `vite.config.ts`
- Cesium init: `src/cesium-config.ts`
- Types: `src/types/index.ts`

## Issues / Notes

- User has NOT yet created a Cesium ion account (needed for Phase 1+)
- The `.test` file in the repo root can be deleted (artifact from initial git setup)
- Resium may not support the `terrain` prop directly - if so, set imperatively via `viewer.scene.setTerrain()` in useEffect
- `clampToGround` on GeoJSON polylines may conflict with styling - fall back to constant altitude if needed
