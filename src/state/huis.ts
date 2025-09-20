import { getAvatarUrl, getBeatmapBgUrl, type WithRequired } from "@/util";
import { useQuery } from "@tanstack/react-query";

import { z } from "zod";
import { useSettings } from "./dashboard";
import dayjs from "dayjs";

const zodBinaryToBoolean = z
  .number()
  .min(0)
  .max(1)
  .or(z.boolean())
  .pipe(z.coerce.boolean());

const zodParseHuisApiDate = z.preprocess((val) => {
  if (typeof val === "string") {
    return dayjs(val, { utc: true }).toDate();
  }
  return val;
}, z.date());

const staffSchema = z
  .object({
    staff_user_uid: z.number().nullable(),
    staff_username: z.string().nullable(),
    role_uid: z.number().nullable(),
    staff_user_id: z.number().nullable(),
  })
  .transform((staff) => ({
    name: staff.staff_username,
    osuId: staff.staff_user_id,
    roleId: staff.role_uid,
  }));

const ROUND_NAMES: Record<string, string> = {
  ro32: "Round of 32",
  ro16: "Round of 16",
  qf: "Quarter Finals",
  sf: "Semi Finals",
  f: "Finals",
  gf: "Grand Finals",
  lr1: "Losers Round 1",
  lr2: "Losers Round 2",
  lr3: "Losers Round 3",
  lr4: "Losers Round 4",
  lr5: "Losers Round 5",
  lr6: "Losers Round 6",
  lr7: "Losers Round 7",
  lr8: "Losers Round 8",
  lr9: "Losers Round 9",
  lr10: "Losers Round 10",
  lr11: "Losers Round 11",
  lr12: "Losers Round 12",
  bracket_reset: "Bracket Reset",
  br: "Bracket Reset",
} as const;

const matchSchema = z
  .object({
    uid: z.number(),
    tourney_id: z.number(),

    match_date: zodParseHuisApiDate,

    is_loser_bracket: zodBinaryToBoolean,
    is_forfeit: zodBinaryToBoolean,
    is_conditional: zodBinaryToBoolean,
    is_rescheduled: zodBinaryToBoolean,

    is_winner_bracket_gf: zodBinaryToBoolean,
    is_bracket_reset: zodBinaryToBoolean,
    is_loser_bracket_gf: zodBinaryToBoolean,
    is_group_stage: zodBinaryToBoolean,
    is_showmatch: zodBinaryToBoolean,

    round_acronym: z.string(),

    player1_id: z.number(),
    player2_id: z.number(),

    seed1: z.number(),
    seed2: z.number(),
    id1: z.number(),
    id2: z.number(),
    name1: z.string(),
    name2: z.string(),

    team1_score: z.number(),
    team2_score: z.number(),
    winner: z.number().min(1).max(2).nullable(),

    staff: z.array(staffSchema),

    pickems_rate1: z.number(),
    pickems_rate2: z.number(),

    supporters: z.array(
      z.object({
        supported_user_id: z.number(),
      }),
    ),
  })
  .transform((match) => {
    const getPlayer = (i: 1 | 2) => ({
      name: match[`name${i}`],
      osuId: match[`player${i}_id`],
      seed: match[`seed${i}`],
      avatarUrl: getAvatarUrl(match[`player${i}_id`]),
      pickemsRate: match[`pickems_rate${i}`].toFixed(2),
      score: match[`team${i}_score`],
      winner: match.winner === i,
      supporters: match["supporters"].filter(
        (s) => s.supported_user_id === match[`player${i}_id`],
      ).length,
    });

    type Player = WithRequired<
      Partial<ReturnType<typeof getPlayer>>,
      "name" | "avatarUrl" | "pickemsRate" | "supporters" | "seed"
    >;

    return {
      uid: match.uid,
      tourneyId: match.tourney_id,
      roundAbbr: match.round_acronym,
      roundName: ROUND_NAMES[match.round_acronym] ?? "???",
      bracket: match.is_loser_bracket ? "losers" : "winners",
      date: match.match_date,
      player1: getPlayer(1) as Player,
      player2: getPlayer(2) as Player,
      showMatch: match.is_showmatch,
    };
  });

const matchesSchema = z
  .object({
    confirmed: z.array(matchSchema),
    conditionals: z.array(
      z.object({
        options: z.array(matchSchema),
      }),
    ),
  })
  .transform((matches) =>
    matches.confirmed
      .concat(matches.conditionals.flatMap((e) => e.options))
      .toSorted((a, b) => Number(a.date) - Number(b.date)),
  );

export type Match = z.infer<typeof matchSchema>;

export type Player = Match["player1"];

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

export function useCurrentMatchesQuery() {
  return useQuery({
    queryKey: ["huis", { tournament: TOURNEY_ID, type: "current_matches" }],
    queryFn: () => fetchMatches(),
  });
}

export function useMatchQuery(): WithRequired<
  Partial<Match>,
  "roundName" | "bracket" | "player1" | "player2"
> {
  const { data, error, isPending } = useCurrentMatchesQuery();
  const [settings] = useSettings();
  const matchId = settings.matchId;
  const avatarUrl = getAvatarUrl();

  if (isPending) {
    return {
      roundName: "???",
      bracket: "???",
      player1: {
        name: "???",
        avatarUrl,
        seed: 0,
        supporters: 0,
        pickemsRate: "0.00",
      },
      player2: {
        name: "???",
        avatarUrl,
        seed: 0,
        supporters: 0,
        pickemsRate: "0.00",
      },
    };
  }

  const match = data?.find((m) => m.uid === matchId);

  if (!match) {
    return {
      roundName: "Unknown round",
      bracket: "???",
      player1: {
        name: "Unknown player",
        avatarUrl,
        seed: 0,
        supporters: 0,
        pickemsRate: "0.00",
      },
      player2: {
        name: "Unknown player",
        avatarUrl,
        seed: 0,
        supporters: 0,
        pickemsRate: "0.00",
      },
    };
  }

  if (error) {
    console.error(error);
  }

  return match;
}

const tournamentSchema = z.object({
  rounds: z
    .array(
      z
        .object({
          acronym: z.string(),
          start_date: zodParseHuisApiDate,
          end_date: zodParseHuisApiDate,
        })
        .transform(({ start_date, end_date, ...round }) => ({
          startDate: start_date,
          endDate: end_date,
          ...round,
        })),
    )
    .transform((rounds) =>
      rounds.toSorted((a, b) => Number(a.startDate) - Number(b.startDate)),
    ),
});

const mappoolSchema = z
  .object({
    beatmaps: z.array(
      z.object({
        mod_bracket: z.literal(["NM", "HD", "HR", "DT", "TB"]),
        mod_bracket_index: z.number(),
        title: z.string(),
        artist: z.string(),
        creator_name: z.string(),
        creator_id: z.number(),
        diff_name: z.string(),
        set_id: z.number(),
        map_id: z.number(),
        is_custom_map: zodBinaryToBoolean,
        ar: z.number(),
        cs: z.number(),
        hp: z.number(),
        od: z.number(),
        bpm: z.number(),
      }),
    ),
  })
  .transform((mappool) =>
    mappool.beatmaps.map(
      ({
        mod_bracket,
        mod_bracket_index,
        creator_name,
        creator_id,
        diff_name,
        set_id,
        map_id,
        is_custom_map,
        ...map
      }) => ({
        modBracket: mod_bracket,
        modBracketIndex: mod_bracket_index,
        creatorName: creator_name,
        creatorId: creator_id,
        diffName: diff_name,
        setId: set_id,
        mapId: map_id,
        bgUrl: getBeatmapBgUrl(set_id),
        isCustomMap: is_custom_map,
        ...map,
      }),
    ),
  );

export type Mappool = z.infer<typeof mappoolSchema>;

export type Beatmap = Mappool[number];

async function fetchMappool(tourneyId: string, roundAbbr: string) {
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
  const { roundAbbr } = useMatchQuery();

  const { data: mappool } = useQuery({
    enabled: !!roundAbbr,
    queryKey: [
      "huis",
      { tournament: TOURNEY_ID, type: "mappool", round: roundAbbr },
    ],
    queryFn: () => (roundAbbr ? fetchMappool(TOURNEY_ID, roundAbbr) : []),
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

export function useScheduleQuery() {
  const tournament = useQuery({
    queryKey: ["huis", { tournament: TOURNEY_ID }],
    queryFn: fetchTournament,
  });

  const now = new Date();
  const currentRound = tournament.data?.rounds.find(
    (round) => Number(round.endDate) > Number(now),
  );

  const matches = useQuery({
    enabled: !!currentRound?.acronym,
    queryKey: [
      "huis",
      { tournament: TOURNEY_ID, type: "round_matches", round: currentRound },
    ],
    queryFn: () => fetchMatches(currentRound?.acronym),
  });

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
