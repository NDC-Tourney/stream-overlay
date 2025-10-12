import { useWebSocket } from "partysocket/react";
import { createContext, use, useState, type ReactNode } from "react";
import { tosuApiResponseSchema, type TosuData } from "~/schemas/tosu";

const TosuContext = createContext<TosuData | null>(null);

const TOSU_ADDRESS = "127.0.0.1:24050";

export function TosuProvider({ children }: { children: ReactNode }) {
  const tosuSocket = useWebSocket(`ws://${TOSU_ADDRESS}/websocket/v2`, null, {
    onOpen() {
      console.log("connected to tosu");
    },

    onClose() {
      console.log("disconnected from tosu");
    },

    onMessage(e) {
      let json;
      try {
        json = JSON.parse(e.data);
      } catch (error) {
        console.error(e.data);
        console.error("failed to parse tosu data as JSON:", error);
      }

      try {
        const parsedData = tosuApiResponseSchema.parse(json);
        setTosuData(parsedData);
      } catch (error) {
        console.error(JSON.stringify(json, null, 2));
        console.error("failed to parse tosu data schema:", error);
      }
    },

    onError() {
      console.error("error connecting to tosu");
    },
  });

  const [tosuData, setTosuData] = useState<TosuData>({
    player1: { name: "loading...", score: 0 },
    player2: { name: "loading...", score: 0 },
    tourney: {
      scoreVisible: false,
      bestOf: 0,
      points: { left: 0, right: 0 },
      chat: [],
      clients: [],
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
      setId: 0,
      bgUrl: null,
      backgroundPath: null,
    },
  });

  return <TosuContext value={tosuData}>{children}</TosuContext>;
}

export function useTosu() {
  const tosuData = use(TosuContext);

  if (!tosuData) {
    throw new Error(`useTosu must be used within a TosuProvider`);
  }

  return tosuData;
}
