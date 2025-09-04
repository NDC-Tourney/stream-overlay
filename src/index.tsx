import { createRoot } from "react-dom/client";
import { App } from "./App";
import { StrictMode } from "react";
import "./dayjs";

function start() {
  const rootEl = document.getElementById("root");

  if (!rootEl) {
    throw "root element missing";
  }

  const root = (import.meta.hot.data.root ??= createRoot(rootEl));
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
