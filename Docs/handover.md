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
7. **Cesium ion token** via `VITE_CESIUM_ION_TOKEN` env var
8. **Children pattern** - Globe component accepts `children` so data sources (Rivers, etc.) are composed declaratively in App.tsx

## Current Status

### Phase 0: Project Scaffold - COMPLETE

All files created, `npm install` succeeded, `npm run dev` serves on localhost:5173, `npm run build` produces clean production bundle.

### Phase 1: Core Globe - COMPLETE

- `src/components/Globe/Globe.tsx` - resium `<Viewer>` with all widgets disabled, world terrain (water mask + vertex normals), 1.5x vertical exaggeration, lighting, fog, atmosphere. Accepts `children` prop.
- `src/components/Globe/Globe.css` - minimized Cesium credit display
- Terrain set imperatively via `viewer.scene.setTerrain()` in useEffect (resium doesn't support `terrain` prop directly)
- Fixed `tsconfig.node.json` - added `composite: true` (was missing from Phase 0)

### Phase 2: Hydrology Layer - COMPLETE

- `public/data/rivers.geojson` - Natural Earth 50m rivers (~807KB), downloaded from natural-earth-vector GitHub repo
- `src/components/Rivers/Rivers.tsx` - `<GeoJsonDataSource>` with steel blue (#4682B4) polylines, 1.5px width, clampToGround
- `src/App.tsx` - composes `<Globe>` with `<Rivers />` as child

### Phase 3: UI Features - COMPLETE

- `src/components/Sidebar/Sidebar.tsx` + `Sidebar.css` - Collapsible left sidebar with hamburger toggle, contains BookmarkList and MeasurementTool
- `src/components/Sidebar/BookmarkList.tsx` - Full CRUD for camera bookmarks in localStorage (`globe_bookmarks` key). Save current view, fly-to on click, inline rename, delete. Uses `useCesium()` for viewer access.
- `src/components/Sidebar/MeasurementTool.tsx` - Toggle measure mode, click two globe points, computes geodesic distance via `EllipsoidGeodesic`, displays km/mi. Renders yellow point entities on globe. Uses `ScreenSpaceEventHandler`.
- `src/components/CoordinateDisplay/CoordinateDisplay.tsx` + `CoordinateDisplay.css` - Fixed bottom-right overlay showing lat/lon under cursor. Uses `ScreenSpaceEventHandler` MOUSE_MOVE + `pickEllipsoid`.
- All UI components placed inside `<Globe>` in App.tsx so they can access resium's `useCesium()` context.

### Phase 4: Polish & Mobile - COMPLETE

- `Sidebar.css` - iOS safe areas via `env(safe-area-inset-*)` on sidebar padding and toggle button positioning. All interactive elements (toggle, bookmark add/edit/delete buttons, measure buttons, inputs) enlarged to 44px minimum touch targets. Responsive layout: full-width sidebar on narrow screens (`@media max-width: 480px`), iOS-friendly scroll with `-webkit-overflow-scrolling: touch`.
- `CoordinateDisplay.css` - Repositioned with `env(safe-area-inset-bottom/right)` to avoid iOS home indicator. Centered horizontally on narrow screens.
- `Rivers.tsx` - Camera altitude listener hides rivers when zoomed below 50km (`RIVER_VISIBILITY_ALTITUDE = 50_000m`) to reduce GPU load. Uses `viewer.camera.changed` event with 1% threshold.

### Phase 4b: River Labels - COMPLETE

- `src/components/Rivers/RiverLabels.tsx` - Fetches rivers.geojson, extracts named features (deduplicated), computes midpoint of each river's geometry, renders white outlined labels via Cesium `LabelCollection`. Labels scale down at distance via `NearFarScalar`, clamp to ground, and share the same altitude-based visibility as river lines (hidden below 50km).
- `src/components/Rivers/constants.ts` - Shared `RIVER_VISIBILITY_ALTITUDE` constant used by both Rivers.tsx and RiverLabels.tsx.
- Rivers.tsx updated to import from shared constants.

### Phase 5: Geography Regions - COMPLETE

- `public/data/geography_regions.geojson` - Natural Earth geographic regions (deserts, mountains, plains, basins, etc.)
- `src/components/GeographyRegions/constants.ts` - `FEATURE_CLASSES` config (22 feature types with labels and colors), `TOGGLE_CLASSES`, `normalizeFeatureClass()`
- `src/components/GeographyRegions/utils.ts` - `getCentroid()` using polylabel for optimal label placement, `splitByFeatureClass()` for grouping features
- `src/components/GeographyRegions/GeographyRegions.tsx` - Renders colored polygon overlays per feature class using `<GeoJsonDataSource>`
- `src/components/GeographyRegions/GeographyRegionLabels.tsx` - White text labels (matching river style) with black outline, altitude-gated visibility, grouped by feature class for toggle control

### Phase 5b: UI Enhancements - COMPLETE

- **Label font color:** All geographic feature labels changed to white (`Color.WHITE.withAlpha(0.9)`) to match river labels for readability. Sidebar color swatches and region overlays retain per-feature-class colors.
- **Globe occlusion fix:** Removed `disableDepthTestDistance: Number.POSITIVE_INFINITY` from both `GeographyRegionLabels.tsx` and `RiverLabels.tsx` so labels on the far side of the globe are properly hidden by depth testing.
- **Default layer state:** Rivers and all geographic features default to OFF on load (`App.tsx` - `useState(false)` for both `showRivers` and `enabledClasses`).
- **Select All fix:** Fixed `LayerToggles.tsx` toggle logic from `noneOn ? true : false` to `!allOn` so partial selections correctly select all.
- **Search feature:** `src/components/Sidebar/Search.tsx` - Local data search across geography regions and rivers. Fetches both GeoJSON files on mount, builds searchable index with centroids. Debounced substring matching, shows up to 10 results with feature type. Clicking a result flies the camera to the location at 500km altitude.
- **Settings cleanup:** Removed unnecessary `WebFetch(domain:github.com)` permission from `.claude/settings.local.json`.

### Next Phase: Phase 6 - TBD

## Key File Paths

- Project root: `c:\Users\johnm\OneDrive\Desktop\DesktopFiles\Projects\Cursor\planet_earth`
- Vite config: `vite.config.ts`
- Cesium init: `src/cesium-config.ts`
- Types: `src/types/index.ts`
- Globe component: `src/components/Globe/Globe.tsx`
- Rivers component: `src/components/Rivers/Rivers.tsx`
- River labels: `src/components/Rivers/RiverLabels.tsx`
- Geography regions: `src/components/GeographyRegions/GeographyRegions.tsx`
- Geography labels: `src/components/GeographyRegions/GeographyRegionLabels.tsx`
- Geography constants: `src/components/GeographyRegions/constants.ts`
- Geography utils: `src/components/GeographyRegions/utils.ts`
- Sidebar: `src/components/Sidebar/Sidebar.tsx`
- Search: `src/components/Sidebar/Search.tsx`
- Layer toggles: `src/components/Sidebar/LayerToggles.tsx`
- Bookmarks: `src/components/Sidebar/BookmarkList.tsx`
- Measurement: `src/components/Sidebar/MeasurementTool.tsx`
- Coordinate display: `src/components/CoordinateDisplay/CoordinateDisplay.tsx`
- App composition: `src/App.tsx`

## Workflow Notes

# Add line 110 to the CLAUDE.md file user has asked you to create
- A Cursor agent automatically reviews each commit for bugs. Its findings will be shared during sessions for verification — some may be false positives due to lacking conversation context.
- User prefers to commit changes themselves
- Plan mode is used for non-trivial features

## Issues / Notes

- The `.test` file in the repo root can be deleted (artifact from initial git setup)
- `clampToGround` on river polylines is working - no fallback needed
- CesiumJS bundle is ~4.5MB (expected, could code-split later if needed)
- The `labelColor` variable in `GeographyRegionLabels.tsx` is computed but intentionally unused for label fill — kept in case region-specific label coloring is wanted later. The white fill was a deliberate design choice for readability.
