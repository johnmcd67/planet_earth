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
import { getCentroid } from "../GeographyRegions/utils";
import { OCEAN_SEA_VISIBILITY_ALTITUDE } from "./constants";

interface GeoJsonFeature {
  properties: { name?: string; featurecla?: string };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

interface Props {
  visible: boolean;
}

export default function OceanSeaLabels({ visible }: Props) {
  const { viewer } = useCesium();
  const entitiesRef = useRef<Entity[]>([]);
  const removeListenerRef = useRef<(() => void) | null>(null);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  useEffect(() => {
    if (!viewer) return;

    const abortController = new AbortController();

    fetch(`${import.meta.env.BASE_URL}data/ocean_seas.geojson`, { signal: abortController.signal })
      .then((res) => res.json())
      .then((geojson) => {
        if (abortController.signal.aborted || viewer.isDestroyed()) return;

        const seen = new Set<string>();
        const entities: Entity[] = [];

        for (const feature of geojson.features as GeoJsonFeature[]) {
          const name = feature.properties?.name;
          if (!name || seen.has(name)) continue;
          seen.add(name);

          const centroid = getCentroid(feature);
          if (!centroid) continue;

          const entity = viewer.entities.add({
            position: Cartesian3.fromDegrees(centroid[0], centroid[1]),
            label: {
              text: name,
              font: "bold 28px sans-serif",
              fillColor: Color.WHITE.withAlpha(0.9),
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              style: LabelStyle.FILL_AND_OUTLINE,
              heightReference: HeightReference.CLAMP_TO_GROUND,
              verticalOrigin: VerticalOrigin.BOTTOM,
              scaleByDistance: new NearFarScalar(1e5, 1.0, 2e7, 0.4),
            },
          });
          entities.push(entity);
        }

        entitiesRef.current = entities;

        const onCameraChange = () => {
          const height = viewer.camera.positionCartographic.height;
          const show = visibleRef.current && height >= OCEAN_SEA_VISIBILITY_ALTITUDE;
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
      abortController.abort();
      if (removeListenerRef.current) removeListenerRef.current();
      if (viewer && !viewer.isDestroyed()) {
        for (const entity of entitiesRef.current) {
          viewer.entities.remove(entity);
        }
        entitiesRef.current = [];
      }
    };
  }, [viewer]);

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    const height = viewer.camera.positionCartographic.height;
    const show = visible && height >= OCEAN_SEA_VISIBILITY_ALTITUDE;
    for (const entity of entitiesRef.current) {
      entity.show = show;
    }
  }, [visible, viewer]);

  return null;
}
