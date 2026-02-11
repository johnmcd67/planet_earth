import { useEffect, useRef, useState } from "react";
import { useCesium } from "resium";
import { Cartesian3, Math as CesiumMath } from "cesium";
import { getCentroid } from "../GeographyRegions/utils";
import { FEATURE_CLASSES, normalizeFeatureClass } from "../GeographyRegions/constants";

interface SearchEntry {
  name: string;
  type: "river" | "geography";
  featureClass: string;
  lon: number;
  lat: number;
}

function getRiverMidpoint(coords: number[][][]): [number, number] | null {
  if (coords.length === 0) return null;
  let longest = coords[0]!;
  for (const line of coords) {
    if (line.length > longest.length) longest = line;
  }
  if (longest.length === 0) return null;
  const mid = longest[Math.floor(longest.length / 2)];
  if (!mid || mid.length < 2) return null;
  return [mid[0]!, mid[1]!];
}

export default function Search() {
  const { viewer } = useCesium();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const indexRef = useRef<SearchEntry[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const abort = new AbortController();

    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/geography_regions.geojson`, { signal: abort.signal }).then((r) => r.json()),
      fetch(`${import.meta.env.BASE_URL}data/rivers.geojson`, { signal: abort.signal }).then((r) => r.json()),
    ]).then(([geo, rivers]) => {
      const entries: SearchEntry[] = [];
      const seen = new Set<string>();

      for (const f of geo.features) {
        const name = f.properties?.name;
        const raw = f.properties?.featurecla ?? "unknown";
        const cls = normalizeFeatureClass(raw);
        if (!name || seen.has(name)) continue;
        seen.add(name);

        const centroid = getCentroid(f);
        if (!centroid) continue;

        entries.push({
          name,
          type: "geography",
          featureClass: FEATURE_CLASSES[cls]?.label ?? cls,
          lon: centroid[0],
          lat: centroid[1],
        });
      }

      for (const f of rivers.features) {
        const name = f.properties?.name;
        if (!name || seen.has(`river-${name}`)) continue;
        seen.add(`river-${name}`);

        const coords = f.geometry?.coordinates;
        if (!coords || coords.length === 0) continue;
        const mid = getRiverMidpoint(coords);
        if (!mid) continue;

        entries.push({
          name,
          type: "river",
          featureClass: "River",
          lon: mid[0],
          lat: mid[1],
        });
      }

      indexRef.current = entries;
    }).catch(() => {});

    return () => abort.abort();
  }, []);

  function handleInput(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const lower = value.toLowerCase();
      const matches = indexRef.current
        .filter((e) => e.name.toLowerCase().includes(lower))
        .slice(0, 10);
      setResults(matches);
    }, 200);
  }

  function handleSelect(entry: SearchEntry) {
    if (!viewer || viewer.isDestroyed()) return;

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(entry.lon, entry.lat, 500_000),
      orientation: {
        heading: 0,
        pitch: -CesiumMath.PI_OVER_TWO,
        roll: 0,
      },
    });

    setQuery("");
    setResults([]);
  }

  return (
    <div className="sidebar-section search-section">
      <h3>Search</h3>
      <input
        className="search-input"
        type="text"
        placeholder="Search features & rivers..."
        value={query}
        onChange={(e) => handleInput(e.target.value)}
      />
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((r, i) => (
            <li
              key={`${r.name}-${i}`}
              className="search-result-item"
              onClick={() => handleSelect(r)}
            >
              <span className="search-result-name">{r.name}</span>
              <span className="search-result-type">{r.featureClass}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
