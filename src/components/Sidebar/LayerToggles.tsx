import { useEffect, useRef } from "react";
import { FEATURE_CLASSES, TOGGLE_CLASSES } from "../GeographyRegions/constants";

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

export default function LayerToggles({ enabledClasses, onToggle, onToggleAll, showRivers, onToggleRivers, showOceanSeas, onToggleOceanSeas, showMountainPeaks, onToggleMountainPeaks }: Props) {
  const selectAllRef = useRef<HTMLInputElement>(null);

  const enabledCount = TOGGLE_CLASSES.filter((cls) => enabledClasses[cls]).length;
  const allOn = enabledCount === TOGGLE_CLASSES.length;
  const noneOn = enabledCount === 0;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = !allOn && !noneOn;
    }
  }, [allOn, noneOn]);

  return (
    <>
    <div className="sidebar-section">
      <h3>Layers</h3>
      <div className="layer-toggle-list">
        <label className="layer-toggle-item">
          <input
            type="checkbox"
            checked={showRivers}
            onChange={onToggleRivers}
          />
          <span
            className="layer-color-swatch"
            style={{ backgroundColor: "#4682B4" }}
          />
          Rivers
        </label>
        <label className="layer-toggle-item">
          <input
            type="checkbox"
            checked={showOceanSeas}
            onChange={onToggleOceanSeas}
          />
          <span
            className="layer-color-swatch"
            style={{ backgroundColor: "#1E90FF" }}
          />
          Oceans & Seas
        </label>
        <label className="layer-toggle-item">
          <input
            type="checkbox"
            checked={showMountainPeaks}
            onChange={onToggleMountainPeaks}
          />
          <span
            className="layer-color-swatch"
            style={{ backgroundColor: "#8B7355" }}
          />
          Mountain Peaks
        </label>
      </div>
    </div>
    <div className="sidebar-section">
      <h3>Geographic Features</h3>
      <div className="layer-toggle-list">
        <label className="layer-toggle-item" style={{ borderBottom: "1px solid #444", paddingBottom: 6, marginBottom: 4 }}>
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allOn}
            onChange={() => onToggleAll(!allOn)}
          />
          <em>Select All</em>
        </label>
        {TOGGLE_CLASSES.map((cls) => {
          const config = FEATURE_CLASSES[cls];
          if (!config) return null;
          return (
            <label key={cls} className="layer-toggle-item">
              <input
                type="checkbox"
                checked={enabledClasses[cls] ?? true}
                onChange={() => onToggle(cls)}
              />
              <span
                className="layer-color-swatch"
                style={{ backgroundColor: config.color }}
              />
              {config.label}
            </label>
          );
        })}
      </div>
    </div>
    </>
  );
}
