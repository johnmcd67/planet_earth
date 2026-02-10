import { useState } from "react";
import BookmarkList from "./BookmarkList";
import MeasurementTool from "./MeasurementTool";
import LayerToggles from "./LayerToggles";
import "./Sidebar.css";

interface Props {
  enabledClasses: Record<string, boolean>;
  onToggle: (cls: string) => void;
}

export default function Sidebar({ enabledClasses, onToggle }: Props) {
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
        <LayerToggles enabledClasses={enabledClasses} onToggle={onToggle} />
        <BookmarkList />
        <MeasurementTool />
      </div>
    </>
  );
}
