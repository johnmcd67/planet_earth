import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initCesium } from "./cesium-config";
import App from "./App";
import "./App.css";

initCesium();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
