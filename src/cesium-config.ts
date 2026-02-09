import { Ion } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

export function initCesium(): void {
  Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN || "";
}
