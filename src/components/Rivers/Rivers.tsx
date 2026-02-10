import { useEffect, useRef, useState } from "react";
import { GeoJsonDataSource } from "resium";
import { Color } from "cesium";
import { useCesium } from "resium";

const RIVER_STYLE = {
  stroke: Color.fromCssColorString("#4682B4"),
  strokeWidth: 1.5,
  clampToGround: true,
};

import { RIVER_VISIBILITY_ALTITUDE } from "./constants";

interface Props {
  visible: boolean;
}

export default function Rivers({ visible }: Props) {
  const { viewer } = useCesium();
  const [altVisible, setAltVisible] = useState(true);
  const removeListener = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!viewer) return;

    const onCameraChange = () => {
      const height = viewer.camera.positionCartographic.height;
      setAltVisible(height >= RIVER_VISIBILITY_ALTITUDE);
    };

    removeListener.current = viewer.camera.changed.addEventListener(onCameraChange);
    // Set initial percentage threshold for changed event
    viewer.camera.percentageChanged = 0.01;
    onCameraChange();

    return () => {
      if (removeListener.current) removeListener.current();
    };
  }, [viewer]);

  return (
    <GeoJsonDataSource
      data="/data/rivers.geojson"
      stroke={RIVER_STYLE.stroke}
      strokeWidth={RIVER_STYLE.strokeWidth}
      clampToGround={RIVER_STYLE.clampToGround}
      show={visible && altVisible}
    />
  );
}
