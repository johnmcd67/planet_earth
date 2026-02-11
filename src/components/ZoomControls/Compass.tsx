import { useEffect, useRef, useState } from "react";
import { useCesium } from "resium";
import { Math as CesiumMath } from "cesium";
import "./Compass.css";

export default function Compass() {
  const { viewer } = useCesium();
  const [heading, setHeading] = useState(0);
  const removeListener = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!viewer) return;

    const update = () => {
      setHeading(CesiumMath.toDegrees(viewer.camera.heading));
    };

    viewer.camera.percentageChanged = 0.01;
    removeListener.current = viewer.camera.changed.addEventListener(update);
    update();

    return () => {
      if (removeListener.current) removeListener.current();
    };
  }, [viewer]);

  function resetNorth() {
    if (!viewer || viewer.isDestroyed()) return;
    viewer.camera.flyTo({
      destination: viewer.camera.position,
      orientation: {
        heading: 0,
        pitch: viewer.camera.pitch,
        roll: 0,
      },
      duration: 0.5,
    });
  }

  return (
    <div className="compass">
      <button className="compass-btn" onClick={resetNorth} aria-label="Reset to north">
        <svg
          className="compass-arrow"
          viewBox="0 0 24 24"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          <polygon points="12,2 8,14 12,12 16,14" fill="#e74c3c" />
          <polygon points="12,22 8,14 12,12 16,14" fill="rgba(255,255,255,0.6)" />
        </svg>
      </button>
    </div>
  );
}
