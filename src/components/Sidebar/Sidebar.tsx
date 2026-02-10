import { useState } from "react";
import BookmarkList from "./BookmarkList";
import MeasurementTool from "./MeasurementTool";
import "./Sidebar.css";

export default function Sidebar() {
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
        <BookmarkList />
        <MeasurementTool />
      </div>
    </>
  );
}
