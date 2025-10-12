import { useWebSocket } from "partysocket/react";
import {
  createContext,
  use,
  useCallback,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  dashboardMessageSchema,
  type DashboardMessage,
  type DashboardSettings,
} from "~/schemas/settings";

export const DashboardContext = createContext<
  [DashboardSettings, Dispatch<SetStateAction<DashboardSettings>>] | null
>(null);

export function DashboardSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const ws = useWebSocket("ws://localhost:7270/ws", null, {
    onOpen() {
      console.log("connected to the dashboard websocket server");
    },

    onClose() {
      console.log("disconnected from the dashboard websocket server");
    },

    onMessage(e) {
      const { success, data, error } = dashboardMessageSchema.safeParse(
        JSON.parse(e.data),
      );

      if (success) {
        if (
          data.type === "HELLO" &&
          typeof GIT_COMMIT !== "undefined" &&
          GIT_COMMIT !== data.gitCommit
        ) {
          console.warn("version mismatch detected! reloading client...");
          window.location.reload();
        }

        if (data.type === "SETTINGS") {
          _setSettings(data.settings);
        }
      } else {
        console.error(
          "error on parsing settings received from websocket server:",
          error.message,
        );
      }
    },

    onError(e) {
      console.error(
        "error on trying to connect to the dashboard websocket server:",
        e,
      );
    },
  });

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
    showCountdown: true,
  });

  const setSettings = useCallback(
    (update: SetStateAction<DashboardSettings>) => {
      _setSettings((currentSettings) => {
        const nextState =
          typeof update === "function" ? update(currentSettings) : update;
        const message: DashboardMessage = {
          type: "SETTINGS",
          settings: nextState,
        };
        ws.send(JSON.stringify(message));
        return nextState;
      });
    },
    [ws],
  );

  return (
    <DashboardContext value={[settings, setSettings]}>
      {children}
    </DashboardContext>
  );
}

export function useSettings() {
  const context = use(DashboardContext);

  if (!context) {
    throw new Error("useSettings must only be used within a DashboardProvider");
  }

  return context;
}
