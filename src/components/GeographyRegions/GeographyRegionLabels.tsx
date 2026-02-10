import { useEffect, useRef } from "react";
import { useCesium } from "resium";
import {
  Cartesian3,
  Color,
  HeightReference,
  LabelStyle,
  NearFarScalar,
  VerticalOrigin,
  Entity,
} from "cesium";
import {
  GEOGRAPHY_VISIBILITY_ALTITUDE,
  FEATURE_CLASSES,
  normalizeFeatureClass,
} from "./constants";
import { getCentroid } from "./utils";

interface GeoJsonFeature {
  properties: { name?: string; featurecla?: string };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

interface Props {
  enabledClasses: Record<string, boolean>;
}

export default function GeographyRegionLabels({ enabledClasses }: Props) {
  const { viewer } = useCesium();
  // Map of featureClass -> Entity[]
  const entitiesByClassRef = useRef<Record<string, Entity[]>>({});
  const removeListenerRef = useRef<(() => void) | null>(null);
  const enabledRef = useRef(enabledClasses);
  enabledRef.current = enabledClasses;

  useEffect(() => {
    if (!viewer) return;

    const abortController = new AbortController();

    fetch("/data/geography_regions.geojson", {
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((geojson) => {
        if (abortController.signal.aborted || viewer.isDestroyed()) return;

        const seen = new Set<string>();
        const byClass: Record<string, Entity[]> = {};

        for (const feature of geojson.features as GeoJsonFeature[]) {
          const name = feature.properties?.name;
          const rawClass = feature.properties?.featurecla ?? "unknown";
          const cls = normalizeFeatureClass(rawClass);

          if (!name || seen.has(name)) continue;
          seen.add(name);

          const centroid = getCentroid(feature);
          if (!centroid) continue;

          const config = FEATURE_CLASSES[cls];
          if (!config) continue;

          const labelColor = Color.fromCssColorString(config.color);

          const entity = viewer.entities.add({
            position: Cartesian3.fromDegrees(centroid[0], centroid[1]),
            label: {
              text: name,
              font: "bold 20px sans-serif",
              fillColor: labelColor.withAlpha(0.9),
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              style: LabelStyle.FILL_AND_OUTLINE,
              heightReference: HeightReference.CLAMP_TO_GROUND,
              verticalOrigin: VerticalOrigin.BOTTOM,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              scaleByDistance: new NearFarScalar(1e5, 1.0, 8e6, 0.3),
            },
          });

          if (!byClass[cls]) byClass[cls] = [];
          byClass[cls].push(entity);
        }

        entitiesByClassRef.current = byClass;

        const updateVisibility = () => {
          const height = viewer.camera.positionCartographic.height;
          const altitudeVisible = height >= GEOGRAPHY_VISIBILITY_ALTITUDE;

          for (const [cls, entities] of Object.entries(
            entitiesByClassRef.current
          )) {
            const show = altitudeVisible && (enabledRef.current[cls] ?? true);
            for (const entity of entities) {
              entity.show = show;
            }
          }
        };

        viewer.camera.percentageChanged = 0.01;
        removeListenerRef.current =
          viewer.camera.changed.addEventListener(updateVisibility);
        updateVisibility();
      })
      .catch(() => {});

    return () => {
      abortController.abort();
      if (removeListenerRef.current) removeListenerRef.current();
      if (viewer && !viewer.isDestroyed()) {
        for (const entities of Object.values(entitiesByClassRef.current)) {
          for (const entity of entities) {
            viewer.entities.remove(entity);
          }
        }
        entitiesByClassRef.current = {};
      }
    };
  }, [viewer]);

  // Update entity visibility when toggles change
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    const height = viewer.camera.positionCartographic.height;
    const altitudeVisible = height >= GEOGRAPHY_VISIBILITY_ALTITUDE;

    for (const [cls, entities] of Object.entries(
      entitiesByClassRef.current
    )) {
      const show = altitudeVisible && (enabledClasses[cls] ?? true);
      for (const entity of entities) {
        entity.show = show;
      }
    }
  }, [enabledClasses, viewer]);

  return null;
}
