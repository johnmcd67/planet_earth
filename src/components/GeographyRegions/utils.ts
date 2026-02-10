import polylabel from "polylabel";
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
  let polygon: number[][][];

  if (type === "Polygon") {
    polygon = coordinates as number[][][];
  } else if (type === "MultiPolygon") {
    const polys = coordinates as number[][][][];
    // Pick the largest polygon by exterior ring length
    polygon = polys.reduce((a, b) =>
      (a[0]?.length ?? 0) >= (b[0]?.length ?? 0) ? a : b
    );
  } else {
    return null;
  }

  if (!polygon || !polygon[0] || polygon[0].length === 0) return null;

  const result = polylabel(polygon, 1.0);
  if (result[0] == null || result[1] == null) return null;
  return [result[0] as number, result[1] as number];
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
