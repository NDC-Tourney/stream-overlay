import { useQuery } from "@tanstack/react-query";
import { getAvatarUrl, preloadImage } from "~/util";

import type { output, ZodType } from "zod";
import {
  FlagsSchema,
  mappoolSchema,
  matchesSchema,
  supportersSchema,
  tournamentSchema,
  type Beatmap,
  type Match,
  type Player,
} from "~/schemas/huis";
import { useSettings } from "./dashboard";

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
    headers: { "x-tourney-id": TOURNAMENT_ID },
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

const TOURNAMENT_ID = "33"; // TODO: add tournament selection

export function useMatchesQuery() {
  const {
    data: matches,
    error,
    isPending,
  } = useQuery({
    queryKey: ["huis", "matches", "current-week"],
    queryFn: () => fetchMatches(),
  });

  const defaultAvatarUrl = getAvatarUrl("");

  const defaultPlayer: Player = {
    name: "???",
    avatarUrl: defaultAvatarUrl,
    supporters: [],
    pickemsRate: "0.00",
    winner: false,
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

  preloadImage(currentMatch.player1.avatarUrl);
  preloadImage(currentMatch.player2.avatarUrl);

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
    queryKey: ["huis", "mappool", roundAbbr],
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
    preloadImage(beatmap.bgUrl);
    mappoolGrouped[beatmap.modBracket].push(beatmap);
  }

  return {
    beatmaps: mappoolGrouped,
  };
}

async function fetchTournament() {
  return fetchAndParse(`tournament/get/${TOURNAMENT_ID}`, tournamentSchema);
}

export function useTournamentQuery() {
  return useQuery({
    queryKey: ["huis", "tournament", TOURNAMENT_ID],
    queryFn: fetchTournament,
  });
}

async function fetchFlags() {
  return fetchAndParse(`assets/flags/tournament`, FlagsSchema);
}

export function useFlagsQuery() {
  return useQuery({
    queryKey: ["huis", "flags", TOURNAMENT_ID],
    queryFn: fetchFlags,
  });
}

function useCurrentRoundMatchesQuery(currentRoundAcronym?: string) {
  return useQuery({
    enabled: !!currentRoundAcronym,
    queryKey: ["huis", "matches", currentRoundAcronym],
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

  const now = Date.now();
  const currentRound = tournament.data?.rounds.find(
    (round) => round.endDate > now,
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
    preloadImage(match.player1.avatarUrl);
    preloadImage(match.player2.avatarUrl);

    if (match.date < now) {
      splitMatches.recent.unshift(match);
    } else {
      splitMatches.upcoming.push(match);
    }
  }

  return splitMatches;
}

function fetchSupporters() {
  return fetchAndParse("banners/list", supportersSchema);
}

export function useSupportersQuery() {
  const { data: supporters, error } = useQuery({
    queryKey: ["huis", "supporters"],
    queryFn: fetchSupporters,
  });

  if (error) {
    console.error(error);
  }

  if (!supporters) {
    return [];
  }

  supporters.forEach((s) => preloadImage(getAvatarUrl(s.userId)));

  return supporters;
}
