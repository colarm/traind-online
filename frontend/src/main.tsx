/**
 * React application entry point
 * Initializes theme and renders the root App component
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App";
import { initializeTheme } from "./utils/themeManager";

// Initialize theme system before rendering
initializeTheme();

// Render the React application
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
