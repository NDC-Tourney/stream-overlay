import { getAvatarUrl } from "@/util";
import { useQuery } from "@tanstack/react-query";

import {
  mappoolSchema,
  matchesSchema,
  tournamentSchema,
  type Beatmap,
  type Match,
  type Player,
} from "@/schemas/huis";
import { useSettings } from "./dashboard";

async function fetchMatches(round: string = "current-week") {
  console.log("fetching matches");
  const response = await fetch(
    `https://api.tourney.huismetbenen.nl/matches/list/${round}`,
    {
      headers: { "x-tourney-id": TOURNEY_ID },
    },
  );

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${response.text}`,
    );
  }

  const data = await response.json();
  return matchesSchema.parse(data);
}

const TOURNEY_ID = "31"; // TODO: add tourney selection

export function useMatchesQuery() {
  const {
    data: matches,
    error,
    isPending,
  } = useQuery({
    queryKey: ["huis", { tournament: TOURNEY_ID, type: "current_matches" }],
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

async function fetchMappool(tourneyId: string, roundAbbr?: string) {
  console.assert(roundAbbr, "roundAbbr is undefined (wtf)");

  console.log("fetching mappool");
  const response = await fetch(
    `https://api.tourney.huismetbenen.nl/mappools/get/${roundAbbr}`,
    {
      headers: { "x-tourney-id": tourneyId },
    },
  );

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${response.text}`,
    );
  }

  const data = await response.json();
  return mappoolSchema.parse(data);
}

export function useMappoolQuery() {
  const { currentMatch } = useMatchesQuery();
  const roundAbbr = currentMatch?.roundAbbr;

  const { data: mappool } = useQuery({
    enabled: !!roundAbbr,
    queryKey: [
      "huis",
      { tournament: TOURNEY_ID, type: "mappool", round: roundAbbr },
    ],
    queryFn: () => fetchMappool(TOURNEY_ID, roundAbbr),
  });

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
  console.log("fetching tournament");
  const response = await fetch(
    `https://api.tourney.huismetbenen.nl/tournament/get/${TOURNEY_ID}`,
  );

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${response.text}`,
    );
  }

  const data = await response.json();
  return tournamentSchema.parse(data);
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
    queryFn: () => fetchMatches(currentRoundAcronym),
  });
}

export function useScheduleQuery() {
  const tournament = useTournamentQuery();

  const now = new Date();
  const currentRound = tournament.data?.rounds.find(
    (round) => Number(round.endDate) > Number(now),
  );

  const matches = useCurrentRoundMatchesQuery(currentRound?.acronym);

  if (!matches.data) {
    return {
      ...matches,
      data: { round: currentRound?.acronym ?? "???", upcoming: [], recent: [] },
    };
  }

  const splitMatches: { upcoming: Match[]; recent: Match[] } = {
    upcoming: [],
    recent: [],
  };

  for (const match of matches.data) {
    if (match.date < now) {
      splitMatches.recent.unshift(match);
    } else {
      splitMatches.upcoming.push(match);
    }
  }

  return {
    ...matches,
    data: splitMatches,
  };
}
