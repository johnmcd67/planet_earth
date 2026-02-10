import { useEffect, useState, useRef } from "react";
import { useCesium } from "resium";
import {
  Cartesian2,
  Cartographic,
  Math as CesiumMath,
  EllipsoidGeodesic,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Color,
} from "cesium";
import type { MeasurementPoint, MeasurementResult } from "../../types";

const KM_PER_METER = 0.001;
const MILES_PER_METER = 0.000621371;

export default function MeasurementTool() {
  const { viewer } = useCesium();
  const [active, setActive] = useState(false);
  const [points, setPoints] = useState<MeasurementPoint[]>([]);
  const [result, setResult] = useState<MeasurementResult | null>(null);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const entitiesRef = useRef<any[]>([]);

  function clearEntities() {
    if (!viewer) return;
    for (const e of entitiesRef.current) {
      viewer.entities.remove(e);
    }
    entitiesRef.current = [];
  }

  function handleClear() {
    setPoints([]);
    setResult(null);
    clearEntities();
  }

  function toggleActive() {
    if (active) {
      handleClear();
    }
    setActive((prev) => !prev);
  }

  useEffect(() => {
    if (!viewer || !active) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;

    handler.setInputAction(
      (click: { position: Cartesian2 }) => {
        const cartesian = viewer.camera.pickEllipsoid(click.position);
        if (!cartesian) return;

        const carto = Cartographic.fromCartesian(cartesian);
        const point: MeasurementPoint = {
          latitude: CesiumMath.toDegrees(carto.latitude),
          longitude: CesiumMath.toDegrees(carto.longitude),
          height: carto.height,
        };

        setPoints((prev) => {
          if (prev.length >= 2) return prev;
          const next = [...prev, point];

          // Add point entity on globe
          const entity = viewer.entities.add({
            position: cartesian,
            point: {
              pixelSize: 8,
              color: Color.YELLOW,
              outlineColor: Color.BLACK,
              outlineWidth: 1,
            },
          });
          entitiesRef.current.push(entity);

          if (next.length === 2) {
            const p0 = next[0]!;
            const p1 = next[1]!;
            const carto1 = Cartographic.fromDegrees(p0.longitude, p0.latitude);
            const carto2 = Cartographic.fromDegrees(p1.longitude, p1.latitude);
            const geo = new EllipsoidGeodesic(carto1, carto2);
            const meters = geo.surfaceDistance;
            setResult({
              points: [p0, p1],
              distanceMeters: meters,
              distanceKm: meters * KM_PER_METER,
              distanceMiles: meters * MILES_PER_METER,
            });
          }

          return next;
        });
      },
      ScreenSpaceEventType.LEFT_CLICK
    );

    return () => {
      handler.destroy();
      handlerRef.current = null;
    };
  }, [viewer, active]);

  // Cleanup entities on unmount
  useEffect(() => {
    return () => clearEntities();
  }, [viewer]);

  return (
    <div className="sidebar-section">
      <h3>Measure</h3>
      <button
        className={`measure-toggle ${active ? "active" : ""}`}
        onClick={toggleActive}
      >
        {active ? "Cancel" : "Measure Distance"}
      </button>
      {active && points.length < 2 && (
        <p className="sidebar-hint">
          Click {points.length === 0 ? "first" : "second"} point on globe
        </p>
      )}
      {result && (
        <div className="measure-result">
          <p>{result.distanceKm.toFixed(2)} km</p>
          <p>{result.distanceMiles.toFixed(2)} mi</p>
          <button onClick={handleClear}>Clear</button>
        </div>
      )}
    </div>
  );
}
