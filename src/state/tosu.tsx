import { getBeatmapBgUrl } from "@/util";
import { useWebSocket } from "partysocket/react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import z from "zod";

export type tosuPlayer = {
  name: string;
  score: number;
};

export type tosuTourney = {
  scoreVisible: boolean;
  bestOf: number;
  points: {
    left: number;
    right: number;
  };
  chat: unknown[];
};

export type tosuBeatmap = {
  title: string;
  artist: string;
  setId?: number;
  bgUrl?: string;
  difficulty: string;
  mapper: string;
  cs: number;
  ar: number;
  od: number;
  stars: number;
  bpm: number;
  length: number;
  backgroundPath?: string;
};

export type tosuData = {
  player1: tosuPlayer;
  player2: tosuPlayer;
  tourney: tosuTourney;
  beatmap: tosuBeatmap;
};

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
  status: z.object({
    number: z.number(),
    name: z.string(),
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

const tosuApiResponseSchema = z
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
    const beatmapBackgroundPath =
      `${tosuResponse.folders.songs}/${tosuResponse.directPath.beatmapBackground}`.replaceAll(
        "\\",
        "/",
      );

    return {
      player1: {
        name: tosuResponse.tourney.team.left,
        score: tosuResponse.tourney.totalScore.left,
      },
      player2: {
        name: tosuResponse.tourney.team.right,
        score: tosuResponse.tourney.totalScore.right,
      },
      tourney: {
        scoreVisible: tosuResponse.tourney.scoreVisible,
        bestOf: tosuResponse.tourney.bestOF,
        points: {
          left: tosuResponse.tourney.points.left,
          right: tosuResponse.tourney.points.right,
        },
        chat: tosuResponse.tourney.chat,
        clients: tosuResponse.tourney.clients,
      },
      beatmap: {
        title: tosuResponse.beatmap.title,
        artist: tosuResponse.beatmap.artist,
        setId: tosuResponse.beatmap.set,
        bgUrl: getBeatmapBgUrl(tosuResponse.beatmap.set),
        difficulty: tosuResponse.beatmap.version,
        mapper: tosuResponse.beatmap.mapper,
        cs:
          tosuResponse.tourney.clients[0]?.beatmap.stats.cs.converted ||
          tosuResponse.beatmap.stats.cs.converted ||
          tosuResponse.tourney.clients[0]?.beatmap.stats.cs.original ||
          tosuResponse.beatmap.stats.cs.original,
        ar:
          tosuResponse.tourney.clients[0]?.beatmap.stats.ar.converted ||
          tosuResponse.beatmap.stats.ar.converted ||
          tosuResponse.tourney.clients[0]?.beatmap.stats.ar.original ||
          tosuResponse.beatmap.stats.ar.original,
        od:
          tosuResponse.tourney.clients[0]?.beatmap.stats.od.converted ||
          tosuResponse.beatmap.stats.od.converted ||
          tosuResponse.tourney.clients[0]?.beatmap.stats.od.original ||
          tosuResponse.beatmap.stats.od.original,
        stars:
          tosuResponse.tourney.clients[0]?.beatmap.stats.stars.total ||
          tosuResponse.beatmap.stats.stars.total,
        bpm:
          tosuResponse.tourney.clients[0]?.beatmap.stats.bpm.realtime ||
          tosuResponse.beatmap.stats.bpm.realtime,
        length:
          tosuResponse.beatmap.time.lastObject -
          tosuResponse.beatmap.time.firstObject,
        backgroundPath: beatmapBackgroundPath,
      },
    };
  });

const TosuContext = createContext<tosuData | null>(null);

const TOSU_ADDRESS = "127.0.0.1:24050";

export function TosuProvider({ children }: { children: ReactNode }) {
  const tosuSocket = useWebSocket(`ws://${TOSU_ADDRESS}/websocket/v2`);

  const [tosuData, setTosuData] = useState<tosuData>({
    player1: { name: "loading...", score: 0 },
    player2: { name: "loading...", score: 0 },
    tourney: {
      scoreVisible: false,
      bestOf: 0,
      points: { left: 0, right: 0 },
      chat: [],
    },
    beatmap: {
      title: "loading...",
      artist: "loading...",
      difficulty: "loading...",
      mapper: "loading...",
      cs: 0,
      ar: 0,
      od: 0,
      stars: 0,
      bpm: 0,
      length: 0,
    },
  });

  useEffect(() => {
    tosuSocket.addEventListener("open", () => {
      console.log("connected to tosu");
    });

    tosuSocket.addEventListener("close", () => {
      console.log("disconnected from tosu");
    });

    tosuSocket.addEventListener("message", (e) => {
      try {
        const json = JSON.parse(e.data);
        const parsedData = tosuApiResponseSchema.parse(json);

        setTosuData(parsedData);
      } catch (e) {
        console.error("failed to parse tosu data schema:", e);
      }
    });

    tosuSocket.addEventListener("error", () => {
      console.error("error connecting to tosu");
    });
  }, [tosuSocket, setTosuData]);

  return <TosuContext value={tosuData}>{children}</TosuContext>;
}

export function useTosu() {
  const tosuData = useContext(TosuContext);
  if (!tosuData) {
    throw new Error(`useTosu must be used within a TosuProvider`);
  }
  return tosuData;
}
