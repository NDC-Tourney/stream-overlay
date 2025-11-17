import type { WithRequired } from "@tanstack/react-query";
import dayjs from "dayjs";
import { produce } from "immer";
import z from "zod";
import { getAvatarUrl, getBeatmapBgUrl } from "~/util";

const zodBinaryToBoolean = z
  .number()
  .min(0)
  .max(1)
  .or(z.boolean())
  .pipe(z.coerce.boolean());

const zodParseHuisApiDate = z.preprocess((val) => {
  if (typeof val === "string") {
    return dayjs(val, { utc: true }).valueOf();
  }
  return val;
}, z.number());

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

    seed1: z.number().nullable(),
    seed2: z.number().nullable(),
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
        supporter_user_id: z.number(),
        supporter_name: z.string(),
      }),
    ),
  })
  .transform((match) => {
    const getPlayer = (i: 1 | 2) => {
      const supporters = match["supporters"]
        .map((s) => ({
          name: s.supporter_name,
          id: s.supporter_user_id,
          supportingId: s.supported_user_id,
        }))
        .filter((s) => s.supportingId === match[`player${i}_id`]);

      return {
        name: match[`name${i}`],
        osuId: match[`player${i}_id`],
        seed: match[`seed${i}`],
        avatarUrl: getAvatarUrl(match[`player${i}_id`]),
        pickemsRate: match[`pickems_rate${i}`].toFixed(2),
        score: match[`team${i}_score`],
        winner: match.winner === i,
        supporters,
      };
    };

    type Player = WithRequired<
      Partial<ReturnType<typeof getPlayer>>,
      "name" | "avatarUrl" | "pickemsRate" | "supporters"
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
      isConditional: match.is_conditional,
      isShowmatch: match.is_showmatch,
    };
  });

export const matchesSchema = z
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
      .concat(
        matches.conditionals.flatMap((e) => {
          let player1Confirmed = e.options.every(
            (o) => o.player1.name === e.options[0]?.player1.name,
          );
          let player2Confirmed = e.options.every(
            (o) => o.player2.name === e.options[0]?.player2.name,
          );

          return e.options.map(
            produce((o) => {
              if (!player1Confirmed) {
                o.player1.name = `${o.player1.name}?`;
              }

              if (!player2Confirmed) {
                o.player2.name = `${o.player2.name}?`;
              }
            }),
          );
        }),
      )
      .toSorted((a, b) => a.date - b.date),
  );

export type Match = WithRequired<
  Partial<z.infer<typeof matchSchema>>,
  "player1" | "player2" | "uid"
>;

export type Player = Match["player1"];

export const tournamentSchema = z.object({
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
      rounds.toSorted((a, b) => a.startDate - b.startDate),
    ),
});

export const mappoolSchema = z
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

export const supportersSchema = z.array(
  z
    .object({
      supported_name: z.string(),
      supported_user_id: z.number(),
      supporter_name: z.string(),
      supporter_user_id: z.number(),
    })
    .transform((s) => ({
      name: s.supporter_name,
      userId: s.supporter_user_id,
      supportedName: s.supported_name,
      supportedUserId: s.supported_user_id,
    })),
);

export type Supporters = z.infer<typeof supportersSchema>;

export const FlagsSchema = z.object({
  regions: z.array(
    z.object({
      data: z.base64(),
      extension: z.string(),
      mime: z.string(),
      name: z.string(),
    }),
  ),
  teams: z.array(
    z.object({
      data: z.base64(),
      extension: z.string(),
      mime: z.string(),
      name: z.string(),
    }),
  ),
});

export type Flags = z.infer<typeof FlagsSchema>;
