import { useState } from "react";
import Globe from "./components/Globe/Globe";
import Rivers from "./components/Rivers/Rivers";
import RiverLabels from "./components/Rivers/RiverLabels";
import GeographyRegions from "./components/GeographyRegions/GeographyRegions";
import GeographyRegionLabels from "./components/GeographyRegions/GeographyRegionLabels";
import Sidebar from "./components/Sidebar/Sidebar";
import CoordinateDisplay from "./components/CoordinateDisplay/CoordinateDisplay";
import ZoomControls from "./components/ZoomControls/ZoomControls";
import OceanSeaLabels from "./components/OceanSeaLabels/OceanSeaLabels";
import MountainPeakLabels from "./components/MountainPeaks/MountainPeakLabels";
import { TOGGLE_CLASSES } from "./components/GeographyRegions/constants";

function App() {
  const [enabledClasses, setEnabledClasses] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(TOGGLE_CLASSES.map((k) => [k, false])));

  const handleToggle = (cls: string) =>
    setEnabledClasses((prev) => ({ ...prev, [cls]: !prev[cls] }));

  const handleToggleAll = (on: boolean) =>
    setEnabledClasses(Object.fromEntries(TOGGLE_CLASSES.map((k) => [k, on])));

  const [showRivers, setShowRivers] = useState(false);
  const handleToggleRivers = () => setShowRivers((v) => !v);

  const [showOceanSeas, setShowOceanSeas] = useState(false);
  const handleToggleOceanSeas = () => setShowOceanSeas((v) => !v);

  const [showMountainPeaks, setShowMountainPeaks] = useState(false);
  const handleToggleMountainPeaks = () => setShowMountainPeaks((v) => !v);

  return (
    <Globe>
      <Rivers visible={showRivers} />
      <RiverLabels visible={showRivers} />
      <GeographyRegions enabledClasses={enabledClasses} />
      <GeographyRegionLabels enabledClasses={enabledClasses} />
      <OceanSeaLabels visible={showOceanSeas} />
      <MountainPeakLabels visible={showMountainPeaks} />
      <CoordinateDisplay />
      <ZoomControls />
      <Sidebar enabledClasses={enabledClasses} onToggle={handleToggle} onToggleAll={handleToggleAll} showRivers={showRivers} onToggleRivers={handleToggleRivers} showOceanSeas={showOceanSeas} onToggleOceanSeas={handleToggleOceanSeas} showMountainPeaks={showMountainPeaks} onToggleMountainPeaks={handleToggleMountainPeaks} />
    </Globe>
  );
}

export default App;
