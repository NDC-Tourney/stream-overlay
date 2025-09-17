import {
  settingsMessageSchema,
  type DashboardSettings,
  type SettingsMessage,
} from "@/schemas/settings";
import { useWebSocket } from "partysocket/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

const DashboardContext = createContext<{
  settings: DashboardSettings;
  setSettings: Dispatch<SetStateAction<DashboardSettings>>;
} | null>(null);

export function DashboardSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const ws = useWebSocket("ws://localhost:7270/ws");

  const [settings, _setSettings] = useState<DashboardSettings>({
    matchId: 0,
    automaticSelect: false,
    activeScreen: "start",
    player1: {
      bans: [],
      picks: [],
    },
    player2: {
      bans: [],
      picks: [],
    },
    activePlayer: "player1",
  });

  const setSettings = useCallback(
    (update: SetStateAction<DashboardSettings>) => {
      _setSettings((currentSettings) => {
        const nextState =
          typeof update === "function" ? update(currentSettings) : update;
        const message: SettingsMessage = {
          type: "SETTINGS",
          settings: nextState,
        };
        ws.send(JSON.stringify(message));
        console.log("sent message to the dashboard websocket server");
        return nextState;
      });
    },
    [ws],
  );

  useEffect(() => {
    ws.addEventListener("open", () => {
      console.log("connected to the dashboard websocket server");
    });

    ws.addEventListener("close", () => {
      console.log("disconnected from the dashboard websocket server");
    });

    ws.addEventListener("error", (e) => {
      console.error(
        "error on trying to connect to the dashboard websocket server:",
        e.error,
      );
    });

    ws.addEventListener("message", (e) => {
      console.log("received message from the dashboard websocket server");
      const { success, data, error } = settingsMessageSchema.safeParse(
        JSON.parse(e.data),
      );

      if (success) {
        _setSettings(data.settings);
      } else {
        console.error(
          "error on parsing settings received from websocket server:",
          error.message,
        );
      }
    });
  }, [ws]);

  return (
    <DashboardContext value={{ settings, setSettings }}>
      {children}
    </DashboardContext>
  );
}

export function useSettings() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useSettings must only be used within a DashboardProvider");
  }

  return [context.settings, context.setSettings] as const;
}
