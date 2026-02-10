import { useState, useEffect } from "react";
import { useCesium } from "resium";
import { Cartographic, Math as CesiumMath, Cartesian3 } from "cesium";
import type { Bookmark } from "../../types";

const STORAGE_KEY = "globe_bookmarks";

function loadBookmarks(): Bookmark[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export default function BookmarkList() {
  const { viewer } = useCesium();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  function handleSave() {
    if (!viewer) return;
    const cam = viewer.camera;
    const carto = Cartographic.fromCartesian(cam.position);
    const name = newName.trim() || `Bookmark ${bookmarks.length + 1}`;
    const bookmark: Bookmark = {
      id: crypto.randomUUID(),
      name,
      latitude: CesiumMath.toDegrees(carto.latitude),
      longitude: CesiumMath.toDegrees(carto.longitude),
      height: carto.height,
      heading: cam.heading,
      pitch: cam.pitch,
      roll: cam.roll,
      createdAt: Date.now(),
    };
    setBookmarks((prev) => [...prev, bookmark]);
    setNewName("");
  }

  function handleFlyTo(b: Bookmark) {
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(b.longitude, b.latitude, b.height),
      orientation: {
        heading: b.heading ?? 0,
        pitch: b.pitch ?? -CesiumMath.PI_OVER_TWO,
        roll: b.roll ?? 0,
      },
    });
  }

  function handleDelete(id: string) {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  function handleRenameStart(b: Bookmark) {
    setEditingId(b.id);
    setEditName(b.name);
  }

  function handleRenameConfirm() {
    if (!editingId) return;
    const name = editName.trim();
    if (name) {
      setBookmarks((prev) =>
        prev.map((b) => (b.id === editingId ? { ...b, name } : b))
      );
    }
    setEditingId(null);
  }

  const sorted = [...bookmarks].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="sidebar-section">
      <h3>Bookmarks</h3>
      <div className="bookmark-add">
        <input
          type="text"
          placeholder="Bookmark name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button onClick={handleSave} title="Save current view">
          +
        </button>
      </div>
      {sorted.length === 0 && (
        <p className="sidebar-hint">No bookmarks yet</p>
      )}
      <ul className="bookmark-list">
        {sorted.map((b) => (
          <li key={b.id}>
            {editingId === b.id ? (
              <input
                className="rename-input"
                value={editName}
                autoFocus
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
                onBlur={handleRenameConfirm}
              />
            ) : (
              <span
                className="bookmark-name"
                onClick={() => handleFlyTo(b)}
                title="Fly to"
              >
                {b.name}
              </span>
            )}
            <span className="bookmark-actions">
              <button onClick={() => handleRenameStart(b)} title="Rename">
                &#9998;
              </button>
              <button onClick={() => handleDelete(b.id)} title="Delete">
                &times;
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
