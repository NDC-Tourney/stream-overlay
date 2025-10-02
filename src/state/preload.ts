import {
  useMatchesQuery,
  useMappoolQuery,
  useTournamentQuery,
  useScheduleQuery,
} from "./huis";

export function usePreload() {
  useMatchesQuery();
  useMappoolQuery();
  useTournamentQuery();
  useScheduleQuery();
}
