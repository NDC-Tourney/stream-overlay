import { getBeatmapBgUrl } from "@/util";
import z from "zod";

const tosuBeatmapSchema = z.object({
  isKiai: z.boolean(),
  isBreak: z.boolean(),
  isConvert: z.boolean(),
  time: z.object({
    live: z.number(),
    firstObject: z.number(),
    lastObject: z.number(),
    mp3Length: z.number(),
  }),
  id: z.number(),
  set: z.number(),
  artist: z.string(),
  artistUnicode: z.string(),
  title: z.string(),
  titleUnicode: z.string(),
  mapper: z.string(),
  version: z.string(),
  stats: z.object({
    stars: z.object({
      live: z.number(),
      total: z.number(),
    }),
    ar: z.object({
      original: z.number(),
      converted: z.number(),
    }),
    cs: z.object({
      original: z.number(),
      converted: z.number(),
    }),
    od: z.object({
      original: z.number(),
      converted: z.number(),
    }),
    hp: z.object({
      original: z.number(),
      converted: z.number(),
    }),
    bpm: z.object({
      realtime: z.number(),
      common: z.number(),
      min: z.number(),
      max: z.number(),
    }),
    maxCombo: z.number(),
  }),
});

export const tosuApiResponseSchema = z
  .object({
    tourney: z.object({
      scoreVisible: z.boolean(),
      starsVisible: z.boolean(),
      ipcState: z.number(),
      bestOF: z.number(),
      team: z.object({
        left: z.string(),
        right: z.string(),
      }),
      points: z.object({
        left: z.number(),
        right: z.number(),
      }),
      chat: z.array(z.unknown()),
      totalScore: z.object({
        left: z.number(),
        right: z.number(),
      }),
      clients: z.array(
        z.object({
          beatmap: z.object({
            stats: tosuBeatmapSchema.shape.stats,
          }),
          play: z.object({
            mods: z.object({
              array: z.array(
                z.object({
                  acronym: z.string(),
                }),
              ),
            }),
          }),
        }),
      ),
    }),
    beatmap: tosuBeatmapSchema,
    directPath: z.object({
      beatmapBackground: z.string(),
    }),
    folders: z.object({
      game: z.string(),
      skin: z.string(),
      songs: z.string(),
      beatmap: z.string(),
    }),
  })
  .transform((tosuResponse) => {
    const { beatmap, directPath, folders, tourney } = tosuResponse;

    const beatmapBackgroundPath =
      `${folders.songs}/${directPath.beatmapBackground}`.replaceAll("\\", "/");

    const isDt = tourney.clients[0]?.play.mods.array
      .map((m) => m.acronym)
      .includes("DT");

    const length =
      (beatmap.time.lastObject - beatmap.time.firstObject) / (isDt ? 1.5 : 1);

    return {
      player1: {
        name: tourney.team.left,
        score: tourney.totalScore.left,
      },
      player2: {
        name: tourney.team.right,
        score: tourney.totalScore.right,
      },
      tourney: {
        scoreVisible: tourney.scoreVisible,
        bestOf: tourney.bestOF,
        points: {
          left: tourney.points.left,
          right: tourney.points.right,
        },
        chat: tourney.chat,
        clients: tourney.clients,
      },
      beatmap: {
        title: beatmap.title,
        artist: beatmap.artist,
        setId: beatmap.set,
        difficulty: beatmap.version,
        mapper: beatmap.mapper,
        cs:
          tourney.clients[0]?.beatmap.stats.cs.converted ||
          beatmap.stats.cs.converted ||
          tourney.clients[0]?.beatmap.stats.cs.original ||
          beatmap.stats.cs.original,
        ar:
          tourney.clients[0]?.beatmap.stats.ar.converted ||
          beatmap.stats.ar.converted ||
          tourney.clients[0]?.beatmap.stats.ar.original ||
          beatmap.stats.ar.original,
        od:
          tourney.clients[0]?.beatmap.stats.od.converted ||
          beatmap.stats.od.converted ||
          tourney.clients[0]?.beatmap.stats.od.original ||
          beatmap.stats.od.original,
        stars:
          tourney.clients[0]?.beatmap.stats.stars.total ||
          beatmap.stats.stars.total,
        bpm:
          tourney.clients[0]?.beatmap.stats.bpm.realtime ||
          beatmap.stats.bpm.realtime,
        length,
        bgUrl: getBeatmapBgUrl(beatmap.set) || null,
        backgroundPath: beatmapBackgroundPath || null,
      },
    };
  });

export type TosuData = z.infer<typeof tosuApiResponseSchema>;
