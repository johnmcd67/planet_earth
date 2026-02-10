export const GEOGRAPHY_VISIBILITY_ALTITUDE = 80_000; // meters

export interface FeatureClassConfig {
  label: string;
  color: string; // CSS color string
}

export const FEATURE_CLASSES: Record<string, FeatureClassConfig> = {
  "Desert":       { label: "Deserts",        color: "#EDC9AF" },
  "Range/mtn":    { label: "Mountains",      color: "#8B7355" },
  "Plateau":      { label: "Plateaus",       color: "#A0522D" },
  "Plain":        { label: "Plains",         color: "#90EE90" },
  "Basin":        { label: "Basins",         color: "#6B8E23" },
  "Tundra":       { label: "Tundra",         color: "#B0C4DE" },
  "Valley":       { label: "Valleys",        color: "#32CD32" },
  "Pen/cape":     { label: "Peninsulas",     color: "#DEB887" },
  "Peninsula":    { label: "Peninsulas",     color: "#DEB887" },
  "Foothills":    { label: "Foothills",      color: "#CD853F" },
  "Lowland":      { label: "Lowlands",       color: "#98FB98" },
  "Wetlands":     { label: "Wetlands",       color: "#2E8B57" },
  "Delta":        { label: "Deltas",         color: "#20B2AA" },
  "Island":       { label: "Islands",        color: "#F4A460" },
  "Island group": { label: "Island Groups",  color: "#D2B48C" },
  "Continent":    { label: "Continents",     color: "#808080" },
  "Geoarea":      { label: "Geo Areas",      color: "#BC8F8F" },
  "Isthmus":      { label: "Isthmuses",      color: "#DAA520" },
  "Coast":        { label: "Coasts",         color: "#5F9EA0" },
  "Gorge":        { label: "Gorges",         color: "#8B4513" },
  "Lake":         { label: "Lakes",          color: "#4682B4" },
  "Depression":   { label: "Depressions",    color: "#696969" },
};

// Normalized key for grouping similar classes (e.g. "Pen/cape" and "Peninsula")
export function normalizeFeatureClass(featurecla: string): string {
  if (featurecla === "Peninsula") return "Pen/cape";
  return featurecla;
}

// Feature classes to show in the toggle UI (deduplicated)
export const TOGGLE_CLASSES = Object.keys(FEATURE_CLASSES).filter(
  (k) => k !== "Peninsula" && k !== "Dragons-be-here"
);
