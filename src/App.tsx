import { useState } from "react";
import Globe from "./components/Globe/Globe";
import Rivers from "./components/Rivers/Rivers";
import RiverLabels from "./components/Rivers/RiverLabels";
import GeographyRegions from "./components/GeographyRegions/GeographyRegions";
import GeographyRegionLabels from "./components/GeographyRegions/GeographyRegionLabels";
import Sidebar from "./components/Sidebar/Sidebar";
import CoordinateDisplay from "./components/CoordinateDisplay/CoordinateDisplay";
import { TOGGLE_CLASSES } from "./components/GeographyRegions/constants";

function App() {
  const [enabledClasses, setEnabledClasses] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(TOGGLE_CLASSES.map((k) => [k, true])));

  const handleToggle = (cls: string) =>
    setEnabledClasses((prev) => ({ ...prev, [cls]: !prev[cls] }));

  return (
    <Globe>
      <Rivers />
      <RiverLabels />
      <GeographyRegions enabledClasses={enabledClasses} />
      <GeographyRegionLabels enabledClasses={enabledClasses} />
      <CoordinateDisplay />
      <Sidebar enabledClasses={enabledClasses} onToggle={handleToggle} />
    </Globe>
  );
}

export default App;
