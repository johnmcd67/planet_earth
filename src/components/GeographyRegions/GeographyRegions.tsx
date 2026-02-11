import { useEffect, useRef, useState, useMemo } from "react";
import { GeoJsonDataSource } from "resium";
import { Color } from "cesium";
import { useCesium } from "resium";
import { GEOGRAPHY_VISIBILITY_ALTITUDE, FEATURE_CLASSES } from "./constants";
import { splitByFeatureClass } from "./utils";

interface Props {
  enabledClasses: Record<string, boolean>;
}

export default function GeographyRegions({ enabledClasses }: Props) {
  const { viewer } = useCesium();
  const [visible, setVisible] = useState(true);
  const [dataByClass, setDataByClass] = useState<Record<string, unknown>>({});
  const removeListener = useRef<(() => void) | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    fetch(`${import.meta.env.BASE_URL}data/geography_regions.geojson`, {
      signal: abortController.signal,
    })
      .then((res) => res.json())
      .then((geojson) => {
        if (abortController.signal.aborted) return;
        setDataByClass(splitByFeatureClass(geojson));
      })
      .catch(() => {});

    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    if (!viewer) return;

    const onCameraChange = () => {
      const height = viewer.camera.positionCartographic.height;
      setVisible(height >= GEOGRAPHY_VISIBILITY_ALTITUDE);
    };

    removeListener.current =
      viewer.camera.changed.addEventListener(onCameraChange);
    viewer.camera.percentageChanged = 0.01;
    onCameraChange();

    return () => {
      if (removeListener.current) removeListener.current();
    };
  }, [viewer]);

  const dataSources = useMemo(() => {
    return Object.entries(dataByClass)
      .filter(([cls]) => FEATURE_CLASSES[cls])
      .map(([cls, fc]) => {
        const config = FEATURE_CLASSES[cls]!;
        return { cls, fc, config };
      });
  }, [dataByClass]);

  return (
    <>
      {dataSources.map(
        ({ cls, fc, config }) =>
          enabledClasses[cls] && (
            <GeoJsonDataSource
              key={cls}
              data={fc as unknown as string}
              fill={Color.fromCssColorString(config.color).withAlpha(0.15)}
              stroke={Color.fromCssColorString(config.color).withAlpha(0.6)}
              strokeWidth={1}
              clampToGround={true}
              show={visible}
            />
          )
      )}
    </>
  );
}
