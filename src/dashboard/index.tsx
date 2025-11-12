import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ZodError } from "zod";
import "~/dayjs.ts";
import { DashboardSettingsProvider } from "~/state/dashboard.tsx";
import { TosuProvider } from "~/state/tosu.tsx";
import "./dashboard.css";
import { Dashboard } from "./Dashboard.tsx";
import { IconContext } from "@phosphor-icons/react";

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
            <IconContext.Provider
              value={{
                height: "1em",
                width: "1em",
                weight: "bold",
              }}
            >
              <Dashboard />
            </IconContext.Provider>
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
