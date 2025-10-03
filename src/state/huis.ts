import { getAvatarUrl } from "@/util";
import { useQuery } from "@tanstack/react-query";

import {
  mappoolSchema,
  matchesSchema,
  supportersSchema,
  tournamentSchema,
  type Beatmap,
  type Match,
  type Player,
} from "@/schemas/huis";
import { useSettings } from "./dashboard";
import type { output, ZodType } from "zod";

const API_BASE = "https://api.tourney.huismetbenen.nl";

async function fetchAndParse<T extends ZodType>(
  url: string,
  schema: T,
): Promise<output<T>> {
  if (url.startsWith(API_BASE)) {
    url = url.replace(API_BASE, "");
  }

  console.log(`fetching ${url}`);

  const response = await fetch(`https://api.tourney.huismetbenen.nl/${url}`, {
    headers: { "x-tourney-id": TOURNEY_ID },
  });

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${await response.text()}`,
    );
  }

  const data = await response.json();
  return schema.parse(data);
}

async function fetchMatches(round: string = "current-week") {
  return fetchAndParse(`matches/list/${round}`, matchesSchema);
}

const TOURNEY_ID = "31"; // TODO: add tourney selection

export function useMatchesQuery() {
  const {
    data: matches,
    error,
    isPending,
  } = useQuery({
    queryKey: [
      "huis",
      { tournament: TOURNEY_ID, type: "matches", round: "current-week" },
    ],
    queryFn: () => fetchMatches(),
  });

  const defaultAvatarUrl = getAvatarUrl("");

  const defaultPlayer: Player = {
    name: "???",
    avatarUrl: defaultAvatarUrl,
    seed: 0,
    supporters: [],
    pickemsRate: "0.00",
    winner: false,
    osuId: 0,
    score: 0,
  };

  const defaultCurrentMatch: Match = {
    uid: 0,
    roundName: "???",
    bracket: "???",
    player1: defaultPlayer,
    player2: defaultPlayer,
  };

  const unknownPlayer: Player = {
    ...defaultPlayer,
    name: "Unknown player",
  };

  const unknownCurrentMatch: Match = {
    ...defaultCurrentMatch,
    roundName: "Unknown round",
    player1: unknownPlayer,
    player2: unknownPlayer,
  };

  const [{ matchId }] = useSettings();
  const currentMatch =
    isPending || !matchId
      ? defaultCurrentMatch
      : (matches?.find((m) => m.uid === matchId) ?? unknownCurrentMatch);

  if (error) {
    console.error(error);
  }

  return { currentMatch, matches };
}

async function fetchMappool(roundAbbr?: string) {
  return fetchAndParse(`mappools/get/${roundAbbr}`, mappoolSchema);
}

export function useMappoolQuery() {
  const { currentMatch } = useMatchesQuery();
  const roundAbbr = currentMatch?.roundAbbr;

  const { data: mappool, error } = useQuery({
    enabled: !!roundAbbr,
    queryKey: [
      "huis",
      { tournament: TOURNEY_ID, type: "mappool", round: roundAbbr },
    ],
    queryFn: () => {
      console.assert(roundAbbr, "roundAbbr is undefined (wtf)");
      return fetchMappool(roundAbbr);
    },
  });

  if (error) {
    console.error(error);
  }

  const mappoolGrouped: Record<Beatmap["modBracket"], Beatmap[]> = {
    NM: [],
    HD: [],
    HR: [],
    DT: [],
    TB: [],
  };

  for (const beatmap of mappool ?? []) {
    mappoolGrouped[beatmap.modBracket].push(beatmap);
  }

  return {
    beatmaps: mappoolGrouped,
  };
}

async function fetchTournament() {
  return fetchAndParse(`tournament/get/${TOURNEY_ID}`, tournamentSchema);
}

export function useTournamentQuery() {
  return useQuery({
    queryKey: ["huis", { tournament: TOURNEY_ID }],
    queryFn: fetchTournament,
  });
}

function useCurrentRoundMatchesQuery(currentRoundAcronym?: string) {
  return useQuery({
    enabled: !!currentRoundAcronym,
    queryKey: [
      "huis",
      {
        tournament: TOURNEY_ID,
        type: "round_matches",
        round: currentRoundAcronym,
      },
    ],
    queryFn: () => {
      console.assert(
        currentRoundAcronym,
        "currentRoundAcronym is undefined (wtf)",
      );
      return fetchMatches(currentRoundAcronym);
    },
  });
}

export function useScheduleQuery() {
  const tournament = useTournamentQuery();

  const now = new Date();
  const currentRound = tournament.data?.rounds.find(
    (round) => Number(round.endDate) > Number(now),
  );

  const { data: matches, error } = useCurrentRoundMatchesQuery(
    currentRound?.acronym,
  );

  if (error) {
    console.error(error);
  }

  if (!matches) {
    return {
      round: currentRound?.acronym ?? "???",
      upcoming: [],
      recent: [],
    };
  }

  const splitMatches: { upcoming: Match[]; recent: Match[] } = {
    upcoming: [],
    recent: [],
  };

  for (const match of matches) {
    if (match.date < now) {
      splitMatches.recent.unshift(match);
    } else {
      splitMatches.upcoming.push(match);
    }
  }

  return splitMatches;
}
