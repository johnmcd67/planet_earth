import { FEATURE_CLASSES, TOGGLE_CLASSES } from "../GeographyRegions/constants";

interface Props {
  enabledClasses: Record<string, boolean>;
  onToggle: (cls: string) => void;
}

export default function LayerToggles({ enabledClasses, onToggle }: Props) {
  return (
    <div className="sidebar-section">
      <h3>Geographic Features</h3>
      <div className="layer-toggle-list">
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
  );
}
