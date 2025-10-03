import {
  useMatchesQuery,
  useMappoolQuery,
  useTournamentQuery,
  useScheduleQuery,
  useSupportersQuery,
} from "./state/huis";

export function usePreload() {
  useMatchesQuery();
  useMappoolQuery();
  useTournamentQuery();
  useScheduleQuery();
  useSupportersQuery();
}
