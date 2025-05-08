import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@/shared/styles/font.css";
import "@/shared/styles/tailwind.css";
import "@/shared/styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
