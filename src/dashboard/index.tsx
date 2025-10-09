import { createRoot } from "react-dom/client";
import { Dashboard } from "./Dashboard.tsx";
import { StrictMode } from "react";
import "./dashboard.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardSettingsProvider } from "@/state/dashboard.tsx";
import "@/dayjs.ts";
import { ZodError } from "zod";
import { TosuProvider } from "@/state/tosu.tsx";

function start() {
  const rootEl = document.getElementById("root");

  if (!rootEl) {
    throw "root element missing";
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        experimental_prefetchInRender: true,
        staleTime: 0,
        retry: (_, error) => !(error instanceof ZodError),
      },
    },
  });

  const root = (import.meta.hot.data.root ??= createRoot(rootEl));
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <DashboardSettingsProvider>
          <TosuProvider>
            <Dashboard />
          </TosuProvider>
        </DashboardSettingsProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
