# The Natural History Globe

A 3D interactive globe for exploring Earth's physical geography — rivers, deserts, mountains, plains, and more — without political borders or human infrastructure.

Built with CesiumJS, React, and TypeScript.

## Getting Started

```bash
npm install
```

Create a `.env` file with your [Cesium ion](https://ion.cesium.com/) access token:

```
VITE_CESIUM_ION_TOKEN=your_token_here
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Features

- 3D globe with world terrain, lighting, and atmosphere
- River systems (Natural Earth 50m data) with labels
- 22 geographic feature types (deserts, mountains, plains, basins, etc.) with colored overlays and labels
- Sidebar with layer toggles, search, camera bookmarks, and distance measurement
- Mobile-friendly with iOS safe area support

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **CesiumJS** with **resium** React bindings
- **Natural Earth** GeoJSON data
