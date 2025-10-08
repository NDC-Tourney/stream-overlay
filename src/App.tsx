import "./static/style.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TosuProvider } from "./state/tosu";
import { DashboardSettingsProvider } from "./state/dashboard";
import { Screens } from "./Screens";
import { ZodError } from "zod";

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
          <Screens />
        </TosuProvider>
      </DashboardSettingsProvider>
    </QueryClientProvider>
  );
}
