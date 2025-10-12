import {
  useMappoolQuery,
  useMatchesQuery,
  useScheduleQuery,
  useSupportersQuery,
  useTournamentQuery,
} from "./state/huis";

export function usePreload() {
  useMatchesQuery();
  useMappoolQuery();
  useTournamentQuery();
  useScheduleQuery();
  useSupportersQuery();
}
