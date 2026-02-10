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
import { RIVER_VISIBILITY_ALTITUDE } from "./constants";

interface GeoJsonFeature {
  properties: { name?: string };
  geometry: {
    type: string;
    coordinates: number[][] | number[][][];
  };
}

function getMidpoint(feature: GeoJsonFeature): [number, number] | null {
  const { type, coordinates } = feature.geometry;
  let coords: number[][];

  if (type === "LineString") {
    coords = coordinates as number[][];
  } else if (type === "MultiLineString") {
    const lines = coordinates as number[][][];
    coords = lines.reduce((a, b) => (a.length >= b.length ? a : b));
  } else {
    return null;
  }

  if (coords.length === 0) return null;
  const mid = coords[Math.floor(coords.length / 2)];
  if (!mid || mid[0] == null || mid[1] == null) return null;
  return [mid[0], mid[1]] as [number, number];
}

export default function RiverLabels() {
  const { viewer } = useCesium();
  const entitiesRef = useRef<Entity[]>([]);
  const removeListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!viewer) return;

    fetch("/data/rivers.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        if (!viewer || viewer.isDestroyed()) return;

        const seen = new Set<string>();
        const entities: Entity[] = [];

        for (const feature of geojson.features as GeoJsonFeature[]) {
          const name = feature.properties?.name;
          if (!name || seen.has(name)) continue;
          seen.add(name);

          const midpoint = getMidpoint(feature);
          if (!midpoint) continue;

          const entity = viewer.entities.add({
            position: Cartesian3.fromDegrees(midpoint[0], midpoint[1]),
            label: {
              text: name,
              font: "bold 24px sans-serif",
              fillColor: Color.WHITE.withAlpha(0.9),
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              style: LabelStyle.FILL_AND_OUTLINE,
              heightReference: HeightReference.CLAMP_TO_GROUND,
              verticalOrigin: VerticalOrigin.BOTTOM,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              scaleByDistance: new NearFarScalar(1e5, 1.0, 8e6, 0.3),
            },
          });
          entities.push(entity);
        }

        entitiesRef.current = entities;

        // Altitude-based visibility
        const onCameraChange = () => {
          const height = viewer.camera.positionCartographic.height;
          const show = height >= RIVER_VISIBILITY_ALTITUDE;
          for (const entity of entitiesRef.current) {
            entity.show = show;
          }
        };

        viewer.camera.percentageChanged = 0.01;
        removeListenerRef.current =
          viewer.camera.changed.addEventListener(onCameraChange);
        onCameraChange();
      });

    return () => {
      if (removeListenerRef.current) removeListenerRef.current();
      if (viewer && !viewer.isDestroyed()) {
        for (const entity of entitiesRef.current) {
          viewer.entities.remove(entity);
        }
        entitiesRef.current = [];
      }
    };
  }, [viewer]);

  return null;
}
