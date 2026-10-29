import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/space-grotesk/400.css";
import "./styles/tokens.css";
import "./styles/global.css";
import { App } from "./ui/App";
const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
