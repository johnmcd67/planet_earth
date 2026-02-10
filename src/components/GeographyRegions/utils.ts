import { normalizeFeatureClass } from "./constants";

interface GeoJsonFeature {
  properties: { name?: string; featurecla?: string };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJsonCollection {
  type: string;
  features: GeoJsonFeature[];
}

export function getCentroid(
  feature: GeoJsonFeature
): [number, number] | null {
  const { type, coordinates } = feature.geometry;
  let ring: number[][] | undefined;

  if (type === "Polygon") {
    ring = (coordinates as number[][][])[0];
  } else if (type === "MultiPolygon") {
    const polys = coordinates as number[][][][];
    const largest = polys.reduce((a, b) =>
      (a[0]?.length ?? 0) >= (b[0]?.length ?? 0) ? a : b
    );
    ring = largest[0];
  } else {
    return null;
  }

  if (!ring || ring.length === 0) return null;

  let lonSum = 0;
  let latSum = 0;
  for (const coord of ring) {
    if (coord[0] == null || coord[1] == null) continue;
    lonSum += coord[0];
    latSum += coord[1];
  }
  return [lonSum / ring.length, latSum / ring.length];
}

export function splitByFeatureClass(
  geojson: GeoJsonCollection
): Record<string, GeoJsonCollection> {
  const result: Record<string, GeoJsonCollection> = {};

  for (const feature of geojson.features) {
    const raw = feature.properties?.featurecla ?? "unknown";
    const key = normalizeFeatureClass(raw);

    if (!result[key]) {
      result[key] = { type: "FeatureCollection", features: [] };
    }
    result[key].features.push(feature);
  }

  return result;
}
