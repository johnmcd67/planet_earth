import { useState } from "react";
import BookmarkList from "./BookmarkList";
import MeasurementTool from "./MeasurementTool";
import LayerToggles from "./LayerToggles";
import Search from "./Search";
import "./Sidebar.css";

interface Props {
  enabledClasses: Record<string, boolean>;
  onToggle: (cls: string) => void;
  onToggleAll: (on: boolean) => void;
  showRivers: boolean;
  onToggleRivers: () => void;
  showOceanSeas: boolean;
  onToggleOceanSeas: () => void;
  showMountainPeaks: boolean;
  onToggleMountainPeaks: () => void;
}

export default function Sidebar({ enabledClasses, onToggle, onToggleAll, showRivers, onToggleRivers, showOceanSeas, onToggleOceanSeas, showMountainPeaks, onToggleMountainPeaks }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`sidebar-toggle ${open ? "shifted" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title={open ? "Close sidebar" : "Open sidebar"}
      >
        {open ? "\u2190" : "\u2630"}
      </button>
      <div className={`sidebar ${open ? "open" : ""}`}>
        <Search />
        <LayerToggles enabledClasses={enabledClasses} onToggle={onToggle} onToggleAll={onToggleAll} showRivers={showRivers} onToggleRivers={onToggleRivers} showOceanSeas={showOceanSeas} onToggleOceanSeas={onToggleOceanSeas} showMountainPeaks={showMountainPeaks} onToggleMountainPeaks={onToggleMountainPeaks} />
        <BookmarkList />
        <MeasurementTool />
      </div>
    </>
  );
}
