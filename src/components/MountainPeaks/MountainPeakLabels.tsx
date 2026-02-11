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
import { PEAK_VISIBILITY_ALTITUDE } from "./constants";

interface GeoJsonFeature {
  properties: { name?: string; elevation?: number };
  geometry: {
    type: string;
    coordinates: number[];
  };
}

interface Props {
  visible: boolean;
}

export default function MountainPeakLabels({ visible }: Props) {
  const { viewer } = useCesium();
  const entitiesRef = useRef<Entity[]>([]);
  const removeListenerRef = useRef<(() => void) | null>(null);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  useEffect(() => {
    if (!viewer) return;

    const abortController = new AbortController();

    fetch(`${import.meta.env.BASE_URL}data/mountain_peaks.geojson`, { signal: abortController.signal })
      .then((res) => res.json())
      .then((geojson) => {
        if (abortController.signal.aborted || viewer.isDestroyed()) return;

        const seen = new Set<string>();
        const entities: Entity[] = [];

        for (const feature of geojson.features as GeoJsonFeature[]) {
          const name = feature.properties?.name;
          if (!name || seen.has(name)) continue;
          seen.add(name);

          const coords = feature.geometry.coordinates;
          if (coords[0] == null || coords[1] == null) continue;

          const elevation = feature.properties?.elevation ?? 0;
          const label = `${name} (${elevation.toLocaleString()}m)`;

          const entity = viewer.entities.add({
            position: Cartesian3.fromDegrees(coords[0], coords[1]),
            label: {
              text: label,
              font: "bold 18px sans-serif",
              fillColor: Color.WHITE.withAlpha(0.9),
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              style: LabelStyle.FILL_AND_OUTLINE,
              heightReference: HeightReference.CLAMP_TO_GROUND,
              verticalOrigin: VerticalOrigin.BOTTOM,
              scaleByDistance: new NearFarScalar(1e5, 1.0, 8e6, 0.3),
            },
          });
          entities.push(entity);
        }

        entitiesRef.current = entities;

        const onCameraChange = () => {
          const height = viewer.camera.positionCartographic.height;
          const show = visibleRef.current && height >= PEAK_VISIBILITY_ALTITUDE;
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
    const show = visible && height >= PEAK_VISIBILITY_ALTITUDE;
    for (const entity of entitiesRef.current) {
      entity.show = show;
    }
  }, [visible, viewer]);

  return null;
}
