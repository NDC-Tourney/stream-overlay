import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { App } from "./App";
import "./dayjs";

function start() {
  const rootEl = document.getElementById("root");

  if (!rootEl) {
    throw "root element missing";
  }

  const root: Root = (import.meta.hot.data.root ??= createRoot(rootEl));
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
