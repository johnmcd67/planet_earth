import { useEffect, useState } from "react";
import { useCesium } from "resium";
import {
  Cartesian2,
  Cartographic,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from "cesium";
import "./CoordinateDisplay.css";

export default function CoordinateDisplay() {
  const { viewer } = useCesium();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );

  useEffect(() => {
    if (!viewer) return;

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction(
      (movement: { endPosition: Cartesian2 }) => {
        const cartesian = viewer.camera.pickEllipsoid(movement.endPosition);
        if (!cartesian) {
          setCoords(null);
          return;
        }
        const carto = Cartographic.fromCartesian(cartesian);
        setCoords({
          lat: CesiumMath.toDegrees(carto.latitude),
          lon: CesiumMath.toDegrees(carto.longitude),
        });
      },
      ScreenSpaceEventType.MOUSE_MOVE
    );

    return () => handler.destroy();
  }, [viewer]);

  if (!coords) return null;

  const latDir = coords.lat >= 0 ? "N" : "S";
  const lonDir = coords.lon >= 0 ? "E" : "W";

  return (
    <div className="coordinate-display">
      {Math.abs(coords.lat).toFixed(3)}°{latDir},{" "}
      {Math.abs(coords.lon).toFixed(3)}°{lonDir}
    </div>
  );
}
