import { useRef, useEffect, type ReactNode } from "react";
import { Viewer as ResiumViewer } from "resium";
import { Terrain, Viewer } from "cesium";
import "./Globe.css";

export default function Globe({ children }: { children?: ReactNode }) {
  const viewerRef = useRef<{ cesiumElement?: Viewer }>(null);

  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    viewer.scene.setTerrain(
      Terrain.fromWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true,
      })
    );

    viewer.scene.verticalExaggeration = 1.5;
    viewer.scene.globe.enableLighting = true;
    viewer.scene.fog.enabled = true;
    viewer.scene.globe.depthTestAgainstTerrain = true;
  }, []);

  return (
    <ResiumViewer
      ref={viewerRef as any}
      full
      animation={false}
      timeline={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      baseLayerPicker={false}
      navigationHelpButton={false}
      fullscreenButton={false}
      selectionIndicator={false}
      infoBox={false}
    >
      {children}
    </ResiumViewer>
  );
}
