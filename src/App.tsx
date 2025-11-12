import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ZodError } from "zod";
import { Screens } from "./Screens";
import { DashboardSettingsProvider } from "./state/dashboard";
import { TosuProvider } from "./state/tosu";
import "./static/style.css";
import { IconContext } from "@phosphor-icons/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      experimental_prefetchInRender: true,
      staleTime: 0,
      retry: (_, error) => !(error instanceof ZodError),
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardSettingsProvider>
        <TosuProvider>
          <IconContext.Provider
            value={{ height: "1em", width: "1em", weight: "bold" }}
          >
            <Screens />
          </IconContext.Provider>
        </TosuProvider>
      </DashboardSettingsProvider>
    </QueryClientProvider>
  );
}
