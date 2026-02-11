import { useCesium } from "resium";
import "./ZoomControls.css";

export default function ZoomControls() {
  const { viewer } = useCesium();

  function zoom(direction: "in" | "out") {
    if (!viewer || viewer.isDestroyed()) return;
    const amount = viewer.camera.positionCartographic.height * 0.4;
    if (direction === "in") {
      viewer.camera.zoomIn(amount);
    } else {
      viewer.camera.zoomOut(amount);
    }
  }

  return (
    <div className="zoom-controls">
      <button className="zoom-btn" onClick={() => zoom("in")} aria-label="Zoom in">
        +
      </button>
      <button className="zoom-btn" onClick={() => zoom("out")} aria-label="Zoom out">
        −
      </button>
    </div>
  );
}
